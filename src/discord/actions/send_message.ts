import { IntentsBitField, Message, MessageOptions } from "discord.js";
import { Context, FrozenContext } from "../../core/context"
import { Chain } from "../../core/logic"
import { DiscordEnvContext } from "../module";

type Params = {
    message: string
    channelId: string
    replyTo?: Message
}
type ContextAdditions = {
    sentMessage: Message
}

export default class SendMessageAction<EnvContext extends DiscordEnvContext> extends Chain<Params, ContextAdditions, EnvContext> {
    protected async preinit(context: FrozenContext<{} & EnvContext["preinit"]>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.GuildMessages)
    }

    protected async run(parameters: Params, context: FrozenContext<EnvContext["init"]>, callback: (context: Context<EnvContext["init"] & ContextAdditions>) => void): Promise<void> {
        let channel = await context.discordGuild.channels.fetch(parameters.channelId);
        if(!channel)
            throw new Error("Channel not found");
        if(!channel.isTextBased())
            throw new Error("Channel is not text based");
        
        let messagePayload: MessageOptions = {
            content: parameters.message
        }
        if(parameters.replyTo)
            messagePayload.reply = {messageReference: parameters.replyTo}

        let sentMessage = await channel.send(messagePayload);
        callback(context.add({sentMessage: sentMessage}));
    }
}