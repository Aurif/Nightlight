import { Message } from "discord.js";
import { Context, FrozenContext } from "../../core/context";
import { Trigger } from "../../core/logic";

type Params = {
    channelId: string
}
type ContextAdditions = {
    receivedMessage: Message
}

export default class MessageSentTrigger<EnvContext extends {discordGuild: any}> extends Trigger<Params, ContextAdditions, EnvContext> {
    protected async init(parameters: Params, context: FrozenContext<EnvContext>, callback: (context: Context<EnvContext & ContextAdditions>) => void): Promise<void> {
        let channel = await context.discordGuild.channels.fetch(parameters.channelId);
        channel.createMessageCollector().on('collect', (message: Message) => {
            if(message.author.bot) return

            let newContext = context.add({receivedMessage: message});
            callback(newContext);
        })

    }
}