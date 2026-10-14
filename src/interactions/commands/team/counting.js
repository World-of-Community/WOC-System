import { EmbedBuilder } from "discord.js";
import CountingModel from "#models/Counting.js";

export default {
  name: "counting",
  description: "» Setzt den Zählkanal. 🔢",
  type: 1,
  default_member_permissions: "16",
  options: [
    {
      name: "kanal",
      description: "» In welchen Kanal soll gezählt werden?",
      required: true,
      type: 7,
    },
  ],

  async run(client, interaction) {
    const selectedChannel = interaction.options.getChannel("kanal");
    const guildId = interaction.guild.id;

    let countingData = await CountingModel.findOne({ guildId });

    if (!countingData) {
      countingData = await CountingModel.create({
        guildId,
        channelId: selectedChannel.id,
        currentCount: 0,
        lastUserId: null,
      });
    }

    countingData.channelId = selectedChannel.id;
    countingData.currentCount = 0;
    countingData.lastUserId = null;

    await interaction.reply({ content: `> \`✅\` » Der Zählkanal wurde auf <#${selectedChannel.id}> eingestellt.`, ephemeral: true });

    const countingEmbed = new EmbedBuilder()
      .setTitle("`🔢` » Zahlen Spiel Information")
      .setDescription(`Hier sind alle Informationen für das Zählspiel:\n\n\`1️⃣\` » Beginne das Zählen mit der Zahl **1**.\n\`🛑\` » Wenn du **falsch** zählst oder **zweimal hintereinander** zählst, wird das Spiel **zurückgesetzt**.\n\n\`🏆\` » **Bisheriger Zähl Rekord:** **\`${countingData.highestCount}\`**`)
      .setColor("Blurple")
      .setFooter({ text: `» ${interaction.guild.name} - System Information` })
      .setTimestamp();

    const countingEmbedMessage = await selectedChannel.send({ embeds: [countingEmbed] });
    countingData.messageId = countingEmbedMessage.id;
    await countingEmbedMessage.pin();

    await countingData.save();
  },
};
