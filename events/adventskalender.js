import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, time, TimestampStyles } from "discord.js";
import cron from "node-cron";
import client from "../index.js";
import serverdb from "../models/serverdb.js";

const buttonConfig = {
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

// Täglich um Mitternacht (Adventskalender)
cron.schedule("00 00 * * *", async () => {
  const server = await serverdb.findOne({ guildID: "815919809379172354" });
  if (!server) {return;}
  const currentDate = new Date();
  const currentDay = new Date().getDate();
  const currentMonth = currentDate.getMonth();
  const maxDay = 24;

  try {
    // Kanal und Nachricht abrufen
    const channel = await client.channels.fetch(server.adventskalender.channelId);
    if (!channel) {throw new Error("Kanal nicht gefunden!");}

    const message = await channel.messages.fetch(server.adventskalender.messageId);
    if (!message) {throw new Error("Nachricht nicht gefunden!");}

    // Neue Button-Logik
    const rows = [];
    let currentRow = new ActionRowBuilder();

    for (let i = 1; i <= maxDay; i++) {
      const buttonData = buttonConfig[i] || {};
      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`advent_${i}`)
          .setLabel(buttonData.label || i.toString())
          .setStyle(buttonData.style || ButtonStyle.Primary)
          .setDisabled(i > currentDay || currentMonth !== 11), // Zukünftige Tage deaktivieren
      );

      if (currentRow.components.length === 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }
    }
    if (currentRow.components.length > 0) {rows.push(currentRow);}

    // Aktualisiertes Embed
    const updatedEmbed = EmbedBuilder.from(message.embeds[0])
      .setDescription(`» Klicke auf einen Tag, um deine Belohnung zu erhalten!\n\nHeute ist der **${time(currentDate, TimestampStyles.LongDate)}**.`);

    // Nachricht bearbeiten
    await message.edit({ embeds: [updatedEmbed], components: rows });
    console.log(`Adventskalener-Embed erfolgreich aktualisiert: Heute ist der ${currentDay}. Dezember`);
  } catch (error) {
    console.error("Fehler beim Bearbeiten des Embeds:", error);
  }
});

// Nachricht wenn ein neues Türchen geöffnet werden kann
cron.schedule("0 0 * * *", async () => {
  try {
    const currentDate = new Date();

    const month = currentDate.getMonth(); // 0 = Januar, 11 = Dezember
    const day = currentDate.getDate();    // 1–31

    // ❌ Nur vom 01.12. bis 24.12.
    if (month !== 11 || day < 1 || day > 24) {return;}

    const channelId = "1312772215791685743"; // Adventskalender-Kanal-ID
    const channel = await client.channels.fetch(channelId);

    if (!channel || !channel.isTextBased()) {
      console.error("Kanal konnte nicht gefunden oder ist kein Textkanal.");
      return;
    }

    const reminderMessage = await channel.send({
      content: `🎉 **Ein neues Türchen kann geöffnet werden!** Heute ist der **${time(currentDate, TimestampStyles.LongDate)}**.`,
    });

    // Nachricht nach 3 Minuten löschen
    setTimeout(() => reminderMessage.delete().catch(() => {}), 3 * 60 * 1000);

  } catch (error) {
    console.error("Fehler beim Senden der Nachricht:", error);
  }
});
