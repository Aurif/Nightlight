import { Scenario, ScenarioCreator } from "../core/scenario";
import ReplyToInteractionAction from "../discord/actions/reply_to_interaction";
import { DiscordEnvContext } from "../discord/module";
import MessageContextMenuTrigger from "../discord/triggers/message_context_menu";

type Params = {
}

export default class MessageMoverScenario<EnvContext extends DiscordEnvContext> extends Scenario<Params, EnvContext> {
    public do(_parameters: Params, create: ScenarioCreator<EnvContext>): void {
        create.on(new MessageContextMenuTrigger({commandName: "Move message"}))
              .do(new ReplyToInteractionAction(ctx =>({message: `Use the \`/here\` command in a channel you want to move this message to`, replyTo: ctx.commandInteraction, ephemeral: true})))
    }
}