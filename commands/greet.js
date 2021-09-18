(async ()=>{
  let timestamps = ((await DataBase.get("ComGreet")) || {})
  let guilds = []
  DiscordClient.guilds.cache.each(g => guilds.push(g))
  for(let guild of guilds) {
    let members = await guild.members.fetch()
    members.each(m => {
      if(!(timestamps[guild.id] > m.joinedAt)) greetUser(m, ["strong", "retro"])
    })

    timestamps[guild.id] = Date.now() 
  }
  await DataBase.set("ComGreet", timestamps)
})();

DiscordClient.on('guildMemberAdd', async (member) => {
  greetUser(member, ["weak", "strong"])

  let timestamps = ((await DataBase.get("ComGreet")) || {})
  timestamps[member.guild.id] = Date.now()
  DataBase.set("ComGreet", timestamps)
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