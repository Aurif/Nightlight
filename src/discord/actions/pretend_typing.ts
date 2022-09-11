import { IntentsBitField } from "discord.js";
import { PreinitContext, InitContext, InitOutContext } from "../../core/context";
import { Action } from "../../core/logic"
import { DiscordEnvContext } from "../module";

type Params = {
    channelId: string
    duration: number
}
type ContextAdditions = {
}

export default class PretendTypingAction<EnvContext extends DiscordEnvContext> extends Action<Params, ContextAdditions, EnvContext> {
    public async preinit(context: PreinitContext<EnvContext>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.GuildMessages)
    }

    protected async run(parameters: Params, context: InitContext<EnvContext>): Promise<InitOutContext<EnvContext, ContextAdditions>> {
        let channel = await context.discordGuild.channels.fetch(parameters.channelId);
        if(!channel)
            throw new Error("Channel not found");
        if(!channel.isTextBased())
            throw new Error("Channel is not text based");
        
        channel.sendTyping();
        let typingInterval = setInterval(channel => {
            channel.sendTyping();
        }, 4e3, channel);
        
        return new Promise(resolve => {
            setTimeout(() => {
                clearInterval(typingInterval);
                resolve(context);
            }, parameters.duration);
        })
    }
}