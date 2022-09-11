import { IntentsBitField, Message } from "discord.js";
import { Context, FrozenContext, GlobalContext } from "../../core/context";
import { Trigger } from "../../core/logic";
import { DiscordEnvContext } from "../module";

type Params = {
    channelId: string
}
type ContextAdditions = {
    receivedMessage: Message
}

export default class MessageSentTrigger<EnvContext extends DiscordEnvContext> extends Trigger<Params, ContextAdditions, EnvContext> {
    public async preinit(context: FrozenContext<GlobalContext["preinit"] & EnvContext["preinit"]>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.GuildMessages)
        context.registerIntent(IntentsBitField.Flags.MessageContent)
    }

    protected async init(parameters: Params, context: FrozenContext<GlobalContext["init"] & EnvContext["init"]>, callback: (context: Context<GlobalContext["init"] & EnvContext["init"] & ContextAdditions>) => void): Promise<void> {
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