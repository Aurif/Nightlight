const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const Client = new (require("@replit/database"))();

async function addToMemory(interaction, count) {
  let dbId = interaction.message.id
  let cur = ((await Client.get(dbId))||0)*1+count
  await Client.set(dbId, cur)
  console.log(cur)
  return "Votes: "+cur
}

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
      .setDescription('For: 0\nAgainst: 0\nAbstain: 0')
      .setFooter('3 days left\n0/1 votes casted')
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
    "for": (async int => {return int.update({ content: await addToMemory(int, 1) });}),
    "abstain": (async int => {return int.update({ content: await addToMemory(int, 0) });}),
    "against": (async int => {return int.update({ content: await addToMemory(int, -1) });})
  }
};