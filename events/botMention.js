import { ChannelType } from "discord.js";
import client from "../index.js";
import logger from "../functions/logger.js";

// Bot Ping / Erwähnung
const pingMessages = [
  "Wenn du Hilfe brauchst öffne ein Ticket im Support <:pepeheart:974642478055555082>",
  "Ein Admin hat mir verboten dir zu antworten <a:warnung:1066110628705615914>",
  "Ja? <:Moin:915211924164210738>",
  "Was gibt es? <a:what:1119708325962055720>",
  "Grüße dich! <a:winken:1086560167442796544>",
  "Ich sorge für Recht und Ordnung! `📚`",
  "An mir kommt keiner vorbei. `😎`",
  "Legt euch lieber nicht mit mir an! `😈`",
  "Ich bin sehr Aufmerksam! `❗`",
];

// Wenn der Bot gepingt wird
client.on("messageCreate", message => {
  if (message.mentions.has(client.user) && !message.author.bot) {
    const randomPingMessage = pingMessages[Math.floor(Math.random() * pingMessages.length)];
    message.channel.send(randomPingMessage).then(sentMessage => {
      setTimeout(() => {
        sentMessage.delete()
          .catch(err => logger.error("Fehler beim Löschen der Nachricht:", err));
      }, 5000); // 5000 Millisekunden = 5 Sekunden
    }).catch(err => logger.error("Fehler beim Senden der Nachricht:", err));
  }
});

// Bot schreibt user per DM wenn der bot angeschrieben wird
client.on("messageCreate", async message => {
  if (message.channel.type === ChannelType.DM && !message.author.bot) {
    try {
      // Antwort auf die DM
      await message.channel.send(`Hey ${message.author.displayName}!\nLeider bin ich der falsche Ansprechpartner, falls du Hilfe suchst...<:pepecryhands:1258388912196550707>\nÖffne ein Support Ticket in <#819555839362072606> damit sich unser Support-Team um dein Problem so schnell es geht kümmern kann. <:pepeheart:974642478055555082>`);
    } catch (error) {
      logger.error("Fehler beim Senden der Antwort:", error);
    }
  }
});
