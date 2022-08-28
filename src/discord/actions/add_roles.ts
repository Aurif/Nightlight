import { GuildMember } from "discord.js";
import { Context, FrozenContext } from "../../core/context"
import { Action } from "../../core/logic"
import { DiscordEnvContext } from "../module";

type Params = {
    user: GuildMember | null
    roleIds: string[]
    reason: string
}
type ContextAdditions = {
}

export default class AddRolesAction<EnvContext extends DiscordEnvContext> extends Action<Params, ContextAdditions, EnvContext> {
    protected async run(parameters: Params, context: FrozenContext<EnvContext["init"]>): Promise<Context<EnvContext["init"] & ContextAdditions>> {
        if(parameters.user)
            await parameters.user.roles.add(parameters.roleIds, parameters.reason)
        return context.unfreeze();
    }
}