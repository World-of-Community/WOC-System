import { EmbedBuilder } from "discord.js";
import cron from "node-cron";
import client from "../index.js";

// Jeden ersten Freitag im Monat um 15:00 Uhr das Wochenend-Event ankündigen
cron.schedule("0 15 * * 5", async () => {
  const today = new Date();
  const day = today.getDate();

  // Nur am ersten Freitag (Tag ≤ 7)
  if (day <= 7) {
    try {
      const channel = await client.channels.fetch("1008696596000677998");
      if (!channel) {return console.log("Kanal nicht gefunden!");}

      // 1️⃣ Banner senden
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setImage("https://cdn.discordapp.com/attachments/1008696596000677998/1337428177487794207/WOC_Banner_Neues_Server_Event.png?ex=690f520d&is=690e008d&hm=62bf01da44ab6d8946820799d984314daee0227eb2ec44c52335b458ba43ac93&"),
        ],
      });

      // 2️⃣ Danach Nachricht senden
      await channel.send(
        "<a:pin:1119708768326914100>  » | **WOCHENEND-EVENT** - <a:Chat1:976129450112593990>\n\n" +
                "Liebe Community, <@&870683971846041650>\n\n" +
                "Von Freitag bis Sonntag läuft ein **Community-Event**. Schaut vorbei und verbringt gemeinsam eine gute Zeit auf dem Server.\n\n" +
                "Mit freundlichen Grüßen\nEuer **World Of Community**-Team <:pepeheart:974642478055555082>",
      );

      console.log("✅ | Banner und Nachricht gesendet!");
    } catch (error) {
      console.error("❌ Fehler beim Senden:", error);
    }
  }
});

// Am Event-Wochenende den XP-Multiplikator setzen (erster Freitag 15 Uhr) und
// am Sonntag um 22 Uhr zurücksetzen
const BotCHANNEL_ID = "870645033232130098";
let commandExecuted = false;

setInterval(async () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sonntag, 5 = Freitag
  const hour = now.getHours();
  const date = now.getDate();

  // Prüfen, ob erster Freitag im Monat
  function isFirstFriday() {
    return day === 5 && date <= 7;
  }

  // Freitag 15:00 Uhr → Command ausführen
  if (isFirstFriday() && hour === 15 && !commandExecuted) {
    commandExecuted = true;
    const channel = await client.channels.fetch(BotCHANNEL_ID);
    channel.send(":?pmulti set 2");
    console.log("Command am Freitag um 15 Uhr ausgeführt!");
  }

  // Sonntag 22:00 Uhr → zurücksetzen
  if (day === 0 && hour === 22 && commandExecuted) {
    commandExecuted = false;
    const channel = await client.channels.fetch(BotCHANNEL_ID);
    channel.send(":?pmulti set 1"); // optional zurücksetzen
    console.log("Command am Sonntag um 22 Uhr zurückgesetzt!");
  }

}, 60 * 60 * 1000); // jede Stunde prüfen
