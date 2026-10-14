import { EventEmitter } from "node:events";
import { EmbedBuilder } from "discord.js";
import erfolgDB from "#models/Achievement.js";
import vorschlagEmitter from "./vorschlagEmitter.js";
import logger from "#core/logger.js";
import { reportError } from "#core/errors.js";
import { GUILD_ID } from "#config";
import { settings } from "#core/settings.js";

const log = logger.child("Erfolge");

export const gewinnspielEmitter = new EventEmitter();

const ERFOLG_BANNER = "https://cdn.discordapp.com/attachments/1269339771420016722/1269339821495681116/WOC_Banner_Server_Erfolg_Erhalten.png?ex=66bedd94&is=66bd8c14&hm=d764c1b8be0977c7068a86366b3e411e95c679a4cd5ccf3be54192879c5fa337&";
const ERFOLGE_CHANNEL_URL = "https://discord.com/channels/815919809379172354/872063101640532008";

function extractUserId(embed) {
  const match = embed?.footer?.text?.match(/»\s+(\d{17,19})$/);
  return match ? match[1] : null;
}

function erfolgEmbed(guild, description) {
  return new EmbedBuilder()
    .setTitle("<a:checkgreen:1154702583202578472> 𑁉 ERFOLG ERHALTEN")
    .setDescription(description)
    .setColor("Green")
    .setImage(ERFOLG_BANNER)
    .setFooter({ text: `» Erfolg freigeschaltet auf ${guild.name}`, iconURL: `${guild.iconURL()}` })
    .setTimestamp();
}

async function onVorschlagAccepted(inter) {
  const message = await inter.channel.fetchStarterMessage();
  const userID = extractUserId(message.embeds[0]);
  if (!userID) {
    log.error("Could not read user id from suggestion embed");
    return;
  }

  const userErfolge = await erfolgDB.findOneAndUpdate(
    { userID },
    { $setOnInsert: { userID } },
    { upsert: true, returnDocument: "after" },
  );

  if (userErfolge.idee >= 10) {return;}

  userErfolge.idee += 1;
  await userErfolge.save();

  if (userErfolge.idee !== 10) {return;}

  const user = await inter.client.users.fetch(userID).catch(() => null);
  if (!user) {return;}

  const embed = erfolgEmbed(
    inter.guild,
    "» `💕`**-lichen Glückwunsch zu diesem Erfolg!**\n\n" +
    "<:Pfeil:1119709908540076124> **Erfolg freigeschaltet:** `💡〢 Informant (10 Server-Ideen)`\n" +
    "<:PfeilBlau:1119711275014955080> Vielen Dank dass du den Server und uns dabei unterstützt mit deinen Kreativen Ideen!\n\n" +
    `<a:wocbook:1178664700469317692> » Schalte noch **mehr Erfolge** frei: ${ERFOLGE_CHANNEL_URL}`,
  );
  await user.send({ content: "<a:Cool:915211628755169301> **ERFOLG FREIGESCHALTET!** <a:Cool:915211628755169301>", embeds: [embed] }).catch(() => {});
}

async function onGewinnspielWin(inter) {
  const message = await inter.channel.fetchStarterMessage();
  const userID = extractUserId(message.embeds[0]);
  if (!userID) {
    log.error("Could not read user id from giveaway embed");
    return;
  }

  let userErfolge = await erfolgDB.findOne({ userID });
  if (!userErfolge) {
    userErfolge = new erfolgDB({ userID, gewinnspiel: 0 });
  }

  if (userErfolge.gewinnspiel >= 1) {return;}

  userErfolge.gewinnspiel += 1;
  await userErfolge.save();

  const member = await inter.guild.members.fetch(userID).catch(() => null);
  const gewinnerRole = inter.guild.roles.cache.get(settings.get("achievementRoles.lucky"));
  if (gewinnerRole && member) {
    await member.roles.add(gewinnerRole).catch((err) => log.error("Failed to add winner role:", err?.message));
  }

  const user = await inter.client.users.fetch(userID).catch(() => null);
  if (!user) {return;}

  const embed = erfolgEmbed(
    inter.guild,
    "» `💕`**-lichen Glückwunsch zum Gewinn des Gewinnspiels!**\n\n" +
    "<:Pfeil:1119709908540076124> **Erfolg freigeschaltet:** `☘️ 〢 Glückspilz (Event-Gewinner)`\n" +
    "<:PfeilBlau:1119711275014955080> Vielen Dank für deine Teilnahme und viel Glück beim nächsten Mal!\n\n" +
    `<a:wocbook:1178664700469317692> » Schalte noch **mehr Erfolge** frei: ${ERFOLGE_CHANNEL_URL}`,
  );
  await user.send({ content: "<a:Cool:915211628755169301> **GEWINNSPIEL ERFOLG FREIGESCHALTET!** <a:Cool:915211628755169301>", embeds: [embed] }).catch(() => {});
}

vorschlagEmitter.on("accept", (inter) => {
  onVorschlagAccepted(inter).catch((error) => reportError(error, { source: "erfolge:vorschlagAccepted" }));
});

gewinnspielEmitter.on("win", (inter) => {
  onGewinnspielWin(inter).catch((error) => reportError(error, { source: "erfolge:gewinnspielWin" }));
});

export async function trackFirstMessage(message) {
  if (!message.guild || message.author.bot) {return;}

  const userAchievements = await erfolgDB.findOne({ userID: message.author.id });
  if (!userAchievements?.firstMessage) {
    await erfolgDB.findOneAndUpdate(
      { userID: message.author.id },
      { firstMessage: true },
      { upsert: true },
    );
  }
}

export async function grantOneYearRole(client) {
  const guild = await client.guilds.fetch(GUILD_ID);
  const role = guild.roles.cache.get(settings.get("achievementRoles.oneYear"));
  if (!role) {throw new Error(`role ${settings.get("achievementRoles.oneYear")} not found`);}

  const members = await guild.members.fetch();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  let granted = 0;
  for (const member of members.values()) {
    if (member.user.bot || member.roles.cache.has(settings.get("achievementRoles.oneYear")) || !member.joinedAt || member.joinedAt > oneYearAgo) {continue;}

    try {
      await member.roles.add(role);
      granted += 1;

      const embed = erfolgEmbed(
        guild,
        "`💕`**-lichen Glückwunsch zu diesem Erfolg!** Das war bestimmt ein steiniger Weg, aber endlich hast du dir diesen Erfolg mehr als verdient!\n\n" +
        "<:Pfeil:1119709908540076124> **Erfolg freigeschaltet:** `💖〢 1 Jahr Server-Mitglied`\n" +
        "<:PfeilBlau:1119711275014955080> Stell dir vor, heute vor exakt einem Jahr bist du unserer Community beigetreten! Dafür wollten wir uns bei dir bedanken. ❤️",
      );
      await member.send({ content: "<a:Cool:915211628755169301> **ERFOLG FREIGESCHALTET!** <a:Cool:915211628755169301>", embeds: [embed] }).catch(() => {});
      log.info(`1-year role granted to ${member.user.username}`);
    } catch (error) {
      log.error(`1-year role failed for ${member.user.username}:`, error?.message ?? error);
    }
  }

  if (granted > 0) {log.info(`${granted} member(s) received the 1-year role`);}
}
