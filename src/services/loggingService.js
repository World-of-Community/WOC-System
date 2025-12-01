const { EmbedBuilder } = require("discord.js");
const { Logger } = require("../utils");

/**
 * Logging Service
 * Verwaltet Server-Logs in Thread-Channels
 */
class LoggingService {
  constructor(client) {
    this.client = client;
    this.guildId = "815919809379172354";
    this.logChannelId = "1263436406655680513"; // Server Logs
    this.botStatusChannelId = "1295742887388254278"; // Bot Status

    this.threadIds = {
      CHANNEL: "1269998213952442525",
      MESSAGE: "1269998217181921320",
      JOIN: "1269998215512457259",
      ROLES: "1269998221518831721",
      SERVER: "1269998220440895510",
      MODERATION: "1269998219266490538",
      INVITE: "1269998218264055818",
      OFFLINE: "1296391117507399763",
      ONLINE: "1296391117507399763",
    };
  }

  /**
     * Sendet ein Log-Embed in einen Thread
     */
  async sendLog(threadId, embed) {
    try {
      const guild = this.client.guilds.cache.get(this.guildId);
      if (!guild) {throw new Error("Server nicht gefunden");}

      // Versuche zuerst Server Logs Channel
      let logChannel = guild.channels.cache.get(this.logChannelId);
      if (!logChannel) {
        // Falls nicht gefunden, versuche Bot Status Channel
        logChannel = guild.channels.cache.get(this.botStatusChannelId);
      }

      if (!logChannel) {throw new Error("Log Kanal nicht gefunden");}

      // Finde Thread
      let thread = logChannel.threads.cache.get(threadId);

      // Falls Thread nicht im Cache, versuche zu fetchen
      if (!thread) {
        const threads = await logChannel.threads.fetchActive();
        thread = threads.threads.get(threadId);
      }

      if (!thread) {throw new Error("Thread nicht gefunden");}

      await thread.send({ embeds: [embed] });
    } catch (error) {
      Logger.error("Fehler beim Senden des Logs", error);
    }
  }

  /**
     * Loggt Message Delete Event
     */
  async logMessageDelete(message) {
    if (!message.author || message.author.bot) {return;}

    try {
      const embed = new EmbedBuilder()
        .setTitle("`🗑️` | NACHRICHT GELÖSCHT")
        .setDescription(
          `Eine Nachricht von **${message.author.displayName}** wurde gelöscht in ${message.channel}\n\n` +
                    `> Nachricht: ${message.content || "**Kein Textinhalt**"}`,
        )
        .setColor("Red")
        .setTimestamp();

      await this.sendLog(this.threadIds.MESSAGE, embed);
    } catch (error) {
      Logger.error("Fehler beim Loggen von Message Delete", error);
    }
  }

  /**
     * Loggt Message Edit Event
     */
  async logMessageEdit(oldMessage, newMessage) {
    if (!newMessage.author || newMessage.author.bot) {return;}
    if (oldMessage.content === newMessage.content) {return;}

    try {
      const embed = new EmbedBuilder()
        .setTitle("`🖊️` | NACHRICHT BEARBEITET")
        .setDescription(
          `Die Nachricht von **${newMessage.author.displayName}** wurde bearbeitet in ${oldMessage.channel}\n\n` +
                    `> Alte Nachricht: ${oldMessage.content || "**Kein Inhalt**"}\n` +
                    `> Neue Nachricht: ${newMessage.content || "**Kein Inhalt**"}`,
        )
        .setColor("Orange")
        .setTimestamp();

      await this.sendLog(this.threadIds.MESSAGE, embed);
    } catch (error) {
      Logger.error("Fehler beim Loggen von Message Edit", error);
    }
  }

