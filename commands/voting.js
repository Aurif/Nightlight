const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, MessageAttachment } = require('discord.js');
const { Collection } = require('discord.js');
const { DataBase } = require("./../proxy/load.js");
var Jimp = require('jimp');
var tinycolor = require("tinycolor2");



async function loadInColor(image, color) {
  color = tinycolor(color)
  image = image.clone()
  return image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    let absS = this.bitmap.data[idx + 1]/2.56
    let absL = this.bitmap.data[idx + 2]/2.56

    let relS = color.toHsl().s*100
    if(this.bitmap.data[idx + 1] > 128) relS = relS+(100-relS)*(this.bitmap.data[idx + 1]/128-1)
    else relS = relS*(this.bitmap.data[idx + 1]/128)
    let relL = color.toHsl().l*100
    if(this.bitmap.data[idx + 1] > 128) relL = relL+(100-relL)*(this.bitmap.data[idx + 2]/128-1)
    else relL = relL*(this.bitmap.data[idx + 1]/128)
      
  
    pixel = tinycolor({
      h: color.toHsl().h,
      s: Math.round(absS+(relS-absS)*Math.min(1, this.bitmap.data[idx]/128)),
      l: Math.round(absL+(relL-absL)*Math.max(0, (this.bitmap.data[idx]+1)/128-1))
    })

    this.bitmap.data[idx + 0] = pixel.toRgb().r;
    this.bitmap.data[idx + 1] = pixel.toRgb().g;
    this.bitmap.data[idx + 2] = pixel.toRgb().b;
  });
}




async function castVote(interaction, guildConfig, vote) {
  let dbId = interaction.message.id
  let coll = ((await DataBase.get(dbId)) || {})

  coll[interaction.user.id] = vote
  await DataBase.set(dbId, coll)

  return await updateVotingMessage(interaction, guildConfig)
}

async function updateVotingMessage(interaction, guildConfig) {
  interaction.deferUpdate()

  let message = interaction.message
  const voteChannel = await interaction.guild.channels.fetch(guildConfig.votingChannel)
  await interaction.guild.members.fetch()
  const members = voteChannel.members.filter(user => !user.user.bot)

  let count = { "for": 0, "abstain": 0, "against": 0, "all": 0 }
  let coll = ((await DataBase.get(message.id)) || {})
  for (c in coll) { count[coll[c]]++; count["all"]++ }
  let allVotes = count.against * 1 + count.for * 1

  let votingThreshold = 0.6





  let font = (await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE))
  let imageBar = (await Jimp.read('assets/gui/percentage_bar.png'))
  let imageMark = (await Jimp.read('assets/gui/percentage_mark.png'))
  let margin = 57

  let markText = Math.round(count.for / allVotes * 100)+"%"
  let forWidth = Math.round(margin + (imageBar.bitmap.width - 2 * margin) * count.for / allVotes)
  let markPos = 
    Math.max(margin,
    Math.min(imageBar.bitmap.width - imageMark.bitmap.width - margin,
    forWidth - imageMark.bitmap.width / 2))
  
  let image = imageBar.clone().opacity(0)
    .composite((await loadInColor(imageBar, "#3ba55d"))
      .crop(0, 0, forWidth, imageBar.bitmap.height),
      0, 0)
    .composite((await loadInColor(imageBar, "#ed4245"))
      .crop(forWidth, 0, imageBar.bitmap.width - forWidth, imageBar.bitmap.height),
      forWidth, 0)
    .composite((await loadInColor(imageMark, count.for/allVotes < votingThreshold?"#ed4245":"#3ba55d")),
      markPos, 0, { mode: Jimp.BLEND_SOURCE_OVER })
    .print(font, 
      markPos+imageMark.bitmap.width/2-Jimp.measureText(font, markText)/2, 
      imageMark.bitmap.height/2-8, 
      markText)
  const attachment = new MessageAttachment(await image.getBufferAsync(Jimp.MIME_PNG), 'results.png');





  let newEmbed = new MessageEmbed(message.embeds[0])
    .setDescription(allVotes ? '' : 'There are no votes yet!')
    .setFooter(count.all + '/' + members.size + ' votes casted\nVoting ends: ')
    .setImage(allVotes ? "attachment://results.png" : null)

  await message.removeAttachments()
  return await message.edit({ embeds: [newEmbed], files: allVotes ? [attachment] : [] })
}




module.exports = {
  data: new SlashCommandBuilder()
    .setName('voting')
    .setDescription('Creates a new for/against voting.')
    .addStringOption(option => option.setName('proposal').setDescription('The proposal for users to vote on')),
  async execute(interaction, guildConfig) {
    const guild = interaction.guild;
    const voteChannel = await guild.channels.fetch(guildConfig.votingChannel)
    await interaction.guild.members.fetch()
    const members = voteChannel.members.filter(user => !user.user.bot)

    const voteEmbed = new MessageEmbed()
      .setColor('#181a43')
      .setAuthor('VOTING', 'https://media.discordapp.net/attachments/557227661131251733/882377586204885043/voting.png')
      .setTitle(interaction.options.getString('proposal'))
      .setDescription(`There are no votes yet!`)
      .setFooter('0/' + members.size + ' votes casted\nVoting ends: ')
      .setTimestamp(Math.round(Date.now() / (1000 * 60 * 15) + 4 * 24 * 3) * 1000 * 60 * 15)

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