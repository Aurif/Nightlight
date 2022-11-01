import { InitContext, EnvironmentContext } from "../context";
import { Condition } from "../logic"

type Params = {
    value: boolean
}

export default class BaseCondition<EnvContext extends EnvironmentContext> extends Condition<Params, EnvContext> {
    protected async check(parameters: Params, _context: InitContext<EnvContext>): Promise<boolean> {
        return parameters.value
    }
}