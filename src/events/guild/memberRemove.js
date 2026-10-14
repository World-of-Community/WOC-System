import { Events, EmbedBuilder } from "discord.js";
import userdb from "#models/User.js";
import InviteCache from "#models/InviteCache.js";
import serverdb from "#models/Guild.js";
import { Coin } from "#models/Coin.js";
import logger from "#core/logger.js";
import { reportError } from "#core/errors.js";

import { settings } from "#core/settings.js";

const LEAVE_MESSAGES = [
  (t) => `<a:leave:1433256832851251411> **${t}** hat uns verlassen. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** hat das Schiff verlassen. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** ist verschwunden... <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** hat die Party verlassen. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** ist in den Sonnenuntergang geritten. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** konnte dem Chaos nicht standhalten. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> Bye **${t}** – vielleicht sieht man sich wieder. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** ist vom Server gefallen. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** hat sich verabschiedet. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** hat das Abenteuer beendet. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> Oh nein! **${t}** ist einfach gegangen. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** hat den Server heimlich verlassen. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** hat das Weite gesucht. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> Der Platz von **${t}** ist nun leer... <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** ist durch ein Portal verschwunden. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** hat genug vom Abenteuer. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** hat sich aus dem Staub gemacht. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> Wir werden **${t}** vermissen... <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** hat den Server verlassen <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** wurde vom Wind davongetragen. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** ist gegangen, bevor die Party richtig losging. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** hat sich verabschiedet – vielleicht kommt er ja wieder? <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** hat einen eleganten Abgang hingelegt. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> **${t}** konnte dem Ruf der Freiheit nicht widerstehen. <a:winken:1086560167442796544>`,
  (t) => `<a:leave:1433256832851251411> Und da war es nur noch einer weniger... **${t}** ist gegangen. <a:winken:1086560167442796544>`,
];

export default {
  name: Events.GuildMemberRemove,

  async execute(client, member) {
    if (member.user.bot) {return;}

    const serverData = await serverdb.findOne({ guildID: member.guild.id });
    if (!serverData) {return;}
    if (serverData.deactivated?.includes?.("willkommensnachrichten")) {return;}

    const leaveChannel = member.guild.channels.cache.get(settings.get("channels.welcome"));
    if (leaveChannel) {
      const pick = LEAVE_MESSAGES[Math.floor(Math.random() * LEAVE_MESSAGES.length)];
      await leaveChannel.send({ content: pick(member.user.tag) }).catch((err) => logger.error("Leave message failed:", err?.message));
    }

    const leaveEmbed = new EmbedBuilder()
      .setTitle("<:user_leave:1228329456079343731> | NUTZER VERLASSEN")
      .setDescription(`**${member.user.displayName}** hat den Server verlassen.\n\n\`📌\` | **INFORMATIONEN**\n> Username: ${member.user.username}\n> Anzeigename: ${member.user.displayName} (${member})\n> Nutzer-ID: \`${member.user.id}\`\n> Server beigetreten am: <t:${Math.floor((member.joinedTimestamp ?? Date.now()) / 1000)}:F>\n> Account erstellt am: <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`)
      .setColor("Red")
      .setThumbnail(member.user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
      .setTimestamp();

    const logchannel = member.guild.channels.cache.get(settings.get("channels.serverLogs"));
    await logchannel?.threads.cache.get(settings.get("logThreads.join"))?.send({ embeds: [leaveEmbed] }).catch(() => {});

    await updateInviteStats(member).catch((error) => reportError(error, { source: "memberRemove:inviteStats" }));
    await deleteUserAds(member).catch((error) => reportError(error, { source: "memberRemove:deleteAds" }));
    await resetDailyStreak(member).catch((error) => reportError(error, { source: "memberRemove:dailyStreak" }));
  },
};

async function updateInviteStats(member) {
  const inviteCacheData = await InviteCache.findOne({ guildID: member.guild.id });
  if (!inviteCacheData) {return;}

  const userData = await userdb.findOne({ userID: member.id });
  if (!userData) {return;}

  if (userData.invitedBy) {
    await userdb.findOneAndUpdate(
      { userID: userData.invitedBy },
      { $inc: { "invites.left": 1 } },
    );
  }

  await userData.deleteOne();
}

async function deleteUserAds(member) {
  const channel = member.guild.channels.cache.get(settings.get("channels.ads"));
  if (!channel) {return;}

  const messages = await channel.messages.fetch();
  const userMessages = messages.filter((msg) => msg.author.id === member.id);

  for (const msg of userMessages.values()) {
    await msg.delete().catch(() => {});
  }
  if (userMessages.size > 0) {
    logger.info(`Deleted ${userMessages.size} ad message(s) from ${member.user.displayName}`);
  }
}

async function resetDailyStreak(member) {
  const userData = await Coin.findOne({ userId: member.id });
  if (!userData) {return;}

  userData.streak = 0;
  await userData.save();
  logger.info(`[DAILY-STREAK] ${member.user.tag} left – streak reset`);
}
