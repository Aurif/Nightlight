import { FrozenContext } from "./context";
import { LogicUnit, Trigger } from "./logic";

export abstract class Scenario<Params, EnvContext> {
    private parameters: Params;
    public constructor(parameters: Params) {
        this.parameters = parameters;
    }

    public build(context: FrozenContext<EnvContext>) {
        this.init(this.parameters, new ScenarioCreator(context));
    }
    public abstract init(parameters: Params, create: ScenarioCreator<EnvContext>): void;
}
export class ScenarioCreator<EnvContext> {
    private context: FrozenContext<EnvContext>;
    constructor(context: FrozenContext<EnvContext>) {
        this.context = context;
    }

    public on<TriggerParams, TriggerContextAdditions>(trigger: Trigger<TriggerParams, TriggerContextAdditions, EnvContext>): LogicUnit<TriggerParams, TriggerContextAdditions, EnvContext> {
        return new LogicUnit<TriggerParams, TriggerContextAdditions, EnvContext>(trigger, this.context);
    }
}