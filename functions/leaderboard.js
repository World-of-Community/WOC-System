import cron from "node-cron";
import userdb from "../models/userdb.js";
import leaderboarddb from "../models/leaderboarddb.js";
import { EmbedBuilder, codeBlock } from "discord.js";
import logger from "./logger.js";
const RoleID = "1150753421339676722";

const positionEmojis = ["`🥇`", "`🥈`", "`🥉`", "`4️⃣`", "`5️⃣`", "`6️⃣`", "`7️⃣`", "`8️⃣`", "`9️⃣`", "`🔟`"];

function getCurrentMonth() {
  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ];
  const now = new Date();
  return monthNames[now.getMonth()];
}

function leaderboardSchedules(client) {
  cron.schedule("* * * * *", () => {
    updateLeaderboard(client);
  });
  cron.schedule("0 0 1 * *", () => {
    resetLeaderboardStats(client);
  });
}

async function createLeaderboardMessage(guild) {
  try {
    const topMessages = await userdb.find().sort({ "stats.messages": -1 }).limit(10);
    const topVoice = await userdb.find().sort({ "stats.voiceTime": -1 }).limit(10);

    const topMessagesMembers = await Promise.all(topMessages.map(async (user) => {
      const member = await guild.members.fetch(user.userID).catch(() => null);
      return { member, messages: user.stats["messages"] ?? 0 };
    }));

    const topVoiceMembers = await Promise.all(topVoice.map(async (user) => {
      const member = await guild.members.fetch(user.userID).catch(() => null);
      const voiceTime = user.stats["voiceTime"] ?? 0;
      const days = Math.floor(voiceTime / (24 * 60 * 60 * 1000));
      const hours = Math.floor((voiceTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((voiceTime % (60 * 60 * 1000)) / (60 * 1000));
      return { member, timeText: `${days} Tage ${hours} Stunden ${minutes} Minuten` };
    }));

    let messageLeaderboardText = topMessagesMembers
      .filter(user => user.member)
      .map((user, index) => {
        const memberMention = user.member ? user.member.toString() : "Unbekannt";
        return `${positionEmojis[index]} » ${memberMention} - **${user.member.user.username}**\n> \`${user.messages} Nachrichten\``;
      })
      .join("\n").slice(0, 1024);

    // automatisch auf 1024 Zeichen kürzen, wenn nötig
    if (messageLeaderboardText.length > 1024) {
      messageLeaderboardText = messageLeaderboardText.substring(0, 1020) + "...";
    }

    let voiceLeaderboardText = topVoiceMembers
      .filter(user => user.member)
      .map((user, index) => {
        const memberMention = user.member ? user.member.toString() : "Unbekannt";
        return `${positionEmojis[index]} » ${memberMention} - **${user.member.user.username}**\n> \`${user.timeText}\``;
      })
      .join("\n").slice(0, 1024);

    if (voiceLeaderboardText.length > 1024) {
      voiceLeaderboardText = voiceLeaderboardText.substring(0, 1020) + "...";
    }

    const currentMonth = getCurrentMonth();

    const InfoEmbed = new EmbedBuilder()
      .setDescription("Die Top 3 Mitglieder in Nachrichten & Voice erhalten\ndie <@&1150753421339676722>-Rolle\n\n> `👷‍♂️` » **Vorteile**\n- Bilder senden in <#815922756918181898>\n- Höher gelistet\n- Ping Reaktion (`/emoji`)\n\n> `📌` » Das Leaderboard wird monatlich zurückgesetzt.")
      .setColor("Orange");

    const messageEmbed = new EmbedBuilder()
      .setAuthor({ name: `» ${currentMonth} Leaderboard - Nachrichten`, iconURL: "https://cdn.discordapp.com/attachments/1269339944766144574/1286772658318479423/8280686.png" })
      .setDescription(messageLeaderboardText)
      .setColor("Blurple")
      .setFooter({ text: "» Zuletzt aktualisiert", iconURL: "https://cdn.discordapp.com/attachments/1269339944766144574/1286773637562630154/image.png" })
      .setTimestamp();

    const voiceEmbed = new EmbedBuilder()
      .setAuthor({ name: `» ${currentMonth} Leaderboard - Voice Zeit`, iconURL: "https://cdn.discordapp.com/attachments/1269339944766144574/1286772303455059988/5808970.png" })
      .setDescription(voiceLeaderboardText)
      .setColor("Blue")
      .setFooter({ text: "» Zuletzt aktualisiert", iconURL: "https://cdn.discordapp.com/attachments/1269339944766144574/1286773912977408011/image.png" })
      .setTimestamp();

    if (topMessagesMembers[0]?.member) {
      messageEmbed.setThumbnail(topMessagesMembers[0].member.displayAvatarURL({ dynamic: true }));
    }

    if (topVoiceMembers[0]?.member) {
      voiceEmbed.setThumbnail(topVoiceMembers[0].member.displayAvatarURL({ dynamic: true }));
    }

    return { embeds: [InfoEmbed, messageEmbed, voiceEmbed] };
  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setColor("Red")
      .setDescription(`Beim laden des Leaderboards ist ein Fehler aufgetreten:\n${codeBlock(error.message)}`);

    logger.error("Fehler beim Aktualisieren des Leaderboards:", error);
    return { embeds: [errorEmbed] };
  }
}

async function updateLeaderboard(client) {
  const savedMessage = await leaderboarddb.findOne({ guildId: "815919809379172354" });
  if (savedMessage) {
    const guild = await client.guilds.cache.get(savedMessage.guildId);
    const leaderboardChannel = await guild.channels.cache.get(savedMessage.channelId);
    const leaderboardMessage = await leaderboardChannel.messages.fetch(savedMessage.messageId);

    const messageContent = await createLeaderboardMessage(guild);

    if (leaderboardMessage) {
      leaderboardMessage.edit({ embeds: messageContent.embeds });
    }
  }
}

async function resetLeaderboardStats(client) {
  await userdb.updateMany({}, { $set: { "stats.messages": 0, "stats.voiceTime": 0 } });
  const guild = await client.guilds.cache.get("815919809379172354");
  const savedMessage = await leaderboarddb.findOne({ guildId: guild.id });
  const leaderboardChannel = await guild.channels.cache.get(savedMessage.channelId);

  const role = await guild.roles.fetch(RoleID);
  if (role) {
    const membersWithRole = await guild.members.fetch({ role: RoleID });
    membersWithRole.forEach(member => {
      member.roles.remove(role).catch(err => logger.error(`Fehler beim Entfernen der Rolle: ${err}`));
    });

    const topMessagesMembers = await userdb.find().sort({ "stats.messages": -1 }).limit(3);
    const topVoiceMembers = await userdb.find().sort({ "stats.voiceTime": -1 }).limit(3);

    // Doppelte User rausfiltern
    const uniqueUserIds = [...new Set([...topMessagesMembers, ...topVoiceMembers].map(u => u.userID))];

    const roleAssignments = uniqueUserIds.map(async userID => {
      const member = await guild.members.fetch(userID).catch(() => null);
      if (member && !member.roles.cache.has(role.id)) {
        await member.roles.add(role).then(() => {
          leaderboardChannel.send({
            content: `${member} hat für die hohe Aktivität die ${role} Rolle erhalten`,
          }).then(m => {
            setTimeout(() => {
              m.delete().catch(() => null);
            }, 5 * 60 * 1000); // Nachricht nach 5 Minuten löschen
          });
        }).catch(err => logger.error(`Fehler beim Hinzufügen der Rolle: ${err}`));
      }
    });
    await Promise.all(roleAssignments);
  }

  logger.info("Leaderboard wurde monatlich zurückgesetzt und die Rolle wurde an die Top 3 Mitglieder vergeben.");
  await createLeaderboardMessage();
}

export {
  leaderboardSchedules,
  createLeaderboardMessage,
  updateLeaderboard,
};
