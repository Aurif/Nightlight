import { Module } from "./module_loader";
import { Context, GlobalContext } from "./context";

class LogicUnit<TriggerParams, TriggerContextAdditions> implements Module {
    private trigger: Trigger<TriggerParams, TriggerContextAdditions>;
    private actions: Action<any, TriggerContextAdditions>[] = [];
    public constructor(trigger: Trigger<TriggerParams, TriggerContextAdditions>) {
        this.trigger = trigger;
    }
    public do<ActionParams>(action: Action<ActionParams, TriggerContextAdditions>): LogicUnit<TriggerParams, TriggerContextAdditions> {
        this.actions.push(action);
        return this;
    }

    public build(globalContext: GlobalContext): void {
        this.trigger.build(globalContext, this.triggerCallback.bind(this));
    }
    private triggerCallback(context: Context<TriggerContextAdditions>): void {
        this.actions.forEach(action => action.execute(context));
    }
}
export function on<TriggerParams, TriggerContextAdditions>(trigger: Trigger<TriggerParams, TriggerContextAdditions>): LogicUnit<TriggerParams, TriggerContextAdditions> {
    return new LogicUnit(trigger);
}


class LogicMultiUnit implements Module {
    private logicUnits: LogicUnit<any, any>[] = [];
    public add(...logicUnits: LogicUnit<any, any>[]): LogicMultiUnit {
        this.logicUnits = this.logicUnits.concat(logicUnits);
        return this;
    }
    public on<TriggerParams, TriggerContextAdditions>(trigger: Trigger<TriggerParams, TriggerContextAdditions>): LogicUnit<TriggerParams, TriggerContextAdditions> {
        let logicUnit = new LogicUnit(trigger);
        this.add(logicUnit);
        return logicUnit;
    }
    
    public build(globalContext: GlobalContext): void {
        this.logicUnits.forEach(logicUnit => logicUnit.build(globalContext))
    }
}
export function multi(...logicUnits: LogicUnit<any, any>[]): LogicMultiUnit {
    let multiUnit = new LogicMultiUnit();
    multiUnit.add(...logicUnits);
    return multiUnit
}


export abstract class Trigger<Params, ContextAdditions> {
    private parameters: Params;
    public constructor(parameters: Params) {
        this.parameters = parameters;
    }

    public build(globalContext: GlobalContext, callback: (context: Context<ContextAdditions>) => void): void {
        this.init(this.parameters, globalContext, callback);
    }
    public abstract init(parameters: Params, globalContext: GlobalContext, callback: (context: Context<ContextAdditions>) => void): void;
}


type ParamLike<Params, ContextAdditions> = Params | ((context: Context<ContextAdditions>) => Params)
export abstract class Action<Params, ContextAdditions> {
    private parameters: ParamLike<Params, ContextAdditions>;
    public constructor(parameters: ParamLike<Params, ContextAdditions>) {
        this.parameters = parameters;
    }

    public execute(context: Context<ContextAdditions>): void {
        if(typeof this.parameters === "function")
            this.run((this.parameters as ((context: Context<ContextAdditions>) => Params))(context), context);
        else
            this.run(this.parameters, context);
    }
    public abstract run(parameters: Params, context: Context<ContextAdditions>): void;
}