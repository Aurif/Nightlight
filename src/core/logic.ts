import { Context, FrozenContext, getSubContextName } from "./context";
import * as logging from "./logging";

export class LogicUnit<TriggerParams, TriggerContextAdditions, EnvContext> {
    private trigger: Trigger<TriggerParams, TriggerContextAdditions, EnvContext>;
    private actions: Action<any, EnvContext & TriggerContextAdditions>[] = [];
    private readonly name: string;
    private readonly id: number;
    public constructor(trigger: Trigger<TriggerParams, TriggerContextAdditions, EnvContext>, EnvContext: FrozenContext<EnvContext>, id: number) {
        this.name = getSubContextName(EnvContext._name, trigger.constructor.name, id);
        logging.logInit(`${this.name}...`);
        this.id = id;

        this.trigger = trigger;
        this.trigger.build(EnvContext, this.triggerCallback.bind(this)).then(() => {
            logging.logInit(`${this.name} OK`);
        }).catch(error => {
            logging.logInit(`${this.name} ERROR`);
            throw error;
        })
    }
    public do<ActionParams>(action: Action<ActionParams, EnvContext & TriggerContextAdditions>): LogicUnit<TriggerParams, TriggerContextAdditions, EnvContext> {
        logging.logInit(getSubContextName(this.name, action.constructor.name, this.actions.length));
        this.actions.push(action);
        return this;
    }

    private triggerCallback(context: Context<EnvContext & TriggerContextAdditions>): void {
        logging.logRun(this.name);
        this.actions.forEach((action, id) => {
            logging.logRun(getSubContextName(this.name, action.constructor.name, id));
            action.execute(context.freeze(this.trigger.constructor.name, this.id))
        });
    }
}


export abstract class Trigger<Params, ContextAdditions, EnvContext> {
    private parameters: Params;
    public constructor(parameters: Params) {
        this.parameters = parameters;
    }

    public async build(context: FrozenContext<EnvContext>, callback: (context: Context<EnvContext & ContextAdditions>) => void): Promise<void> {
        await this.init(this.parameters, context, callback);
    }
    protected abstract init(parameters: Params, context: FrozenContext<EnvContext>, callback: (context: Context<EnvContext & ContextAdditions>) => void): Promise<void>;
}


type ParamLike<Params, ContextAdditions> = Params | ((context: FrozenContext<ContextAdditions>) => Params)
export abstract class Action<Params, ContextAdditions> {
    private parameters: ParamLike<Params, ContextAdditions>;
    public constructor(parameters: ParamLike<Params, ContextAdditions>) {
        this.parameters = parameters;
    }

    public execute(context: FrozenContext<ContextAdditions>): void {
        if(typeof this.parameters === "function")
            this.run((this.parameters as ((context: FrozenContext<ContextAdditions>) => Params))(context), context);
        else
            this.run(this.parameters, context);
    }
    protected abstract run(parameters: Params, context: FrozenContext<ContextAdditions>): void;
}