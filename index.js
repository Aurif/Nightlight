require("./proxy/load.js");
const fs = require('fs');
const { Client, Intents } = require('discord.js');

DiscordClient = new Client({
  fetchAllMembers: true,
  presence: {
    status: 'online'
  },
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]
});
DiscordClient.login(Secrets('__BOTTOKEN__'));



DiscordClient.once('ready', async () => {
  console.log('Ready!');
  
  let postInit = await require("./scheduler.js");
  require("./deploy_commands.js");

  postInit()
});
