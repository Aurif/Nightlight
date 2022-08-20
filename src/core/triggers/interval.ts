import { Trigger } from "../logic"
import { Context, GlobalContext } from "../context"

type Params = {
    time: number
}
type ContextAdditions = {
    intervalTime: number,
    intervalRepetition: number
}

export default class IntervalTrigger extends Trigger<Params, ContextAdditions> {
    public init(parameters: Params, globalContext: GlobalContext, callback: (context: Context<ContextAdditions>) => void): void {
        let newContext = globalContext.add({intervalTime: parameters.time});

        let counter = 0;
        setInterval(() => {
            counter += 1;
            let newerContext = newContext.add({intervalRepetition: counter});
            callback(newerContext)
        }, parameters.time)
    }
}