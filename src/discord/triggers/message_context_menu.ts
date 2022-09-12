import { ApplicationCommandType, GuildMember, IntentsBitField, Message, MessageContextMenuCommandInteraction, TextBasedChannel } from "discord.js";
import { PreinitContext, InitContext, InitOutContext } from "../../core/context";
import { Trigger } from "../../core/logic";
import { DiscordEnvContext } from "../module";

type Params = {
    commandName: string,
}
type ContextAdditions = {
    commandTargetMessageChannel: TextBasedChannel
    commandTargetMessage: Message
    commandExecutingUser: GuildMember
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
                if(!interaction.member || !interaction.guild) return;
                let channel = await interaction.guild.channels.fetch(interaction.channelId) as TextBasedChannel;
                if(!channel) return;

                callback(context.add({
                    commandTargetMessageChannel: channel,
                    commandTargetMessage: interaction.targetMessage, 
                    commandExecutingUser: interaction.member as GuildMember,
                    commandInteraction: interaction
                }));
            }
        })
    }
}