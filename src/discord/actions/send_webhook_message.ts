import { BaseGuildTextChannel, IntentsBitField, Message, ThreadChannel, Webhook, WebhookMessageOptions } from "discord.js";
import { PreinitContext, InitContext, InitOutContext } from "../../core/context";
import { DiscordEnvContext } from "../module";
import { MessageSender, MessageSenderParams } from "../utils/message_sender";

type Params = MessageSenderParams & {
    channel: BaseGuildTextChannel
    threadChannel?: ThreadChannel | null
    name: string
    avatarURL: string | null
    reason: string
}
type ContextAdditions = {
    sentMessage: Message
}

export default class SendWebhookMessageAction<EnvContext extends DiscordEnvContext> extends MessageSender<Params, ContextAdditions, EnvContext> {
    public async preinit(context: PreinitContext<EnvContext>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.GuildWebhooks)
    }

    protected async run(parameters: Params, context: InitContext<EnvContext>): Promise<InitOutContext<EnvContext, ContextAdditions>> {
        let webhook = await this.makeWebhook(parameters.channel, parameters);
        let messagePayload = this.prepareWebhookMessagePayload(parameters);
        let sentMessage = await webhook.send(messagePayload);
        webhook.delete();
        return context.add({sentMessage: sentMessage});
    }

    private async makeWebhook(channel: BaseGuildTextChannel, parameters: Params): Promise<Webhook> {
        let webhook = await channel.createWebhook({
            name: parameters.name,
            avatar: parameters.avatarURL,
            reason: parameters.reason
        });
        return webhook;
    }

    private prepareWebhookMessagePayload(parameters: Params): WebhookMessageOptions {
        let payload = this.prepareMessagePayload(parameters) as WebhookMessageOptions;
        if(parameters.threadChannel)
            payload.threadId = parameters.threadChannel.id;

        return payload;
    }
}