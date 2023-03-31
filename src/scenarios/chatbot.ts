import { Scenario, ScenarioCreator } from "../core/scenario";
import GetPreviousMessagesAction from "../discord/actions/get_previous_messages";
import PretendTypingAction from "../discord/actions/pretend_typing";
import SendMessageAction from "../discord/actions/send_message";
import MentionsBotCondition from "../discord/conditions/mentions_bot";
import { DiscordEnvContext } from "../discord/module";
import MessageSentTrigger from "../discord/triggers/message_sent";
import CreateChatCompletionAction from "../openai/actions/create_chat_completion";
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
              .do(new CreateChatCompletionAction(ctx => {
                let extra_prompt = ""
                let today = new Date()
                if(today.getMonth() == 3 && today.getDate() == 1)
                    extra_prompt = ' Respond to in an extremely over-the-top furry way. UwU-ify your responses, use phrases such as "uwu" and "owo", and emotes such as "^^", "x3" and ">.<".'

                let messages = [{role: ("system" as "system"|"user"|"assistant"), content: 'You are a friendly chatbot called Nightlight.'+extra_prompt}]
                
                for(let i=Math.min(ctx.previousMessages.length, parameters.maxPreviousMessages)-1; i>=0; i--) {
                    if(ctx.previousMessages[i].cleanContent.length + JSON.stringify(messages).length >= parameters.maxPromptLength) break
                    messages.push({
                        role: ctx.previousMessages[i].author.id == ctx.discordClient.user?.id ? "assistant" : "user", 
                        content: ctx.previousMessages[i].cleanContent
                    })
                }
                return {prompt: messages, user: ctx.receivedMessage.author.id}
              }))
              .do(new PretendTypingAction(ctx => ({channelId: ctx.receivedMessage.channelId, duration: Math.sqrt(ctx.promptCompletion.length)*150})))
              .do(new SendMessageAction(ctx =>({message: ctx.promptCompletion, channelId: ctx.receivedMessage.channelId})))
    }
}