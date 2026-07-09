import { EmbedBuilder } from "discord.js";
import client from "../index.js";
import { sendLog, ThreadIDs } from "../functions/sendLog.js";
import logger from "../functions/logger.js";

// Event, wenn der Bot bereit ist
client.on("clientReady", async () => {
  const onlineEmbed = new EmbedBuilder()
    .setTitle("Bot Status - Update")
    .setDescription(`> \`🟢\` » **\`${client.user.username}\`** ist jetzt online.\n\n> \`🕒\` » <t:${Math.floor(client.readyTimestamp / 1000)}:F>`)
    .setColor("Green")
    .setTimestamp();

  try {
    await sendLog(ThreadIDs.ONLINE, onlineEmbed);
  } catch (error) {
    logger.error("Fehler beim Senden des Online-Logs:", error);
  }
});

// Event, wenn der Shard getrennt wird (offline)
client.on("shardDisconnect", async () => {
  const offlineEmbed = new EmbedBuilder()
    .setTitle("Bot Status - Update")
    .setDescription(`> \`🔴\` » **\`${client.user.username}\`** ist offline.`)
    .setColor("Red")
    .setTimestamp();

  try {
    await sendLog(ThreadIDs.OFFLINE, offlineEmbed);
  } catch (error) {
    logger.error("Fehler beim Senden des Offline-Logs:", error);
  }
});

// Event, wenn ein Fehler auftritt
client.on("error", async (error) => {
  const errorEmbed = new EmbedBuilder()
    .setTitle("`❌` | FEHLER BEI BOT")
    .setDescription(`\`\`\`${error.stack}\`\`\``)
    .setColor("Orange")
    .setTimestamp();

  try {
    await sendLog(ThreadIDs.ERROR, errorEmbed);
  } catch (sendError) {
    logger.error("Fehler beim Senden des Error-Logs:", sendError);
  }
});
