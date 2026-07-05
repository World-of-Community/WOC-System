import client from "../index.js";

// Thread-IDs für die verschiedenen Log-Kategorien (aus der alten index.js)
export const ThreadIDs = {
  CHANNEL: "1269998213952442525",
  MESSAGE: "1269998217181921320",
  JOIN: "1269998215512457259",
  ROLES: "1269998221518831721",
  SERVER: "1269998220440895510",
  MODERATION: "1269998219266490538",
  INVITE: "1269998218264055818",
  OFFLINE: "1296391117507399763",
  ONLINE: "1296391117507399763",
  ERROR: "1296391118723878932",
};

// Sendet ein Embed in den passenden Log-Thread
export async function sendLog(threadID, embed) {
  try {
    const serverCatch = client.guilds.cache.get("815919809379172354");
    if (!serverCatch) {throw new Error("Server nicht gefunden");}

    const logchannel = serverCatch.channels.cache.get("1263436406655680513"); // Server Logs
    if (!logchannel) {throw new Error("Log Kanal nicht gefunden");}

    const logchannel2 = serverCatch.channels.cache.get("1295742887388254278"); // Bot Status
    if (!logchannel2) {throw new Error("Log Kanal nicht gefunden");}

    let thread = logchannel.threads.cache.get(threadID);
    if (!thread) {thread = logchannel2.threads.cache.get(threadID);}
    if (!thread) {throw new Error("Thread nicht gefunden");}

    await thread.send({ embeds: [embed] });
  } catch (error) {
    console.error(`Fehler beim Senden des Logs: ${error.message}`);
  }
}
