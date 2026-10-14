import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import Timeout from "#models/Timeout.js";
import Warn from "#models/Warning.js";
import Note from "#models/UserNote.js";

export default {
  id: "showPunishments_",
  prefix: true,
  run: async (client, interaction) => {
    const userId = interaction.customId.split("_")[1];
    const guildId = interaction.guild.id;

    // ───────────── Lade Strafen ─────────────
    const timeouts = await Timeout.find({ userId, guildId }).sort({ createdAt: 1 });
    const warns = await Warn.find({ userId, guildId }).sort({ createdAt: 1 });

    const punishments = [
      ...timeouts.map(t => ({
        type: "Timeout",
        text: t.reason || "Kein Grund angegeben",
        date: t.createdAt || new Date(),
        image: t.proof || null,
        id: t._id.toString(),
      })),
      ...warns.map(w => ({
        type: "Warnung",
        text: w.reason || "Kein Grund angegeben",
        date: w.createdAt || new Date(),
        image: w.proof || null,
        id: w._id.toString(),
      })),
    ];

    if (!punishments.length)
    {return interaction.reply({ content: "> `🟢` » Keine Strafen vorhanden.", ephemeral: true });}

    // ───────────── Lade Notizen ─────────────
    const notes = await Note.find({ userId, guildId }).sort({ createdAt: 1 });

    let page = 0;

    const buildEmbed = () => {
      const p = punishments[page];

      // Suche passende Notiz zur Strafe (optional, per Id matching, hier nach Datum)
      const n = notes.find(n =>
        Math.abs(new Date(n.createdAt) - new Date(p.date)) < 60 * 1000, // +-1min
      );

      const date = p.date ? new Date(p.date) : new Date();

      const embed = new EmbedBuilder()
        .setTitle(`⚠️ Strafe (${page + 1}/${punishments.length})`)
        .setDescription(
          `Strafe: ${p.type}\n` +
                    `Grund: ${n?.note ?? p.text ?? "Kein Grund angegeben"}\n` +
                    `Datum: <t:${Math.floor(date.getTime() / 1000)}:f>`,
        )
        .setColor(0xED4245)
        .setFooter({ text: `User-ID: ${userId}` })
        .setTimestamp(date);

      if (p.image) {embed.setImage(p.image);}
      return embed;
    };

    const row = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("punish_prev")
          .setEmoji("⬅️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("punish_next")
          .setEmoji("➡️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === punishments.length - 1),
      );

    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({ embeds: [buildEmbed()], components: [row()] });

    const msg = await interaction.fetchReply();
    const collector = msg.createMessageComponentCollector({ componentType: 2 });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id)
      {return i.reply({ content: "> `❌` » Nicht dein Menü.", ephemeral: true });}

      if (i.customId === "punish_prev") {page--;}
      if (i.customId === "punish_next") {page++;}

      await i.update({ embeds: [buildEmbed()], components: [row()] });
    });
  },
};
