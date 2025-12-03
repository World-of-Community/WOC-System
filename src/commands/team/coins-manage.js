const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Coin } = require('../../../Datenbank/coindb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coins-manage')
    .setDescription('» Verwalte Coins eines Benutzers.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Füge einem Benutzer Coins hinzu.')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Der Benutzer, dem Coins hinzugefügt werden sollen')
            .setRequired(true))
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Die Anzahl der Coins, die hinzugefügt werden sollen')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Entfernt Coins von einem Benutzer.')
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Die Anzahl der Coins, die entfernt werden sollen')
            .setRequired(true))
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Der Benutzer (Ping)')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('userid')
            .setDescription('Die Benutzer-ID')
            .setRequired(false))),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const user = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');

      if (user.bot) {
        return interaction.reply({ content: '> `❌` » Bots können keine Coins erhalten.', ephemeral: true });
      }

      if (amount <= 0) {
        return interaction.reply({ content: '> `❗` » Die Anzahl der Coins muss eine positive Zahl sein.', ephemeral: true });
      }

      let userCoins = await Coin.findOne({ userId: user.id });
      if (!userCoins) {
        userCoins = new Coin({ userId: user.id, coins: 0 });
      }

      userCoins.coins += amount;
      await userCoins.save();

      const formattedCoins = userCoins.coins.toLocaleString('de-DE');
      const formattedAmount = amount.toLocaleString('de-DE');

      const CoinEmbed = new EmbedBuilder()
        .setTitle(`\`👤\` × ${user.displayName}'s Coins wurden aktualisiert`)
        .setDescription(`» ${user} hat **${formattedAmount} Coins** erhalten.\n\n» ${user.displayName} hat jetzt insgesamt **${formattedCoins} Coins**.`)
        .setColor('Green')
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: `» ${interaction.guild.name} | Coin-System`, iconURL: interaction.guild.iconURL() })
        .setTimestamp();

      return interaction.reply({ embeds: [CoinEmbed], ephemeral: true });
    }

    if (subcommand === 'remove') {
      const userPing = interaction.options.getUser('user');
      const userIdInput = interaction.options.getString('userid');
      const amount = interaction.options.getInteger('amount');

      if (amount <= 0) {
        return interaction.reply({ content: '> `❗` » Die Anzahl der Coins muss größer als **0** sein.', ephemeral: true });
      }

      // Validierung: entweder Ping ODER ID muss angegeben werden
      if (!userPing && !userIdInput) {
        return interaction.reply({ content: '> `❗` » Du musst entweder einen Benutzer **pingen** oder eine **ID angeben**.', ephemeral: true });
      }

      const userId = userPing?.id || userIdInput;
      let user = userPing;

      if (!user && userIdInput) {
        try {
          user = await interaction.client.users.fetch(userIdInput);
        } catch {
          user = null;
        }
      }

      if (user?.bot) {
        return interaction.reply({ content: '> `❌` » Bots können keine Coins haben.', ephemeral: true });
      }

      let userCoins = await Coin.findOne({ userId });
      if (!userCoins) {
        return interaction.reply({ content: `> \`❗\` » Nutzer mit der ID \`${userId}\` hat keine Coins, die entfernt werden können.`, ephemeral: true });
      }

      userCoins.coins -= amount;
      if (userCoins.coins < 0) userCoins.coins = 0;
      await userCoins.save();

      const member = interaction.guild.members.cache.get(userId);
      const displayName = member?.displayName || user?.username || `Unbekannt (${userId})`;
      const formattedCoins = userCoins.coins.toLocaleString('de-DE');
      const formattedAmount = amount.toLocaleString('de-DE');

      const CoinEmbed = new EmbedBuilder()
        .setTitle(`\`👤\` × ${displayName}'s Coins wurden aktualisiert`)
        .setDescription(`» **${formattedAmount} Coins** wurden von <@${userId}> entfernt.\n\n» Aktueller Stand: **${formattedCoins} Coins**.`)
        .setColor('Red')
        .setThumbnail(user?.displayAvatarURL?.() || null)
        .setFooter({ text: `» ${interaction.guild.name} | Coin-System`, iconURL: interaction.guild.iconURL() })
        .setTimestamp();

      return interaction.reply({ embeds: [CoinEmbed], ephemeral: true });
    }
  }
};
