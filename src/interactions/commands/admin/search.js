import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";

export default {
  name: "search",
  description: "Zeigt Mitglieder, die in einem bestimmten Jahr dem Server beigetreten sind.",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      type: 4,
      name: "jahr",
      description: "Das Jahr, z.B. 2022",
      required: true,
    },
  ],

  async run(client, interaction) {
    const jahr = interaction.options.getInteger("jahr");
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const allMembers = await interaction.guild.members.fetch();
    const gefiltert = allMembers.filter(member =>
      member.joinedAt && member.joinedAt.getFullYear() === jahr,
    );

    if (gefiltert.size === 0) {
      return interaction.editReply(`> \`🔍\` » Es wurden **keine Mitglieder** gefunden, die im Jahr **${jahr}** dem Server beigetreten sind.`);
    }

    const liste = gefiltert
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .map(m => {
        const d = m.joinedAt;
        const tag = String(d.getDate()).padStart(2, "0");
        const monat = String(d.getMonth() + 1).padStart(2, "0");
        const jahr = d.getFullYear();
        return `• <@${m.id}> (${m.user.tag}) – ${tag}.${monat}.${jahr}`;
      });

    const seiten = [];
    const proSeite = 10;

    for (let i = 0; i < liste.length; i += proSeite) {
      const seitenInhalt = liste.slice(i, i + proSeite).join("\n");
      const embed = new EmbedBuilder()
        .setTitle(`Mitglieder beigetreten im Jahr ${jahr}`)
        .setDescription(seitenInhalt)
        .setFooter({ text: `Seite ${Math.floor(i / proSeite) + 1} von ${Math.ceil(liste.length / proSeite)} • ${liste.length} Mitglieder insgesamt` })
        .setColor("Blurple");
      seiten.push(embed);
    }

    let aktuelleSeite = 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("zurueck")
        .setLabel("⬅️ Vorherige Seite")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("weiter")
        .setLabel("➡️ Nächste Seite")
        .setStyle(ButtonStyle.Primary),
    );

    const message = await interaction.editReply({
      embeds: [seiten[aktuelleSeite]],
      components: seiten.length > 1 ? [row] : [],
    });

    if (seiten.length <= 1) {return;}

    const collector = message.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
    });

    collector.on("collect", async i => {
      if (i.customId === "zurueck") {
        aktuelleSeite = (aktuelleSeite === 0) ? seiten.length - 1 : aktuelleSeite - 1;
      } else if (i.customId === "weiter") {
        aktuelleSeite = (aktuelleSeite + 1) % seiten.length;
      }

      await i.update({
        embeds: [seiten[aktuelleSeite]],
        components: [row],
      });
    });

    collector.on("end", async () => {
      await message.edit({ components: [] }).catch(() => {});
    });
  },
};
