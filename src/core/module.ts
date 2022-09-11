import { Context, GlobalContext, getGlobalContext, FrozenContext, getSubContextName } from "./context";
import { Scenario } from "./scenario";
import * as logging from "./logging";

export type EnvironmentContext = {
    preinit?: {},
    init: {}
}
export default abstract class Module<Params, EnvContext extends EnvironmentContext> {
    private static moduleCount = 0;
    public readonly name: string = this.constructor.name;
    private readonly id: number = Module.moduleCount++;
    private lockNewScenarios = false;
    private scenarios: Scenario<any, EnvContext>[] = [];
    // TODO: dissallow for passing additional parameters
    public constructor(parameters: Params) {
        this.name = getSubContextName("global", this.constructor.name, this.id);
        this.build(parameters);
    }
    private async build(parameters: Params): Promise<void> {
        let globalContext = getGlobalContext(this.name);

        logging.logInit(`${this.name}...`, 'PREINIT');
        let preinitContext = await this.preinit(globalContext["preinit"], parameters)
        logging.logInit(`${this.name} OK`, 'PREINIT');
        await this.preinitScenarios(preinitContext.freeze(this.constructor.name, this.id));

        logging.logInit(`${this.name}...`, 'INIT');
        let initContext = await this.init(globalContext["init"], parameters);
        logging.logInit(`${this.name} OK`, 'INIT');
        this.initScenarios(initContext.freeze(this.constructor.name, this.id));
    }
    private preinitScenarios(preinitContext: FrozenContext<GlobalContext["preinit"] &  EnvContext["preinit"]>): Promise<void[]> {
        this.lockNewScenarios = true;
        let promises: Promise<void>[] = [];
        this.scenarios.forEach((scenario, id) => {
            let scenarioContext = preinitContext.freeze(scenario.constructor.name, id);
            logging.logInit(`${scenarioContext._name}...`, 'PREINIT');
            let promise = scenario.prebuild(scenarioContext);
            promises.push(promise);
            promise.then(() => {
                logging.logInit(`${scenarioContext._name} OK`, 'PREINIT');
            })
        })
        return Promise.all(promises)
    }
    private initScenarios(initContext: FrozenContext<GlobalContext["init"] & EnvContext["init"]>): void {
        this.scenarios.forEach((scenario, id) => {
            let scenarioContext = initContext.freeze(scenario.constructor.name, id);
            logging.logInit(`${scenarioContext._name}...`, 'INIT');
            scenario.build(scenarioContext);
            logging.logInit(`${scenarioContext._name} OK`, 'INIT');
        })
    }

    // TODO: retry preinit/init on failure
    // TODO: proper error handling for preinit/init
    protected async preinit(context: Context<GlobalContext["preinit"]>, _parameters: Params): Promise<Context<GlobalContext["preinit"] & EnvContext["preinit"]>> {
        return context as Context<GlobalContext["preinit"] & EnvContext["preinit"]>;
    };
    protected abstract init(context: GlobalContext["init"], parameters: Params): Promise<Context<GlobalContext["init"] & EnvContext["init"]>>;

    public use(scenario: Scenario<any, EnvContext>): Module<Params, EnvContext> {
        if(this.lockNewScenarios)
            throw new Error("Tried registering scenario after module started initializing scenarios");
        else
            this.scenarios.push(scenario);
        return this;
    }

}
