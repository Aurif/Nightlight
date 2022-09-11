import { EnvironmentContext, InitContext, InitOutContext } from "../context"
import { Action } from "../logic"

type Params = {
    message: string
}
type ContextAdditions = {
    loggedMessage: string
}

export default class ConsoleLogAction<EnvContext extends EnvironmentContext> extends Action<Params, ContextAdditions, EnvContext> {
    protected async run(parameters: Params, context: InitContext<EnvContext>): Promise<InitOutContext<EnvContext, ContextAdditions>> {
        console.log(parameters.message);
        return context.add({loggedMessage: parameters.message});
    }
}