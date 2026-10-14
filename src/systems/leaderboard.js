import { EmbedBuilder } from "discord.js";
import User from "#models/User.js";
import Leaderboard from "#models/Leaderboard.js";
import logger from "#core/logger.js";
import { settings } from "#core/settings.js";
import { env } from "#config";

const log = logger.child("Leaderboard");

const POSITION_EMOJIS = ["`🥇`", "`🥈`", "`🥉`", "`4️⃣`", "`5️⃣`", "`6️⃣`", "`7️⃣`", "`8️⃣`", "`9️⃣`", "`🔟`"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const FIELD_LIMIT = 1024;

const ICONS = {
  messages: "https://cdn.discordapp.com/attachments/1269339944766144574/1286772658318479423/8280686.png",
  messagesFooter: "https://cdn.discordapp.com/attachments/1269339944766144574/1286773637562630154/image.png",
  voice: "https://cdn.discordapp.com/attachments/1269339944766144574/1286772303455059988/5808970.png",
  voiceFooter: "https://cdn.discordapp.com/attachments/1269339944766144574/1286773912977408011/image.png",
};

const excluded = () => settings.get("system.leaderboardExcluded");

function formatVoiceTime(ms) {
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return `${days} Tage ${hours} Stunden ${minutes} Minuten`;
}

function clamp(text, fallback) {
  if (!text) {return fallback;}
  return text.length > FIELD_LIMIT ? `${text.slice(0, FIELD_LIMIT - 4)}...` : text;
}

async function topUsers(field, limit) {
  return User.find({ userID: { $nin: excluded() } }).sort({ [field]: -1 }).limit(limit);
}

async function resolveMembers(guild, users) {
  const members = await Promise.all(users.map((u) => guild.members.fetch(u.userID).catch(() => null)));
  return users.map((user, i) => ({ user, member: members[i] })).filter((e) => e.member);
}

function renderList(entries, valueOf) {
  return entries
    .map(({ user, member }, index) => `${POSITION_EMOJIS[index]} » ${member} - **${member.user.username}**\n> \`${valueOf(user)}\``)
    .join("\n");
}

export async function createLeaderboardMessage(guild) {
  const [messageEntries, voiceEntries] = await Promise.all([
    topUsers("stats.messages", 10).then((u) => resolveMembers(guild, u)),
    topUsers("stats.voiceTime", 10).then((u) => resolveMembers(guild, u)),
  ]);

  const month = MONTHS[new Date().getMonth()];

  const infoEmbed = new EmbedBuilder()
    .setDescription(
      "Die Top 3 Mitglieder in Nachrichten & Voice erhalten\n" +
      `die <@&${settings.get("exclusiveRoles.leaderboardWinner")}>-Rolle\n\n` +
      "> `👷‍♂️` » **Vorteile**\n" +
      `- Bilder senden in <#${settings.get("channels.mainChat")}>\n` +
      "- Höher gelistet\n" +
      "- Ping Reaktion (`/emoji`)\n\n" +
      "> `📌` » Das Leaderboard wird monatlich zurückgesetzt.",
    )
    .setColor("Orange");

  const messageEmbed = new EmbedBuilder()
    .setAuthor({ name: `» ${month} Leaderboard - Nachrichten`, iconURL: ICONS.messages })
    .setDescription(clamp(renderList(messageEntries, (u) => `${u.stats?.messages ?? 0} Nachrichten`), "> Noch keine Nachrichten vorhanden."))
    .setColor("Blurple")
    .setFooter({ text: "» Zuletzt aktualisiert", iconURL: ICONS.messagesFooter })
    .setTimestamp();

  const voiceEmbed = new EmbedBuilder()
    .setAuthor({ name: `» ${month} Leaderboard - Voice Zeit`, iconURL: ICONS.voice })
    .setDescription(clamp(renderList(voiceEntries, (u) => formatVoiceTime(u.stats?.voiceTime ?? 0)), "> Noch keine Voice-Zeit vorhanden."))
    .setColor("Blue")
    .setFooter({ text: "» Zuletzt aktualisiert", iconURL: ICONS.voiceFooter })
    .setTimestamp();

  if (messageEntries[0]) {messageEmbed.setThumbnail(messageEntries[0].member.displayAvatarURL());}
  if (voiceEntries[0]) {voiceEmbed.setThumbnail(voiceEntries[0].member.displayAvatarURL());}

  return { embeds: [infoEmbed, messageEmbed, voiceEmbed] };
}

async function fetchLeaderboardMessage(client) {
  const saved = await Leaderboard.findOne({ guildId: env.discord.guildId });
  if (!saved) {
    log.warn("No leaderboard message stored – run /setup-leaderboard");
    return null;
  }

  const guild = client.guilds.cache.get(saved.guildId);
  const channel = guild?.channels.cache.get(saved.channelId);
  const message = await channel?.messages.fetch(saved.messageId).catch(() => null);
  if (!message) {
    log.warn(`Leaderboard message ${saved.messageId} not found`);
    return null;
  }
  return { guild, channel, message };
}

// Always edits the stored message, never posts a new one.
export async function updateLeaderboard(client) {
  const target = await fetchLeaderboardMessage(client);
  if (!target) {return;}

  const content = await createLeaderboardMessage(target.guild);
  await target.message.edit({ embeds: content.embeds });
}

// Monthly: hand the winner role to the top 3 of each category, then reset the stats.
export async function resetLeaderboardStats(client) {
  const target = await fetchLeaderboardMessage(client);
  if (!target) {return;}
  const { guild, channel } = target;

  const roleId = settings.get("exclusiveRoles.leaderboardWinner");
  const role = await guild.roles.fetch(roleId).catch(() => null);
  if (!role) {throw new Error(`leaderboard role ${roleId} not found`);}

  const [topMessages, topVoice] = await Promise.all([topUsers("stats.messages", 3), topUsers("stats.voiceTime", 3)]);
  const winnerIds = [...new Set([...topMessages, ...topVoice].map((u) => u.userID))];

  const members = await guild.members.fetch({ withPresences: false });
  for (const member of members.filter((m) => m.roles.cache.has(role.id)).values()) {
    await member.roles.remove(role).catch((err) => log.error(`Could not remove role from ${member.user.tag}:`, err?.message));
  }

  for (const userID of winnerIds) {
    const member = await guild.members.fetch(userID).catch(() => null);
    if (!member || member.roles.cache.has(role.id)) {continue;}

    try {
      await member.roles.add(role);
      log.info(`${member.user.tag} received the leaderboard role`);
      const notice = await channel.send({ content: `${member} hat für die hohe Aktivität die ${role} Rolle erhalten` });
      setTimeout(() => notice.delete().catch(() => {}), 5 * 60 * 1000);
    } catch (error) {
      log.error(`Could not add role to ${member.user.tag}:`, error?.message ?? error);
    }
  }

  await User.updateMany({}, { $set: { "stats.messages": 0, "stats.voiceTime": 0 } });
  await updateLeaderboard(client);
  log.info("Monthly reset done");
}
