import { ChannelType, Events } from "discord.js";
import { settings } from "#core/settings.js";

const PING_MESSAGES = [
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

export default [
  {
    name: Events.MessageCreate,
    async execute(client, message) {
      if (message.author.bot || !message.mentions.has(client.user)) {return;}

      const reply = PING_MESSAGES[Math.floor(Math.random() * PING_MESSAGES.length)];
      const sent = await message.channel.send(reply);
      setTimeout(() => sent.delete().catch(() => {}), 5000);
    },
  },
  {
    name: Events.MessageCreate,
    async execute(client, message) {
      if (message.author.bot || message.channel.type !== ChannelType.DM) {return;}

      await message.channel.send(
        `Hey ${message.author.displayName}!\n` +
        "Leider bin ich der falsche Ansprechpartner, falls du Hilfe suchst...<:pepecryhands:1258388912196550707>\n" +
        `Öffne ein Support Ticket in <#${settings.get("channels.support")}> damit sich unser Support-Team um dein Problem so schnell es geht kümmern kann. <:pepeheart:974642478055555082>`,
      );
    },
  },
];
