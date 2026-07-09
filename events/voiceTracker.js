import client from "../index.js";
import userdb from "../models/userdb.js";
import logger from "../functions/logger.js";

// Trackt die Sprachkanal-Zeit für Giveaway-Voraussetzungen und Statistiken
client.on("voiceStateUpdate", async (oldState, newState) => {
  if (oldState.member.user.bot || newState.member.user.bot) {return;}

  const userId = newState.member.user.id;
  const currentTime = new Date().getTime();

  if (!oldState.channelId && newState.channelId) {

    const userData = await userdb.findOne({ userID: userId });
    if (userData) {
      userData.giveaway.startTime = currentTime;
      await userData.save();
    } else {
      logger.error(`Für die Benutzer-ID wurde keine Benutzerdaten gefunden: ${userId}`);
    }
  }
  else if (oldState.channelId && !newState.channelId) {

    const user = oldState.member?.user || newState.member?.user;
    if (!user) {return;}

    const jetzt = new Date();

    // Datum und Uhrzeit auf Deutsch formatieren
    const formatter = new Intl.DateTimeFormat("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(jetzt);
    let tag = parts.find(p => p.type === "weekday").value;
    const tagNum = parts.find(p => p.type === "day").value;
    const monat = parts.find(p => p.type === "month").value;
    const jahr = parts.find(p => p.type === "year").value;
    const stunde = parts.find(p => p.type === "hour").value;
    const minute = parts.find(p => p.type === "minute").value;

    tag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
    const datumStr = `🕓  | Datum: ${tag}, ${tagNum}.${monat}.${jahr}, ${stunde}:${minute} Uhr`;

    if (!oldState.channel && newState.channel) {
      // Benutzer betritt einen Kanal
      logger.info(`Benutzer ${user.username} ist einem Sprachkanal beigetreten: ${newState.channel.name}\n${datumStr}`);
    } else if (oldState.channel && !newState.channel) {
      // Benutzer verlässt einen Kanal
      logger.info(`Benutzer ${user.username} hat einen Sprachkanal verlassen: ${oldState.channel.name}\n${datumStr}`);
    } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
      // Benutzer wechselt den Kanal
      logger.info(`Benutzer ${user.username} ist von "${oldState.channel.name}" zu "${newState.channel.name}" gewechselt\n${datumStr}`);
    }

    const userData = await userdb.findOne({ userID: userId });
    if (userData) {
      const startTime = userData.giveaway.startTime;

      if (startTime !== 0) {
        const durationInMilliseconds = currentTime - startTime;
        if (!isNaN(durationInMilliseconds)) {
          userData.giveaway.voiceTime += durationInMilliseconds;
          userData.stats.voiceTime += durationInMilliseconds;
          userData.giveaway.startTime = 0;
          await userData.save();
        } else {
          logger.error("Ungültige durationInMilliseconds:", durationInMilliseconds);
        }
      } else {
        logger.error("Die Startzeit war Null oder nicht eingestellt.");
      }
    } else {
      logger.error("Für die Benutzer-ID wurde keine Benutzerdaten gefunden:", userId);
    }
  }
});
