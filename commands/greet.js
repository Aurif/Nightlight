DiscordClient.scheduler.timestampedInit(async (guild, timestamp) => {
  let members = await guild.members.fetch()
  members.each(m => {
    if(!(timestamp > m.joinedAt)) greetUser(m, ["strong", "retro"])
  })
})

DiscordClient.on('guildMemberAdd', async (member) => {
  greetUser(member, ["weak", "strong"])
  DiscordClient.scheduler.updateTimestamp(member.guild.id)
})

function greetUser(member, keys) {
  let guildConfigRaw = require('../guild_configs/'+member.guild.id+'.json').greet
  if(!guildConfigRaw) return
  let guildConfig = []
  for(let k of keys) guildConfig = guildConfig.concat(guildConfigRaw[k]||[])
  for(let act of guildConfig) {
    DiscordClient.shout(act[0], act[1], {
      guild: member.guild, 
      member: member
    })
  }
}

module.exports = {};