import { FrozenContext } from "../../core/context"
import { Action } from "../../core/logic"

type Params = {
    message: string,
    channelId: string
}

export default class SendMessageAction<ContextAdditions extends {discordGuild: any}> extends Action<Params, ContextAdditions> {
    protected async run(parameters: Params, context: FrozenContext<ContextAdditions>): Promise<void> {
        let channel = await context.discordGuild.channels.fetch(parameters.channelId);
        let sentMessage = await channel.send(parameters.message);
        context.add({sentMessage: sentMessage})
    }
}