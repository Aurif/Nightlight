import { Context, GlobalContext, getGlobalContext, FrozenContext } from "./context";
import { Scenario } from "./scenario";
import * as logging from "./logging";

export type EnvironmentContext = {
    preinit?: Record<string, any>,
    init: Record<string, any>
}
export default abstract class Module<Params, EnvContext extends EnvironmentContext> {
    private lockNewScenarios = false;
    private scenarios: Scenario<any, EnvContext>[] = [];
    public constructor(parameters: Params) {
        this.build(parameters);
    }
    private async build(parameters: Params): Promise<void> {
        logging.logInit(`${this.constructor.name}...`, 'PREINIT');
        let preinitContext = await this.preinit(getGlobalContext(), parameters)
        logging.logInit(`${this.constructor.name} OK`, 'PREINIT');
        await this.preinitScenarios(preinitContext.freeze(this.constructor.name));

        logging.logInit(`${this.constructor.name}...`, 'INIT');
        let initContext = await this.init(getGlobalContext(), parameters);
        logging.logInit(`${this.constructor.name} OK`, 'INIT');
        this.initScenarios(initContext.freeze(this.constructor.name));
    }
    private preinitScenarios(preinitContext: FrozenContext<{} & EnvContext["preinit"]>): Promise<void[]> {
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
    private initScenarios(initContext: FrozenContext<EnvContext["init"]>): void {
        this.scenarios.forEach((scenario, id) => {
            let scenarioContext = initContext.freeze(scenario.constructor.name, id);
            logging.logInit(`${scenarioContext._name}...`, 'INIT');
            scenario.build(scenarioContext);
            logging.logInit(`${scenarioContext._name} OK`, 'INIT');
        })
    }

    // TODO: retry preinit/init on failure
    // TODO: proper error handling for preinit/init
    protected async preinit(context: GlobalContext, _parameters: Params): Promise<Context<{} & EnvContext["preinit"]>> {
        return context as Context<{} & EnvContext["preinit"]>;
    };
    protected abstract init(context: GlobalContext, parameters: Params): Promise<Context<EnvContext["init"]>>;

    public use(scenario: Scenario<any, EnvContext>): Module<Params, EnvContext> {
        if(this.lockNewScenarios)
            throw new Error("Tried registering scenario after module started initializing scenarios");
        else
            this.scenarios.push(scenario);
        return this;
    }

}
