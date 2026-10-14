import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

import logger from "#core/logger.js";
import Flaggenquiz from "#models/Flaggenquiz.js";

/* =========================
   FLAGGEN
========================= */
const flags = [
  { country: "Deutschland", imageUrl: "https://flagcdn.com/w640/de.png" },
  { country: "Frankreich", imageUrl: "https://flagcdn.com/w640/fr.png" },
  { country: "Italien", imageUrl: "https://flagcdn.com/w640/it.png" },
  { country: "Spanien", imageUrl: "https://flagcdn.com/w640/es.png" },
  { country: "Portugal", imageUrl: "https://flagcdn.com/w640/pt.png" },
  { country: "Niederlande", imageUrl: "https://flagcdn.com/w640/nl.png" },
  { country: "Belgien", imageUrl: "https://flagcdn.com/w640/be.png" },
  { country: "Luxemburg", imageUrl: "https://flagcdn.com/w640/lu.png" },
  { country: "Österreich", imageUrl: "https://flagcdn.com/w640/at.png" },
  { country: "Schweiz", imageUrl: "https://flagcdn.com/w640/ch.png" },
  { country: "Polen", imageUrl: "https://flagcdn.com/w640/pl.png" },
  { country: "Tschechien", imageUrl: "https://flagcdn.com/w640/cz.png" },
  { country: "Slowakei", imageUrl: "https://flagcdn.com/w640/sk.png" },
  { country: "Ungarn", imageUrl: "https://flagcdn.com/w640/hu.png" },
  { country: "Rumänien", imageUrl: "https://flagcdn.com/w640/ro.png" },
  { country: "Bulgarien", imageUrl: "https://flagcdn.com/w640/bg.png" },
  { country: "Griechenland", imageUrl: "https://flagcdn.com/w640/gr.png" },
  { country: "Kroatien", imageUrl: "https://flagcdn.com/w640/hr.png" },
  { country: "Serbien", imageUrl: "https://flagcdn.com/w640/rs.png" },
  { country: "Norwegen", imageUrl: "https://flagcdn.com/w640/no.png" },
  { country: "Schweden", imageUrl: "https://flagcdn.com/w640/se.png" },
  { country: "Finnland", imageUrl: "https://flagcdn.com/w640/fi.png" },
  { country: "Dänemark", imageUrl: "https://flagcdn.com/w640/dk.png" },
  { country: "Island", imageUrl: "https://flagcdn.com/w640/is.png" },
  { country: "Irland", imageUrl: "https://flagcdn.com/w640/ie.png" },
  { country: "Vereinigtes Königreich", imageUrl: "https://flagcdn.com/w640/gb.png" },
  { country: "Ukraine", imageUrl: "https://flagcdn.com/w640/ua.png" },
  { country: "Russland", imageUrl: "https://flagcdn.com/w640/ru.png" },
  { country: "Türkei", imageUrl: "https://flagcdn.com/w640/tr.png" },

  { country: "Vereinigte Staaten", imageUrl: "https://flagcdn.com/w640/us.png" },
  { country: "Kanada", imageUrl: "https://flagcdn.com/w640/ca.png" },
  { country: "Mexiko", imageUrl: "https://flagcdn.com/w640/mx.png" },
  { country: "Brasilien", imageUrl: "https://flagcdn.com/w640/br.png" },
  { country: "Argentinien", imageUrl: "https://flagcdn.com/w640/ar.png" },
  { country: "Chile", imageUrl: "https://flagcdn.com/w640/cl.png" },
  { country: "Kolumbien", imageUrl: "https://flagcdn.com/w640/co.png" },
  { country: "Peru", imageUrl: "https://flagcdn.com/w640/pe.png" },
  { country: "Uruguay", imageUrl: "https://flagcdn.com/w640/uy.png" },

  { country: "Marokko", imageUrl: "https://flagcdn.com/w640/ma.png" },
  { country: "Algerien", imageUrl: "https://flagcdn.com/w640/dz.png" },
  { country: "Tunesien", imageUrl: "https://flagcdn.com/w640/tn.png" },
  { country: "Ägypten", imageUrl: "https://flagcdn.com/w640/eg.png" },
  { country: "Nigeria", imageUrl: "https://flagcdn.com/w640/ng.png" },
  { country: "Südafrika", imageUrl: "https://flagcdn.com/w640/za.png" },
  { country: "Kenia", imageUrl: "https://flagcdn.com/w640/ke.png" },

  { country: "Japan", imageUrl: "https://flagcdn.com/w640/jp.png" },
  { country: "China", imageUrl: "https://flagcdn.com/w640/cn.png" },
  { country: "Südkorea", imageUrl: "https://flagcdn.com/w640/kr.png" },
  { country: "Indien", imageUrl: "https://flagcdn.com/w640/in.png" },
  { country: "Thailand", imageUrl: "https://flagcdn.com/w640/th.png" },
  { country: "Vietnam", imageUrl: "https://flagcdn.com/w640/vn.png" },
  { country: "Indonesien", imageUrl: "https://flagcdn.com/w640/id.png" },
  { country: "Philippinen", imageUrl: "https://flagcdn.com/w640/ph.png" },
  { country: "Pakistan", imageUrl: "https://flagcdn.com/w640/pk.png" },
  { country: "Saudi-Arabien", imageUrl: "https://flagcdn.com/w640/sa.png" },
  { country: "Vereinigte Arabische Emirate", imageUrl: "https://flagcdn.com/w640/ae.png" },
  { country: "Israel", imageUrl: "https://flagcdn.com/w640/il.png" },

  { country: "Australien", imageUrl: "https://flagcdn.com/w640/au.png" },
  { country: "Neuseeland", imageUrl: "https://flagcdn.com/w640/nz.png" },
];

