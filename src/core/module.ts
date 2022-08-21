import { FrozenContext, Context, GlobalContext, getGlobalContext } from "./context";
import { Scenario } from "./scenario";


export default abstract class Module<Params, EnvContext> {
    private context: FrozenContext<EnvContext>;
    public constructor(parameters: Params) {
        this.context = this.init(getGlobalContext(), parameters).freeze();
    }
    public abstract init(context: GlobalContext, parameters: Params): Context<EnvContext>;

    public use(scenario: Scenario<any, EnvContext>) {
        scenario.build(this.context);
    }
}
