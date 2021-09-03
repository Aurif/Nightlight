const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { Collection } = require('discord.js');
const Client = new (require("@replit/database"))();

async function castVote(interaction, guildConfig, vote) {
  let dbId = interaction.message.id
  let coll = ((await Client.get(dbId)) || {})

  coll[interaction.user.id] = vote
  await Client.set(dbId, coll)

  return await updateVotingMessage(interaction, guildConfig)
}

async function updateVotingMessage(interaction, guildConfig) {
  let message = interaction.message
  const voteChannel = await interaction.guild.channels.fetch(guildConfig.votingChannel)
  // await interaction.guild.members.fetch()
  const members = voteChannel.members.filter(user => user.user.bot)
  console.log(voteChannel.members)

  let count = { "for": 0, "abstain": 0, "against": 0, "all": 0 }
  let coll = ((await Client.get(message.id)) || {})
  for (c in coll) {count[coll[c]]++; count["all"]++}

  let newEmbed = new MessageEmbed(message.embeds[0])
      .setDescription(`For: ${count.for}\nAgainst: ${count.against}\nAbstain: ${count.abstain}`)
      .setFooter(count.all+'/'+members.size+' votes casted\nVoting ends: ')
  
  return await interaction.update({embeds: [newEmbed]})
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voting')
    .setDescription('Creates a new for/against voting.')
    .addStringOption(option => option.setName('proposal').setDescription('The proposal for users to vote on')),
  async execute(interaction, guildConfig) {
    const guild = interaction.guild;
    const voteChannel = await guild.channels.fetch(guildConfig.votingChannel)
    // await interaction.guild.members.fetch()
    const members = voteChannel.members.filter(user => !user.user.bot)

    const voteEmbed = new MessageEmbed()
      .setColor('#181a43')
      .setAuthor('VOTING', 'https://media.discordapp.net/attachments/557227661131251733/882377586204885043/voting.png')
      .setTitle(interaction.options.getString('proposal'))
      .setDescription(`There are no votes yet!`)
      .setFooter('0/'+members.size+' votes casted\nVoting ends: ')
      .setImage('http://filmos.net/assets/images/FilmosMed.png')
      .setTimestamp(Math.round(Date.now()/(1000*60*15)+4*24*3)*1000*60*15)

    const voteButtons = new MessageActionRow()
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

    voteChannel.send({ embeds: [voteEmbed], components: [voteButtons] })
    return interaction.reply({ content: `New voting created!`, ephemeral: true });
  },
  buttons: {
    "for": (async (int, guildConfig) => { return await castVote(int, guildConfig, "for") }),
    "abstain": (async (int, guildConfig) => { return await castVote(int, guildConfig, "abstain") }),
    "against": (async (int, guildConfig) => { return await castVote(int, guildConfig, "against") })
  }
};