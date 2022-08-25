import { Chain } from "../logic"
import { Context, FrozenContext } from "../context"
import { EnvironmentContext } from "../module"

type Params = {
    message: string
}
type ContextAdditions = {
    loggedMessage: string
}

export default class ConsoleLogAction<EnvContext extends EnvironmentContext> extends Chain<Params, ContextAdditions, EnvContext> {
    protected async run(parameters: Params, context: FrozenContext<EnvContext["init"]>, callback: (context: Context<EnvContext["init"] & ContextAdditions>) => void): Promise<void> {
        console.log(parameters.message)
        callback(context.add({loggedMessage: parameters.message}));
    }
}