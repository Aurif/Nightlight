require("./proxy/load.js");
const fs = require('fs');
const { Client, Intents } = require('discord.js');

DiscordClient = new Client({
  fetchAllMembers: true,
  presence: {
    status: 'online'
  },
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]
});
DiscordClient.login(Secrets('__BOTTOKEN__'));



DiscordClient.once('ready', async () => {
  console.log('Ready!');
  
  let commands = require("./deploy_commands.js");
  commands.every(com => {
    DiscordClient.api.applications(DiscordClient.user.id).guilds(Secrets('_TestGuildId_')).commands.post({data: com.data});
  });

  await require("./scheduler.js")();
});
