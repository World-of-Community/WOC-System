import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { getRandomFlag, findFlag, getFlagUrl, getFlagsByRegion, getRegions } from "country-flag-utils";
import Flaggenquiz from "#models/Flaggenquiz.js";

const LANGUAGE = "de";
const IMAGE = { provider: "flagcdn", size: "w640", format: "png" };

export const REGIONS = getRegions();

function pickCountry(region) {
  if (!region) {return getRandomFlag({ language: LANGUAGE });}
  const pool = getFlagsByRegion(region, { language: LANGUAGE });
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function getQuiz(channelId) {
  return Flaggenquiz.findOne({ channelId });
}

export async function deleteQuizMessage(channel, quiz) {
  if (!quiz?.messageId) {return;}
  const message = await channel.messages.fetch(quiz.messageId).catch(() => null);
  await message?.delete().catch(() => {});
}

export async function sendNewFlag(channel, { region = null } = {}) {
  const country = pickCountry(region);
  const imageUrl = getFlagUrl(country.code, IMAGE);

  const embed = new EmbedBuilder()
    .setDescription(
      "🚩 » Welche Flagge ist das?\n\n" +
      `💡 » Tipp: Beginnt mit **${country.name.charAt(0)}**\n\n` +
      "✍️ » Schreibe den Ländernamen in den Chat!",
    )
    .setImage(imageUrl)
    .setColor("Random")
    .setFooter({ text: "» Benutze den Button, um die Flagge zu überspringen.", iconURL: channel.guild?.iconURL() ?? undefined });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("skip_flag").setLabel("➡️ Überspringen").setStyle(ButtonStyle.Secondary),
  );

  const message = await channel.send({ embeds: [embed], components: [row] });

  await Flaggenquiz.findOneAndUpdate(
    { channelId: channel.id },
    { guildId: channel.guild.id, channelId: channel.id, messageId: message.id, code: country.code, country: country.name, region, imageUrl },
    { upsert: true },
  );

  return country;
}

export async function skipFlag(channel) {
  const quiz = await getQuiz(channel.id);
  if (!quiz) {return null;}
  await deleteQuizMessage(channel, quiz);
  return sendNewFlag(channel, { region: quiz.region });
}

export async function stopQuiz(channel) {
  const quiz = await getQuiz(channel.id);
  if (!quiz) {return false;}
  await deleteQuizMessage(channel, quiz);
  await Flaggenquiz.deleteOne({ channelId: channel.id });
  return true;
}

// Accepts German/English names, aliases and codes; returns the solved country or null.
export async function checkAnswer(message) {
  const quiz = await getQuiz(message.channel.id);
  if (!quiz) {return null;}

  // quizzes created before the code field existed only have the German name
  const expected = quiz.code ?? findFlag(quiz.country, LANGUAGE)?.code;
  const guess = findFlag(message.content.trim(), LANGUAGE);
  if (!guess || guess.code !== expected) {return null;}

  await message.react("✅").catch(() => {});
  await message.channel.send(`> \`✅\` » Richtig! Das ist **${quiz.country}** ${guess.emoji}.`);

  const region = quiz.region;
  await Flaggenquiz.deleteOne({ channelId: message.channel.id });
  setTimeout(() => sendNewFlag(message.channel, { region }).catch(() => {}), 5000);
  return quiz;
}
