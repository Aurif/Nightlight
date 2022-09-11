import { Modifier } from "../../core/logic"
import { EnvironmentContext, InitContext, InitOutContext } from "../context";

type Params = {
    delay: number
}
type ContextAdditions = {
}

export default class DelayModifier<EnvContext extends EnvironmentContext> extends Modifier<Params, ContextAdditions, EnvContext> {
    protected async init(parameters: Params, context: InitContext<EnvContext>, callback: (context: InitOutContext<EnvContext, ContextAdditions>) => void): Promise<void> {
        setTimeout(() => {
            callback(context);
        }, parameters.delay);
    }
}