  /**
     * Loggt Member Join Event
     */
  async logMemberJoin(member) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("`👋` | MITGLIED BEIGETRETEN")
        .setDescription(
          `**${member.user.tag}** ist dem Server beigetreten\n\n` +
                    `> User ID: ${member.id}\n` +
                    `> Account erstellt: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setColor("Green")
        .setTimestamp();

      await this.sendLog(this.threadIds.JOIN, embed);
    } catch (error) {
      Logger.error("Fehler beim Loggen von Member Join", error);
    }
  }

  /**
     * Loggt Member Leave Event
     */
  async logMemberLeave(member) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("`👋` | MITGLIED VERLASSEN")
        .setDescription(
          `**${member.user.tag}** hat den Server verlassen\n\n` +
                    `> User ID: ${member.id}\n` +
                    `> Beigetreten: <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setColor("Red")
        .setTimestamp();

      await this.sendLog(this.threadIds.JOIN, embed);
    } catch (error) {
      Logger.error("Fehler beim Loggen von Member Leave", error);
    }
  }

  /**
     * Loggt Role Update Event
     */
  async logRoleUpdate(oldMember, newMember) {
    try {
      const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
      const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

      if (addedRoles.size === 0 && removedRoles.size === 0) {return;}

      let description = `Rollen von **${newMember.user.tag}** wurden aktualisiert\n\n`;

      if (addedRoles.size > 0) {
        description += `> ✅ **Hinzugefügt:** ${addedRoles.map(r => r.name).join(", ")}\n`;
      }

      if (removedRoles.size > 0) {
        description += `> ❌ **Entfernt:** ${removedRoles.map(r => r.name).join(", ")}`;
      }

      const embed = new EmbedBuilder()
        .setTitle("`🎭` | ROLLEN AKTUALISIERT")
        .setDescription(description)
        .setColor("Blue")
        .setTimestamp();

      await this.sendLog(this.threadIds.ROLES, embed);
    } catch (error) {
      Logger.error("Fehler beim Loggen von Role Update", error);
    }
  }

  /**
     * Loggt Channel Create Event
     */
  async logChannelCreate(channel) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("`📁` | KANAL ERSTELLT")
        .setDescription(
          `Kanal **${channel.name}** wurde erstellt\n\n` +
                    `> Typ: ${channel.type}\n` +
                    `> ID: ${channel.id}`,
        )
        .setColor("Green")
        .setTimestamp();

      await this.sendLog(this.threadIds.CHANNEL, embed);
    } catch (error) {
      Logger.error("Fehler beim Loggen von Channel Create", error);
    }
  }

  /**
     * Loggt Channel Delete Event
     */
  async logChannelDelete(channel) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("`📁` | KANAL GELÖSCHT")
        .setDescription(
          `Kanal **${channel.name}** wurde gelöscht\n\n` +
                    `> Typ: ${channel.type}\n` +
                    `> ID: ${channel.id}`,
        )
        .setColor("Red")
        .setTimestamp();

      await this.sendLog(this.threadIds.CHANNEL, embed);
    } catch (error) {
      Logger.error("Fehler beim Loggen von Channel Delete", error);
    }
  }

  /**
     * Loggt Bot Online Status
     */
  async logBotOnline() {
    try {
      const embed = new EmbedBuilder()
        .setTitle("`✅` | BOT ONLINE")
        .setDescription(
          "Der Bot ist jetzt **online** und einsatzbereit!\n\n" +
                    `> Startzeit: <t:${Math.floor(Date.now() / 1000)}:F>`,
        )
        .setColor("Green")
        .setTimestamp();

      await this.sendLog(this.threadIds.ONLINE, embed);
    } catch (error) {
      Logger.error("Fehler beim Loggen von Bot Online", error);
    }
  }

  /**
     * Loggt Bot Offline Status
     */
  async logBotOffline() {
    try {
      const embed = new EmbedBuilder()
        .setTitle("`❌` | BOT OFFLINE")
        .setDescription(
          "Der Bot geht jetzt **offline**\n\n" +
                    `> Shutdown-Zeit: <t:${Math.floor(Date.now() / 1000)}:F>`,
        )
        .setColor("Red")
        .setTimestamp();

      await this.sendLog(this.threadIds.OFFLINE, embed);
    } catch (error) {
      Logger.error("Fehler beim Loggen von Bot Offline", error);
    }
  }
}

module.exports = LoggingService;
