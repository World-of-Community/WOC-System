const userdb = require("../../Datenbank/userdb");
const { Logger } = require("../utils");

/**
 * Voice Service
 * Verwaltet Voice-Zeit-Tracking für User
 */
class VoiceService {
  constructor(client) {
    this.client = client;
  }

  /**
     * Behandelt Voice State Updates
     */
  async handleVoiceStateUpdate(oldState, newState) {
    if (oldState.member.user.bot || newState.member.user.bot) {return;}

    const userId = newState.member.user.id;
    const currentTime = Date.now();

    // User joined voice channel
    if (!oldState.channelId && newState.channelId) {
      await this.handleVoiceJoin(userId, currentTime);
    }
    // User left voice channel
    else if (oldState.channelId && !newState.channelId) {
      await this.handleVoiceLeave(userId, currentTime, oldState, newState);
    }
    // User switched voice channel
    else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      await this.handleVoiceSwitch(userId, currentTime, oldState, newState);
    }
  }

  /**
     * Behandelt Voice Channel Join
     */
  async handleVoiceJoin(userId, currentTime) {
    try {
      const userData = await userdb.findOne({ userID: userId });

      if (userData) {
        userData.giveaway.startTime = currentTime;
        await userData.save();
        Logger.debug(`Voice Join: User ${userId} started tracking`);
      } else {
        Logger.warning(`Voice Join: Keine User-Daten gefunden für ${userId}`);
      }
    } catch (error) {
      Logger.error(`Fehler bei Voice Join für User ${userId}`, error);
    }
  }

  /**
     * Behandelt Voice Channel Leave
     */
  async handleVoiceLeave(userId, currentTime, oldState, newState) {
    try {
      const user = oldState.member?.user || newState.member?.user;
      if (!user) {return;}

      this.logVoiceActivity(user, oldState, newState, "leave");

      const userData = await userdb.findOne({ userID: userId });

      if (!userData) {
        Logger.warning(`Voice Leave: Keine User-Daten gefunden für ${userId}`);
        return;
      }

      const startTime = userData.giveaway.startTime;

      if (startTime && startTime !== 0) {
        const duration = currentTime - startTime;

        if (!isNaN(duration) && duration > 0) {
          userData.giveaway.voiceTime += duration;
          userData.stats.voiceTime += duration;
          userData.giveaway.startTime = 0;
          await userData.save();

          const minutes = Math.floor(duration / 60000);
          Logger.debug(`Voice Leave: User ${userId} - ${minutes} Minuten getrackt`);
        } else {
          Logger.warning(`Ungültige Duration für User ${userId}: ${duration}`);
        }
      } else {
        Logger.warning(`Startzeit war 0 oder nicht gesetzt für User ${userId}`);
      }
    } catch (error) {
      Logger.error(`Fehler bei Voice Leave für User ${userId}`, error);
    }
  }

  /**
     * Behandelt Voice Channel Switch
     */
  async handleVoiceSwitch(userId, currentTime, oldState, newState) {
    try {
      const user = newState.member.user;
      this.logVoiceActivity(user, oldState, newState, "switch");

      // Bei Switch: Zeit für alten Channel speichern und neu starten
      await this.handleVoiceLeave(userId, currentTime, oldState, newState);
      await this.handleVoiceJoin(userId, currentTime);
    } catch (error) {
      Logger.error(`Fehler bei Voice Switch für User ${userId}`, error);
    }
  }

  /**
     * Loggt Voice-Aktivität (für Debugging)
     */
  logVoiceActivity(user, oldState, newState, action) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    let tag = parts.find(p => p.type === "weekday").value;
    const tagNum = parts.find(p => p.type === "day").value;
    const monat = parts.find(p => p.type === "month").value;
    const jahr = parts.find(p => p.type === "year").value;
    const stunde = parts.find(p => p.type === "hour").value;
    const minute = parts.find(p => p.type === "minute").value;

    tag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
    const datumStr = `🕓 | Datum: ${tag}, ${tagNum}.${monat}.${jahr}, ${stunde}:${minute} Uhr`;

    if (action === "join") {
      Logger.debug(`Benutzer ${user.username} ist einem Sprachkanal beigetreten: ${newState.channel?.name}\n${datumStr}`);
    } else if (action === "leave") {
      Logger.debug(`Benutzer ${user.username} hat einen Sprachkanal verlassen: ${oldState.channel?.name}\n${datumStr}`);
    } else if (action === "switch") {
      Logger.debug(`Benutzer ${user.username} ist von "${oldState.channel?.name}" zu "${newState.channel?.name}" gewechselt\n${datumStr}`);
    }
  }

  /**
     * Holt Voice-Zeit eines Users (formatiert)
     */
  formatVoiceTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

module.exports = VoiceService;
