const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Coin = require("../../../Datenbank/coindb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coin')
    .setDescription('Coin-System')
    .addSubcommand(sub =>
      sub.setName('generator')
        .setDescription('Starte den Coin-Generator für 1 Minute (Live-Anzeige)')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Benutzer, der Coins erhalten soll')
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser('user');
      const targetMember = await interaction.guild.members.fetch(targetUser.id);

      const totalMs = 60000; // 1 Minute
      const intervalMs = 15000; // alle 15 Sekunden
      const maxTicks = totalMs / intervalMs;

      let collectedCoins = 0;
      let tickCount = 0;

      const message = await interaction.reply({
        content: `⏳ » Starte Coin-Generator für ${targetMember.displayName} für **1 Minute**...\nCoins gesammelt: **0**`,
        fetchReply: true,
        ephemeral: true
      });

      const interval = setInterval(async () => {
        const coins = Math.floor(Math.random() * 5) + 1;
        collectedCoins += coins;
        tickCount++;

        // Nachricht aktualisieren
        await interaction.editReply({
          content: `⏳ » Coin-Generator läuft...\nCoins gesammelt: **${collectedCoins}**`
        });

        if (tickCount >= maxTicks) {
          clearInterval(interval);

          let user = await Coin.findOne({ userId: targetUser.id });
          if (!user) user = new Coin({ userId: targetUser.id, coins: 0 });
          user.coins += collectedCoins;
          await user.save();

          const embed = new EmbedBuilder()
            .setTitle(`🎉 Coin-Ergebnis für ${targetUser.username}`)
            .setColor('Gold')
            .setDescription(`👤 **${targetUser.username}** hat in **1 Minute** insgesamt **${collectedCoins} Coins** gesammelt.`)
            .setTimestamp();

          await interaction.editReply({
            content: '✅ » Coin-Generator abgeschlossen.',
            embeds: [embed]
          });
        }
      }, intervalMs);

    } catch (error) {
      console.error('Fehler im Coin-Generator:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ Ein Fehler ist aufgetreten.', ephemeral: true });
      }
    }
  }
};
