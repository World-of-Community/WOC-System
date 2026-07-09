import client from "../index.js";
import { Events, EmbedBuilder } from "discord.js";
import countingSchema from "../models/countingdb.js";

client.on(Events.MessageCreate, async (message) => {

  if (message.author.bot) {return;}
  if (!message.guild) {return;}

  const countingdb = await countingSchema.findOne({ guildId: "815919809379172354" });

  switch (message.channel.id) {
    case countingdb?.channelId:
      counting(message, countingdb);
      break;
    case "1269568224295391233": // Flaggen

      break;

    case "1269568327127269466": // Emoji

      break;
  }
});

async function counting(message, counting) {
  if (message.author.id === counting.lastUserId) {
    counting.lastUserId = null;
    counting.currentCount = 0;
    message.reply({ content: "**Falsch!** Du darfst nicht 2x hintereinander hochzählen." });
    message.react("❌");
  } else if (Number(message.content) !== counting.currentCount + 1) {
    counting.lastUserId = null;
    counting.currentCount = 0;
    message.reply({ content: `**Falsch!** Die richtige Zahl wäre \`${counting.currentCount + 1}\` gewesen.` });
    message.react("❌");
  } else {
    counting.currentCount++;
    counting.lastUserId = message.author.id;
    if (counting.currentCount > counting.highestCount) {
      counting.highestCount = counting.currentCount;

      const countingEmbed = await message.channel.messages.fetch(counting.messageId);
      const embed = new EmbedBuilder(countingEmbed.embeds[0]);
      embed.setDescription(
        "Hier sind alle Informationen für das Zählspiel:\n\n" +
                "`1️⃣` » Beginne das Zählen mit der Zahl **1**.\n" +
                "`🛑` » Wenn du **falsch** zählst oder **zweimal hintereinander** zählst, wird das Spiel **zurückgesetzt**.\n\n" +
                `\`🏆\` » **Bisheriger Zähl Rekord:** **\`${counting.highestCount}\`**`,
      );

      countingEmbed.edit({ embeds: [embed] });
    }
    message.react("✅");
  }

  await counting.save();
}
