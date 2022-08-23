import { Action } from "../logic"
import { FrozenContext } from "../context"
import { EnvironmentContext } from "../module"

type Params = {
    message: string
}

export default class ConsoleLogAction<EnvContext extends EnvironmentContext, ContextAdditions> extends Action<Params, EnvContext, ContextAdditions> {
    protected run(parameters: Params, context: FrozenContext<EnvContext["init"] & ContextAdditions>): void {
        console.log(parameters.message)
        context.add({loggedMessage: parameters.message})
    }
}