import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import EmojiQuiz from "#models/EmojiQuiz.js";
import EmojiQuizEntry from "#models/EmojiQuizEntry.js";
import { Coin } from "#models/Coin.js";
import { settings } from "#core/settings.js";
import logger from "#core/logger.js";
import seed from "./emojiQuizSeed.js";

const log = logger.child("EmojiQuiz");
const NEXT_DELAY = 5000;

export const DIFFICULTIES = ["einfach", "mittel", "schwer"];

// "Die Eiskönigin!" -> "eiskoenigin"
export function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/^(der|die|das|the|a|an)\s+/, "")
    .replace(/[^a-z0-9]/g, "");
}

export async function seedEntries() {
  if (await EmojiQuizEntry.countDocuments() > 0) {return 0;}
  await EmojiQuizEntry.insertMany(seed.map((e) => ({ ...e, addedBy: null })));
  log.info(`Seeded ${seed.length} riddles`);
  return seed.length;
}

export async function addEntry({ begriff, emojis, tipp = "", schwierigkeit = "mittel", aliases = [] }, addedBy = null) {
  const name = String(begriff).trim();
  if (!name) {throw new Error("Begriff fehlt");}
  if (!String(emojis).trim()) {throw new Error("Emojis fehlen");}
  if (!DIFFICULTIES.includes(schwierigkeit)) {throw new Error(`Schwierigkeit muss ${DIFFICULTIES.join(", ")} sein`);}

  const existing = await EmojiQuizEntry.findOne({ begriff: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
  if (existing) {throw new Error(`"${name}" existiert bereits`);}

  return EmojiQuizEntry.create({
    begriff: name,
    emojis: String(emojis).trim(),
    tipp: String(tipp ?? "").trim(),
    schwierigkeit,
    aliases: aliases.map((a) => String(a).trim()).filter(Boolean),
    addedBy,
  });
}

export async function removeEntry(begriff) {
  const entry = await EmojiQuizEntry.findOneAndDelete({ begriff });
  if (!entry) {throw new Error(`"${begriff}" ist nicht eingetragen`);}
  return entry;
}

export async function listEntries() {
  return EmojiQuizEntry.find().sort({ begriff: 1 }).lean();
}

export async function searchEntries(query, limit = 25) {
  const q = query.toLowerCase();
  const all = await listEntries();
  return all.filter((e) => e.begriff.toLowerCase().includes(q) || e.emojis.includes(query)).slice(0, limit);
}

async function pickEntry(schwierigkeit, excludeId) {
  const filter = schwierigkeit ? { schwierigkeit } : {};
  if (excludeId) {filter._id = { $ne: excludeId };}
  const [entry] = await EmojiQuizEntry.aggregate([{ $match: filter }, { $sample: { size: 1 } }]);
  return entry ?? (excludeId ? pickEntry(schwierigkeit, null) : null);
}

function buildQuizMessage(channel, entry) {
  const reward = Number(settings.get("coins.emojiQuizReward")) || 0;
  const embed = new EmbedBuilder()
    .setDescription(
      `Gesuchter Begriff • ${entry.emojis}\n\n` +
      `Schwierigkeit • **${entry.schwierigkeit}**\n` +
      (reward > 0 ? `Belohnung • **${reward.toLocaleString("de-DE")}** 🪙\n` : "") +
      (entry.tipp ? `\nTipp • **${entry.tipp}**\n` : "") +
      "\n`❓` Dir fällt der Begriff nicht ein? Du kannst das Emojiquiz auch überspringen.",
    )
    .setColor("Blurple");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("skip_emoji").setLabel("Überspringen").setEmoji("➡️").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("emoji_hint").setLabel("Erster Buchstabe").setEmoji("🅰️").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("emoji_suggest").setLabel("Neuen Begriff vorschlagen").setEmoji("❓").setStyle(ButtonStyle.Primary),
  );

  return { embeds: [embed], components: [row] };
}

export async function getQuiz(channelId) {
  return EmojiQuiz.findOne({ channelId });
}

async function fetchQuizMessage(channel, quiz) {
  if (!quiz?.messageId) {return null;}
  return channel.messages.fetch(quiz.messageId).catch(() => null);
}

async function clearChannel(channel, keepMessageId) {
  const messages = await channel.messages.fetch({ limit: 100 }).catch(() => null);
  if (!messages) {return;}
  const toDelete = messages.filter((m) => m.id !== keepMessageId);
  if (toDelete.size > 0) {
    await channel.bulkDelete(toDelete, true).catch(() => {});
  }
}

// Edits the existing quiz embed when it still exists, otherwise sends a new one.
export async function sendNewEmoji(channel, { schwierigkeit = null } = {}) {
  const quiz = await getQuiz(channel.id);
  const difficulty = schwierigkeit ?? quiz?.schwierigkeit ?? null;
  const entry = await pickEntry(difficulty, quiz?.entryId);
  if (!entry) {throw new Error("Keine Rätsel in der Datenbank – /settings emoji add");}

  const payload = buildQuizMessage(channel, entry);
  let message = await fetchQuizMessage(channel, quiz);
  if (message) {
    await message.edit(payload);
  } else {
    message = await channel.send(payload);
  }

  await EmojiQuiz.findOneAndUpdate(
    { channelId: channel.id },
    { guildId: channel.guild.id, channelId: channel.id, messageId: message.id, entryId: String(entry._id), begriff: entry.begriff, schwierigkeit: difficulty },
    { upsert: true },
  );

  return entry;
}

export async function skipEmoji(channel) {
  const quiz = await getQuiz(channel.id);
  if (!quiz) {return null;}
  await clearChannel(channel, quiz.messageId);
  return sendNewEmoji(channel);
}

export async function stopQuiz(channel) {
  const quiz = await getQuiz(channel.id);
  if (!quiz) {return false;}
  const message = await fetchQuizMessage(channel, quiz);
  await message?.delete().catch(() => {});
  await EmojiQuiz.deleteOne({ channelId: channel.id });
  return true;
}

export async function checkAnswer(message) {
  const quiz = await getQuiz(message.channel.id);
  if (!quiz?.entryId) {return null;}

  const entry = await EmojiQuizEntry.findById(quiz.entryId).lean();
  if (!entry) {return null;}

  const guess = normalize(message.content);
  const accepted = [entry.begriff, ...(entry.aliases ?? [])].map(normalize);
  if (!guess || !accepted.includes(guess)) {return null;}

  // lock the round so a second correct answer within the delay does nothing
  await EmojiQuiz.updateOne({ channelId: message.channel.id }, { $set: { entryId: null, begriff: null } });

  const reward = Number(settings.get("coins.emojiQuizReward")) || 0;
  if (reward > 0) {
    await Coin.updateOne({ userId: message.author.id }, { $inc: { coins: reward } }, { upsert: true });
  }

  await message.react("✅").catch(() => {});
  await message.channel.send(
    `> \`✅\` » ${message.author} hat es erraten: **${entry.begriff}** ${entry.emojis}` +
    (reward > 0 ? `\n> \`🪙\` » **+${reward.toLocaleString("de-DE")} Coins**` : ""),
  );

  setTimeout(async () => {
    await clearChannel(message.channel, quiz.messageId);
    await sendNewEmoji(message.channel).catch((err) => log.error("Next riddle failed:", err?.message));
  }, NEXT_DELAY);

  return entry;
}

export async function currentEntry(channelId) {
  const quiz = await getQuiz(channelId);
  if (!quiz?.entryId) {return null;}
  return EmojiQuizEntry.findById(quiz.entryId).lean();
}
