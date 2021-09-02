module.exports = (client) => {

  const fs = require('fs');
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v9');
  const { Collection } = require('discord.js');


  client.commands = new Collection();
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
  }



  // const rest = new REST({ version: '9' }).setToken(process.env['__BOTTOKEN__']);
  // (async () => {
  // 	try {
  // 		await rest.put(
  //       Routes.applicationCommands(process.env['__CLIENTID__']),
  //       { body: client.commands },
  //     );

  // 		console.log('Successfully registered application commands.');
  // 	} catch (error) {
  // 		console.error(error);
  // 	}
  // })();



  const commandHandler = async interaction => {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction, require('./guild_configs/'+interaction.guild.id+'.json'));
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }

  const buttonHandler = async interaction => {
    const command = client.commands.get(interaction.customId.split(":")[0]);
    const button = command.buttons[interaction.customId.split(":")[1]];
    if(button) return button(interaction)
  }


  client.on('interactionCreate', async interaction => {
    if(interaction.isCommand()) return commandHandler(interaction);
    if(interaction.isButton()) return buttonHandler(interaction);
  });



  return client.commands
}