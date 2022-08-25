import { Context, FrozenContext, getSubContextName } from "./context";
import * as logging from "./logging";
import { EnvironmentContext } from "./module";

// TODO: proper error handling for preinit/init of triggers/actions
type ExpandedContext<Context extends EnvironmentContext, ContextAdditions> = Context & {"init": ContextAdditions};
export class ChainLink<TriggerParams, TriggerContextAdditions, EnvContext extends EnvironmentContext> {
    private readonly trigger: Chain<TriggerParams, TriggerContextAdditions, EnvContext>;
    private subchains: ChainLink<any, any, ExpandedContext<EnvContext, TriggerContextAdditions>>[] = [];
    private readonly preinitContext: FrozenContext<{} & EnvContext["preinit"]>;
    private readonly registerPreinitAwaiter: (promise: Promise<any>) => void;
    private readonly name: string;
    private readonly id: number;
    public constructor(trigger: Chain<TriggerParams, TriggerContextAdditions, EnvContext>, EnvContext: FrozenContext<{} & EnvContext["preinit"]>, id: number, registerPreinitAwaiter: (promise: Promise<any>) => void) {
        this.name = getSubContextName(EnvContext._name, trigger.constructor.name, id);
        this.id = id;
        this.trigger = trigger;
        this.preinitContext = EnvContext;
        this.registerPreinitAwaiter = registerPreinitAwaiter;

        logging.logInit(`${this.name}...`, 'PREINIT');
        let promise = trigger.prebuild(EnvContext);
        promise.then(() => {
            logging.logInit(`${this.name} OK`, 'PREINIT');
        })
        registerPreinitAwaiter(promise);
    }
    public do<ChainTriggerParams, ChainContextAdditions>(action: Chain<ChainTriggerParams, ChainContextAdditions, ExpandedContext<EnvContext, TriggerContextAdditions>>): ChainLink<ChainTriggerParams, ChainContextAdditions, ExpandedContext<EnvContext, TriggerContextAdditions>> {
        let logicUnit = new ChainLink<ChainTriggerParams, ChainContextAdditions, ExpandedContext<EnvContext, TriggerContextAdditions>>(action, this.preinitContext.freeze(this.trigger.constructor.name, this.id), this.subchains.length, this.registerPreinitAwaiter);
        this.subchains.push(logicUnit);
        return logicUnit;
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

    private triggerCallback(context: Context<EnvContext["init"] & TriggerContextAdditions>): void {
        logging.logRun(`${this.name} >>`);
        this.subchains.forEach((action) => {
            logging.logRun(`${action.name} <<`);
            action.execute(context.freeze(this.trigger.constructor.name, this.id))
        });
    }
    private execute(context: FrozenContext<EnvContext["init"]>): Promise<void> {
        return this.trigger.execute(context, this.triggerCallback.bind(this));
    }
}


// TODO: add typecheck to prevent chains from adding more context parameters than specified
type ParamLike<Params, Context> = Params | ((context: FrozenContext<Context>) => Params)
export abstract class Chain<Params, ContextAdditions, EnvContext extends EnvironmentContext> {
    protected parameters: ParamLike<Params, EnvContext["init"]>;
    public constructor(parameters: ParamLike<Params, EnvContext["init"]>) {
        this.parameters = parameters;
    }

    public async prebuild(context: FrozenContext<{} & EnvContext["preinit"]>): Promise<void> {
        await this.preinit(context);
    }
    protected async preinit(_context: FrozenContext<{} & EnvContext["preinit"]>): Promise<void> {
        return
    }

    public async execute(context: FrozenContext<EnvContext["init"]>, callback: (context: Context<EnvContext["init"] & ContextAdditions>) => void): Promise<void> {
        let parameters = this.parameters;
        if(typeof parameters === "function")
            parameters = (this.parameters as ((context: FrozenContext<EnvContext["init"]>) => Params))(context);
        
        this.run(parameters, context, callback);
    }
    protected abstract run(parameters: Params, context: FrozenContext<EnvContext["init"]>, callback: (context: Context<EnvContext["init"] & ContextAdditions>) => void): Promise<void>;

}