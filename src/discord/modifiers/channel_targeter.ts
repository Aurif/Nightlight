import { InitContext, InitOutContext, PreinitContext } from "../../core/context";
import { Modifier } from "../../core/logic"
import { DiscordEnvContext } from "../module";

type Params = {
    delay: number
}
type ContextAdditions = {
}

export default class ChannelTargeterModifier<EnvContext extends DiscordEnvContext> extends Modifier<Params, ContextAdditions, EnvContext> {
    public async preinit(_context: PreinitContext<EnvContext>): Promise<void> {
        
    }
    
    protected async init(parameters: Params, context: InitContext<EnvContext>, callback: (context: InitOutContext<EnvContext, ContextAdditions>) => void): Promise<void> {
        setTimeout(() => {
            callback(context.unfreeze());
        }, parameters.delay);
    }
}