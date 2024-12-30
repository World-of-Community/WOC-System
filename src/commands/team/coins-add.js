const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const coindb = require("../../../Datenbank/coindb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coins-add')
    .setDescription('» Verwalte Coins eines Benutzers.')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('Der Benutzer, dem Coins hinzugefügt werden sollen')
        .setRequired(true)
    )
    .addIntegerOption(option => 
      option.setName('amount')
        .setDescription('Die Anzahl der Coins, die hinzugefügt werden sollen')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    // Überprüfe, ob der Benutzer ein Bot ist
    if (user.bot) {
      return interaction.reply({ content: '> `❌` » Bots können keine Coins erhalten.', ephemeral: true });
    }

    // Überprüfe, ob die angegebene Menge gültig ist
    if (amount <= 0) {
      return interaction.reply({ content: '> `❗` » Die Anzahl der Coins muss eine positive Zahl sein.', ephemeral: true });
    }

    // Suche nach den Coins des Benutzers in der Datenbank
    let userCoins = await coindb.findOne({ userId: user.id });
    
    if (!userCoins) {
      // Wenn der Benutzer keine Coins hat, erstelle einen neuen Eintrag
      userCoins = new coindb({ userId: user.id, coins: 0 });
    }

    // Füge die Coins hinzu
    userCoins.coins += amount;
    await userCoins.save();

    // Erstelle das Embed
    const CoinEmbed = new EmbedBuilder()
      .setTitle(`\`👤\` × ${user.username}'s Coins wurden aktualisiert`)
      .setDescription(`${user.username} hat **${amount} Coins** erhalten.\n\n» Der Benutzer hat jetzt insgesamt **${userCoins.coins} Coins**.`)
      .setColor('Green')
      .setFooter({ text: `» ${interaction.guild.name} Coin-System`, iconURL: `${interaction.guild.iconURL()}` });

    await interaction.reply({ embeds: [CoinEmbed], ephemeral: true });
  },
};
