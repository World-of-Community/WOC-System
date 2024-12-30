const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const coindb = require("../../../Datenbank/coindb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coin')
    .setDescription('Zeigt die aktuellen Coins eines Benutzers an.')
    .addUserOption(option => option.setName('user').setDescription('Der Benutzer, dessen Coins angezeigt werden sollen')),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    // Suche nach den Coins des Benutzers in der Datenbank
    let userCoins = await coindb.findOne({ userId: user.id });
    
    if (!userCoins) {
      // Wenn der Benutzer keine Coins hat, erstelle einen neuen Eintrag
      userCoins = new coindb({ userId: user.id, coins: 0 });
      await userCoins.save();
    }

    // Erstelle das Embed
    const CoinEmbed = new EmbedBuilder()
      .setTitle(`${user.username}'s Coins`)
      .setDescription(`${user.username} hat aktuell **${userCoins.coins} Coins**.\n\n» Du kannst die Coins im Ticket-Support einlösen und erhältst diese dann auf dem Minecraft-Server.`)
      .setColor('Blurple')
      .setFooter({ text: `» ${interaction.guild.name} Coin-System`, iconURL: interaction.guild.iconURL() });

    await interaction.reply({ embeds: [CoinEmbed], ephemeral: true });
  },
};
