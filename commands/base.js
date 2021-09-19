const { MessageEmbed } = require('discord.js');
function textParser(pattern, context) {
  let functions = {
    formatDuration: (time) => {
      time = Math.floor(time*1)
      let units = {
          1: "second",
          60: "minute",
          3600: "hour",
          86400: "day",
          604800: "week",
          2592000: "month"
      }
      let maxUnit = 0
      for(let i in units) if(i<time) maxUnit = Math.max(maxUnit, i)
      let val = Math.floor(time/maxUnit)
      return val+" "+units[maxUnit]+(val>1?"s":"")
    }
  }
  
  return pattern.replace(/\${([^{}@]+)@([^{}]+)}/g, (all, func, query) => (functions[func] || (()=>""))(context[query]?.toString() || ""))
                .replace(/\${([^{}]+)}/g, (all, query) => (context[query]?.toString() || ""))        
}

module.exports = {
  listeners: {
    "message": (async (payload, context) => {
      let channel = await context.guild.channels.fetch(payload.channel)
      channel.send(textParser(payload.message, context))
    }), 
    "messageQuote": (async (payload, context) => {
      let channel = await context.guild.channels.fetch(payload.channel)
      let quotedMessage = context[payload.target]
      let embed = []
      if(quotedMessage) {
        embed = [new MessageEmbed()
          .setColor('#181a43')
          .setAuthor(quotedMessage.member.displayName, quotedMessage.author.displayAvatarURL(), quotedMessage.url)
          .setDescription(quotedMessage.content)]
      }
      channel.send({
        content: textParser(payload.message, context),
        embeds: embed
      })
    })
  }
};