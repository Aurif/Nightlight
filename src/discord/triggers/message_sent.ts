import { IntentsBitField, Message } from "discord.js";
import { PreinitContext, InitContext, InitOutContext } from "../../core/context";
import { Trigger } from "../../core/logic";
import { DiscordEnvContext } from "../module";

type Params = {
    channelId: string
}
type ContextAdditions = {
    receivedMessage: Message
}

export default class MessageSentTrigger<EnvContext extends DiscordEnvContext> extends Trigger<Params, ContextAdditions, EnvContext> {
    public async preinit(context: PreinitContext<EnvContext>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.GuildMessages)
        context.registerIntent(IntentsBitField.Flags.MessageContent)
    }

    protected async init(parameters: Params, context: InitContext<EnvContext>, callback: (context: InitOutContext<EnvContext, ContextAdditions>) => void): Promise<void> {
        let channel = await context.discordGuild.channels.fetch(parameters.channelId);
        if(!channel)
            throw new Error("Channel not found");
        if(!channel.isTextBased())
            throw new Error("Channel is not text based");
        
        channel.createMessageCollector().on('collect', (message: Message) => {
            if(message.author.bot) return

            let newContext = context.add({receivedMessage: message});
            callback(newContext);
        })
    }
}