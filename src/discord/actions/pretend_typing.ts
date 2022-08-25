import { IntentsBitField } from "discord.js";
import { Context, FrozenContext } from "../../core/context"
import { Chain } from "../../core/logic"
import { DiscordEnvContext } from "../module";

type Params = {
    channelId: string
    duration: number
}
type ContextAdditions = {
}

export default class PretendTypingAction<EnvContext extends DiscordEnvContext> extends Chain<Params, ContextAdditions, EnvContext> {
    protected async preinit(context: FrozenContext<{} & EnvContext["preinit"]>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.GuildMessages)
    }

    protected async run(parameters: Params, context: FrozenContext<EnvContext["init"]>, callback: (context: Context<EnvContext["init"] & ContextAdditions>) => void): Promise<void> {
        let channel = await context.discordGuild.channels.fetch(parameters.channelId);
        if(!channel)
            throw new Error("Channel not found");
        if(!channel.isTextBased())
            throw new Error("Channel is not text based");
        
        channel.sendTyping();
        let typingInterval = setInterval(channel => {
            channel.sendTyping();
        }, 4e3, channel);
        
        setTimeout(() => {
            clearInterval(typingInterval);
            callback(context.add({}));
        }, parameters.duration);
    }
}