import { GuildMember, IntentsBitField } from "discord.js";
import { PreinitContext, InitContext } from "../../core/context";
import { Condition } from "../../core/logic"
import { DiscordEnvContext } from "../module";

type Params = {
    user: GuildMember | null,
    roleId: string
}

export default class HasRoleCondition<EnvContext extends DiscordEnvContext> extends Condition<Params, EnvContext> {
    public async preinit(context: PreinitContext<EnvContext>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.Guilds)
    }
    
    protected async check(parameters: Params, _context: InitContext<EnvContext>): Promise<boolean> {
        if(!parameters.user)
            return false;
        return parameters.user.roles.resolve(parameters.roleId) != null
    }
}