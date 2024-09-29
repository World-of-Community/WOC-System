const { SlashCommandBuilder } = require('@discordjs/builders');

//Placeholder Code muss noch gecodet werden

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice')
    .setDescription('Set XP for voice activity')
    .addIntegerOption(option =>
      option.setName('xp')
        .setDescription('XP amount')
        .setRequired(true)),
  
  async execute(interaction) {
    const xpAmount = interaction.options.getInteger('xp');

    // Logic to set the XP amount (e.g., update a database or config)
    
    await interaction.reply(`Voice XP has been set to ${xpAmount} points.`);
  },
};
