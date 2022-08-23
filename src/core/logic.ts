import { Context, FrozenContext, getSubContextName } from "./context";
import * as logging from "./logging";
import { EnvironmentContext } from "./module";

// TODO: proper error handling for preinit/init of triggers/actions
export class LogicUnit<TriggerParams, TriggerContextAdditions, EnvContext extends EnvironmentContext> {
    private readonly trigger: Trigger<TriggerParams, TriggerContextAdditions, EnvContext>;
    private actions: Action<any, EnvContext, TriggerContextAdditions>[] = [];
    private readonly preinitContext: FrozenContext<{} & EnvContext["preinit"]>;
    private readonly registerPreinitAwaiter: (promise: Promise<any>) => void;
    private readonly name: string;
    private readonly id: number;
    public constructor(trigger: Trigger<TriggerParams, TriggerContextAdditions, EnvContext>, EnvContext: FrozenContext<{} & EnvContext["preinit"]>, id: number, registerPreinitAwaiter: (promise: Promise<any>) => void) {
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
    public do<ActionParams>(action: Action<ActionParams, EnvContext, TriggerContextAdditions>): LogicUnit<TriggerParams, TriggerContextAdditions, EnvContext> {
        let actionName = getSubContextName(this.name, action.constructor.name, this.actions.length);
        this.actions.push(action);

        logging.logInit(`${actionName}...`, 'PREINIT');
        let promise = action.prebuild(this.preinitContext);
        promise.then(() => {
            logging.logInit(`${actionName} OK`, 'PREINIT');
        })
        this.registerPreinitAwaiter(promise);
        return this;
    }
    public build(context: FrozenContext<EnvContext["init"]>): void {
        logging.logInit(`${this.name}...`, 'INIT');
        this.trigger.build(context, this.triggerCallback.bind(this)).then(() => {
            logging.logInit(`${this.name} OK`);
        }).catch(error => {
            logging.logInit(`${this.name} ERROR`);
            throw error;
        })
    }

    private triggerCallback(context: Context<EnvContext["init"] & TriggerContextAdditions>): void {
        logging.logRun(this.name);
        this.actions.forEach((action, id) => {
            logging.logRun(getSubContextName(this.name, action.constructor.name, id));
            action.execute(context.freeze(this.trigger.constructor.name, this.id))
        });
    }
}


export abstract class Trigger<Params, ContextAdditions, EnvContext extends EnvironmentContext> {
    private parameters: Params;
    public constructor(parameters: Params) {
        this.parameters = parameters;
    }

    public async prebuild(context: FrozenContext<{} & EnvContext["preinit"]>): Promise<void> {
        await this.preinit(this.parameters, context);
    }
    protected async preinit(_parameters: Params, _context: FrozenContext<{} & EnvContext["preinit"]>): Promise<void> {
        return
    }

    public async build(context: FrozenContext<EnvContext["init"]>, callback: (context: Context<EnvContext["init"] & ContextAdditions>) => void): Promise<void> {
        await this.init(this.parameters, context, callback);
    }
    protected abstract init(parameters: Params, context: FrozenContext<EnvContext["init"]>, callback: (context: Context<EnvContext["init"] & ContextAdditions>) => void): Promise<void>;

}


type ParamLike<Params, Context> = Params | ((context: FrozenContext<Context>) => Params)
export abstract class Action<Params, EnvContext extends EnvironmentContext, ContextAdditions> {
    private parameters: ParamLike<Params, EnvContext["init"] & ContextAdditions>;
    public constructor(parameters: ParamLike<Params, EnvContext["init"] & ContextAdditions>) {
        this.parameters = parameters;
    }

    public async prebuild(context: FrozenContext<{} & EnvContext["preinit"]>): Promise<void> {
        await this.preinit(context);
    }
    protected async preinit(_context: FrozenContext<{} & EnvContext["preinit"]>): Promise<void> {
        return
    }

    public execute(context: FrozenContext<EnvContext["init"] & ContextAdditions>): void {
        if(typeof this.parameters === "function")
            this.run((this.parameters as ((context: FrozenContext<EnvContext["init"] & ContextAdditions>) => Params))(context), context);
        else
            this.run(this.parameters, context);
    }
    protected abstract run(parameters: Params, context: FrozenContext<EnvContext["init"] & ContextAdditions>): void;
}