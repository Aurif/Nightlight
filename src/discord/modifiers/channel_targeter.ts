import { Context, FrozenContext, GlobalContext } from "../../core/context"
import { Modifier } from "../../core/logic"
import { DiscordEnvContext } from "../module";

type Params = {
    delay: number
}
type ContextAdditions = {
}

export default class ChannelTargeterModifier<EnvContext extends DiscordEnvContext> extends Modifier<Params, ContextAdditions, EnvContext> {
    public async preinit(context: FrozenContext<GlobalContext["preinit"] & EnvContext["preinit"]>): Promise<void> {
        
    }
    
    protected async init(parameters: Params, context: FrozenContext<GlobalContext["init"] & EnvContext["init"]>, callback: (context: Context<GlobalContext["init"] & EnvContext["init"] & ContextAdditions>) => void): Promise<void> {
        setTimeout(() => {
            callback(context.unfreeze());
        }, parameters.delay);
    }
}