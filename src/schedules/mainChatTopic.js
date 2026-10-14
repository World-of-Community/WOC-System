import { ChannelType, PermissionsBitField } from "discord.js";
import messagedb from "#models/messagedb.js";
import logger from "#core/logger.js";
import { config } from "#config";

export default {
  name: "mainChatTopic",
  interval: 5 * 60 * 1000,

  async execute(client) {
    const channel = await client.channels.fetch(config.willkommen).catch(() => null);
    if (!channel || channel.type !== ChannelType.GuildText) {return;}

    if (!channel.permissionsFor(client.user)?.has(PermissionsBitField.Flags.ManageChannels)) {
      logger.warn("Missing ManageChannels for main chat topic");
      return;
    }

    let messageData = await messagedb.findOne({ guildID: config.server });
    if (!messageData) {
      messageData = await messagedb.create({ guildID: config.server, messages: 0 });
    }
    if (typeof messageData.messages !== "number") {
      messageData.messages = Number(messageData.messages) || 0;
      await messageData.save();
    }

    const messages = messageData.messages.toLocaleString("de-DE");

    await channel.setTopic(
      "<a:cursorclick:1007272113830383716> **| KLICK MICH FÜR MEHR INFOS**\n\n" +
      `𑁉 **${messages}** Nachrichten wurden bereits versendet! <a:Chat1:976129450112593990> **Unterhalte dich** ein wenig mit uns! - das macht **garantiert Spaß**!\n\n` +
      "<a:Information:1007267420316106903> **| __WICHTIGE INFORMATION__**\n" +
      "» Um eine friedliche Atmosphäre beizubehalten, denke bitte stets daran, dich an unsere **Regeln** zu halten:\n" +
      "<#815922286502346773>\n\n" +
      "📌 » Solltest du **Fragen** haben, dann öffne ein Ticket in <#819555839362072606> und schreibe eine Nachricht mit deinem Anliegen.",
    );
  },
};
