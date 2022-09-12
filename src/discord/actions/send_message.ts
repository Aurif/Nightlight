import { IntentsBitField, Message } from "discord.js";
import { PreinitContext, InitContext, InitOutContext } from "../../core/context";
import { DiscordEnvContext } from "../module";
import { BareMessageSenderParams, MessageSender } from "../utils/message_sender";

type Params = BareMessageSenderParams & {
    message: string
    channelId: string
}
type ContextAdditions = {
    sentMessage: Message
}

export default class SendMessageAction<EnvContext extends DiscordEnvContext> extends MessageSender<Params, ContextAdditions, EnvContext> {
    public async preinit(context: PreinitContext<EnvContext>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.GuildMessages)
    }

    protected async run(parameters: Params, context: InitContext<EnvContext>): Promise<InitOutContext<EnvContext, ContextAdditions>> {
        let channel = await this.getChannel(parameters.channelId, context);
        let messagePayload = this.prepareMessagePayload(parameters);
        let sentMessage = await channel.send(messagePayload);
        return context.add({sentMessage: sentMessage});
    }
}