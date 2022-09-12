import { IntentsBitField, Message } from "discord.js";
import { PreinitContext, InitContext, InitOutContext } from "../../core/context";
import { Action } from "../../core/logic";
import { DiscordEnvContext } from "../module";

type Params = {
    message: Message
}
type ContextAdditions = {
}

export default class DeleteMessageAction<EnvContext extends DiscordEnvContext> extends Action<Params, ContextAdditions, EnvContext> {
    public async preinit(context: PreinitContext<EnvContext>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.GuildMessages)
    }

    protected async run(parameters: Params, context: InitContext<EnvContext>): Promise<InitOutContext<EnvContext, ContextAdditions>> {
        await parameters.message.delete();
        return context;
    }
}