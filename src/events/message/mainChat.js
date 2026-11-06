import { ActionRowBuilder, ButtonBuilder, ComponentType, EmbedBuilder, Events, MessageFlags } from "discord.js";
import serverdb from "#models/Guild.js";
import userdb from "#models/User.js";
import messagedb from "#models/MessageCounter.js";
import teamdb from "#models/TeamMember.js";
import { updateLeaderboard } from "#systems/leaderboard.js";
import logger from "#core/logger.js";
import { reportError } from "#core/errors.js";
import { env } from "#config";
import { settings } from "#core/settings.js";
import { addDailyXp } from "#systems/seasonPass.js";

const TEAM_ROLE_IDS = [
  settings.get("teamRoles.admin"), // Admin
  settings.get("teamRoles.teamLead"), // Team-Leitung
  settings.get("teamRoles.developer"), // Developer
  settings.get("teamRoles.srModerator"), // Sr-Moderator
  settings.get("teamRoles.moderator"), // Moderator
  settings.get("teamRoles.supporter"), // Supporter
  settings.get("teamRoles.builder"), // Builder
];

const IP_DELETE_AFTER = 30 * 1000;
const IP_KEYWORDS = [
  "wie ist die ip", "was ist die ip", "server ip", "minecraft ip", "ip bitte", "ip vom server",
  "ip vom mc server", "was ist die ip vom server", "was ist die ip vom mc server", "wie lautet die ip",
  "kannst du mir die ip geben", "was ist die ip adresse", "ip adresse", "serveradresse", "adresse vom server",
  "mc ip", "mc-ip", "ip des servers", "minecraft server ip", "wie komme ich auf den server", "wie kann ich joinen",
  "wie joine ich", "join ip", "wie komme ich auf den mc server", "ip pls", "ip plz", "wie ist nochmal die ip",
  "wie war nochmal die ip", "ip vom minecraft server",
];
const IP_CHANNELS = [
  settings.get("channels.mainChat"), // Haupt-Chat
  settings.get("channels.playerSearch"), // Spielersuche
  settings.get("channels.media"), // Bilder und Videos
  settings.get("channels.botCommands"), // Bots-verwenden
  settings.get("channels.writingSupport"), // Schrift Support
];

const NO_INVITE_CHANNELS = [
  settings.get("channels.mainChat"), // Haupt Chat
  settings.get("channels.playerSearch"), // Spielersuche
  settings.get("channels.introductions"), // Vorstellung
  settings.get("channels.media"), // Bilder und Videos
];
const INVITE_ALLOWED_CHANNELS = [settings.get("channels.ads")]; // Werbung für alle
const DISCORD_INVITE_PATTERN = /(https?:\/\/)?(www\.)?(discord\.gg|discordapp\.com\/invite)\/[^\s]+/;

const LOOT_TABLE = [
  { string: "1 Level", rarity: "Gewöhnlich", probability: 0.35 },
  { string: "2 Level", rarity: "Gewöhnlich", probability: 0.30 },
  { string: "3 Level", rarity: "Ungewöhnlich", probability: 0.25 },
  { string: "4 Level", rarity: "Selten", probability: 0.07 },
  { string: "5 Level", rarity: "Episch", probability: 0.03 },
];
const RARITY_COLORS = {
  "Gewöhnlich": "Grey",
  "Ungewöhnlich": "Green",
  "Selten": "Blue",
  "Episch": "Purple",
  "Legendär (Jackpot)": "Orange",
};

export default {
  name: Events.MessageCreate,

  async execute(client, message) {
    if (!message.guild) {return;}

    await answerIpQuestion(message).catch((error) => reportError(error, { source: "mainChat:ipQuestion" }));

    await messagedb.findOneAndUpdate(
      { guildID: message.guild.id },
      { $inc: { messages: 1 } },
      { returnDocument: "after", upsert: true },
    ).catch((err) => logger.error("Message counter failed:", err));

    if (message.author.bot) {return;}

    await trackTeamMessage(message).catch((error) => reportError(error, { source: "mainChat:teamMessage" }));
    await warnTeamMention(message).catch((error) => reportError(error, { source: "mainChat:teamMention" }));

    if (message.guild.id !== env.discord.guildId) {return;}

    await trackUserStats(client, message).catch((error) => reportError(error, { source: "mainChat:userStats" }));
    await blockInviteLinks(message).catch((error) => reportError(error, { source: "mainChat:inviteLinks" }));
  },
};

async function answerIpQuestion(message) {
  if (!IP_CHANNELS.includes(message.channel.id)) {return;}

  const text = message.content.toLowerCase().trim();
  const matches = IP_KEYWORDS.some((k) => text.includes(k)) || /\bip\b/i.test(text);
  if (!matches) {return;}

  const timestamp = Math.floor((Date.now() + IP_DELETE_AFTER) / 1000);
  const embed = new EmbedBuilder()
    .setTitle("`🌐` Minecraft-Server IP")
    .setDescription(
      "> `📡` » Die IP des Servers lautet:\n" +
      `\`\`\`${settings.get("system.minecraftIp")}\`\`\`\n` +
      "> `⚙️` » Version: **ab 1.21.x**\n\n" +
      `> \`⏳\` » Nachricht wird gelöscht <t:${timestamp}:R> (<t:${timestamp}:F>)`,
    )
    .setColor("Green");

  const reply = await message.reply({ embeds: [embed] });
  setTimeout(() => {
    reply.delete().catch(() => {});
    message.delete().catch(() => {});
  }, IP_DELETE_AFTER);
}

async function trackTeamMessage(message) {
  if (!message.member?.roles.cache.some((role) => TEAM_ROLE_IDS.includes(role.id))) {return;}

  await teamdb.findOneAndUpdate(
    { userID: message.author.id },
    { $inc: { messages: 1 } },
    { upsert: true },
  );
}

