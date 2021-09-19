DiscordClient.scheduler.timestampedInit(async (guild, timestamp) => {
  let config = require('../guild_configs/'+guild.id+'.json').reminders
  if(!config) return
  for(let channelId in config) {
    let channel = await guild.channels.fetch(channelId)
    let messages = await channel.messages.fetch()

    messages.each(mess => {
      let messTime = mess.editedAt || mess.createdAt
      if(!(messTime > timestamp))
        DiscordClient.schedule(messTime+config[channelId].time*60000, "reminders:run", {guild: guild.id, channel: channelId, message: mess.id})
    })

    let collector = channel.createMessageCollector()
    collector.on('collect', message => {

    })
  }
})

DiscordClient.on('messageCreate', async (message) => {
  let config = require('../guild_configs/'+message.guild.id+'.json')?.reminders; if(!config) return 
  config = config[message.channel.id]; if(!config) return

  DiscordClient.schedule(Date.now()+config.time*60000, "reminders:run", {guild: message.guild.id, channel: message.channel.id, message: message.id})
})


module.exports = {
  listeners: {
    "run": (async (payload, context) => {
      let guild = DiscordClient.guilds.cache.get(payload.guild)
      let channel = ""
      let message = ""
      try {
        channel = await guild.channels.fetch(payload.channel).catch()
        message = await channel.messages.fetch(payload.message).catch()
        if(!message) return
      } catch(e) {return}

      let config = require('../guild_configs/'+payload.guild+'.json').reminders[payload.channel]
      let messTime = message.editedAt || message.createdAt
      if(messTime + config.time*60000 <= Date.now()) {
        for(let act of config.actions) {
          DiscordClient.shout(act[0], act[1], {
            guild: guild, 
            channel: channel,
            message: message,
            lastChange: Date.now()-messTime
          })
        }
        messTime = Date.now()
      }

      DiscordClient.schedule(messTime+config.time*60000, "reminders:run", payload)
    })
  }
};