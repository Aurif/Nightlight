function skeleton(predicate) {
  return (payload, context) => {
    let runAction = (action) => {
      if(!action) return
      if(!Array.isArray(action[0])) DiscordClient.shout(action[0], action[1], context)
      else for(let act of action) DiscordClient.shout(act[0], act[1], context)
    }
    
    let condition = predicate(payload, context)
    if(condition) runAction(payload.action) 
    else runAction(payload.elseAction) 
  }
}


module.exports = {
  listeners: {
    "hasNoRoles": skeleton((payload, context) => {
      let targetMember = context[payload.target]
      return !(targetMember?.roles?.cache?.size > 1)
    })
  }
};