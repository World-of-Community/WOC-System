import cron from "node-cron";
import userdb from "../models/userdb.js";
import leaderboarddb from "../models/leaderboarddb.js";
import { EmbedBuilder, codeBlock } from "discord.js";
import logger from "./logger.js";

const GUILD_ID = "815919809379172354";
const RoleID = "1150753421339676722";

// ============================================================
// USER, DIE PERMANENT AUS DEM LEADERBOARD AUSGESCHLOSSEN SIND
// ============================================================
//
// Hier einfach die Discord User-ID eintragen.
//
// Beispiel:
// const EXCLUDED_USER_IDS = [
//   "123456789012345678",
//   "987654321098765432",
// ];
//
// Diese User:
// - erscheinen NICHT im Nachrichten-Leaderboard
// - erscheinen NICHT im Voice-Leaderboard
// - können KEINE Leaderboard-Rolle bekommen
// - werden bei der monatlichen Top-3-Berechnung ignoriert
//
// Ihre normalen Stats in der Datenbank bleiben erhalten.
//
const EXCLUDED_USER_IDS = [
   "996364148361400330",
];

const positionEmojis = [
  "`🥇`",
  "`🥈`",
  "`🥉`",
  "`4️⃣`",
  "`5️⃣`",
  "`6️⃣`",
  "`7️⃣`",
  "`8️⃣`",
  "`9️⃣`",
  "`🔟`",
];

function getCurrentMonth() {
  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];

  const now = new Date();

  return monthNames[now.getMonth()];
}

// ============================================================
// CRON JOBS
// ============================================================

function leaderboardSchedules(client) {
  // Leaderboard jede Minute aktualisieren
  cron.schedule("* * * * *", async () => {
    try {
      await updateLeaderboard(client);
    } catch (error) {
      logger.error(
        "Fehler beim automatischen Aktualisieren des Leaderboards:",
        error,
      );
    }
  });

  // Jeden Monat am 1. um 00:00 Uhr
  cron.schedule("0 0 1 * *", async () => {
    try {
      await resetLeaderboardStats(client);
    } catch (error) {
      logger.error(
        "Fehler beim monatlichen Zurücksetzen des Leaderboards:",
        error,
      );
    }
  });

  logger.info("Leaderboard-Cronjobs wurden gestartet.");
}

// ============================================================
// LEADERBOARD EMBED ERSTELLEN
// ============================================================

