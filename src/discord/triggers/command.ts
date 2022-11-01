import { ChatInputCommandInteraction, GuildMember, TextBasedChannel } from "discord.js";
import { InitContext, InitOutContext } from "../../core/context";
import { Trigger } from "../../core/logic";
import { DiscordEnvContext } from "../module";

type Params = {
    commandName: string,
    commandDescription: string,
}
type ContextAdditions = {
    commandChannel: TextBasedChannel
    commandExecutingUser: GuildMember
    commandInteraction: ChatInputCommandInteraction
}

export default class CommandTrigger<EnvContext extends DiscordEnvContext> extends Trigger<Params, ContextAdditions, EnvContext> {
    protected async init(parameters: Params, context: InitContext<EnvContext>, callback: (context: InitOutContext<EnvContext, ContextAdditions>) => void): Promise<void> {
        await context.discordGuild.commands.create({
            name: parameters.commandName,
            description: parameters.commandDescription,
        })

        context.discordClient.on('interactionCreate', async interaction => {
            if(interaction.guildId == context.discordGuild.id 
            && interaction.isChatInputCommand()
            && interaction.commandName == parameters.commandName) {
                if(!interaction.member || !interaction.guild) return;
                let channel = await interaction.guild.channels.fetch(interaction.channelId) as TextBasedChannel;
                if(!channel) return;

                callback(context.add({
                    commandChannel: channel,
                    commandExecutingUser: interaction.member as GuildMember,
                    commandInteraction: interaction
                }));
            }
        })
    }
}