const fs = require('fs');
const { Client, Intents } = require('discord.js');

const client = new Client({
  fetchAllMembers: true,
  presence: {
    status: 'online'
  },
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]
});
client.login(process.env['__BOTTOKEN__']);



client.once('ready', () => {
  console.log('Ready!');
  
  let commands = require("./deploy_commands.js")(client);
  commands.every(com => {
    client.api.applications(client.user.id).guilds(process.env['_TestGuildId_']).commands.post({data: com.data});
  })
});
