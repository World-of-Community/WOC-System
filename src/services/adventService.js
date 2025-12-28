const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, time, TimestampStyles } = require("discord.js");
const cron = require("node-cron");
const serverdb = require("../../Datenbank/serverdb");
const { Logger } = require("../utils");

/**
 * Adventskalender Service
 * Verwaltet das Adventskalender-System
 */
class AdventService {
  constructor(client) {
    this.client = client;
    this.buttonConfig = {
      1: { label: "1🎁", style: ButtonStyle.Primary },
      2: { label: "2🌨️", style: ButtonStyle.Primary },
      3: { label: "3🎄", style: ButtonStyle.Primary },
      4: { label: "4⛄", style: ButtonStyle.Primary },
      5: { label: "5⭐", style: ButtonStyle.Primary },
      6: { label: "6❄️", style: ButtonStyle.Primary },
      7: { label: "7✨", style: ButtonStyle.Primary },
      8: { label: "8🎄", style: ButtonStyle.Primary },
      9: { label: "9☃️", style: ButtonStyle.Primary },
      10: { label: "10🎁", style: ButtonStyle.Primary },
      11: { label: "11⭐", style: ButtonStyle.Primary },
      12: { label: "12❄️", style: ButtonStyle.Primary },
      13: { label: "13🌨️", style: ButtonStyle.Primary },
      14: { label: "14🎄", style: ButtonStyle.Primary },
      15: { label: "15⭐", style: ButtonStyle.Primary },
      16: { label: "16✨", style: ButtonStyle.Primary },
      17: { label: "17❄️", style: ButtonStyle.Primary },
      18: { label: "18🎄", style: ButtonStyle.Primary },
      19: { label: "19🧸", style: ButtonStyle.Primary },
      20: { label: "20🦌", style: ButtonStyle.Primary },
      21: { label: "21✨", style: ButtonStyle.Primary },
      22: { label: "22🎉", style: ButtonStyle.Primary },
      23: { label: "23🎁", style: ButtonStyle.Primary },
      24: { label: "24🎅", style: ButtonStyle.Primary },
    };
  }

  /**
     * Startet den Adventskalender mit Cron-Jobs
     */
  start() {
    // Täglich um Mitternacht - Update Adventskalender
    cron.schedule("0 0 * * *", async () => {
      await this.updateAdventCalendar();
    });

    // Nachricht wenn neues Türchen verfügbar
    cron.schedule("0 0 * * *", async () => {
      await this.sendDailyReminder();
    });

    Logger.success("Adventskalender Service gestartet");
  }

  /**
     * Aktualisiert den Adventskalender täglich
     */
  async updateAdventCalendar() {
    try {
      const server = await serverdb.findOne({ guildID: "815919809379172354" });
      if (!server || !server.adventskalender) {return;}

      const currentDate = new Date();
      const currentDay = currentDate.getDate();
      const currentMonth = currentDate.getMonth();
      const maxDay = 24;

      // Kanal und Nachricht abrufen
      const channel = await this.client.channels.fetch(server.adventskalender.channelId);
      if (!channel) {throw new Error("Kanal nicht gefunden!");}

      const message = await channel.messages.fetch(server.adventskalender.messageId);
      if (!message) {throw new Error("Nachricht nicht gefunden!");}

      // Button-Rows erstellen
      const rows = this.createButtonRows(currentDay, currentMonth, maxDay);

      // Aktualisiertes Embed
      const updatedEmbed = EmbedBuilder.from(message.embeds[0])
        .setDescription(
          `» Klicke auf einen Tag, um deine Belohnung zu erhalten!\n\nHeute ist der **${time(currentDate, TimestampStyles.LongDate)}**.`,
        );

      // Nachricht bearbeiten
      await message.edit({ embeds: [updatedEmbed], components: rows });
      Logger.success(`Adventskalender aktualisiert: ${currentDay}. Dezember`);
    } catch (error) {
      Logger.error("Fehler beim Aktualisieren des Adventskalenders", error);
    }
  }

  /**
     * Erstellt die Button-Rows für den Adventskalender
     */
  createButtonRows(currentDay, currentMonth, maxDay) {
    const rows = [];
    let currentRow = new ActionRowBuilder();

    for (let i = 1; i <= maxDay; i++) {
      const buttonData = this.buttonConfig[i] || {};
      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`advent_${i}`)
          .setLabel(buttonData.label || i.toString())
          .setStyle(buttonData.style || ButtonStyle.Primary)
          .setDisabled(i > currentDay || currentMonth !== 11),
      );

      if (currentRow.components.length === 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }
    }

    if (currentRow.components.length > 0) {rows.push(currentRow);}
    return rows;
  }

  /**
     * Sendet tägliche Erinnerung für neues Türchen
     */
  async sendDailyReminder() {
    try {
      const currentDate = new Date();

      // Nur im Dezember ausführen
      if (currentDate.getMonth() !== 11) {return;}

      const channelId = "1312772215791685743";
      const channel = await this.client.channels.fetch(channelId);

      if (!channel || !channel.isTextBased()) {
        Logger.warning("Adventskalender-Kanal nicht gefunden");
        return;
      }

      const reminderMessage = await channel.send({
        content: `🎉 **Ein neues Türchen kann geöffnet werden!** Heute ist der **${time(currentDate, TimestampStyles.LongDate)}**.`,
      });

      // Nachricht nach 3 Minuten löschen
      setTimeout(() => reminderMessage.delete().catch(() => {}), 3 * 60 * 1000);
    } catch (error) {
      Logger.error("Fehler beim Senden der Adventskalender-Erinnerung", error);
    }
  }
}

module.exports = AdventService;
