import { CommandInteraction, InteractionReplyOptions } from "discord.js";
import { Context, FrozenContext, GlobalContext } from "../../core/context";
import { Action } from "../../core/logic";
import { DiscordEnvContext } from "../module";

type Params = {
    message: string
    replyTo: CommandInteraction
    ephemeral?: boolean
}
type ContextAdditions = {
}

export default class ReplyToInteractionAction<EnvContext extends DiscordEnvContext> extends Action<Params, ContextAdditions, EnvContext> {
    protected async run(parameters: Params, context: FrozenContext<GlobalContext["init"] & EnvContext["init"]>): Promise<Context<GlobalContext["init"] & EnvContext["init"] & ContextAdditions>> {
        await parameters.replyTo.reply(this.prepareMessagePayload(parameters));
        return context.unfreeze();
    }

    private prepareMessagePayload(parameters: Params): InteractionReplyOptions {
        return {
            content: parameters.message,
            ephemeral: !!parameters.ephemeral
        }
    }
}