import { APIInteractionGuildMember, ApplicationCommandType, GuildMember, IntentsBitField, Message, MessageContextMenuCommandInteraction } from "discord.js";
import { PreinitContext, InitContext, InitOutContext } from "../../core/context";
import { Trigger } from "../../core/logic";
import { DiscordEnvContext } from "../module";

type Params = {
    commandName: string,
}
type ContextAdditions = {
    commandTargetMessage: Message
    commandExecutingUser: GuildMember | APIInteractionGuildMember | null,
    commandInteraction: MessageContextMenuCommandInteraction
}

export default class MessageContextMenuTrigger<EnvContext extends DiscordEnvContext> extends Trigger<Params, ContextAdditions, EnvContext> {
    public async preinit(context: PreinitContext<EnvContext>): Promise<void> {
        context.registerIntent(IntentsBitField.Flags.MessageContent)
    }
    protected async init(parameters: Params, context: InitContext<EnvContext>, callback: (context: InitOutContext<EnvContext, ContextAdditions>) => void): Promise<void> {
        await context.discordGuild.commands.create({
            name: parameters.commandName,
            type: ApplicationCommandType.Message
        })

        context.discordClient.on('interactionCreate', async interaction => {
            if(interaction.guildId == context.discordGuild.id 
            && interaction.isMessageContextMenuCommand() 
            && interaction.commandName == parameters.commandName) {
                callback(context.add({
                    commandTargetMessage: interaction.targetMessage, 
                    commandExecutingUser: interaction.member,
                    commandInteraction: interaction
                }));
            }
        })
    }
}