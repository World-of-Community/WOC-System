const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Coin, CoinConfig } = require("../../../Datenbank/coindb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coins')
    .setDescription('» Zeigt die aktuellen Coins eines Benutzers an. 🪙')
    .addUserOption(option => option.setName('user').setDescription('Der Benutzer, dessen Coins angezeigt werden sollen')),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    // Bots ignorieren
    if (user.bot) {
      return interaction.reply({ content: '> `❌` » Bots können keine Coins haben.', ephemeral: true });
    }
    
    // Suche nach den Coins des Benutzers in der Datenbank
    let userCoins = await Coin.findOne({ userId: user.id });

    if (!userCoins) {
      // Wenn der Benutzer keine Coins hat, Eintrag mit 0 erstellen
      userCoins = new Coin({ userId: user.id, coins: 0 });
      await userCoins.save();
    }

    // Formatierung der Coins mit Tausendertrennzeichen
    const formattedCoins = userCoins.coins.toLocaleString('de-DE'); // Formatierung für deutsch (mit Punkt als Trennzeichen)

    // Erstelle das Embed
    const CoinEmbed = new EmbedBuilder()
      .setTitle(`<:coin:1316865013528526908> × ${user.displayName}'s Coins`)
      .setDescription(`» ${user} hat aktuell **${formattedCoins} Coins**.\n\n» Du kannst die Coins im Ticket-Support einlösen und erhältst diese dann auf dem Minecraft-Server.`)
      .setColor('Blurple')
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `» ${interaction.guild.name} | Coin-System`, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [CoinEmbed], ephemeral: true });
  },
};
