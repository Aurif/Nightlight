import { EnvironmentContext, InitContext, InitOutContext } from "../context"
import { Trigger } from "../logic"

type Params = {
    time: number
}
type ContextAdditions = {
    intervalTime: number,
    intervalRepetition: number
}

export default class IntervalTrigger<EnvContext extends EnvironmentContext> extends Trigger<Params, ContextAdditions, EnvContext> {
    protected async init(parameters: Params, context: InitContext<EnvContext>, callback: (context: InitOutContext<EnvContext, ContextAdditions>) => void): Promise<void> {
        let newContext = context.add({intervalTime: parameters.time});

        let counter = 0;
        setInterval(() => {
            counter += 1;
            let newerContext = newContext.add({intervalRepetition: counter});
            callback(newerContext)
        }, parameters.time)
    }
}