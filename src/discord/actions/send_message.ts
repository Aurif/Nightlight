import { IntentsBitField } from "discord.js";
import { FrozenContext } from "../../core/context"
import { Action } from "../../core/logic"
import { DiscordEnvContext } from "../module";

type Params = {
    message: string,
    channelId: string
}

export default class SendMessageAction<EnvContext extends DiscordEnvContext, ContextAdditions> extends Action<Params, EnvContext, ContextAdditions> {
    protected async preinit(context: FrozenContext<{} & EnvContext["preinit"]>): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        context.registerIntent(IntentsBitField.Flags.GuildMessages)
    }

    protected async run(parameters: Params, context: FrozenContext<EnvContext["init"] & ContextAdditions>): Promise<void> {
        let channel = await context.discordGuild.channels.fetch(parameters.channelId);
        if(!channel)
            throw new Error("Channel not found");
        if(!channel.isTextBased())
            throw new Error("Channel is not text based");
        
        let sentMessage = await channel.send(parameters.message);
        context.add({sentMessage: sentMessage})
    }
}