import { EmptyParams, Scenario, ScenarioCreator } from "../core/scenario";
import DeleteMessageAction from "../discord/actions/delete_message";
import ReplyToInteractionAction from "../discord/actions/reply_to_interaction";
import SendWebhookMessageAction from "../discord/actions/send_webhook_message";
import ChannelTargeterModifier from "../discord/modifiers/channel_targeter";
import { DiscordEnvContext } from "../discord/module";
import MessageContextMenuTrigger from "../discord/triggers/message_context_menu";

type Params = EmptyParams

export default class MessageMoverScenario<EnvContext extends DiscordEnvContext> extends Scenario<Params, EnvContext> {
    public do(_parameters: Params, create: ScenarioCreator<EnvContext>): void {
        create.on(new MessageContextMenuTrigger({commandName: "Move message"}))
              .do(new ReplyToInteractionAction(ctx =>({message: `Use the \`/here\` command in a channel you want to move this message to`, replyTo: ctx.commandInteraction, ephemeral: true})))
              .with(new ChannelTargeterModifier(ctx => ({user: ctx.commandExecutingUser})))
              .do(new ReplyToInteractionAction(ctx =>({message: `Moving message...`, replyTo: ctx.targeterInteraction, ephemeral: true})))
              .do(new SendWebhookMessageAction(ctx => ({message: ctx.commandTargetMessage.content, 
                                                        channel: ctx.targeterChannel, 
                                                        threadChannel: ctx.targeterThreadChannel,
                                                        name: ctx.commandTargetMessage.member?.displayName || ctx.commandTargetMessage.author.username, 
                                                        avatarURL: ctx.commandTargetMessage.member?.displayAvatarURL() || ctx.commandTargetMessage.author.avatarURL(),
                                                        reason: `${ctx.commandExecutingUser.displayName} is moving message from ${ctx.commandTargetMessage.channel.toString()}`,
                                                        embded: {description: `Moved from ${ctx.commandTargetMessage.channel.toString()}`}
                                                })))
              .do(new DeleteMessageAction(ctx => ({message: ctx.commandTargetMessage})))
    }
}