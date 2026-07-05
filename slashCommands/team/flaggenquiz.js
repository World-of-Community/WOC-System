import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import Flaggenquiz from "../../models/flaggenquizdb.js";

/* =========================
   FLAGGEN
========================= */
const flags = [
  { country: "Deutschland", imageUrl: "https://www.worldometers.info/img/flags/gm-flag.gif" },
  { country: "Frankreich", imageUrl: "https://www.worldometers.info/img/flags/fr-flag.gif" },
  { country: "Vereinigte Staaten", imageUrl: "https://www.worldometers.info/img/flags/us-flag.gif" },
  { country: "Kanada", imageUrl: "https://www.worldometers.info/img/flags/ca-flag.gif" },
  { country: "Brasilien", imageUrl: "https://www.worldometers.info/img/flags/br-flag.gif" },
  { country: "Japan", imageUrl: "https://www.worldometers.info/img/flags/ja-flag.gif" },
  { country: "Indien", imageUrl: "https://www.worldometers.info/img/flags/in-flag.gif" },
  { country: "Australien", imageUrl: "https://www.worldometers.info/img/flags/as-flag.gif" },
  { country: "Vereinigtes Königreich", imageUrl: "https://www.worldometers.info/img/flags/uk-flag.gif" },
  { country: "China", imageUrl: "https://www.worldometers.info/img/flags/ch-flag.gif" },
  { country: "Russland", imageUrl: "https://www.worldometers.info/img/flags/rs-flag.gif" },
  { country: "Südkorea", imageUrl: "https://www.worldometers.info/img/flags/ks-flag.gif" },
  { country: "Italien", imageUrl: "https://www.worldometers.info/img/flags/it-flag.gif" },
  { country: "Spanien", imageUrl: "https://www.worldometers.info/img/flags/sp-flag.gif" },
  { country: "Mexiko", imageUrl: "https://www.worldometers.info/img/flags/mx-flag.gif" },
];

/* =========================
   HILFSFUNKTION
========================= */
async function sendNewFlag(channel, guild) {
  const randomFlag = flags[Math.floor(Math.random() * flags.length)];
  const firstLetter = randomFlag.country[0];

  const embed = new EmbedBuilder()
    .setDescription(
      "`🚩` » Welche Flagge ist das?\n\n" +
      `\`💡\` » Tipp: Beginnt mit **${firstLetter}**\n\n` +
      "`✍️` » Schreibe den Ländernamen in den Chat!",
    )
    .setImage(randomFlag.imageUrl)
    .setColor("Random")
    .setFooter({
      text: "» Benutze den Button, um die Flagge zu überspringen.",
      iconURL: guild.iconURL(),
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("skip_flag")
      .setLabel("➡️ Überspringen")
      .setStyle(ButtonStyle.Secondary),
  );

  const msg = await channel.send({ embeds: [embed], components: [row] });

  await Flaggenquiz.findOneAndUpdate(
    { channelId: channel.id },
    {
      guildId: guild.id,
      channelId: channel.id,
      messageId: msg.id,
      country: randomFlag.country,
      imageUrl: randomFlag.imageUrl,
    },
    { upsert: true },
  );
}

/* =========================
   GLOBALER BUTTON HANDLER
========================= */
export const handleButton = async (interaction) => {
  if (!interaction.isButton()) {return;}
  if (interaction.customId !== "skip_flag") {return;}

  const quiz = await Flaggenquiz.findOne({ channelId: interaction.channel.id });
  if (!quiz) {
    return interaction.reply({
      content: "> `❌` » Kein aktives Flaggenquiz.",
      ephemeral: true,
    });
  }

  await interaction.deferUpdate();

  await interaction.channel.messages.fetch(quiz.messageId)
    .then(m => m.delete())
    .catch(() => {});

  await sendNewFlag(interaction.channel, interaction.guild);
};

/* =========================
   GLOBALER MESSAGE HANDLER
========================= */
export const handleMessage = async (message) => {
  if (message.author.bot) {return;}

  const quiz = await Flaggenquiz.findOne({ channelId: message.channel.id });
  if (!quiz) {return;}

  if (message.content.toLowerCase() === quiz.country.toLowerCase()) {
    await message.react("✅");

    await message.channel.send(
      `> \`✅\` » Richtig! Das ist **${quiz.country}**.`,
    );

    await Flaggenquiz.deleteOne({ channelId: message.channel.id });

    setTimeout(async () => {
      await sendNewFlag(message.channel, message.guild);
    }, 5000);
  }
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
      "name": "kanal",
      "description": "Kanal für das Quiz",
      "required": true,
      "type": 7,
    },
  ],

  async run(client, interaction) {
    const channel = interaction.options.getChannel("kanal");

    await interaction.reply({
      content: "> `⏳` » Flaggenquiz wird gestartet...",
      ephemeral: true,
    });

    await Flaggenquiz.deleteOne({ channelId: channel.id });
    await sendNewFlag(channel, interaction.guild);
  },
  handleButton,
  handleMessage,
};
