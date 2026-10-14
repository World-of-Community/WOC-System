import { EmbedBuilder, Events } from "discord.js";
import { sendLog } from "#core/discordLog.js";
import { settings } from "#core/settings.js";

export default [
  {
    name: Events.MessageCreate,
    async execute(client, message) {
      if (!message.author || message.author.bot) {return;}
      if (message.channelId === settings.get("channels.logIgnored")) {return;}

      const embed = new EmbedBuilder()
        .setTitle("`📨` | NACHRICHT GESENDET")
        .setDescription(`**${message.author.displayName}** hat eine Nachricht gesendet in ${message.channel}\n\n> Nachricht: ${message.content || "**Kein Inhalt**"}`)
        .setColor("Green")
        .setTimestamp();

      await sendLog(settings.get("logThreads.message"), embed);
    },
  },
  {
    name: Events.MessageDelete,
    async execute(client, message) {
      if (!message.author || message.author.bot) {return;}
      if (message.channelId === settings.get("channels.logIgnored")) {return;}

      const embed = new EmbedBuilder()
        .setTitle("`🗑️` | NACHRICHT GELÖSCHT")
        .setDescription(`Die Nachricht von **${message.author.displayName}** wurde gelöscht in ${message.channel}\n\n> Inhalt: ${message.content || "**Kein Inhalt**"}`)
        .setColor("Red")
        .setTimestamp();

      await sendLog(settings.get("logThreads.message"), embed);
    },
  },
  {
    name: Events.MessageUpdate,
    async execute(client, oldMessage, newMessage) {
      if (!newMessage.author || newMessage.author.bot) {return;}
      if (oldMessage.content === newMessage.content) {return;}

      const embed = new EmbedBuilder()
        .setTitle("`🖊️` | NACHRICHT BEARBEITET")
        .setDescription(`Die Nachricht von **${newMessage.author.displayName}** wurde bearbeitet in ${oldMessage.channel}\n\n> Alte Nachricht: ${oldMessage.content || "**Kein Inhalt**"}\n> Neue Nachricht: ${newMessage.content || "**Kein Inhalt**"}`)
        .setColor("Orange")
        .setTimestamp();

      await sendLog(settings.get("logThreads.message"), embed);
    },
  },
];
