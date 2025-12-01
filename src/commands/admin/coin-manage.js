const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { CoinConfig } = require("../../../Datenbank/coindb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coin-manage")
    .setDescription("» Verwalte die Generierung von Coins für den Coin-Generator. 🪙")
    .addIntegerOption(option =>
      option.setName("min")
        .setDescription("Minimal generierte Coins pro Tick (z.B. 1)")
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option.setName("max")
        .setDescription("Maximal generierte Coins pro Tick (z.B. 5)")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const min = interaction.options.getInteger("min");
    const max = interaction.options.getInteger("max");

    // Validierung der Eingaben
    if (min < 0 || max < 1 || min > max) {
      return interaction.reply({
        content: "> `⛔` » Ungültige Eingaben. Bitte stelle sicher, dass `min ≥ 0`, `max ≥ 1` und `min ≤ max` ist.",
        ephemeral: true,
      });
    }

    // Konfiguration speichern
    let config = await CoinConfig.findOne({ guildId: interaction.guild.id });
    if (!config) {config = new CoinConfig({ guildId: interaction.guild.id });}

    config.minCoins = min;
    config.maxCoins = max;
    await config.save();

    // Antwort
    await interaction.reply({
      content: `> \`✅\` » Der Coin-Generator wurde aktualisiert:\n> Es werden nun **zwischen ${min.toLocaleString("de-DE")} und ${max.toLocaleString("de-DE")} Coins** alle **3 Sekunden** generiert.`,
      ephemeral: true,
    });
  },
};
