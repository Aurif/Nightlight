import { Context, FrozenContext, getSubContextName } from "./context";
import * as logging from "./logging";
import { EnvironmentContext } from "./module";

// TODO: there has to be a better way to do this than this nightmare
type ExpandedContext<Context extends EnvironmentContext, ContextAdditions> = Context & {"init": ContextAdditions};
type ParamLike<Params, Context> = Params | ((context: FrozenContext<Context>) => Params)

class MultiChain<ChainStart extends Chain<StartParams, StartContextAdditions, StartEnvContext>, ChainEnd extends Chain<EndParams, EndContextAdditions, EndEnvContext>, StartParams, StartContextAdditions, StartEnvContext extends EnvironmentContext, EndParams, EndContextAdditions, EndEnvContext extends EnvironmentContext> {
    public readonly chainStart: ChainStart;
    public readonly chainEnd: ChainEnd;

    public constructor(chainStart: ChainStart, chainEnd: ChainEnd) {
        this.chainStart = chainStart;
        this.chainEnd = chainEnd;
    }

    public do<ChainParams, ChainContextAdditions>(chain: Chain<ChainParams, ChainContextAdditions, ExpandedContext<EndEnvContext, EndContextAdditions>>): MultiChain<ChainStart, Chain<ChainParams, ChainContextAdditions, ExpandedContext<EndEnvContext, EndContextAdditions>>, StartParams, StartContextAdditions, StartEnvContext, ChainParams, ChainContextAdditions, ExpandedContext<EndEnvContext, EndContextAdditions>> {
        return new MultiChain(this.chainStart, this.chainEnd.do(chain).chainEnd);
    }
    public doAsync<ChainParams, ChainContextAdditions>(...chains: MultiChain<Chain<ChainParams, ChainContextAdditions, ExpandedContext<EndEnvContext, EndContextAdditions>>, Chain<any, any, any>, ChainParams, ChainContextAdditions, ExpandedContext<EndEnvContext, EndContextAdditions>, any, any, any>[]): MultiChain<Chain<StartParams, StartContextAdditions, StartEnvContext>, Chain<EndParams, EndContextAdditions, EndEnvContext>, StartParams, StartContextAdditions, StartEnvContext, EndParams, EndContextAdditions, EndEnvContext> {
        return new MultiChain(this.chainStart, this.chainEnd.doAsync(...chains).chainEnd);
    }
}

// TODO: add typecheck to prevent chains from adding more context parameters than specified
// TODO: proper error handling for preinit/init of triggers/actions
export abstract class Chain<Params, ContextAdditions, EnvContext extends EnvironmentContext> implements MultiChain<Chain<Params, ContextAdditions, EnvContext>, Chain<Params, ContextAdditions, EnvContext>, Params, ContextAdditions, EnvContext, Params, ContextAdditions, EnvContext> {
    public readonly chainStart = this;
    public readonly chainEnd = this;
    protected parameters: ParamLike<Params, EnvContext["init"]>;
    private subchains: Chain<unknown, unknown, ExpandedContext<EnvContext, ContextAdditions>>[] = [];
    private name?: string;
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

        this.subchains.forEach((chain, subId) => chain.prebuild(context.freeze(this.constructor.name, id), registerPreinitAwaiter, subId))

        await promise;
        logging.logInit(`${this.name} OK`, 'PREINIT');
    }
    protected async preinit(_context: FrozenContext<{} & EnvContext["preinit"]>): Promise<void> {
        return
    }

    public build(context: FrozenContext<EnvContext["init"]>): void {
        logging.logInit(`${this.name}...`, 'INIT');
        this.execute(context).then(() => {
            logging.logInit(`${this.name} OK`);
        }).catch(error => {
            logging.logInit(`${this.name} ERROR`);
            throw error;
        })
    }
    public async execute(context: FrozenContext<EnvContext["init"]>): Promise<void> {
        let parameters = this.parameters;
        if(typeof parameters === "function")
            parameters = (this.parameters as ((context: FrozenContext<EnvContext["init"]>) => Params))(context);
        
        this.run(parameters, context, this.executionCallback.bind(this));
    }
    private executionCallback(context: Context<EnvContext["init"] & ContextAdditions>): void {
        logging.logRun(`${this.name} >>`);
        this.subchains.forEach((action) => {
            logging.logRun(`${action.name} <<`);
            action.execute(context.freeze(this.constructor.name, this.id))
        });
    }
    protected abstract run(parameters: Params, context: FrozenContext<EnvContext["init"]>, callback: (context: Context<EnvContext["init"] & ContextAdditions>) => void): Promise<void>;
    

    public do<ChainParams, ChainContextAdditions>(chain: Chain<ChainParams, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>>): MultiChain<Chain<Params, ContextAdditions, EnvContext>, Chain<ChainParams, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>>, Params, ContextAdditions, EnvContext, ChainParams, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>>  {
        this.subchains.push(chain);
        return new MultiChain(this, chain);
    }
    public doAsync<ChainParams, ChainContextAdditions>(...chains: MultiChain<Chain<ChainParams, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>>, Chain<any, any, any>, ChainParams, ChainContextAdditions, ExpandedContext<EnvContext, ContextAdditions>, any, any, any>[]): MultiChain<Chain<Params, ContextAdditions, EnvContext>, Chain<Params, ContextAdditions, EnvContext>, Params, ContextAdditions, EnvContext, Params, ContextAdditions, EnvContext> {
        chains.forEach(chain => this.do(chain.chainStart));
        return this;
    }

}