async function createLeaderboardMessage(guild) {
  try {
    if (!guild) {
      throw new Error("Guild konnte nicht gefunden werden.");
    }

    // ========================================================
    // NACHRICHTEN TOP 10
    // Ausgeschlossene User werden direkt aus der Abfrage
    // ausgeschlossen.
    // ========================================================

    const topMessages = await userdb
      .find({
        userID: {
          $nin: EXCLUDED_USER_IDS,
        },
      })
      .sort({
        "stats.messages": -1,
      })
      .limit(10);

    // ========================================================
    // VOICE TOP 10
    // ========================================================

    const topVoice = await userdb
      .find({
        userID: {
          $nin: EXCLUDED_USER_IDS,
        },
      })
      .sort({
        "stats.voiceTime": -1,
      })
      .limit(10);

    // ========================================================
    // DISCORD MITGLIEDER FÜR NACHRICHTEN LADEN
    // ========================================================

    const topMessagesMembers = await Promise.all(
      topMessages.map(async (user) => {
        const member = await guild.members
          .fetch(user.userID)
          .catch(() => null);

        return {
          member,
          messages: user.stats?.messages ?? 0,
          userID: user.userID,
        };
      }),
    );

    // ========================================================
    // DISCORD MITGLIEDER FÜR VOICE LADEN
    // ========================================================

    const topVoiceMembers = await Promise.all(
      topVoice.map(async (user) => {
        const member = await guild.members
          .fetch(user.userID)
          .catch(() => null);

        const voiceTime = user.stats?.voiceTime ?? 0;

        const days = Math.floor(
          voiceTime / (24 * 60 * 60 * 1000),
        );

        const hours = Math.floor(
          (voiceTime % (24 * 60 * 60 * 1000)) /
            (60 * 60 * 1000),
        );

        const minutes = Math.floor(
          (voiceTime % (60 * 60 * 1000)) /
            (60 * 1000),
        );

        return {
          member,
          timeText: `${days} Tage ${hours} Stunden ${minutes} Minuten`,
          userID: user.userID,
        };
      }),
    );

    // ========================================================
    // NACHRICHTEN LEADERBOARD TEXT
    // ========================================================

    let messageLeaderboardText = topMessagesMembers
      .filter((user) => user.member)
      .map((user, index) => {
        const memberMention = user.member.toString();

        return `${positionEmojis[index]} » ${memberMention} - **${user.member.user.username}**
> \`${user.messages} Nachrichten\``;
      })
      .join("\n");

    if (!messageLeaderboardText) {
      messageLeaderboardText =
        "> Noch keine Nachrichten vorhanden.";
    }

    // Discord Embed Field/Description Limit
    if (messageLeaderboardText.length > 1024) {
      messageLeaderboardText =
        messageLeaderboardText.substring(0, 1020) + "...";
    }

    // ========================================================
    // VOICE LEADERBOARD TEXT
    // ========================================================

    let voiceLeaderboardText = topVoiceMembers
      .filter((user) => user.member)
      .map((user, index) => {
        const memberMention = user.member.toString();

        return `${positionEmojis[index]} » ${memberMention} - **${user.member.user.username}**
> \`${user.timeText}\``;
      })
      .join("\n");

    if (!voiceLeaderboardText) {
      voiceLeaderboardText =
        "> Noch keine Voice-Zeit vorhanden.";
    }

    // Discord Embed Field/Description Limit
    if (voiceLeaderboardText.length > 1024) {
      voiceLeaderboardText =
        voiceLeaderboardText.substring(0, 1020) + "...";
    }

    const currentMonth = getCurrentMonth();

    // ========================================================
    // INFO EMBED
    // ========================================================

    const InfoEmbed = new EmbedBuilder()
      .setDescription(
        "Die Top 3 Mitglieder in Nachrichten & Voice erhalten\n" +
          "die <@&1150753421339676722>-Rolle\n\n" +
          "> `👷‍♂️` » **Vorteile**\n" +
          "- Bilder senden in <#815922756918181898>\n" +
          "- Höher gelistet\n" +
          "- Ping Reaktion (`/emoji`)\n\n" +
          "> `📌` » Das Leaderboard wird monatlich zurückgesetzt.",
      )
      .setColor("Orange");

    // ========================================================
    // NACHRICHTEN EMBED
    // ========================================================

    const messageEmbed = new EmbedBuilder()
      .setAuthor({
        name: `» ${currentMonth} Leaderboard - Nachrichten`,
        iconURL:
          "https://cdn.discordapp.com/attachments/1269339944766144574/1286772658318479423/8280686.png",
      })
      .setDescription(messageLeaderboardText)
      .setColor("Blurple")
      .setFooter({
        text: "» Zuletzt aktualisiert",
        iconURL:
          "https://cdn.discordapp.com/attachments/1269339944766144574/1286773637562630154/image.png",
      })
      .setTimestamp();

    // ========================================================
    // VOICE EMBED
    // ========================================================

    const voiceEmbed = new EmbedBuilder()
      .setAuthor({
        name: `» ${currentMonth} Leaderboard - Voice Zeit`,
        iconURL:
          "https://cdn.discordapp.com/attachments/1269339944766144574/1286772303455059988/5808970.png",
      })
      .setDescription(voiceLeaderboardText)
      .setColor("Blue")
      .setFooter({
        text: "» Zuletzt aktualisiert",
        iconURL:
          "https://cdn.discordapp.com/attachments/1269339944766144574/1286773912977408011/image.png",
      })
      .setTimestamp();

    // ========================================================
    // THUMBNAILS
    // ========================================================

    if (topMessagesMembers[0]?.member) {
      messageEmbed.setThumbnail(
        topMessagesMembers[0].member.displayAvatarURL({
          dynamic: true,
        }),
      );
    }

    if (topVoiceMembers[0]?.member) {
      voiceEmbed.setThumbnail(
        topVoiceMembers[0].member.displayAvatarURL({
          dynamic: true,
        }),
      );
    }

    return {
      embeds: [
        InfoEmbed,
        messageEmbed,
        voiceEmbed,
      ],
    };
  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setColor("Red")
      .setDescription(
        `Beim Laden des Leaderboards ist ein Fehler aufgetreten:\n${codeBlock(
          error.message,
        )}`,
      );

    logger.error(
      "Fehler beim Erstellen des Leaderboards:",
      error,
    );

    return {
      embeds: [errorEmbed],
    };
  }
}

