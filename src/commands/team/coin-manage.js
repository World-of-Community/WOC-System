const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Coin = require('../../../Datenbank/coinConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coin')
    .setDescription('Coin-System')
    .addSubcommand(sub =>
      sub.setName('generator-coins')
        .setDescription('Lege fest, wie viele Coins pro Sekunde generiert werden')
        .addIntegerOption(option =>
          option.setName('min')
            .setDescription('Minimal generierte Coins (z.b. 1)')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('max')
            .setDescription('Maximal generierte Coins (z.b. 5)')
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const min = interaction.options.getInteger('min');
    const max = interaction.options.getInteger('max');

    if (min < 0 || max < 1 || min > max) {
      return interaction.reply({ content: '> `⛔` » Ungültige Werte. Stelle sicher, dass `min ≤ max` und beide ≥ 0 sind.', ephemeral: true });
    }

    let config = await CoinConfig.findOne({ guildId: interaction.guild.id });
    if (!config) config = new CoinConfig({ guildId: interaction.guild.id });

    config.minCoins = min;
    config.maxCoins = max;
    await config.save();

    await interaction.reply({
      content: `> \`✅\` » Der Coin-Generator wurde angepasst: Generiert nun **${min}–${max} Coins** pro Sekunde.`,
      ephemeral: true
    });
  }
};
