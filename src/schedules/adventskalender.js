import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, time, TimestampStyles } from "discord.js";
import serverdb from "#models/serverdb.js";
import logger from "#core/logger.js";
import { GUILD_ID } from "#config";

const ADVENT_CHANNEL_ID = "1312772215791685743";
const MAX_DAY = 24;

const BUTTON_LABELS = {
  1: "1🎁", 2: "2🌨️", 3: "3🎄", 4: "4⛄", 5: "5⭐", 6: "6❄️", 7: "7✨", 8: "8🎄", 9: "9☃️", 10: "10🎁",
  11: "11⭐", 12: "12❄️", 13: "13🌨️", 14: "14🎄", 15: "15⭐", 16: "16✨", 17: "17❄️", 18: "18🎄", 19: "19🧸",
  20: "20🦌", 21: "21✨", 22: "22🎉", 23: "23🎁", 24: "24🎅",
};

function buildRows(currentDay, isDecember) {
  const rows = [];
  let row = new ActionRowBuilder();

  for (let day = 1; day <= MAX_DAY; day++) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`advent_${day}`)
        .setLabel(BUTTON_LABELS[day] ?? String(day))
        .setStyle(ButtonStyle.Primary)
        .setDisabled(day > currentDay || !isDecember),
    );
    if (row.components.length === 5) {
      rows.push(row);
      row = new ActionRowBuilder();
    }
  }
  if (row.components.length > 0) {rows.push(row);}
  return rows;
}

export default [
  {
    name: "adventskalenderUpdate",
    cron: "0 0 * * *",

    async execute(client) {
      const server = await serverdb.findOne({ guildID: GUILD_ID });
      if (!server?.adventskalender?.channelId || !server.adventskalender.messageId) {return;}

      const now = new Date();
      const channel = await client.channels.fetch(server.adventskalender.channelId);
      const message = await channel.messages.fetch(server.adventskalender.messageId);

      const embed = EmbedBuilder.from(message.embeds[0])
        .setDescription(`» Klicke auf einen Tag, um deine Belohnung zu erhalten!\n\nHeute ist der **${time(now, TimestampStyles.LongDate)}**.`);

      await message.edit({ embeds: [embed], components: buildRows(now.getDate(), now.getMonth() === 11) });
      logger.info(`Advent calendar updated for day ${now.getDate()}`);
    },
  },
  {
    name: "adventskalenderReminder",
    cron: "0 0 * * *",

    async execute(client) {
      const now = new Date();
      if (now.getMonth() !== 11 || now.getDate() > 24) {return;}

      const channel = await client.channels.fetch(ADVENT_CHANNEL_ID).catch(() => null);
      if (!channel?.isTextBased()) {
        logger.error("Advent calendar channel not found");
        return;
      }

      const reminder = await channel.send({
        content: `🎉 **Ein neues Türchen kann geöffnet werden!** Heute ist der **${time(now, TimestampStyles.LongDate)}**.`,
      });
      setTimeout(() => reminder.delete().catch(() => {}), 3 * 60 * 1000);
    },
  },
];
