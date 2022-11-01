import { IntentsBitField, Message } from "discord.js";
import { PreinitContext, InitContext, InitOutContext } from "../../core/context";
import { DiscordEnvContext } from "../module";
import { BareMessageSender, BareMessageSenderParams } from "../utils/message_sender";

type Params = BareMessageSenderParams & {
    toEdit: Message
}
type ContextAdditions = {
}

export default class EditMessageAction<EnvContext extends DiscordEnvContext> extends BareMessageSender<Params, ContextAdditions, EnvContext> {
    public async preinit(context: PreinitContext<EnvContext>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.GuildMessages)
    }

    protected async run(parameters: Params, context: InitContext<EnvContext>): Promise<InitOutContext<EnvContext, ContextAdditions>> {
        let messagePayload = this.prepareBareMessagePayload(parameters);
        await parameters.toEdit.edit(messagePayload)
        return context;
    }
}