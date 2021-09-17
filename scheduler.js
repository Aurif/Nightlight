const { DataBase } = require("./proxy/load.js")

module.exports = async () => {
  async function launchSchedule(id, target, payload) {
    DiscordClient.shout(target, payload)

    let schedules = ((await DataBase.get("CoreScheduler")) || [])
    delete schedules[id]
    DataBase.set("CoreScheduler", schedules)
  }

  let oldSchedules = ((await DataBase.get("CoreScheduler")) || {})
  let newSchedules = {}
  for(let sId in oldSchedules) {
    let s = oldSchedules[sId]
    if(s.time <= Date.now()) {DiscordClient.shout(s.target, s.payload); continue}

    setTimeout(()=>{launchSchedule(sId, s.target, s.payload)}, s.time-Date.now())
    newSchedules[sId] = {time: s.time, target: s.target, payload: s.payload}
  }
  await DataBase.set("CoreScheduler", newSchedules)

  DiscordClient.schedule = async (time, target, payload) => {
    if(time <= Date.now()) {DiscordClient.shout(target, payload); return}
    let sId = Date.now()+""+(Math.round(Math.random()*1000))

    setTimeout(()=>{launchSchedule(sId, target, payload)}, time-Date.now())
    let schedules = ((await DataBase.get("CoreScheduler")) || [])
    schedules[sId] = {time: time, target: target, payload: payload}
    await DataBase.set("CoreScheduler", schedules)
  }
}