import { Message } from "discord.js";
import { InitContext, InitOutContext } from "../../core/context";
import { Action } from "../../core/logic";
import { DiscordEnvContext } from "../module";

type Params = {
    message: Message,
    maxCount: number
}
type ContextAdditions = {
    previousMessages: Message[]
}

export default class GetPreviousMessagesAction<EnvContext extends DiscordEnvContext> extends Action<Params, ContextAdditions, EnvContext>  {
    protected async run(parameters: Params, context: InitContext<EnvContext>): Promise<InitOutContext<EnvContext, ContextAdditions>> {
        let messages = parameters.message.channel.messages.cache
        .filter(m => {return m.createdTimestamp <= parameters.message.createdTimestamp})
        .sort((a,b) => (a.createdTimestamp > b.createdTimestamp ? -1 : a.createdTimestamp < b.createdTimestamp ? 1 : 0))
        .values()

        let messageArray = [] as Message[]
        for(let message of messages) {
            if(messageArray.length >= parameters.maxCount) break
            messageArray.push(message)
        }
        return context.add({previousMessages: messageArray.reverse()});
    }
}