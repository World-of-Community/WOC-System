import cron from "node-cron";
import userdb from "#models/userdb.js";
import leaderboarddb from "#models/leaderboarddb.js";
import { EmbedBuilder, codeBlock } from "discord.js";
import logger from "#core/logger.js";

const GUILD_ID = "815919809379172354";
const RoleID = "1150753421339676722";

// ============================================================
// USER, DIE PERMANENT AUS DEM LEADERBOARD AUSGESCHLOSSEN SIND
// ============================================================

const EXCLUDED_USER_IDS = [
  "996364148361400330",
];

// ============================================================
// POSITION EMOJIS
// ============================================================

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

// ============================================================
// MONAT
// ============================================================

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

  return monthNames[new Date().getMonth()];
}

// ============================================================
// CRON JOBS
// ============================================================

function leaderboardSchedules(client) {
  // ==========================================================
  // FALLBACK: JEDE MINUTE AKTUALISIEREN
  // ==========================================================

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

  // ==========================================================
  // MONATLICHER RESET
  // ==========================================================

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

  // ==========================================================
  // BEIM BOT-START EINMAL SOFORT AKTUALISIEREN
  // ==========================================================

  setTimeout(async () => {
    try {
      await updateLeaderboard(client);

      logger.info(
        "Leaderboard wurde beim Bot-Start aktualisiert.",
      );
    } catch (error) {
      logger.error(
        "Fehler beim Start-Update des Leaderboards:",
        error,
      );
    }
  }, 3000);

  logger.info(
    "Leaderboard-System wurde gestartet.",
  );
}

// ============================================================
// LEADERBOARD EMBED ERSTELLEN
// ============================================================

