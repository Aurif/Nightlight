import { IntentsBitField, Message } from "discord.js";
import { InitContext, InitOutContext, PreinitContext } from "../../core/context";
import { Modifier } from "../../core/logic"
import { DiscordEnvContext } from "../module";

type Params = {
    message: Message,
    buttons: {[id: string]: string}
}
type ContextAdditions = {
    pressedEmote: string
}

export default class MessageReactionButtonsModifier<EnvContext extends DiscordEnvContext> extends Modifier<Params, ContextAdditions, EnvContext> {
    public async preinit(context: PreinitContext<EnvContext>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.GuildMessageReactions)
    }
    
    protected async init(parameters: Params, context: InitContext<EnvContext>, callback: (context: InitOutContext<EnvContext, ContextAdditions>) => void): Promise<void> {
        for(let key in parameters.buttons) {
            parameters.message.react(parameters.buttons[key])
        }

        const collector = parameters.message.createReactionCollector();
        collector.on('collect', (reaction, user) => {
            if(user.bot) return
            for(let key in parameters.buttons) {
                if(reaction.emoji.id === parameters.buttons[key]) {
                    callback(context.add({
                        pressedEmote: key
                    }))
                    reaction.users.remove(user)
                }
            }
            
        });
        
    }
}