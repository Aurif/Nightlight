import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message, MessageComponentInteraction, ButtonInteraction } from "discord.js";
import { InitContext, InitOutContext } from "../../core/context";
import { Modifier } from "../../core/logic"
import { DiscordEnvContext } from "../module";

type Params = {
    message: Message,
    buttons: {[id: string]: {
        label?: string,
        style?: keyof typeof ButtonStyle,
        disabled?: boolean,
        emoji?: string
    }}
}
type ContextAdditions = {
    pressedButton: string,
    buttonInteraction: ButtonInteraction
}

export default class MessageButtonsModifier<EnvContext extends DiscordEnvContext> extends Modifier<Params, ContextAdditions, EnvContext> {
    protected async init(parameters: Params, context: InitContext<EnvContext>, callback: (context: InitOutContext<EnvContext, ContextAdditions>) => void): Promise<void> {
        const row = new ActionRowBuilder<ButtonBuilder>()

        for(let key in parameters.buttons) {
            let buttonConfig = parameters.buttons[key]
            const button = new ButtonBuilder().setCustomId(key)
            
            button.setStyle(ButtonStyle[buttonConfig.style || "Primary"])
            if(buttonConfig.label) button.setLabel(buttonConfig.label)
            if(buttonConfig.emoji) button.setEmoji(buttonConfig.emoji)
            if(buttonConfig.disabled) button.setDisabled(true)

            row.addComponents(button);
        }

        await parameters.message.edit({components: [row]});
        const filter = (interaction: MessageComponentInteraction) => {
            if(!interaction.isButton()) return false
            for(let key in parameters.buttons) {
                if(interaction.customId === key) return true
            }
            return false
        }
        const collector = parameters.message.createMessageComponentCollector({ filter });
        collector.on('collect', i => {
            if(!i.isButton()) return
            callback(context.add({
                pressedButton: i.customId,
                buttonInteraction: i
            }))
        });
        
    }
}