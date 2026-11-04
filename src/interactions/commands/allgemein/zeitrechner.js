import { EmbedBuilder, MessageFlags } from "discord.js";

export default {
  name: "zeitrechner",
  description: "» Berechnet einen zukünftigen Zeitpunkt. ⏰",
  type: 1,
  options: [
    {
      name: "jahr",
      description: "» Anzahl der Jahre.",
      type: 4,
      required: false,
      min_value: 0,
      max_value: 100,
    },
    {
      name: "monat",
      description: "» Anzahl der Monate.",
      type: 4,
      required: false,
      min_value: 0,
      max_value: 1200,
    },
    {
      name: "tag",
      description: "» Anzahl der Tage.",
      type: 4,
      required: false,
      min_value: 0,
      max_value: 36500,
    },
    {
      name: "stunden",
      description: "» Anzahl der Stunden.",
      type: 4,
      required: false,
      min_value: 0,
      max_value: 8760,
    },
    {
      name: "minuten",
      description: "» Anzahl der Minuten.",
      type: 4,
      required: false,
      min_value: 0,
      max_value: 59,
    },
  ],

  async run(client, interaction) {
    const jahr = interaction.options.getInteger("jahr") ?? 0;
    const monat = interaction.options.getInteger("monat") ?? 0;
    const tag = interaction.options.getInteger("tag") ?? 0;
    const stunden = interaction.options.getInteger("stunden") ?? 0;
    const minuten = interaction.options.getInteger("minuten") ?? 0;

    if (
      jahr === 0 &&
      monat === 0 &&
      tag === 0 &&
      stunden === 0 &&
      minuten === 0
    ) {
      return interaction.reply({
        content: "❌ » Bitte gib mindestens einen Zeitraum an.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const jetzt = new Date();
    const zielzeit = new Date(jetzt);

    zielzeit.setFullYear(zielzeit.getFullYear() + jahr);
    zielzeit.setMonth(zielzeit.getMonth() + monat);
    zielzeit.setDate(zielzeit.getDate() + tag);

    zielzeit.setTime(
      zielzeit.getTime() + (stunden * 60 + minuten) * 60 * 1000,
    );

    const unixTimestamp = Math.floor(zielzeit.getTime() / 1000);

    const formatDatum = new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin",
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const formatUhrzeit = new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

    const aktuelleUhrzeit = formatUhrzeit.format(jetzt);
    const ergebnisUhrzeit = formatUhrzeit.format(zielzeit);
    const ergebnisDatum = formatDatum.format(zielzeit);

    const zeitEmbed = new EmbedBuilder()
      .setTitle("`⏰` × Zeitrechner")
      .setDescription(
        "» Hier kannst du berechnen, wann ein bestimmter Zeitpunkt erreicht wird.\n\n" +
        `\`🕒\` » **Aktuelle Uhrzeit:** \`${aktuelleUhrzeit} Uhr\`\n` +
        `\`➕\` » **Hinzugefügte Zeit:** \`${jahr}y ${monat}m ${tag}d ${stunden}h ${minuten}m\`\n\n` +
        `\`📅\` » **Datum:** ${ergebnisDatum}\n` +
        `\`⏰\` » **Ergebnis:** \`${ergebnisUhrzeit} Uhr\`\n\n` +
        `\`🗓️\` » **Discord-Zeit:** <t:${unixTimestamp}:F>\n` +
        `\`⏳\` » **Countdown:** <t:${unixTimestamp}:R>`,
      )
      .setThumbnail("https://cdn.discordapp.com/attachments/1269339586568388670/1269341245730459749/WOC_Orange.png?ex=66b4fba8&is=66b3aa28&hm=0c61d77ee96136f6cea2948d3ddb13c1378ec1&")
      .setColor("Orange")
      .setFooter({
        text: `${interaction.client.user.displayName} - Bot`,
        iconURL: interaction.guild.iconURL(),
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [zeitEmbed],
      flags: MessageFlags.Ephemeral,
    });
  },
};
