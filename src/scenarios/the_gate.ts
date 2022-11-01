import BaseCondition from "../core/conditions/has_role";
import { Scenario, ScenarioCreator } from "../core/scenario";
import AddRolesAction from "../discord/actions/add_roles";
import PretendTypingAction from "../discord/actions/pretend_typing";
import SendMessageAction from "../discord/actions/send_message";
import HasRoleCondition from "../discord/conditions/has_role";
import { DiscordEnvContext } from "../discord/module";
import MessageSentTrigger from "../discord/triggers/message_sent";
import CreateCompletionAction from "../openai/actions/create_completion";
import { OpenAIEnvContext } from "../openai/module";

type Params = {
    channelId: string,
    baseRoleId: string,
    additionalRoleIds: string[]
}

export default class TheGateScenario<EnvContext extends DiscordEnvContext & OpenAIEnvContext> extends Scenario<Params, EnvContext> {
    public do(parameters: Params, create: ScenarioCreator<EnvContext>): void {
        create.on(new MessageSentTrigger({channelId: parameters.channelId}))
              .ifNot(new HasRoleCondition(ctx => ({user: ctx.receivedMessage.member, roleId: parameters.baseRoleId})))
              .do(new AddRolesAction(ctx => ({user: ctx.receivedMessage.member, roleIds: [parameters.baseRoleId, ...parameters.additionalRoleIds], reason: "User passed automated initiation"})))
              .do(new PretendTypingAction({channelId: parameters.channelId, duration: 10}))
              .do(new CreateCompletionAction(ctx =>({prompt: `Respond to the following message:\n${ctx.receivedMessage.content}\n`, modelType: 'high', user: ctx.receivedMessage.author.id})))
              .do(new PretendTypingAction(ctx => ({channelId: parameters.channelId, duration: ctx.promptCompletion.length*50})))
              .do(new SendMessageAction(ctx =>({message: ctx.promptCompletion, channelId: parameters.channelId})))
              .if(new BaseCondition(ctx => ({value: ctx.promptCompletion.slice(-1) !== "?"})))
              .do(new PretendTypingAction({channelId: parameters.channelId, duration: 10}))
              .do(new CreateCompletionAction(ctx =>({prompt: `Respond to the following message with a question:\n${ctx.receivedMessage.content}\n`, modelType: 'high', user: ctx.receivedMessage.author.id})))
              .do(new PretendTypingAction(ctx => ({channelId: parameters.channelId, duration: ctx.promptCompletion.length*50})))
              .do(new SendMessageAction(ctx =>({message: ctx.promptCompletion, channelId: parameters.channelId})))
    }
}