import { Scenario, ScenarioCreator } from "../core/scenario";
import AddRolesAction from "../discord/actions/add_roles";
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
              .do(new AddRolesAction(ctx => ({user: ctx.receivedMessage.member, roleIds: [parameters.baseRoleId, ...parameters.additionalRoleIds], reason: "User passed automated initiation"})))
              .do(new SendMessageAction(ctx =>({message: `Welcome to the guild ${ctx.receivedMessage.author}!`, channelId: parameters.channelId})))
    }
}