import { GuildMember, IntentsBitField } from "discord.js";
import { FrozenContext, GlobalContext } from "../../core/context"
import { Condition } from "../../core/logic"
import { DiscordEnvContext } from "../module";

type Params = {
    user: GuildMember | null,
    roleId: string
}

export default class HasRoleCondition<EnvContext extends DiscordEnvContext> extends Condition<Params, EnvContext> {
    public async preinit(context: FrozenContext<GlobalContext["preinit"] & EnvContext["preinit"]>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.Guilds)
    }
    
    protected async check(parameters: Params, _context: FrozenContext<GlobalContext["init"] & EnvContext["init"]>): Promise<boolean> {
        if(!parameters.user)
            return false;
        return parameters.user.roles.resolve(parameters.roleId) != null
    }
}