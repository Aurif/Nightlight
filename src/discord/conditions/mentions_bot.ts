import { Message } from "discord.js";
import { InitContext } from "../../core/context";
import { Condition } from "../../core/logic"
import { DiscordEnvContext } from "../module";

type Params = {
    message: Message
}

export default class MentionsBotCondition<EnvContext extends DiscordEnvContext> extends Condition<Params, EnvContext> {
    protected async check(parameters: Params, context: InitContext<EnvContext>): Promise<boolean> {
        return parameters.message.mentions.has(context.discordClient.user!)
    }
}