import { IntentsBitField, Message, MessageOptions, TextChannel } from "discord.js";
import { Context, FrozenContext, GlobalContext } from "../../core/context"
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
    public async preinit(context: FrozenContext<GlobalContext["preinit"] & EnvContext["preinit"]>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.GuildMessages)
    }

    protected async run(parameters: Params, context: FrozenContext<GlobalContext["init"] & EnvContext["init"]>): Promise<Context<GlobalContext["init"] & EnvContext["init"] & ContextAdditions>> {
        let channel = await this.getChannel(parameters.channelId, context);
        let messagePayload = this.prepareMessagePayload(parameters);
        let sentMessage = await channel.send(messagePayload);
        return context.add({sentMessage: sentMessage});
    }

    private async getChannel(channelId: string, context: FrozenContext<GlobalContext["init"] & EnvContext["init"]>): Promise<TextChannel> {
        let channel = await context.discordGuild.channels.fetch(channelId);
        if(!channel)
            throw new Error("Channel not found");
        if(!channel.isTextBased())
            throw new Error("Channel is not text based");
        return channel as TextChannel;
    }

    private prepareMessagePayload(parameters: Params): MessageOptions {
        let messagePayload: MessageOptions = {
            content: parameters.message
        }
        
        if(parameters.replyTo && parameters.replyTo instanceof Message)
            messagePayload.reply = {messageReference: parameters.replyTo}

        return messagePayload;
    }
}