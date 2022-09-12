import { CommandInteraction, InteractionReplyOptions, Message } from "discord.js";
import { InitContext, InitOutContext } from "../../core/context";
import { DiscordEnvContext } from "../module";
import { BareMessageSender, BareMessageSenderParams } from "../utils/message_sender";

type Params = BareMessageSenderParams & {
    replyTo: CommandInteraction
    ephemeral?: boolean
}
type ContextAdditions = {
    interactionReply: Message
}

export default class ReplyToInteractionAction<EnvContext extends DiscordEnvContext> extends BareMessageSender<Params, ContextAdditions, EnvContext> {
    protected async run(parameters: Params, context: InitContext<EnvContext>): Promise<InitOutContext<EnvContext, ContextAdditions>> {
        let response = await parameters.replyTo.reply({...this.prepareMessagePayload(parameters), fetchReply: true});
        return context.add({interactionReply: response});
    }

    private prepareMessagePayload(parameters: Params): InteractionReplyOptions {
        let messagePayload = this.prepareBareMessagePayload(parameters) as InteractionReplyOptions;
        messagePayload.ephemeral = !!parameters.ephemeral;
        return messagePayload;
    }
}