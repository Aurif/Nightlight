function textParser(pattern, context) {
  return pattern.replace(/\${([^{}]+)}/g, (all, query) => (context[query]?.toString() || ""))
}

module.exports = {
  listeners: {
    "message": (async (payload, context) => {
      let channel = await context.guild.channels.fetch(payload.channel)
      channel.send(textParser(payload.message, context))
    })
  }
};