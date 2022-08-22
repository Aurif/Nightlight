import { Action } from "../logic"
import { FrozenContext } from "../context"

type Params = {
    message: string
}

export default class ConsoleLogAction<ContextAdditions> extends Action<Params, ContextAdditions> {
    protected run(parameters: Params, context: FrozenContext<ContextAdditions>): void {
        console.log(parameters.message)
        context.add({loggedMessage: parameters.message})
    }
}