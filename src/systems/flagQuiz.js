import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { getRandomFlag, findFlag, getFlagUrl, getFlagsByRegion, getRegions } from "country-flag-utils";
import Flaggenquiz from "#models/Flaggenquiz.js";
import { Coin } from "#models/Coin.js";
import { settings } from "#core/settings.js";

const LANGUAGE = "de";
const IMAGE = { provider: "flagcdn", size: "w640", format: "png" };
const NEXT_FLAG_DELAY = 5000;

export const REGIONS = getRegions();

function pickCountry(region) {
  if (!region) {return getRandomFlag({ language: LANGUAGE });}
  const pool = getFlagsByRegion(region, { language: LANGUAGE });
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildQuizMessage(channel, country) {
  const embed = new EmbedBuilder()
    .setDescription(
      "🚩 » Welche Flagge ist das?\n\n" +
      `💡 » Tipp: Beginnt mit **${country.name.charAt(0)}**\n` +
      "🪙 » Belohnung: **2 Coins**\n\n" +
      "✍️ » Schreibe den Ländernamen in den Chat!",
    )
    .setImage(getFlagUrl(country.code, IMAGE))
    .setColor("Blurple")
    .setFooter({ text: "» Benutze den Button, um die Flagge zu überspringen.", iconURL: channel.guild?.iconURL() ?? undefined });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("skip_flag").setLabel("➡️ Überspringen").setStyle(ButtonStyle.Secondary),
  );

  return { embeds: [embed], components: [row] };
}

export async function getQuiz(channelId) {
  return Flaggenquiz.findOne({ channelId });
}

async function fetchQuizMessage(channel, quiz) {
  if (!quiz?.messageId) {return null;}
  return channel.messages.fetch(quiz.messageId).catch(() => null);
}

// Everything in the channel except the quiz embed (bulkDelete only works for messages < 14 days)
async function clearChannel(channel, keepMessageId) {
  const messages = await channel.messages.fetch({ limit: 100 }).catch(() => null);
  if (!messages) {return;}
  const toDelete = messages.filter((m) => m.id !== keepMessageId);
  if (toDelete.size > 0) {
    await channel.bulkDelete(toDelete, true).catch(() => {});
  }
}

// Edits the existing quiz embed when it still exists, otherwise sends a new one.
export async function sendNewFlag(channel, { region = null } = {}) {
  const quiz = await getQuiz(channel.id);
  const country = pickCountry(region ?? quiz?.region ?? null);
  const payload = buildQuizMessage(channel, country);

  let message = await fetchQuizMessage(channel, quiz);
  if (message) {
    await message.edit(payload);
  } else {
    message = await channel.send(payload);
  }

  await Flaggenquiz.findOneAndUpdate(
    { channelId: channel.id },
    { guildId: channel.guild.id, channelId: channel.id, messageId: message.id, code: country.code, country: country.name, region: region ?? quiz?.region ?? null },
    { upsert: true },
  );

  return country;
}

export async function skipFlag(channel) {
  const quiz = await getQuiz(channel.id);
  if (!quiz) {return null;}
  await clearChannel(channel, quiz.messageId);
  return sendNewFlag(channel);
}

export async function stopQuiz(channel) {
  const quiz = await getQuiz(channel.id);
  if (!quiz) {return false;}
  const message = await fetchQuizMessage(channel, quiz);
  await message?.delete().catch(() => {});
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

  // mark the round as solved so a second correct answer in the same 5 s does nothing
  await Flaggenquiz.updateOne({ channelId: message.channel.id }, { $set: { code: null, country: null } });

  const reward = Number(settings.get("coins.flagQuizReward")) || 0;
  if (reward > 0) {
    await Coin.updateOne({ userId: message.author.id }, { $inc: { coins: reward } }, { upsert: true });
  }

  await message.react("✅").catch(() => {});
  await message.channel.send(
    `> \`✅\` » ${message.author} hat es erraten: **${quiz.country}** ${guess.emoji}` +
    (reward > 0 ? `\n> \`🪙\` » **+${reward.toLocaleString("de-DE")} Coins**` : ""),
  );

  setTimeout(async () => {
    await clearChannel(message.channel, quiz.messageId);
    await sendNewFlag(message.channel).catch(() => {});
  }, NEXT_FLAG_DELAY);

  return quiz;
}
