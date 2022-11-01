import { APIEmbed, JSONEncodable, Message, MessageOptions, TextChannel } from "discord.js";
import { InitContext } from "../../core/context";
import { Action } from "../../core/logic";
import { DiscordEnvContext } from "../module";

export type BareMessageOptions = Omit<MessageOptions, 'reply' | 'stickers' | 'flags'>
export type BareMessageSenderParams = {
    message?: string
    embded?: APIEmbed | JSONEncodable<APIEmbed>
}
export abstract class BareMessageSender<Params extends BareMessageSenderParams, ContextAdditions, EnvContext extends DiscordEnvContext> extends Action<Params, ContextAdditions, EnvContext> {
    protected prepareBareMessagePayload(parameters: Params): BareMessageOptions {
        let messagePayload: BareMessageOptions = {}
        if (parameters.message) messagePayload.content = parameters.message;
        if (parameters.embded) messagePayload.embeds = [parameters.embded];
        return messagePayload;
    }
}

export type MessageSenderParams = BareMessageSenderParams & {
    replyTo?: Message
}
export abstract class MessageSender<Params extends MessageSenderParams, ContextAdditions, EnvContext extends DiscordEnvContext> extends BareMessageSender<Params, ContextAdditions, EnvContext> {
    protected async getChannel(channelId: string, context: InitContext<EnvContext>): Promise<TextChannel> {
        let channel = await context.discordGuild.channels.fetch(channelId);
        if(!channel)
            throw new Error("Channel not found");
        if(!channel.isTextBased())
            throw new Error("Channel is not text based");
        return channel as TextChannel;
    }

    protected prepareMessagePayload(parameters: Params): MessageOptions {
        let messagePayload = this.prepareBareMessagePayload(parameters) as MessageOptions;
        
        if(parameters.replyTo && parameters.replyTo instanceof Message)
            messagePayload.reply = {messageReference: parameters.replyTo}

        return messagePayload;
    }
}