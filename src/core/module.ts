import { FrozenContext, Context, GlobalContext, getGlobalContext } from "./context";
import { Scenario } from "./scenario";


export default abstract class Module<Params, EnvContext> {
    private context?: FrozenContext<EnvContext>;
    private scenarioStash: Scenario<any, EnvContext>[] = [];
    public constructor(parameters: Params) {
        this.init(getGlobalContext(), parameters).then(context => {
            this.context = context.freeze();
            this.buildStashedScenarios();
        })
    }
    protected abstract init(context: GlobalContext, parameters: Params): Promise<Context<EnvContext>>;

    public use(scenario: Scenario<any, EnvContext>) {
        if(this.context != null)
            scenario.build(this.context);
        else
            this.scenarioStash.push(scenario);
    }
    private buildStashedScenarios() {
        if(this.context == null)
            throw new Error("Tried building stashed scenarios before module fully initialized");
        for(const scenario of this.scenarioStash)
            scenario.build(this.context);
        this.scenarioStash = [];
    }
}
