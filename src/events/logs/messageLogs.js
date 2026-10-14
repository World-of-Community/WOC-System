import { EmbedBuilder, Events } from "discord.js";
import { sendLog, ThreadIDs } from "#core/discordLog.js";

const IGNORED_CHANNEL_ID = "1205936920866328576";

export default [
  {
    name: Events.MessageCreate,
    async execute(client, message) {
      if (!message.author || message.author.bot) {return;}
      if (message.channelId === IGNORED_CHANNEL_ID) {return;}

      const embed = new EmbedBuilder()
        .setTitle("`📨` | NACHRICHT GESENDET")
        .setDescription(`**${message.author.displayName}** hat eine Nachricht gesendet in ${message.channel}\n\n> Nachricht: ${message.content || "**Kein Inhalt**"}`)
        .setColor("Green")
        .setTimestamp();

      await sendLog(ThreadIDs.MESSAGE, embed);
    },
  },
  {
    name: Events.MessageDelete,
    async execute(client, message) {
      if (!message.author || message.author.bot) {return;}
      if (message.channelId === IGNORED_CHANNEL_ID) {return;}

      const embed = new EmbedBuilder()
        .setTitle("`🗑️` | NACHRICHT GELÖSCHT")
        .setDescription(`Die Nachricht von **${message.author.displayName}** wurde gelöscht in ${message.channel}\n\n> Inhalt: ${message.content || "**Kein Inhalt**"}`)
        .setColor("Red")
        .setTimestamp();

      await sendLog(ThreadIDs.MESSAGE, embed);
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

      await sendLog(ThreadIDs.MESSAGE, embed);
    },
  },
];
