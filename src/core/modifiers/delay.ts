import { Context, FrozenContext } from "../../core/context"
import { Modifier } from "../../core/logic"
import { EnvironmentContext } from "../module";

type Params = {
    delay: number
}
type ContextAdditions = {
}

export default class DelayModifier<EnvContext extends EnvironmentContext> extends Modifier<Params, ContextAdditions, EnvContext> {
    protected async init(parameters: Params, context: FrozenContext<EnvContext["init"]>, callback: (context: Context<EnvContext["init"] & ContextAdditions>) => void): Promise<void> {
        setTimeout(() => {
            callback(context);
        }, parameters.delay);
    }
}