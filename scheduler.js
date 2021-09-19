async function launchSchedule(id, target, payload) {
  DiscordClient.shout(target, payload)

  let schedules = ((await DataBase.get("CoreScheduler")) || [])
  delete schedules[id]
  DataBase.set("CoreScheduler", schedules)
}
DiscordClient.schedule = async (time, target, payload, dontRegister) => {
  if(time <= Date.now()) {DiscordClient.shout(target, payload); return}
  let sId = Date.now()+""+(Math.round(Math.random()*1000))

  setTimeout(()=>{launchSchedule(sId, target, payload)}, time-Date.now())
  if(dontRegister) return
  let schedules = ((await DataBase.get("CoreScheduler")) || [])
  schedules[sId] = {time: time, target: target, payload: payload}
  await DataBase.set("CoreScheduler", schedules)
}
DiscordClient.scheduler = {
  _timestampedInits: [],
  timestampedInit: (func)=>{DiscordClient.scheduler._timestampedInits.push(func)},
  updateTimestamp: async (guildId)=>{
    let timestamps = ((await DataBase.get("CoreSchedulerTimestamps")) || {})
    timestamps[guildId] = Date.now()
    DataBase.set("CoreSchedulerTimestamps", timestamps)
  }
}

module.exports = async () => {
  let oldSchedules = ((await DataBase.get("CoreScheduler")) || {})
  let newSchedules = {}
  for(let sId in oldSchedules) {
    let s = oldSchedules[sId]
    if(s.time <= Date.now()) {DiscordClient.shout(s.target, s.payload); continue}

    setTimeout(()=>{launchSchedule(sId, s.target, s.payload)}, s.time-Date.now())
    newSchedules[sId] = {time: s.time, target: s.target, payload: s.payload}
  }
  await DataBase.set("CoreScheduler", newSchedules)

  let timestamps = ((await DataBase.get("CoreSchedulerTimestamps")) || {})
  let guilds = []
  DiscordClient.guilds.cache.each(g => guilds.push(g))
  for(let guild of guilds) {
    for(let func of DiscordClient.scheduler._timestampedInits)
      func(guild, timestamps[guild.id])
    timestamps[guild.id] = Date.now() 
  }
  await DataBase.set("CoreSchedulerTimestamps", timestamps)
}