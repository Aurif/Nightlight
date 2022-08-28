import DelayModifier from "../core/modifiers/delay";
import { ScenarioCreator, Scenario } from "../core/scenario";
import PretendTypingAction from "../discord/actions/pretend_typing";
import SendMessageAction from "../discord/actions/send_message";
import { DiscordEnvContext } from "../discord/module";
import MessageSentTrigger from "../discord/triggers/message_sent";

type Params = {
    channelId: string
}

export default class TheGateScenario<EnvContext extends DiscordEnvContext> extends Scenario<Params, EnvContext> {
    public do(parameters: Params, create: ScenarioCreator<EnvContext>): void {
        create.on(new MessageSentTrigger({channelId: parameters.channelId}))
              .do(new SendMessageAction(ctx =>({message: `Received message \`${ctx.receivedMessage.content}\``, channelId: parameters.channelId})))
              .doForked(fork => {
                fork.do(new PretendTypingAction({channelId: parameters.channelId, duration: 2000}));
                fork.with(new DelayModifier({delay: 3000}))
                    .do(new SendMessageAction(ctx =>({message: `Repeating, received message \`${ctx.receivedMessage.content}\``, channelId: parameters.channelId, replyTo: ctx.sentMessage})))
              })    
    }
}