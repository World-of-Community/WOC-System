import { Events, EmbedBuilder } from "discord.js";
import serverdb from "#models/serverdb.js";
import userdb from "#models/userdb.js";
import InviteCacheModel from "#models/inviteCachedb.js";
import { Coin } from "#models/coindb.js";
import logger from "#core/logger.js";
import { reportError } from "#core/errors.js";
import { CHANNELS, LOG_THREADS } from "#config";

const WELCOME_CHANNEL_ID = "1433189396475023380";
const NEUES_MITGLIED_ROLE_ID = "1222122625594294272";
const MITGLIED_ROLE_ID = "815920703067914290";
const BANN_ROLE_ID = "886989738244964362";

const WELCOME_MESSAGES = [
  (m) => `<a:Join:1375559039098032299> ${m} **ist gerade auf den Server geschlittert** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> **Ein wildes** ${m} **erscheint!** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> ${m} **hat den weg gefunden** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> ${m} **ist gelandet** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> ${m} **ist auf den Server gehüpft** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> ${m} **bringt Kekse** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> **Kann jemand** ${m} **etwas herumführen?** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> **Huch!** ${m} **ist zu uns gestolpert** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> **Heißen wir** ${m} **Willkommen bei uns!** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> ${m} **gibt allen eine Runde aus, Willkommen** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> **Willkommen** ${m} **Wir hoffen, du hast Pizza mitgebracht.** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> **Hey** ${m} **sind wir froh das du uns gefunden hast** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> **Juhu,** ${m} **du hast es zu uns geschafft!** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> **Herzlich Willkommen** ${m} **Sag hallo** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> ${m} **Hilft uns die Welt zu erobern.** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> **Danke dass du uns eine Chance gibst,** ${m} **Willkommen!** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> **Wir begrüßen** ${m} **in der Community** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> **Diese Entscheidung war kein Fehler,** ${m} **- Willkommen!** <a:winken:1086560167442796544>`,
  (m) => `<a:Join:1375559039098032299> **Schön, dass du da bist,** ${m} <a:winken:1086560167442796544>`,
];

export default {
  name: Events.GuildMemberAdd,

  async execute(client, member) {
    if (member.user.bot) {return;}

    const serverData = await serverdb.findOne({ guildID: member.guild.id });
    if (serverData?.deactivated?.includes?.("willkommensnachrichten")) {return;}

    const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (welcomeChannel) {
      const pick = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
      await welcomeChannel.send({ content: pick(member) }).catch((err) => logger.error("Welcome message failed:", err?.message));
    }

    const joinEmbed = new EmbedBuilder()
      .setTitle("<:user_join:1228329348470407198> | NUTZER BEIGETRETEN")
      .setDescription(`**${member.user.displayName}** ist dem Server beigetreten.\n\n\`📌\` | **INFORMATIONEN**\n> Username: ${member.user.username}\n> Anzeigename: ${member.user.displayName} (${member})\n> Nutzer-ID: \`${member.user.id}\`\n> Server beigetreten: <t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n> Account erstellt am: <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`)
      .setThumbnail(member.user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
      .setColor("Green")
      .setTimestamp();

    const logchannel = member.guild.channels.cache.get(CHANNELS.SERVER_LOGS);
    await logchannel?.threads.cache.get(LOG_THREADS.JOIN)?.send({ embeds: [joinEmbed] }).catch(() => {});

    const neuesMitglied = member.guild.roles.cache.get(NEUES_MITGLIED_ROLE_ID);
    const mitglied = member.guild.roles.cache.get(MITGLIED_ROLE_ID);
    try {
      if (neuesMitglied) {await member.roles.add(neuesMitglied);}
      if (mitglied) {await member.roles.add(mitglied);}
    } catch (error) {
      logger.error("Failed to add default roles:", error?.message ?? error);
    }

    await flagSuspiciousAccount(member).catch((error) => reportError(error, { source: "memberAdd:suspiciousAccount" }));
    await trackInvite(member).catch((error) => reportError(error, { source: "memberAdd:inviteTracking" }));
    await resetDailyStreak(member).catch((error) => reportError(error, { source: "memberAdd:dailyStreak" }));
  },
};

async function flagSuspiciousAccount(member) {
  const username = member.user.username.toLowerCase();
  const joinedRecently = (Date.now() - member.user.createdTimestamp) < 7 * 24 * 60 * 60 * 1000;
  const noAvatar = member.user.displayAvatarURL().includes("default");

  const isSuspicious =
    (username.includes("bot") || username.includes("assistant")) &&
    (joinedRecently || noAvatar);

  if (!isSuspicious) {return;}

  const role = member.guild.roles.cache.get(BANN_ROLE_ID);
  if (role) {
    await member.roles.add(role);
    logger.info(`Suspicious account flagged: ${member.user.tag}`);
  } else {
    logger.error("Ban role not found");
  }

  const embed = new EmbedBuilder()
    .setTitle("⚠️ Verdächtiger Account erkannt")
    .setDescription(`Ein verdächtiger Account wurde erkannt und markiert.\n\nBenutzername: ${member.user.tag} (${member.user.displayName})\nBenutzer-ID: ${member.id}\nErstellt am: <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`)
    .setColor("Red")
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: "Überprüfe den Account und treffe geeignete Maßnahmen." })
    .setTimestamp();

  const thread = await member.guild.channels.fetch(LOG_THREADS.MODERATION).catch(() => null);
  if (thread?.isThread()) {
    await thread.send({ embeds: [embed] });
  } else {
    logger.error("Moderation thread not found");
  }
}

async function trackInvite(member) {
  const guild = member.guild;
  const newInvites = await guild.invites.fetch();

  const inviteCache = await InviteCacheModel.findOne({ guildID: guild.id });
  const previous = inviteCache?.invites ?? [];
  const current = newInvites.map((i) => ({ code: i.code, uses: i.uses }));

  if (!inviteCache) {
    await InviteCacheModel.create({ guildID: guild.id, invites: current });
  } else {
    inviteCache.invites = current;
    await inviteCache.save();
  }

  const usedInvite = newInvites.find((i) => {
    const cached = previous.find((c) => c.code === i.code);
    return cached && i.uses > cached.uses;
  });

  if (!usedInvite?.inviter) {return;}

  await userdb.findOneAndUpdate(
    { userID: usedInvite.inviter.id },
    { $inc: { "invites.joins": 1 } },
    { upsert: true },
  );

  await userdb.findOneAndUpdate(
    { userID: member.id },
    { invitedBy: usedInvite.inviter.id },
    { upsert: true },
  );

  const userData = await userdb.findOne({ userID: member.id });
  if (!userData) {
    await new userdb({
      userID: member.id,
      donation: 0,
      reactions: [],
      "birthday.tag": 0,
      "birthday.monat": 0,
    }).save();
  }
}

async function resetDailyStreak(member) {
  const userData = await Coin.findOne({ userId: member.id });
  if (!userData || userData.streak === 0) {return;}

  userData.streak = 0;
  await userData.save();
  logger.info(`[DAILY-STREAK] ${member.user.tag} rejoined – streak reset`);
}
