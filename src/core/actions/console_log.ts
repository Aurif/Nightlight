import { Action } from "../logic"
import { Context, FrozenContext, GlobalContext } from "../context"
import { EnvironmentContext } from "../module"

type Params = {
    message: string
}
type ContextAdditions = {
    loggedMessage: string
}

export default class ConsoleLogAction<EnvContext extends EnvironmentContext> extends Action<Params, ContextAdditions, EnvContext> {
    protected async run(parameters: Params, context: FrozenContext<GlobalContext["init"] & EnvContext["init"]>): Promise<Context<GlobalContext["init"] & EnvContext["init"] & ContextAdditions>> {
        console.log(parameters.message);
        return context.add({loggedMessage: parameters.message});
    }
}