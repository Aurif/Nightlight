const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, MessageAttachment } = require('discord.js');
const { Collection } = require('discord.js');
const { DataBase } = require("./../proxy/load.js");
var Jimp = require('jimp');
var tinycolor = require("tinycolor2");

class Voting {
  constructor(uid) {
    this.uid = uid
  }
  register(proposal, guildId) {
    this.registry = {
      votes: {},
      guild: guildId,
      proposal: proposal,
      linkedInputs: [],
      linkedDisplays: [],
      linkedThreads: []
    }
    DiscordClient.schedule(Date.now() + this.totalDuration*1000*60, "voting:ends", this.uid)
    return this
  }
  async findRegistry() {
    let votingBase = ((await DataBase.get("ComVoting")) || {})
    let originalUid = this.uid
    this.uid = Object.keys(votingBase).find(k => {
      let v = votingBase[k]
      return ([...v.linkedInputs, ...v.linkedDisplays].findIndex(vv => vv.message == originalUid)!=-1)
    })
    this.registry = votingBase[this.uid]
    return this
  }
  async loadRegistry() {
    let votingBase = ((await DataBase.get("ComVoting")) || {})
    this.registry = votingBase[this.uid]
    return this
  }
  async pushRegistry() {
    let votingBase = ((await DataBase.get("ComVoting")) || {})
    if(this.registry == null) delete votingBase[this.uid]
    else votingBase[this.uid] = this.registry
    await DataBase.set("ComVoting", votingBase)
    return this
  }

  async getElligibleVoters() {
    if(this._elligibleVoters) return this._elligibleVoters
    if(!this.guildConfig) return new Collection()

    let channel = await this.getTargetChannel()
    await channel.guild.members.fetch()
    this._elligibleVoters = channel.members.filter(user => !user.user.bot)
    return this._elligibleVoters
  }
  async getTargetChannel() {
    if(this._targetChannel) return this._targetChannel
    if(!this.guildConfig) return []

    let guild = DiscordClient.guilds.cache.get(this.guildId)
    this._targetChannel = await guild.channels.fetch(this.guildConfig["channelToPost"])
    return this._targetChannel
  }
  get totalDuration() {return this.guildConfig["timeToVote"]}
  get votingThreshold() {return this.guildConfig["requiredVoteRatio"]}
  get guildConfig() {
    if(this._guildConfig) return this._guildConfig
    if(!this.guildId) return {}

    this._guildConfig = require('../guild_configs/'+this.guildId+'.json').voting
    return this._guildConfig
  }
  get guildId() {
    if(!this.registry) return undefined
    return this.registry.guild
  }
  get proposal() {
    if(!this.registry) return undefined
    return this.registry.proposal
  }


  castVote(userId, vote) {
    this.registry.votes[userId] = vote
    return this
  }
  async pushUpdate() {
    if(await this.checkEarlyEnd()) return
    let count = this.getResults()
    let members = (await (this.getElligibleVoters())).size
    let newAttachment = count.allVotes ? [(await this.generateResultsImage())] : []

    this.registry.linkedDisplays.forEach(async (conf) => {
      let guild = DiscordClient.guilds.cache.get(this.guildId)
      let channel = await guild.channels.fetch(conf.channel)
      let message = await channel.messages.fetch(conf.message)
      let newEmbed = new MessageEmbed(message.embeds[0])
        .setDescription(count.allVotes ? '' : 'There are no votes yet!')
        .setFooter(count.all + '/' + members + ' votes casted\nVoting ends: ')
        .setImage(count.allVotes ? "attachment://results.png" : null)
      await message.removeAttachments()
      message.edit({ embeds: [newEmbed], files: newAttachment })
    })
  }
  async generateResultsImage() {
    let count = this.getResults()

    let font = (await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE))
    let imageBar = (await Jimp.read('assets/gui/percentage_bar.png'))
    let imageMark = (await Jimp.read('assets/gui/percentage_mark.png'))
    let margin = 57