async function warnTeamMention(message) {
  if (message.member?.roles.cache.has(settings.get("teamRoles.member"))) {return;}
  if (message.reference) {return;}

  const mentionsTeam = message.mentions.members.some((member) => member.roles.cache.has(settings.get("teamRoles.member")));
  if (!mentionsTeam) {return;}

  const sent = await message.reply(`Bitte erwähne oder Pinge keine Teammitglieder, öffne ein Ticket im <#${settings.get("channels.support")}> bei Fragen oder Problemen.`);
  setTimeout(() => sent.delete().catch(() => {}), 5000);
}

async function trackUserStats(client, message) {
  let serverData = await serverdb.findOne({ guildID: message.guildId });
  if (!serverData) {
    serverData = new serverdb({ guildID: message.guildId, roleBypass: [] });
    await serverData.save();
  }

  let userData = await userdb.findOne({ userID: message.author.id });
  if (!userData) {
    userData = new userdb({
      userID: message.author.id,
      giveaway: { eventWins: 0, toggledm: true, messages: 1, voiceTime: 0, startTime: 0 },
      stats: { messages: 1, voiceTime: 0 },
      giveawayProgress: { messages: 1, voiceTime: 0 },
    });
  } else {
    userData.giveaway.messages += 1;
    userData.stats.messages += 1;
    userData.giveawayProgress.messages += 1;
  }

  const isFirstMessage = !userData.firstMessage && Boolean(message.content);
  if (isFirstMessage) {userData.firstMessage = true;}

  await userData.save();
  await addDailyXp(message.author.id, new Date(), message.author);
  updateLeaderboard(client).catch((err) => logger.error("Leaderboard update failed:", err));

  if (isFirstMessage) {
    await sendFirstMessageReward(message);
  }
}

function getRandomLoot() {
  const random = Math.random();
  let current = 0;
  for (const item of LOOT_TABLE) {
    current += item.probability;
    if (random <= current) {return item;}
  }
  return LOOT_TABLE[0];
}

async function sendFirstMessageReward(message) {
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Belohnung abholen")
      .setStyle("Success")
      .setCustomId("newbieClaim_button"),
  );

  const welcomeEmbed = new EmbedBuilder()
    .setColor("Blurple")
    .setTitle("<:neuesmitglied:1033452545651253328> Herzlich Willkommen!")
    .setDescription(
      `Hey ${message.author},\n\n` +
      "du hast soeben deine **erste Nachricht** geschrieben – Glückwunsch! 🎉\n\n" +
      "Drück unten auf den Knopf, um deine Belohnung abzuholen! <a:Gewinnspiel:968876390982234202>",
    )
    .setFooter({ text: "Belohnung für erste Nachricht" });

  const msg = await message.channel.send({ embeds: [welcomeEmbed], components: [buttons] });

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 1000 * 60 * 10,
  });

  collector.on("collect", async (i) => {
    if (i.customId !== "newbieClaim_button") {return;}

    if (i.user.id !== message.author.id) {
      await i.reply({ content: "> `❌` » Das ist nicht für dich!", flags: MessageFlags.Ephemeral });
      return;
    }

    await i.deferUpdate();

    buttons.components[0].setDisabled(true).setLabel("Belohnung abgeholt").setEmoji("<:wumpusgifted:1335338403176386560>");
    await msg.edit({ components: [buttons] }).catch(() => {});

    const gewinn = getRandomLoot();
    const lootEmbed = new EmbedBuilder()
      .setTitle("`🎁` Belohnung erhalten!")
      .setDescription(
        `<a:Gift:1263043283555319941> | <@${i.user.id}> du bekommst **${gewinn.string}**!\n\n` +
        `\`⭐\` » Seltenheit: **${gewinn.rarity}**\n` +
        `\`📊\` » Dropchance: \`${Math.floor(gewinn.probability * 100)}%\`\n\n` +
        "*(Bitte Screenshot machen als Beweis.)*\n\n" +
        "> `🎫` » Öffne ein Ticket zum Einlösen.",
      )
      .setColor(RARITY_COLORS[gewinn.rarity]);

    await i.followUp({ embeds: [lootEmbed], flags: MessageFlags.Ephemeral });
    collector.stop("claimed");
    setTimeout(() => msg.delete().catch(() => {}), 500);
  });

  collector.on("end", (_, reason) => {
    if (reason === "claimed" || !msg.editable) {return;}
    buttons.components[0].setDisabled(true).setStyle("Danger").setLabel("abgelaufen");
    msg.edit({ components: [buttons] }).catch(() => {});
  });
}

async function blockInviteLinks(message) {
  if (!NO_INVITE_CHANNELS.includes(message.channel.id)) {return;}
  if (!DISCORD_INVITE_PATTERN.test(message.content)) {return;}

  await message.delete();

  const allowed = INVITE_ALLOWED_CHANNELS.map((id) => `<#${id}>`).join(", ");
  const warnEmbed = new EmbedBuilder()
    .setTitle("⚠️ | WARNUNG")
    .setDescription(
      "> Das Teilen von (Discord)-Server-Links ist in diesem Kanal\n" +
      `> (<#${message.channel.id}>) nicht erlaubt.\n\n` +
      "> Bitte nutze die erlaubten Kanäle wie z.B.\n" +
      `> ${allowed}`,
    )
    .setColor("Red")
    .setTimestamp();

  try {
    await message.author.send({ embeds: [warnEmbed] });
  } catch {
    const channelWarning = await message.channel.send({
      content: `${message.author}, du kannst keine Server-Links in diesem Kanal teilen.`,
      embeds: [warnEmbed],
    });
    setTimeout(() => channelWarning.delete().catch(() => {}), 10000);
  }
}
