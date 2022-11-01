import { getGlobalContext, getSubContextName, EnvironmentContext, PreinitContext, InitContext, PreinitOutContext, InitOutContext } from "./context";
import { Scenario } from "./scenario";
import * as logging from "./logging";

export abstract class Module<Params, EnvContext extends EnvironmentContext> {
    private readonly parameters: Params;
    public constructor(parameters: Params) {
        this.parameters = parameters;
    }
    public runPreinit(context: PreinitContext<{}>): Promise<PreinitOutContext<{}, EnvContext["preinit"]>> {
        return this.preinit(context, this.parameters)
    }
    public runInit(context: InitContext<{}>): Promise<InitOutContext<{}, EnvContext["preinit"]>> {
        return this.init(context, this.parameters)
    }

    // TODO: retry preinit/init on failure
    // TODO: proper error handling for preinit/init
    protected async preinit(context: PreinitContext<{}>, _parameters: Params): Promise<PreinitOutContext<{}, EnvContext["preinit"]>> {
        return context as PreinitOutContext<{}, EnvContext["preinit"]>;
    };
    protected abstract init(context: InitContext<{}>, parameters: Params): Promise<InitOutContext<{}, EnvContext["init"]>>;

}

export function worker() {
    return new MultiModule()
}

class MultiModule<EnvContext extends EnvironmentContext> {
    private static moduleCount = 0;
    private readonly id: number = MultiModule.moduleCount++;
    public readonly name: string = getSubContextName("global", "M", this.id);

    private lockNew = false;
    private modules: Module<any, EnvContext>[] = [];
    private scenarios: Scenario<any, EnvContext>[] = [];
    public constructor() {
        setTimeout(this.build.bind(this), 0)
    }

    // TODO: infer NewEnvConvtext from paramater instead of defining it explicitly
    public using<NewEnvContext extends EnvironmentContext>(module: Module<any, NewEnvContext>): MultiModule<EnvContext & NewEnvContext> {
        if(this.lockNew)
            throw new Error("Tried registering module after process started initializing");
        else
            this.modules.push(module)
        return this 
    }
    private async build(): Promise<void> {
        let globalContext = getGlobalContext(this.name);
        this.lockNew = true;

        logging.logInit(`${this.name}...`, 'PREINIT');
        let preinitContext = globalContext["preinit"]
        for(let module of this.modules)
            preinitContext = await module.runPreinit(preinitContext) as PreinitContext<EnvContext>
        logging.logInit(`${this.name} OK`, 'PREINIT');
        await this.preinitScenarios(preinitContext.freeze("M", this.id) as PreinitContext<EnvContext>);

        logging.logInit(`${this.name}...`, 'INIT');
        let initContext = globalContext["init"]
        for(let module of this.modules)
            initContext = await module.runInit(initContext) as InitContext<EnvContext>
        logging.logInit(`${this.name} OK`, 'INIT');
        this.initScenarios(initContext.freeze("M", this.id) as InitContext<EnvContext>);
    }
    private preinitScenarios(preinitContext: PreinitContext<EnvContext>): Promise<void[]> {
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
    private initScenarios(initContext: InitContext<EnvContext>): void {
        this.scenarios.forEach((scenario, id) => {
            let scenarioContext = initContext.freeze(scenario.constructor.name, id);
            logging.logInit(`${scenarioContext._name}...`, 'INIT');
            scenario.build(scenarioContext);
            logging.logInit(`${scenarioContext._name} OK`, 'INIT');
        })
    }

    public run(scenario: Scenario<any, EnvContext>): MultiModule<EnvContext> {
        if(this.lockNew)
            throw new Error("Tried registering scenario after process started initializing");
        else
            this.scenarios.push(scenario);
        return this;
    }

}