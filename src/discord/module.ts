import { Context, GlobalContext } from "../core/context"
import Module from "../core/module"

type Params = {
    guildId: string
}
type EnvContext = {
    guildId: string
}

export class DiscordModule extends Module<Params, EnvContext> {
    public init(context: GlobalContext, parameters: Params): Context<EnvContext> {
        return context.add({guildId: parameters.guildId})
    }
}