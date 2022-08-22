import { FrozenContext, Context, GlobalContext, getGlobalContext } from "./context";
import { Scenario } from "./scenario";
import * as logging from "./logging";


export default abstract class Module<Params, EnvContext> {
    private context?: FrozenContext<EnvContext>;
    private scenarioStash: Scenario<any, EnvContext>[] = [];
    private nextScenarioId: number = 0;
    public constructor(parameters: Params) {
        logging.logInit(`${this.constructor.name}...`);
        this.init(getGlobalContext(), parameters).then(context => {
            logging.logInit(`${this.constructor.name} OK`);
            this.context = context.freeze(this.constructor.name);
            this.buildStashedScenarios();
        })
    }
    protected abstract init(context: GlobalContext, parameters: Params): Promise<Context<EnvContext>>;

    public use(scenario: Scenario<any, EnvContext>): Module<Params, EnvContext> {
        if(this.context != null)
            this.buildScenario(scenario);
        else
            this.scenarioStash.push(scenario);
        return this;
    }
    private buildStashedScenarios() {
        for(const scenario of this.scenarioStash)
            this.buildScenario(scenario);
        this.scenarioStash = [];
    }
    private buildScenario(scenario: Scenario<any, EnvContext>) {
        if(this.context == null)
            throw new Error("Tried building scenario before module fully initialized");
        let frozenContext = this.context.freeze(scenario.constructor.name, this.nextScenarioId++);
        logging.logInit(frozenContext._name);
        scenario.build(frozenContext);
    }
}
