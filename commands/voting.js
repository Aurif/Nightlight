const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

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
    
    const row = new MessageActionRow()
			.addComponents(
        new MessageButton()
					.setCustomId('voting:for')
					.setLabel('For')
					.setStyle('SUCCESS'),
        new MessageButton()
					.setCustomId('voting:abstain')
					.setLabel('Abstain')
					.setStyle('SECONDARY'),
        new MessageButton()
					.setCustomId('voting:against')
					.setLabel('Against')
					.setStyle('DANGER')
			);


    voteChannel.send({embeds: [voteEmbed], components: [row]})

    return interaction.reply({ content: `New voting created!`, ephemeral: true });
  },
  buttons: {
    "for": (interaction => {return interaction.update({ content: 'For!' });}),
    "abstain": (interaction => {return interaction.update({ content: 'Abstain!' });}),
    "against": (interaction => {return interaction.update({ content: 'Against!' });})
  }
};