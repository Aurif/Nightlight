import { IntentsBitField, Message, MessageOptions } from "discord.js";
import { Context, FrozenContext } from "../../core/context"
import { Action } from "../../core/logic"
import { DiscordEnvContext } from "../module";

type Params = {
    message: string
    channelId: string
    replyTo?: Message
}
type ContextAdditions = {
    sentMessage: Message
}

export default class SendMessageAction<EnvContext extends DiscordEnvContext> extends Action<Params, ContextAdditions, EnvContext> {
    public async preinit(context: FrozenContext<{} & EnvContext["preinit"]>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.GuildMessages)
    }

    protected async run(parameters: Params, context: FrozenContext<EnvContext["init"]>): Promise<Context<EnvContext["init"] & ContextAdditions>> {
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
        return context.add({sentMessage: sentMessage});
    }
}