const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Coin = require("../../../Datenbank/coindb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coin')
    .setDescription('Coin-System')
    .addSubcommand(sub =>
      sub.setName('generator')
        .setDescription('Starte den Coin-Generator für z.b. 1h 30m')
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

      // Zeit parsen
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

      // Zufällige Coins für die gesamte Zeitspanne (1-5)
      const generatedCoins = Math.floor(Math.random() * 5) + 1;

      // Coins in DB speichern
      let user = await Coin.findOne({ userId: targetUser.id });
      if (!user) user = new Coin({ userId: targetUser.id, coins: 0 });

      user.coins += generatedCoins;
      await user.save();

      // Embed bauen und senden
      const embed = new EmbedBuilder()
        .setTitle(`🎉 Coin-Ergebnis für ${targetUser.username}`)
        .setColor('Gold')
        .setDescription(`👤 **${targetUser.username}** hat für **${hours} Stunde(n) ${minutes} Minute(n)** insgesamt **${generatedCoins} Coins** erhalten.`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Fehler im Coin-Generator:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ Ein Fehler ist aufgetreten.', ephemeral: true });
      }
    }
  }
};
