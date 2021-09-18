const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  commands: [{
    data: new SlashCommandBuilder()
      .setName('beep')
      .setDescription('Beep!'),
    async execute(interaction) {
      return interaction.reply({content: 'Boop!', ephemeral: true});
    }
  }]
};