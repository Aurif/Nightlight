import { Trigger } from "../logic"
import { Context, FrozenContext } from "../context"

type Params = {
    time: number
}
type ContextAdditions = {
    intervalTime: number,
    intervalRepetition: number
}

export default class IntervalTrigger<EnvContext> extends Trigger<Params, ContextAdditions, EnvContext> {
    protected async init(parameters: Params, context: FrozenContext<EnvContext>, callback: (context: Context<EnvContext & ContextAdditions>) => void): Promise<void> {
        let newContext = context.add({intervalTime: parameters.time});

        let counter = 0;
        setInterval(() => {
            counter += 1;
            let newerContext = newContext.add({intervalRepetition: counter});
            callback(newerContext)
        }, parameters.time)
    }
}