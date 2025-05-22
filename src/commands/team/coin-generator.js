const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Coin = require("../../../Datenbank/coindb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coin')
    .setDescription('Coin-System')
    .addSubcommand(sub =>
      sub.setName('generator')
        .setDescription('Berechnet sofort Coins basierend auf einer angegebenen Zeit (z.B. 1h 30m)')
        .addStringOption(option =>
          option.setName('zeit')
            .setDescription('Zeit angeben (z.B. 1h 30m oder 45m)')
            .setRequired(true)
        )
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Benutzer, der Coins erhalten soll')
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    try {
      const input = interaction.options.getString('zeit').toLowerCase();
      const targetUser = interaction.options.getUser('user');
      const targetMember = await interaction.guild.members.fetch(targetUser.id);

      const hMatch = input.match(/(\d+)\s*h/);
      const mMatch = input.match(/(\d+)\s*m/);
      const hours = hMatch ? parseInt(hMatch[1]) : 0;
      const minutes = mMatch ? parseInt(mMatch[1]) : 0;
      const totalMinutes = hours * 60 + minutes;

      if (totalMinutes < 1) {
        return interaction.reply({
          content: '> `⛔` » Gib mindestens **1 Minute** an (z.B. `1h`, `30m`).',
          ephemeral: true
        });
      }

      // Alle 15 Minuten gibt es eine Generierung
      const intervals = Math.floor(totalMinutes / 15);
      if (intervals < 1) {
        return interaction.reply({
          content: '> `⛔` » Gib mindestens **15 Minuten** an, um Coins zu generieren.',
          ephemeral: true
        });
      }

      // Generiere zufällige Coins (1-5) pro Intervall
      let collectedCoins = 0;
      for (let i = 0; i < intervals; i++) {
        collectedCoins += Math.floor(Math.random() * 5) + 1;
      }

      // Coins speichern
      let user = await Coin.findOne({ userId: targetUser.id });
      if (!user) user = new Coin({ userId: targetUser.id, coins: 0 });

      user.coins += collectedCoins;
      await user.save();

      const embed = new EmbedBuilder()
        .setTitle(`🎉 Coin-Ergebnis für ${targetUser.username}`)
        .setColor('Gold')
        .setDescription(`👤 **${targetUser.username}** hat durch den Coin-Generator in **${hours} Stunde(n) ${minutes} Minute(n)** insgesamt **${collectedCoins} Coins** erhalten.`)
        .setTimestamp();

      return interaction.reply({
        content: '> `✅` » Coin-Generator abgeschlossen:',
        embeds: [embed],
        ephemeral: true
      });
    } catch (error) {
      console.error('Fehler im Coin-Generator:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ Ein Fehler ist aufgetreten.', ephemeral: true });
      }
    }
  }
};