async function createLeaderboardMessage(guild) {
  try {
    if (!guild) {
      throw new Error(
        "Guild konnte nicht gefunden werden.",
      );
    }

    // ========================================================
    // TOP 10 NACHRICHTEN
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
    // TOP 10 VOICE
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
    // MITGLIEDER NACHRICHTEN
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
    // MITGLIEDER VOICE
    // ========================================================

    const topVoiceMembers = await Promise.all(
      topVoice.map(async (user) => {
        const member = await guild.members
          .fetch(user.userID)
          .catch(() => null);

        const voiceTime =
          user.stats?.voiceTime ?? 0;

        const days = Math.floor(
          voiceTime /
            (24 * 60 * 60 * 1000),
        );

        const hours = Math.floor(
          (voiceTime %
            (24 * 60 * 60 * 1000)) /
            (60 * 60 * 1000),
        );

        const minutes = Math.floor(
          (voiceTime %
            (60 * 60 * 1000)) /
            (60 * 1000),
        );

        return {
          member,
          timeText:
            `${days} Tage ${hours} Stunden ${minutes} Minuten`,
          userID: user.userID,
        };
      }),
    );

    // ========================================================
    // NACHRICHTEN TEXT
    // ========================================================

    let messageLeaderboardText =
      topMessagesMembers
        .filter((user) => user.member)
        .map((user, index) => {
          const memberMention =
            user.member.toString();

          return `${positionEmojis[index]} » ${memberMention} - **${user.member.user.username}**
> \`${user.messages} Nachrichten\``;
        })
        .join("\n");

    if (!messageLeaderboardText) {
      messageLeaderboardText =
        "> Noch keine Nachrichten vorhanden.";
    }

    // ========================================================
    // DISCORD LIMIT
    // ========================================================

    if (
      messageLeaderboardText.length > 1024
    ) {
      messageLeaderboardText =
        messageLeaderboardText.substring(
          0,
          1020,
        ) + "...";
    }

    // ========================================================
    // VOICE TEXT
    // ========================================================

    let voiceLeaderboardText =
      topVoiceMembers
        .filter((user) => user.member)
        .map((user, index) => {
          const memberMention =
            user.member.toString();

          return `${positionEmojis[index]} » ${memberMention} - **${user.member.user.username}**
> \`${user.timeText}\``;
        })
        .join("\n");

    if (!voiceLeaderboardText) {
      voiceLeaderboardText =
        "> Noch keine Voice-Zeit vorhanden.";
    }

    if (
      voiceLeaderboardText.length > 1024
    ) {
      voiceLeaderboardText =
        voiceLeaderboardText.substring(
          0,
          1020,
        ) + "...";
    }

    const currentMonth =
      getCurrentMonth();

    // ========================================================
    // INFO EMBED
    // ========================================================

    const InfoEmbed =
      new EmbedBuilder()
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

    const messageEmbed =
      new EmbedBuilder()
        .setAuthor({
          name:
            `» ${currentMonth} Leaderboard - Nachrichten`,
          iconURL:
            "https://cdn.discordapp.com/attachments/1269339944766144574/1286772658318479423/8280686.png",
        })
        .setDescription(
          messageLeaderboardText,
        )
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

    const voiceEmbed =
      new EmbedBuilder()
        .setAuthor({
          name:
            `» ${currentMonth} Leaderboard - Voice Zeit`,
          iconURL:
            "https://cdn.discordapp.com/attachments/1269339944766144574/1286772303455059988/5808970.png",
        })
        .setDescription(
          voiceLeaderboardText,
        )
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

    if (
      topMessagesMembers[0]?.member
    ) {
      messageEmbed.setThumbnail(
        topMessagesMembers[0].member.displayAvatarURL({
          dynamic: true,
        }),
      );
    }

    if (
      topVoiceMembers[0]?.member
    ) {
      voiceEmbed.setThumbnail(
        topVoiceMembers[0].member.displayAvatarURL({
          dynamic: true,
        }),
      );
    }

    // ========================================================
    // EMBEDS ZURÜCKGEBEN
    // ========================================================

    return {
      embeds: [
        InfoEmbed,
        messageEmbed,
        voiceEmbed,
      ],
    };
  } catch (error) {
    logger.error(
      "Fehler beim Erstellen des Leaderboards:",
      error,
    );

    const errorEmbed =
      new EmbedBuilder()
        .setColor("Red")
        .setDescription(
          `Beim Laden des Leaderboards ist ein Fehler aufgetreten:\n${codeBlock(
            error.message,
          )}`,
        );

    return {
      embeds: [errorEmbed],
    };
  }
}

// ============================================================
// LEADERBOARD AKTUALISIEREN
// ============================================================
//
// WICHTIG:
// Diese Funktion BEARBEITET IMMER DIE VORHANDENE NACHRICHT.
//
// Es wird KEINE neue Nachricht erstellt.
// ============================================================