/* =========================
   HILFSFUNKTION
========================= */
async function sendNewFlag(channel, guild) {
  const randomFlag = flags[Math.floor(Math.random() * flags.length)];
  const firstLetter = randomFlag.country.charAt(0);

  const embed = new EmbedBuilder()
    .setDescription(
      "🚩 » Welche Flagge ist das?\n\n" +
      `💡 » Tipp: Beginnt mit **${firstLetter}**\n\n` +
      "✍️ » Schreibe den Ländernamen in den Chat!",
    )
    .setImage(randomFlag.imageUrl)
    .setColor("Random")
    .setFooter({
      text: "» Benutze den Button, um die Flagge zu überspringen.",
      iconURL: guild?.iconURL() ?? undefined,
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("skip_flag")
      .setLabel("➡️ Überspringen")
      .setStyle(ButtonStyle.Secondary),
  );

  const quizMessage = await channel.send({
    embeds: [embed],
    components: [row],
  });

  await Flaggenquiz.findOneAndUpdate(
    { channelId: channel.id },
    {
      guildId: guild.id,
      channelId: channel.id,
      messageId: quizMessage.id,
      country: randomFlag.country,
      imageUrl: randomFlag.imageUrl,
    },
    { upsert: true, new: true },
  );
}

/* =========================
   BUTTON HANDLER
========================= */
export const handleButton = async (interaction) => {
  if (!interaction.isButton() || interaction.customId !== "skip_flag") {
    return;
  }

  const quiz = await Flaggenquiz.findOne({
    channelId: interaction.channelId,
  });

  if (!quiz) {
    await interaction.reply({
      content: "> `❌` » Kein aktives Flaggenquiz.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const oldMessage = await interaction.channel.messages
    .fetch(quiz.messageId)
    .catch(() => null);

  if (oldMessage) {
    await oldMessage.delete().catch(() => null);
  }

  await sendNewFlag(interaction.channel, interaction.guild);
};

/* =========================
   MESSAGE HANDLER
========================= */
export const handleMessage = async (message) => {
  if (message.author.bot || !message.guild) {
    return;
  }

  const quiz = await Flaggenquiz.findOne({
    channelId: message.channel.id,
  });

  if (!quiz) {
    return;
  }

  if (message.content.trim().toLowerCase() !== quiz.country.toLowerCase()) {
    return;
  }

  await message.react("✅").catch(() => null);

  await message.channel.send(
    `> \`✅\` » Richtig! Das ist **${quiz.country}**.`,
  );

  await Flaggenquiz.deleteOne({
    channelId: message.channel.id,
  });

  setTimeout(() => {
    sendNewFlag(message.channel, message.guild).catch((err) => logger.error("Flaggenquiz:", err));
  }, 5000);
};

/* =========================
   COMMAND
========================= */
export default {
  name: "flaggenquiz",
  description: "» Startet ein Flaggenquiz",
  type: 1,
  default_member_permissions: "268435456",

  options: [
    {
      name: "kanal",
      description: "Kanal für das Quiz",
      required: true,
      type: 7,
    },
  ],

  async run(client, interaction) {
    const channel = interaction.options.getChannel("kanal");

    if (!channel?.isTextBased()) {
      await interaction.reply({
        content: "> `❌` » Bitte wähle einen Textkanal aus.",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: "> `⏳` » Flaggenquiz wird gestartet...",
      ephemeral: true,
    });

    const oldQuiz = await Flaggenquiz.findOne({
      channelId: channel.id,
    });

    if (oldQuiz) {
      const oldMessage = await channel.messages
        .fetch(oldQuiz.messageId)
        .catch(() => null);

      if (oldMessage) {
        await oldMessage.delete().catch(() => null);
      }
    }

    await Flaggenquiz.deleteOne({
      channelId: channel.id,
    });

    await sendNewFlag(channel, interaction.guild);
  },

  handleButton,
  handleMessage,
};
