import { Context, FrozenContext, getSubContextName } from "./context";
import * as logging from "./logging";
import { Action, Condition, Modifier } from "./logic";
import { EnvironmentContext } from "./module";

type ExpandedContext<Context extends EnvironmentContext, ContextAdditions> = Context & { "init": ContextAdditions; };
type ParamLike<Params, Context> = Params | ((context: FrozenContext<Context>) => Params);
// TODO: add typecheck to prevent chains from adding more context parameters than specified
// TODO: proper error handling for preinit/init of triggers/actions

export abstract class Chain<Params, ContextAdditions, EnvContext extends EnvironmentContext> {
    protected parameters: ParamLike<Params, EnvContext["init"]>;
    private subchains: Chain<any, any, ExpandedContext<EnvContext, ContextAdditions>>[] = [];
    protected name?: string;
    private id?: number;
    public constructor(parameters: ParamLike<Params, EnvContext["init"]>) {
        this.parameters = parameters;
    }

    public async prebuild(context: FrozenContext<{} & EnvContext["preinit"]>, registerPreinitAwaiter: (promise: Promise<any>) => void, id: number): Promise<void> {
        this.id = id;
        this.name = getSubContextName(context._name, this.constructor.name, id);

        logging.logInit(`${this.name}...`, 'PREINIT');
        let promise = this.preinit(context);
        registerPreinitAwaiter(promise);

        this.subchains.forEach((chain, subId) => chain.prebuild(context.freeze(this.constructor.name, id), registerPreinitAwaiter, subId));

        await promise;
        logging.logInit(`${this.name} OK`, 'PREINIT');
    }
    protected async preinit(_context: FrozenContext<{} & EnvContext["preinit"]>): Promise<void> {
        return;
    }

    public async execute(context: FrozenContext<EnvContext["init"]>): Promise<void> {
        let parameters = this.parameters;
        if (typeof parameters === "function")
            parameters = (this.parameters as ((context: FrozenContext<EnvContext["init"]>) => Params))(context);

        this.init(parameters, context, this.executionCallback.bind(this));
    }
    private executionCallback(context: Context<EnvContext["init"] & ContextAdditions>): void {
        logging.logRun(`${this.name} >>`);
        this.subchains.forEach((action) => {
            logging.logRun(`${action.name} <<`);
            action.execute(context.freeze(this.constructor.name, this.id));
        });
    }
    protected abstract init(parameters: Params, context: FrozenContext<EnvContext["init"]>, callback: (context: Context<EnvContext["init"] & ContextAdditions>) => void): Promise<void>;


    private addChain<ChainParams, ChainContextAdditions>(chain: Chain<ChainParams, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>>): Chain<ChainParams, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>> {
        this.subchains.push(chain);
        return chain;
    }
    public do<ChainParams, ChainContextAdditions>(action: Action<ChainParams, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>>): Chain<ChainParams, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>> {
        return this.addChain(action);
    }
    public doAsync<ChainParams, ChainContextAdditions>(chain: Action<ChainParams, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>>): Chain<Params, ContextAdditions, EnvContext> {
        this.do(chain);
        return this;
    }
    // TODO: .do after forking should be executed once all forks ended
    public doForked(registeringFunc: (fork: Chain<Params, ContextAdditions, EnvContext>) => void): Chain<Params, ContextAdditions, EnvContext> {
        registeringFunc(this);
        return this;
    }
    public if<ChainParams>(condition: Condition<ChainParams, ExpandedContext<EnvContext, ContextAdditions>>): Chain<ChainParams, {}, ExpandedContext<EnvContext, ContextAdditions>> {
        return this.addChain(condition);
    }
    public with<ChainParams, ChainContextAdditions>(modifier: Modifier<ChainParams, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>>): Chain<ChainParams, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>> {
        return this.addChain(modifier);
    }


}
