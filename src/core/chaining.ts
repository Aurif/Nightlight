import { Context, FrozenContext, getSubContextName } from "./context";
import * as logging from "./logging";
import { Action, Condition, Modifier, Trigger } from "./logic";
import { EnvironmentContext } from "./module";

type ExpandedContext<Context extends EnvironmentContext, ContextAdditions> = Context & { "init": ContextAdditions; };
type ParamLike<Params, Context> = Params | ((context: FrozenContext<Context>) => Params);
// TODO: add typecheck to prevent chains from adding more context parameters than specified
// TODO: proper error handling for preinit/init of triggers/actions

export abstract class Chain<Params, ContextAdditions, EnvContext extends EnvironmentContext> {
    protected parameters: ParamLike<Params, EnvContext["init"]>;
    private executionCallback?: (context: Context<EnvContext["init"] & ContextAdditions>) => void;
    public constructor(parameters: ParamLike<Params, EnvContext["init"]>) {
        this.parameters = parameters;
    }
    public bind(callback: (context: Context<EnvContext["init"] & ContextAdditions>) => void): void {
        this.executionCallback = callback;
    }

    public async preinit(_context: FrozenContext<{} & EnvContext["preinit"]>): Promise<void> {
        return;
    }

    public async execute(context: FrozenContext<EnvContext["init"]>): Promise<void> {
        if (!this.executionCallback)
            throw new Error(`Tried running unbound chain ${this.constructor.name}`);

        let parameters = this.parameters;
        if (typeof parameters === "function")
            parameters = (this.parameters as ((context: FrozenContext<EnvContext["init"]>) => Params))(context);

        this.init(parameters, context, this.executionCallback.bind(this));
    }
    protected abstract init(parameters: Params, context: FrozenContext<EnvContext["init"]>, callback: (context: Context<EnvContext["init"] & ContextAdditions>) => void): Promise<void>;
}

class ChainLink<ContextAdditions, EnvContext extends EnvironmentContext> {
    protected readonly chain: Chain<any, ContextAdditions, EnvContext>;
    private subchains: ChainLink<any, ExpandedContext<EnvContext, ContextAdditions>>[] = [];
    protected name?: string;
    private id?: number;
    protected constructor(chain: Chain<any, ContextAdditions, EnvContext>) {
        this.chain = chain;
        chain.bind(this.executionCallback.bind(this));
    }

    public async prebuild(context: FrozenContext<{} & EnvContext["preinit"]>, registerPreinitAwaiter: (promise: Promise<any>) => void, id: number): Promise<void> {
        this.id = id;
        this.name = getSubContextName(context._name, this.chain.constructor.name, id);

        logging.logInit(`${this.name}...`, 'PREINIT');
        let promise = this.chain.preinit(context);
        registerPreinitAwaiter(promise);

        this.subchains.forEach((chain, subId) => chain.prebuild(context.freeze(this.chain.constructor.name, id), registerPreinitAwaiter, subId));

        await promise;
        logging.logInit(`${this.name} OK`, 'PREINIT');
    }
    private execute(context: FrozenContext<EnvContext["init"]>): void {
        this.chain.execute(context);
    }
    private executionCallback(context: Context<EnvContext["init"] & ContextAdditions>): void {
        logging.logRun(`${this.name} >>`);
        this.subchains.forEach((sublink) => {
            logging.logRun(`${sublink.name} <<`);
            sublink.execute(context.freeze(this.chain.constructor.name, this.id));
        });
    }

    private addChain<ChainParams, ChainContextAdditions>(chain: Chain<ChainParams, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>>): ChainLink<ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>> {
        let chainLink = new ChainLink(chain);
        this.subchains.push(chainLink);
        return chainLink;
    }
    public do<ChainContextAdditions>(action: Action<any, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>>): ChainLink<ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>> {
        return this.addChain(action);
    }
    public if(condition: Condition<any, ExpandedContext<EnvContext, ContextAdditions>>): ChainLink<{}, ExpandedContext<EnvContext, ContextAdditions>> {
        return this.addChain(condition);
    }
    public with<ChainContextAdditions>(modifier: Modifier<any, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>>): ChainLink<ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>> {
        return this.addChain(modifier);
    }

    public doAsync<ChainContextAdditions>(chain: Action<any, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>>): ChainLink<ContextAdditions, EnvContext> {
        this.do(chain);
        return this;
    }
    // TODO: .do after forking should be executed once all forks ended
    public doForked(registeringFunc: (fork: ChainLink<ContextAdditions, EnvContext>) => void): ChainLink<ContextAdditions, EnvContext> {
        registeringFunc(this);
        return this;
    }
    public ifNot(condition: Condition<any, ExpandedContext<EnvContext, ContextAdditions>>): ChainLink<{}, ExpandedContext<EnvContext, ContextAdditions>> {
        return this.addChain(condition.not());
    }
}
export class InitialChainLink<ContextAdditions, EnvContext extends EnvironmentContext> extends ChainLink<ContextAdditions, EnvContext> {
    public constructor(chain: Trigger<any, ContextAdditions, EnvContext>) {
        super(chain);
    }
    
    public build(context: FrozenContext<EnvContext["init"]>) {
        logging.logInit(`${this.name}...`, 'INIT');
        (this.chain as Trigger<unknown, ContextAdditions, EnvContext>).build(context).then(() => {
            logging.logInit(`${this.name} OK`);
        }).catch(error => {
            logging.logInit(`${this.name} ERROR`);
            throw error;
        })
    }
}