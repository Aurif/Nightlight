import DelayModifier from "../core/modifiers/delay";
import { ScenarioCreator, Scenario } from "../core/scenario";
import PretendTypingAction from "../discord/actions/pretend_typing";
import SendMessageAction from "../discord/actions/send_message";
import HasRoleCondition from "../discord/conditions/has_role";
import { DiscordEnvContext } from "../discord/module";
import MessageSentTrigger from "../discord/triggers/message_sent";

type Params = {
    channelId: string,
    baseRoleId: string,
    additionalRoleIds: string[]
}

export default class TheGateScenario<EnvContext extends DiscordEnvContext> extends Scenario<Params, EnvContext> {
    public do(parameters: Params, create: ScenarioCreator<EnvContext>): void {
        create.on(new MessageSentTrigger({channelId: parameters.channelId}))
              .ifNot(new HasRoleCondition(ctx => ({user: ctx.receivedMessage.member, roleId: parameters.baseRoleId})))
              .do(new SendMessageAction(ctx =>({message: `Welcome to the guild ${ctx.receivedMessage.author}!`, channelId: parameters.channelId})))
              .doForked(fork => {
                fork.do(new PretendTypingAction({channelId: parameters.channelId, duration: 2000}));
                fork.with(new DelayModifier({delay: 3000}))
                    .do(new SendMessageAction(ctx =>({message: `Repeating, received message \`${ctx.receivedMessage.content}\``, channelId: parameters.channelId, replyTo: ctx.sentMessage})))
              })    
    }
}