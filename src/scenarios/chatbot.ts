import { Scenario, ScenarioCreator } from "../core/scenario";
import GetPreviousMessagesAction from "../discord/actions/get_previous_messages";
import PretendTypingAction from "../discord/actions/pretend_typing";
import SendMessageAction from "../discord/actions/send_message";
import MentionsBotCondition from "../discord/conditions/mentions_bot";
import { DiscordEnvContext } from "../discord/module";
import MessageSentTrigger from "../discord/triggers/message_sent";
import CreateCompletionAction from "../openai/actions/create_completion";
import { OpenAIEnvContext } from "../openai/module";

type Params = {
    channelId: string | string[],
    maxPromptLength: number,
    maxPreviousMessages: number
}

export default class ChatBotScenario<EnvContext extends DiscordEnvContext & OpenAIEnvContext> extends Scenario<Params, EnvContext> {
    public do(parameters: Params, create: ScenarioCreator<EnvContext>): void {
        create.on(new MessageSentTrigger({channelId: parameters.channelId}))
              .if(new MentionsBotCondition(ctx => ({message: ctx.receivedMessage})))
              .do(new PretendTypingAction(ctx => ({channelId: ctx.receivedMessage.channelId, duration: 10})))
              .do(new GetPreviousMessagesAction(ctx => ({message: ctx.receivedMessage, maxCount: parameters.maxPreviousMessages})))
              .do(new CreateCompletionAction(ctx => {
                if(ctx.previousMessages.length > 0 && ctx.previousMessages[0].toString().length > parameters.maxPromptLength)
                    return {prompt: `Paraphrase "too much text, didn't read"`, modelType: 'medium', user: "0"}
                
                let prompt = "You are a friendly chatbot called Nightlight"
                for(let i=0; i<Math.min(ctx.previousMessages.length, parameters.maxPreviousMessages); i++) {
                    if(ctx.previousMessages[i].toString().length + prompt.length >= parameters.maxPromptLength) break
                    prompt += `\n${ctx.previousMessages[i].author.username}: ${ctx.previousMessages[i].toString()}`
                }
                prompt += "\nNightlight:"
                return {prompt: prompt, modelType: 'high', user: ctx.receivedMessage.author.id}
              }))
              .do(new PretendTypingAction(ctx => ({channelId: ctx.receivedMessage.channelId, duration: ctx.promptCompletion.length*50})))
              .do(new SendMessageAction(ctx =>({message: ctx.promptCompletion, channelId: ctx.receivedMessage.channelId})))
    }
}