async function updateLeaderboard(client) {
  try {
    // ========================================================
    // GESPEICHERTE LEADERBOARD-NACHRICHT LADEN
    // ========================================================

    const savedMessage =
      await leaderboarddb.findOne({
        guildId: GUILD_ID,
      });

    if (!savedMessage) {
      logger.warn(
        "Kein gespeichertes Leaderboard gefunden.",
      );

      return;
    }

    // ========================================================
    // GUILD
    // ========================================================

    const guild =
      client.guilds.cache.get(
        savedMessage.guildId,
      );

    if (!guild) {
      logger.warn(
        `Guild ${savedMessage.guildId} konnte nicht gefunden werden.`,
      );

      return;
    }

    // ========================================================
    // CHANNEL
    // ========================================================

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

    // ========================================================
    // EXISTIERENDE NACHRICHT HOLEN
    // ========================================================

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

    // ========================================================
    // NEUE EMBEDS ERSTELLEN
    // ========================================================

    const messageContent =
      await createLeaderboardMessage(
        guild,
      );

    // ========================================================
    // DIESELBE NACHRICHT BEARBEITEN
    // ========================================================

    await leaderboardMessage.edit({
      embeds:
        messageContent.embeds,
    });

    logger.debug?.(
      `Leaderboard-Nachricht ${leaderboardMessage.id} wurde aktualisiert.`,
    );
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
    const guild =
      client.guilds.cache.get(
        GUILD_ID,
      );

    if (!guild) {
      logger.error(
        `Guild ${GUILD_ID} konnte beim Reset nicht gefunden werden.`,
      );

      return;
    }

    const savedMessage =
      await leaderboarddb.findOne({
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

    const role =
      await guild.roles
        .fetch(RoleID)
        .catch(() => null);

    if (!role) {
      logger.error(
        `Leaderboard-Rolle ${RoleID} konnte nicht gefunden werden.`,
      );

      return;
    }

    // ========================================================
    // TOP 3 NACHRICHTEN
    // ========================================================

    const topMessagesMembers =
      await userdb
        .find({
          userID: {
            $nin:
              EXCLUDED_USER_IDS,
          },
        })
        .sort({
          "stats.messages": -1,
        })
        .limit(3);

    // ========================================================
    // TOP 3 VOICE
    // ========================================================

    const topVoiceMembers =
      await userdb
        .find({
          userID: {
            $nin:
              EXCLUDED_USER_IDS,
          },
        })
        .sort({
          "stats.voiceTime": -1,
        })
        .limit(3);

    // ========================================================
    // USER ZUSAMMENFÜHREN
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

    const filteredUserIds =
      uniqueUserIds.filter(
        (userID) =>
          !EXCLUDED_USER_IDS.includes(
            userID,
          ),
      );

    // ========================================================
    // ALTE ROLLE ENTFERNEN
    // ========================================================

    const membersWithRole =
      await guild.members.fetch({
        withPresences: false,
      });

    const membersToRemoveRole =
      membersWithRole.filter(
        (member) =>
          member.roles.cache.has(
            role.id,
          ),
      );

    await Promise.all(
      membersToRemoveRole.map(
        async (member) => {
          try {
            await member.roles.remove(
              role,
            );

            logger.debug?.(
              `Leaderboard-Rolle von ${member.user.tag} entfernt.`,
            );
          } catch (error) {
            logger.error(
              `Fehler beim Entfernen der Leaderboard-Rolle von ${member.user.tag}:`,
              error,
            );
          }
        },
      ),
    );

    // ========================================================
    // NEUE ROLLEN VERTEILEN
    // ========================================================

    const roleAssignments =
      filteredUserIds.map(
        async (userID) => {
          const member =
            await guild.members
              .fetch(userID)
              .catch(() => null);

          if (!member) {
            logger.warn(
              `User ${userID} konnte nicht gefunden werden.`,
            );

            return;
          }

          if (
            EXCLUDED_USER_IDS.includes(
              member.id,
            )
          ) {
            return;
          }

          try {
            if (
              !member.roles.cache.has(
                role.id,
              )
            ) {
              await member.roles.add(
                role,
              );

              logger.info(
                `${member.user.tag} hat die Leaderboard-Rolle erhalten.`,
              );

              const notification =
                await leaderboardChannel.send(
                  {
                    content:
                      `${member} hat für die hohe Aktivität die ${role} Rolle erhalten`,
                  },
                );

              setTimeout(() => {
                notification
                  .delete()
                  .catch(
                    () => null,
                  );
              }, 5 * 60 * 1000);
            }
          } catch (error) {
            logger.error(
              `Fehler beim Hinzufügen der Leaderboard-Rolle zu ${member.user.tag}:`,
              error,
            );
          }
        },
      );

    await Promise.all(
      roleAssignments,
    );

    // ========================================================
    // STATS AUF 0 SETZEN
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
    // DIESELBE LEADERBOARD-NACHRICHT AKTUALISIEREN
    // ========================================================

    await updateLeaderboard(
      client,
    );

    logger.info(
      "Leaderboard wurde zurückgesetzt und anschließend aktualisiert.",
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

