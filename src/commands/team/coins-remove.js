const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const coindb = require("../../../Datenbank/coindb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coins-remove')
    .setDescription('Verwalte Coins eines Benutzers.')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('Der Benutzer, dessen Coins reduziert werden sollen')
        .setRequired(true)
    )
    .addIntegerOption(option => 
      option.setName('amount')
        .setDescription('Die Anzahl der Coins, die entfernt werden sollen')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    // Überprüfe, ob der Benutzer ein Bot ist
    if (user.bot) {
        return interaction.reply({ content: '> `❌` » Bots können keine Coins haben.', ephemeral: true });
      }

    // Validierung der Menge
    if (amount <= 0) {
      return interaction.reply({ content: '> `❗` » Die Anzahl der Coins muss größer als **0** sein.', ephemeral: true });
    }

    // Benutzer in der Datenbank suchen
    let userCoins = await coindb.findOne({ userId: user.id });

    if (!userCoins) {
      // Wenn der Benutzer keine Coins hat
      return interaction.reply({ content: `> \`❗\` » ${user} hat keine Coins, die entfernt werden können.`, ephemeral: true });
    }

    // Coins abziehen
    userCoins.coins -= amount;
    if (userCoins.coins < 0) userCoins.coins = 0; // Verhindert negative Coins
    await userCoins.save();

    // Embed erstellen
    const CoinEmbed = new EmbedBuilder()
      .setTitle(`\`👤\` × ${user.displayName}'s Coins wurden aktualisiert`)
      .setDescription(`» **${amount} Coins** wurden von ${user} entfernt.\n\n» Aktueller Stand: **${userCoins.coins} Coins**.`)
      .setColor('Red')
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `» ${interaction.guild.name} | Coin-System`, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    // Antwort senden
    await interaction.reply({ embeds: [CoinEmbed], ephemeral: true });
  },
};
