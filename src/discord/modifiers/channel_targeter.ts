import { BaseGuildTextChannel, ChannelType, ChatInputCommandInteraction, GuildMember, ThreadChannel } from "discord.js";
import { TempCache } from "../../core/cache";
import { InitContext, InitOutContext, PreinitContext } from "../../core/context";
import { Modifier } from "../../core/logic"
import { DiscordEnvContext } from "../module";

type Params = {
    user: GuildMember
}
type ContextAdditions = {
    targeterChannel: BaseGuildTextChannel
    targeterThreadChannel: ThreadChannel | null
    targeterInteraction: ChatInputCommandInteraction
}

export default class ChannelTargeterModifier<EnvContext extends DiscordEnvContext> extends Modifier<Params, ContextAdditions, EnvContext> {
    private cachedAction!: TempCache<any>;

    public async preinit(context: PreinitContext<EnvContext>): Promise<void> {
        this.cachedAction = context.cache.make("ChannelTargeter");
    }
    
    protected async init(parameters: Params, context: InitContext<EnvContext>, callback: (context: InitOutContext<EnvContext, ContextAdditions>) => void): Promise<void> {
        if(!this.cachedAction.get("init")) {
            this.cachedAction.set("init", true);

            await context.discordGuild.commands.create({
                name: "here",
                description: 'This command selects the channel it was run in, for use in combination with other commands.',
            })
    
            context.discordClient.on('interactionCreate', async interaction => {
                if(interaction.guildId == context.discordGuild.id 
                && interaction.isChatInputCommand()
                && interaction.commandName == "here") {
                    let user = interaction.member as GuildMember;
                    if(!user) return;
                    let targeterCallback = this.cachedAction.get("callback_"+user.id);
                    if(targeterCallback) targeterCallback(interaction);
                    else interaction.reply({content: "No action is waiting for selecting a channel.", ephemeral: true});
                }
            })
        }

        this.cachedAction.set("callback_"+parameters.user.id, async (target: ChatInputCommandInteraction) => {
            if(!target.guild) return;
            let channel = await target.guild.channels.fetch(target.channelId);
            if(!channel || channel.type == ChannelType.GuildCategory || channel.type == ChannelType.GuildVoice || channel.type == ChannelType.GuildStageVoice) return;
            
            let threadChannel = null
            if(channel.isThread()) {
                threadChannel = channel as ThreadChannel;
                if(!threadChannel.parentId) return;
                let parentChannel = await target.guild.channels.fetch(threadChannel.parentId);
                if(!parentChannel || parentChannel.type == ChannelType.GuildCategory || parentChannel.type == ChannelType.GuildVoice || parentChannel.type == ChannelType.GuildStageVoice) return;
                channel = parentChannel;
            }

            callback(context.add({
                targeterChannel: channel, 
                targeterInteraction: target,
                targeterThreadChannel: threadChannel
            }));
            this.cachedAction.set("callback_"+parameters.user.id, null);
        })
    }
}