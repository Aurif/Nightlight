import { CommandInteraction, IntentsBitField } from "discord.js";
import { PreinitContext, InitContext, InitOutContext } from "../../core/context";
import { Action } from "../../core/logic";
import { DiscordEnvContext } from "../module";

type Params = {
    interaction: CommandInteraction
}
type ContextAdditions = {
}

export default class DeleteInteractionReplyAction<EnvContext extends DiscordEnvContext> extends Action<Params, ContextAdditions, EnvContext> {
    public async preinit(context: PreinitContext<EnvContext>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.GuildMessages)
    }

    protected async run(parameters: Params, context: InitContext<EnvContext>): Promise<InitOutContext<EnvContext, ContextAdditions>> {
        await parameters.interaction.deleteReply();
        return context;
    }
}