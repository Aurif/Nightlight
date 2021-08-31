const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');

const client = new Client({
  fetchAllMembers: true,
  presence: {
    status: 'online'
  },
  intents: [Intents.FLAGS.GUILDS]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log('Ready!');
  
  let commands = require("./deploy_commands.js");
  for(let com of commands)
    client.api.applications(client.user.id).guilds(process.env['_TestGuildId_']).commands.post({data: com});
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, require('./guild_configs/'+interaction.guild.id+'.json'));
  } catch (error) {
    console.error(error);
    return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.login(process.env['__BOTTOKEN__']);