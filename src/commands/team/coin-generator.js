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
            .setDescription('Zeit angeben (z.b. 1h 30m oder 45m)')
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
    const input = interaction.options.getString('zeit').toLowerCase();
    const targetUser = interaction.options.getUser('user');

    const hMatch = input.match(/(\d+)\s*h/);
    const mMatch = input.match(/(\d+)\s*m/);
    const hours = hMatch ? parseInt(hMatch[1]) : 0;
    const minutes = mMatch ? parseInt(mMatch[1]) : 0;
    const totalMs = (hours * 60 + minutes) * 60 * 1000;

    if (totalMs < 60000) {
      return interaction.reply({
        content: '> `⛔` » Gib mindestens **1 Minute** an (z.B. `1h`, `30m`).',
        ephemeral: true
      });
    }

    const endTimestamp = Date.now() + totalMs;

    await interaction.reply({
      content: `> \`⏳\` » Starte Coin-Generator für ${targetUser.username} für **${hours}h ${minutes}m**...`,
      ephemeral: true
    });

    let collectedCoins = 0;
    let elapsed = 0;

    const generateCoins = async () => {
      const fixedInterval = 6000; // 6 Sekunden Ladezeit

      if (elapsed + fixedInterval > totalMs) {
        let user = await Coin.findOne({ userId: targetUser.id });
        if (!user) user = new Coin({ userId: targetUser.id, coins: 0 });

        user.coins += collectedCoins;
        await user.save();

        const embed = new EmbedBuilder()
          .setTitle(`🎉 Coin-Ergebnis für ${targetUser.username}`)
          .setColor('Gold')
          .setDescription(`👤 **${targetUser.username}** hat durch das Streaming in **${hours}h ${minutes}m** insgesamt **${collectedCoins} Coins** gesammelt.`)
          .setFooter({ text: `Ende war: <t:${Math.floor(endTimestamp / 1000)}:F>` })
          .setTimestamp();

        return await interaction.editReply({ content: '> `✅` » Coin-Generator ist nun fertig. Hier ist die Übersicht:', embeds: [embed] });
      }

      const coins = Math.floor(Math.random() * 5) + 1; // 1 bis 5 Coins
      collectedCoins += coins;
      elapsed += fixedInterval;

      setTimeout(generateCoins, fixedInterval);
    };

    generateCoins();
  }
};
