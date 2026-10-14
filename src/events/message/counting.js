import { Events, EmbedBuilder } from "discord.js";
import countingSchema from "#models/Counting.js";
import { GUILD_ID } from "#config";

export default {
  name: Events.MessageCreate,

  async execute(client, message) {
    if (message.author.bot || !message.guild) {return;}

    const counting = await countingSchema.findOne({ guildId: GUILD_ID });
    if (!counting?.channelId || message.channel.id !== counting.channelId) {return;}

    if (message.author.id === counting.lastUserId) {
      counting.lastUserId = null;
      counting.currentCount = 0;
      await message.reply({ content: "**Falsch!** Du darfst nicht 2x hintereinander hochzählen." });
      await message.react("❌");
    } else if (Number(message.content) !== counting.currentCount + 1) {
      const expected = counting.currentCount + 1;
      counting.lastUserId = null;
      counting.currentCount = 0;
      await message.reply({ content: `**Falsch!** Die richtige Zahl wäre \`${expected}\` gewesen.` });
      await message.react("❌");
    } else {
      counting.currentCount++;
      counting.lastUserId = message.author.id;

      if (counting.currentCount > counting.highestCount) {
        counting.highestCount = counting.currentCount;

        const infoMessage = await message.channel.messages.fetch(counting.messageId).catch(() => null);
        if (infoMessage?.embeds[0]) {
          const embed = EmbedBuilder.from(infoMessage.embeds[0]).setDescription(
            "Hier sind alle Informationen für das Zählspiel:\n\n" +
            "`1️⃣` » Beginne das Zählen mit der Zahl **1**.\n" +
            "`🛑` » Wenn du **falsch** zählst oder **zweimal hintereinander** zählst, wird das Spiel **zurückgesetzt**.\n\n" +
            `\`🏆\` » **Bisheriger Zähl Rekord:** **\`${counting.highestCount}\`**`,
          );
          await infoMessage.edit({ embeds: [embed] });
        }
      }
      await message.react("✅");
    }

    await counting.save();
  },
};
