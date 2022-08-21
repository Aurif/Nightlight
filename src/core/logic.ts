import { Context, FrozenContext } from "./context";

export class LogicUnit<TriggerParams, TriggerContextAdditions, EnvContext> {
    private trigger: Trigger<TriggerParams, TriggerContextAdditions, EnvContext>;
    private actions: Action<any, EnvContext & TriggerContextAdditions>[] = [];
    public constructor(trigger: Trigger<TriggerParams, TriggerContextAdditions, EnvContext>, EnvContext: FrozenContext<EnvContext>) {
        this.trigger = trigger;
        this.trigger.build(EnvContext, this.triggerCallback.bind(this));
    }
    public do<ActionParams>(action: Action<ActionParams, EnvContext & TriggerContextAdditions>): LogicUnit<TriggerParams, TriggerContextAdditions, EnvContext> {
        this.actions.push(action);
        return this;
    }

    private triggerCallback(context: Context<EnvContext & TriggerContextAdditions>): void {
        this.actions.forEach(action => action.execute(context.freeze()));
    }
}


export abstract class Trigger<Params, ContextAdditions, EnvContext> {
    private parameters: Params;
    public constructor(parameters: Params) {
        this.parameters = parameters;
    }

    public build(globalContext: FrozenContext<EnvContext>, callback: (context: Context<EnvContext & ContextAdditions>) => void): void {
        this.init(this.parameters, globalContext, callback);
    }
    public abstract init(parameters: Params, globalContext: FrozenContext<EnvContext>, callback: (context: Context<EnvContext & ContextAdditions>) => void): void;
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
    public abstract run(parameters: Params, context: FrozenContext<ContextAdditions>): void;
}