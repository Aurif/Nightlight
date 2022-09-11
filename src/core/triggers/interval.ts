import { Trigger } from "../logic"
import { Context, FrozenContext, GlobalContext } from "../context"
import { EnvironmentContext } from "../module"

type Params = {
    time: number
}
type ContextAdditions = {
    intervalTime: number,
    intervalRepetition: number
}

export default class IntervalTrigger<EnvContext extends EnvironmentContext> extends Trigger<Params, ContextAdditions, EnvContext> {
    protected async init(parameters: Params, context: FrozenContext<GlobalContext["init"] & EnvContext["init"]>, callback: (context: Context<GlobalContext["init"] & EnvContext["init"] & ContextAdditions>) => void): Promise<void> {
        let newContext = context.add({intervalTime: parameters.time});

        let counter = 0;
        setInterval(() => {
            counter += 1;
            let newerContext = newContext.add({intervalRepetition: counter});
            callback(newerContext)
        }, parameters.time)
    }
}