import { Trigger } from "./logic";
import { InitialChainLink } from "./chaining";
import { EnvironmentContext, PreinitContext, InitContext } from "./context";

// TODO: scenarios don't have their own init/preinit code, so maybe skip this level of logging? Or change how module logging works? But logging module finished init requires quite a bit of a rewrite
export abstract class Scenario<Params, EnvContext extends EnvironmentContext> {
    private parameters: Params;
    private initializers: ScenarioInitializer<EnvContext>[] = [];
    public constructor(parameters: Params) {
        this.parameters = parameters;
    }

    public async prebuild(context: PreinitContext<EnvContext>): Promise<void> {
        this.initializers = await new Promise((resolve) => {
            this.do(this.parameters, new ScenarioCreator<EnvContext>(context, resolve));
        })
    }
    public build(context: InitContext<EnvContext>): void {
        this.initializers.forEach(initializer => initializer(context));
    }

    protected abstract do(parameters: Params, create: ScenarioCreator<EnvContext>): void;
}

type ScenarioInitializer<EnvContext extends EnvironmentContext> = (context: InitContext<EnvContext>) => void;
export class ScenarioCreator<EnvContext extends EnvironmentContext> {
    private startLinks: InitialChainLink<any, EnvContext>[] = [];
    private afterPreinit: ((initializers: ScenarioInitializer<EnvContext>[]) => void) | null;
    private preinitsAwaiting = 0;
    constructor(context: PreinitContext<EnvContext>, afterPreinit: (initializers: ScenarioInitializer<EnvContext>[]) => void) {
        this.afterPreinit = afterPreinit;
        process.nextTick(() => {
            this.preinit(context);
          });
    }

    public on<TriggerParams, TriggerContextAdditions>(trigger: Trigger<TriggerParams, TriggerContextAdditions, EnvContext>): InitialChainLink<TriggerContextAdditions, EnvContext> {
        let link = new InitialChainLink(trigger);
        this.startLinks.push(link);
        return link;
    }

    private preinit(context: PreinitContext<EnvContext>) {
        this.startLinks.forEach((chain, id) => chain.prebuild(context, this.newPreinitAwaiter.bind(this), id));
    }
    private newPreinitAwaiter(promise: Promise<any>) {
        if(this.afterPreinit === null) 
            throw new Error("Tried to add preinit awaiter after preinit phase");
        this.preinitsAwaiting++;
        promise.then(() => {
            this.preinitsAwaiting--;
            if(this.preinitsAwaiting == 0)
                this.afterPreinitAwaiter();
        })
    }
    private afterPreinitAwaiter(): void {
        this.afterPreinit!(this.startLinks.map(unit => unit.build.bind(unit)));
        this.afterPreinit = null;
    }
}

export type EmptyParams = {[n: string]: never};