    let markText = Math.round(count.for / count.allVotes * 100)+"%"
    let forWidth = Math.round(margin + (imageBar.bitmap.width - 2 * margin) * count.for / count.allVotes)
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
      .composite((await loadInColor(imageMark, count.for/count.allVotes < this.votingThreshold?"#ed4245":"#3ba55d")),
        markPos, 0, { mode: Jimp.BLEND_SOURCE_OVER })
      .print(font, 
        markPos+imageMark.bitmap.width/2-Jimp.measureText(font, markText)/2, 
        imageMark.bitmap.height/2-8, 
        markText)
    return new MessageAttachment(await image.getBufferAsync(Jimp.MIME_PNG), 'results.png');
  }
  getResults() {
    let count = { "for": 0, "abstain": 0, "against": 0, "all": 0 }
    let votes = this.registry.votes
    for (let v in votes) { count[votes[v]]++; count["all"]++ }
    count.allVotes = count.against * 1 + count.for * 1
    return count
  }


  generateButtonComponent() {
    return new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('voting:for')
          .setLabel(this.guildConfig["buttonLabelFor"])
          .setStyle('SUCCESS'),
        new MessageButton()
          .setCustomId('voting:abstain')
          .setLabel(this.guildConfig["buttonLabelAbstain"])
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('voting:against')
          .setLabel(this.guildConfig["buttonLabelAgainst"])
          .setStyle('DANGER')
      );
  }
  async generateDisplayEmbed() {
    return new MessageEmbed()
      .setColor('#181a43')
      .setAuthor('VOTING', this.guildConfig["votingIcon"])
      .setTitle(this.proposal)
      .setDescription(`There are no votes yet!`)
      .setFooter('0/' + (await (this.getElligibleVoters())).size + ' votes casted\nVoting ends: ')
      // .setTimestamp(Math.round((Date.now() + this.totalDuration*1000*60) / (1000 * 60 * 15)) * 1000 * 60 * 15)
      .setTimestamp(Date.now() + this.totalDuration*1000*60)
  }


  async startThread(message) {
    const voteThread = await message.startThread({
      name: this.proposal,
      autoArchiveDuration: 'MAX',
      reason: "Thread for voting discussion"
    })
    const threadButtons = await voteThread.send({ content: "-", components: [this.generateButtonComponent()] })
    if(this.guildConfig["threadCreationMessage"]) voteThread.send({ 
      content: this.guildConfig["threadCreationMessage"], 
      allowed_mentions: {parse: ["everyone", "roles"]}
    })
    this.linkMessageAsInput(threadButtons)
    this.linkThread(voteThread)
    return this
  }
  linkThread(thread) {
    this.registry.linkedThreads.push(thread.id)
    return this
  }
  linkMessageAsInput(message) {
    this.registry.linkedInputs.push({channel: message.channel.id, message: message.id})
    return this
  }
  linkMessageAsDisplay(message) {
    this.registry.linkedDisplays.push({channel: message.channel.id, message: message.id})
    return this
  }


  async checkEarlyEnd() {
    if(this.guildConfig["endEarlyWhenEveryoneVoted"] && this.getResults().all == (await (this.getElligibleVoters())).size) {await this.close(); return true}
    return false
  }
  async closeAndPush() {
    if(!this.registry) return
    await this.close()
    await this.pushRegistry()
  }
  async close() {
    if(!this.registry) return
    await this.closeDisplays()
    await this.closeInputs()
    this.closeThreads()
    this.clearRegistry()
  }
  async closeDisplays() {
    let count = this.getResults()
    let members = (await (this.getElligibleVoters())).size
    let newAttachment = count.allVotes ? [(await this.generateResultsImage())] : []

    let linkedDisplays = this.registry.linkedDisplays
    for(let conf of linkedDisplays) {
      let guild = DiscordClient.guilds.cache.get(this.guildId)
      let channel = await guild.channels.fetch(conf.channel)
      let message = await channel.messages.fetch(conf.message)
      let newEmbed = new MessageEmbed(message.embeds[0])
        .setAuthor('VOTING CLOSED', this.guildConfig["votingClosedIcon"])
        .setFooter(count.all + '/' + members + ' votes casted\n'+count.abstain+' abstain votes')
        .setTimestamp(null)
        .setImage(count.allVotes ? "attachment://results.png" : null)
      await message.removeAttachments()
      await message.edit({ embeds: [newEmbed], files: newAttachment })
    }
  }
  async closeInputs() {
    let linkedInputs = this.registry.linkedInputs
    for(let conf of linkedInputs) {
      let guild = DiscordClient.guilds.cache.get(this.guildId)
      let channel = await guild.channels.fetch(conf.channel)
      let message = await channel.messages.fetch(conf.message)
      
      await message.edit({ components: [] })
    }
  }
  closeThreads() {
    if(!this.guildConfig["closeThreadOnceVotingEnds"]) return
    let linkedThreads = this.registry.linkedThreads
    linkedThreads.forEach(async (conf) => {
      let guild = DiscordClient.guilds.cache.get(this.guildId)
      let thread = await guild.channels.fetch(conf)
      
      thread.setArchived(true, "Voting has ended")
    })
  }
  clearRegistry() {
    this.registry = null
  }
}



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


async function castVote(interaction, vote) {
  interaction.deferUpdate()
  let Vote = (await (new Voting(interaction.message.id)).findRegistry())
            .castVote(interaction.user.id, vote)
  await Vote.pushUpdate()
  Vote.pushRegistry()
}

module.exports = {
  commands: [{
    data: new SlashCommandBuilder()
      .setName('voting')
      .setDescription('Creates a new for/against voting.')
      .addStringOption(option => option.setName('proposal').setDescription('The proposal for users to vote on')),
    async execute(interaction, guildConfig) {
      const guild = interaction.guild;
      const Vote = (new Voting(interaction.id)).register(interaction.options.getString('proposal'), guild.id)

      const voteChannel = await Vote.getTargetChannel()
      const voteMessage = await voteChannel.send({ 
        embeds: [await (Vote.generateDisplayEmbed())], 
        components: [Vote.generateButtonComponent()] 
      })

      if(Vote.guildConfig["createThread"]) await Vote.startThread(voteMessage)
      Vote.linkMessageAsDisplay(voteMessage)
          .linkMessageAsInput(voteMessage)
          .pushRegistry()
      
      return interaction.reply({ content: `**New voting created**, [click here to go to it](<${voteMessage.url}>)`, ephemeral: Vote.guildConfig["votingCreationAnonymous"]==true });
    }
  }],
  buttons: {
    "for": (async (int) => { return await castVote(int, "for") }),
    "abstain": (async (int) => { return await castVote(int, "abstain") }),
    "against": (async (int) => { return await castVote(int, "against") })
  },
  listeners: {
    "ends": (async (id) => {(await (new Voting(id)).loadRegistry()).closeAndPush()})
  }
};