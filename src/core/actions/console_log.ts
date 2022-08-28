import { Action } from "../logic"
import { Context, FrozenContext } from "../context"
import { EnvironmentContext } from "../module"

type Params = {
    message: string
}
type ContextAdditions = {
    loggedMessage: string
}

export default class ConsoleLogAction<EnvContext extends EnvironmentContext> extends Action<Params, ContextAdditions, EnvContext> {
    protected async run(parameters: Params, context: FrozenContext<EnvContext["init"]>): Promise<Context<EnvContext["init"] & ContextAdditions>> {
        console.log(parameters.message);
        return context.add({loggedMessage: parameters.message});
    }
}