// ============================================================
// LEADERBOARD AKTUALISIEREN
// ============================================================

async function updateLeaderboard(client) {
  try {
    const savedMessage = await leaderboarddb.findOne({
      guildId: GUILD_ID,
    });

    if (!savedMessage) {
      logger.warn(
        "Kein gespeichertes Leaderboard gefunden.",
      );
      return;
    }

    const guild = client.guilds.cache.get(
      savedMessage.guildId,
    );

    if (!guild) {
      logger.warn(
        `Guild ${savedMessage.guildId} konnte nicht gefunden werden.`,
      );
      return;
    }

    const leaderboardChannel =
      guild.channels.cache.get(
        savedMessage.channelId,
      );

    if (!leaderboardChannel) {
      logger.warn(
        `Leaderboard-Channel ${savedMessage.channelId} konnte nicht gefunden werden.`,
      );
      return;
    }

    const leaderboardMessage =
      await leaderboardChannel.messages
        .fetch(savedMessage.messageId)
        .catch(() => null);

    if (!leaderboardMessage) {
      logger.warn(
        `Leaderboard-Nachricht ${savedMessage.messageId} konnte nicht gefunden werden.`,
      );
      return;
    }

    const messageContent =
      await createLeaderboardMessage(guild);

    await leaderboardMessage.edit({
      embeds: messageContent.embeds,
    });
  } catch (error) {
    logger.error(
      "Fehler beim Aktualisieren des Leaderboards:",
      error,
    );
  }
}

// ============================================================
// MONATLICHER RESET
// ============================================================

