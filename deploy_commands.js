const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection } = require('discord.js');


DiscordClient.commands = new Collection();
DiscordClient.modules = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const commandData = require(`./commands/${file}`);
  DiscordClient.modules.set(file.slice(0,-3), commandData);
  if(commandData.commands) for(let command of commandData.commands)
    DiscordClient.commands.set(command.data.name, command);
}



// const rest = new REST({ version: '9' }).setToken(Secrets('__BOTTOKEN__'));
// (async () => {
// 	try {
// 		await rest.put(
//       Routes.applicationCommands(Secrets('__CLIENTID__')),
//       { body: DiscordClient.commands },
//     );

// 		console.log('Successfully registered application commands.');
// 	} catch (error) {
// 		console.error(error);
// 	}
// })();



const commandHandler = async interaction => {
  const command = DiscordClient.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
}

const buttonHandler = async interaction => {
  const command = DiscordClient.modules.get(interaction.customId.split(":")[0]);
  const button = command.buttons[interaction.customId.split(":")[1]];
  
  try {
    return button(interaction)
  } catch (error) {
    console.error(error);
    return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
}


DiscordClient.on('interactionCreate', async interaction => {
  if(interaction.isCommand()) return commandHandler(interaction);
  if(interaction.isButton()) return buttonHandler(interaction);
});


DiscordClient.shout = (target, payload, context) => {
  const command = DiscordClient.modules.get(target.split(":")[0]);
  const listener = command.listeners[target.split(":")[1]];
  
  try {
    return listener(payload, context)
  } catch (error) {
    console.error(error);
  }
}

module.exports = DiscordClient.commands
