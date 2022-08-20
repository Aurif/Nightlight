import { Action } from "../logic"
import { Context } from "../context"

type Params = {
    message: string
}

export default class ConsoleLogAction<ContextAdditions> extends Action<Params, ContextAdditions> {
    public run(parameters: Params, _context: Context<ContextAdditions>): void {
        console.log(parameters.message)
    }
}