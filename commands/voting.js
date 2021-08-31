const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voting')
    .setDescription('Creates a new for/against voting.')
    .addStringOption(option => option.setName('proposal').setDescription('The proposal for users to vote on')),
  async execute(interaction, guildConfig) {
    const guild = interaction.guild;
    const voteChannel = await guild.channels.fetch(guildConfig.votingChannel)
    const voteEmbed = new MessageEmbed()
      .setColor('#181a43')
      .setAuthor('VOTING', 'https://media.discordapp.net/attachments/557227661131251733/882377586204885043/voting.png')
      .setTitle(interaction.options.getString('proposal'))
      .setDescription('3 days left\n0/1 votes casted')
	    .setImage('http://filmos.net/assets/images/FilmosMed.png')
    voteChannel.send({embeds: [voteEmbed]})

    return interaction.reply({ content: `New voting created!`, ephemeral: true });
  },
};