async function resetLeaderboardStats(client) {
  try {
    const guild = client.guilds.cache.get(GUILD_ID);

    if (!guild) {
      logger.error(
        `Guild ${GUILD_ID} konnte beim Reset nicht gefunden werden.`,
      );
      return;
    }

    const savedMessage = await leaderboarddb.findOne({
      guildId: GUILD_ID,
    });

    if (!savedMessage) {
      logger.error(
        "Kein gespeichertes Leaderboard gefunden.",
      );
      return;
    }

    const leaderboardChannel =
      guild.channels.cache.get(
        savedMessage.channelId,
      );

    if (!leaderboardChannel) {
      logger.error(
        `Leaderboard-Channel ${savedMessage.channelId} konnte nicht gefunden werden.`,
      );
      return;
    }

    const role = await guild.roles
      .fetch(RoleID)
      .catch(() => null);

    if (!role) {
      logger.error(
        `Leaderboard-Rolle ${RoleID} konnte nicht gefunden werden.`,
      );
      return;
    }

    // ========================================================
    // 1. TOP 3 DES VERGANGENEN MONATS ERMITTELN
    //
    // WICHTIG:
    // Das passiert VOR dem Reset der Stats!
    // ========================================================

    const topMessagesMembers = await userdb
      .find({
        userID: {
          $nin: EXCLUDED_USER_IDS,
        },
      })
      .sort({
        "stats.messages": -1,
      })
      .limit(3);

    const topVoiceMembers = await userdb
      .find({
        userID: {
          $nin: EXCLUDED_USER_IDS,
        },
      })
      .sort({
        "stats.voiceTime": -1,
      })
      .limit(3);

    // ========================================================
    // 2. TOP USER AUS BEIDEN LEADERBOARDS ZUSAMMENFÜHREN
    //
    // Falls jemand in Nachrichten UND Voice Top 3 ist,
    // bekommt er die Rolle trotzdem nur einmal.
    // ========================================================

    const uniqueUserIds = [
      ...new Set([
        ...topMessagesMembers.map(
          (user) => user.userID,
        ),
        ...topVoiceMembers.map(
          (user) => user.userID,
        ),
      ]),
    ];

    // Sicherheit:
    // Ausgeschlossene User niemals berücksichtigen.
    const filteredUserIds = uniqueUserIds.filter(
      (userID) =>
        !EXCLUDED_USER_IDS.includes(userID),
    );

    // ========================================================
    // 3. ALTE LEADERBOARD-ROLLE VON ALLEN ENTFERNEN
    // ========================================================

    const membersWithRole =
      await guild.members.fetch({
        withPresences: false,
      });

    const membersToRemoveRole =
      membersWithRole.filter((member) =>
        member.roles.cache.has(role.id),
      );

    await Promise.all(
      membersToRemoveRole.map(async (member) => {
        try {
          await member.roles.remove(role);

          logger.debug?.(
            `Leaderboard-Rolle von ${member.user.tag} entfernt.`,
          );
        } catch (error) {
          logger.error(
            `Fehler beim Entfernen der Leaderboard-Rolle von ${member.user.tag}:`,
            error,
          );
        }
      }),
    );

    // ========================================================
    // 4. NEUE TOP-USER BEKOMMEN DIE ROLLE
    // ========================================================

    const roleAssignments =
      filteredUserIds.map(async (userID) => {
        const member = await guild.members
          .fetch(userID)
          .catch(() => null);

        if (!member) {
          logger.warn(
            `User ${userID} konnte nicht gefunden werden.`,
          );
          return;
        }

        // Zusätzliche Sicherheit:
        // Ausgeschlossene User bekommen niemals die Rolle.
        if (
          EXCLUDED_USER_IDS.includes(member.id)
        ) {
          logger.warn(
            `Ausgeschlossener User ${member.user.tag} wurde beim Rollenverteilen übersprungen.`,
          );
          return;
        }

        try {
          if (!member.roles.cache.has(role.id)) {
            await member.roles.add(role);

            logger.info(
              `${member.user.tag} hat die Leaderboard-Rolle erhalten.`,
            );

            // ==================================================
            // BENACHRICHTIGUNG
            // ==================================================

            const notification =
              await leaderboardChannel.send({
                content: `${member} hat für die hohe Aktivität die ${role} Rolle erhalten`,
              });

            // Nach 5 Minuten löschen
            setTimeout(() => {
              notification
                .delete()
                .catch(() => null);
            }, 5 * 60 * 1000);
          }
        } catch (error) {
          logger.error(
            `Fehler beim Hinzufügen der Leaderboard-Rolle zu ${member.user.tag}:`,
            error,
          );
        }
      });

    await Promise.all(roleAssignments);

    // ========================================================
    // 5. STATS ZURÜCKSETZEN
    //
    // ERST JETZT werden die Werte auf 0 gesetzt.
    // ========================================================

    await userdb.updateMany(
      {},
      {
        $set: {
          "stats.messages": 0,
          "stats.voiceTime": 0,
        },
      },
    );

    // ========================================================
    // 6. LEADERBOARD NACH DEM RESET AKTUALISIEREN
    // ========================================================

    await updateLeaderboard(client);

    logger.info(
      "Leaderboard wurde monatlich zurückgesetzt und die Rolle wurde an die Top 3 Mitglieder des vergangenen Monats vergeben.",
    );
  } catch (error) {
    logger.error(
      "Fehler beim monatlichen Leaderboard-Reset:",
      error,
    );
  }
}

// ============================================================
// EXPORTS
// ============================================================

export {
  leaderboardSchedules,
  createLeaderboardMessage,
  updateLeaderboard,
  resetLeaderboardStats,
};

/*
import cron from "node-cron";
import userdb from "../models/userdb.js";
import leaderboarddb from "../models/leaderboarddb.js";
import { EmbedBuilder, codeBlock } from "discord.js";
import logger from "./logger.js";
const RoleID = "1150753421339676722";

const positionEmojis = [
  "`🥇`",
  "`🥈`",
  "`🥉`",
  "`4️⃣`",
  "`5️⃣`",
  "`6️⃣`",
  "`7️⃣`",
  "`8️⃣`",
  "`9️⃣`",
  "`🔟`"
];

function getCurrentMonth() {
  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
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
*/
