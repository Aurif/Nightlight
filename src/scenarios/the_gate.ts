import { ScenarioCreator, Scenario } from "../core/scenario";
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
    }
    
}