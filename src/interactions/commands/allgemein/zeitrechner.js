import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("zeitrechner")
    .setDescription("Berechnet einen zukünftigen Zeitpunkt.")
    .addIntegerOption(option =>
      option
        .setName("stunden")
        .setDescription("Wie viele Stunden sollen addiert werden?")
        .setMinValue(0)
        .setMaxValue(8760)
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("minuten")
        .setDescription("Wie viele Minuten sollen addiert werden?")
        .setMinValue(0)
        .setMaxValue(59)
        .setRequired(false)
    ),

  async execute(interaction) {
    const stunden = interaction.options.getInteger("stunden");
    const minuten = interaction.options.getInteger("minuten") ?? 0;

    if (stunden === 0 && minuten === 0) {
      return interaction.reply({
        content: "> `❌` » Bitte gib mindestens eine Stunde oder Minute an.",
        ephemeral: true
      });
    }

    const jetzt = new Date();
    const zielzeit = new Date(
      jetzt.getTime() + (stunden * 60 + minuten) * 60 * 1000
    );

    const datum = new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin",
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(zielzeit);

    const uhrzeit = new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).format(zielzeit);

    const aktuelleUhrzeit = new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).format(jetzt);

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("⏰ Zeitrechner")
      .setDescription(
        `Der gewünschte Zeitpunkt wurde erfolgreich berechnet!`
      )
      .addFields(
        {
          name: "🕒 Aktuelle Uhrzeit",
          value: `${aktuelleUhrzeit} Uhr`,
          inline: true
        },
        {
          name: "➕ Hinzugefügte Zeit",
          value: `${stunden} Stunden und ${minuten} Minuten`,
          inline: true
        },
        {
          name: "📅 Datum",
          value: datum,
          inline: false
        },
        {
          name: "⏰ Ergebnis",
          value: `**${uhrzeit} Uhr**`,
          inline: false
        }
      )
      .setFooter({
        text: "WOC • Zeitrechner"
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};