const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionBitField } = require('discord.js');
const CountingModel = require("../../../Datenbank/countingdb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('counting')
        .setDescription('» Setzt den Zählkanal. 🔢')
        .addChannelOption(option => option.setName('kanal').setDescription('» In welchen Kanal soll gezählt werden?').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const selectedChannel = interaction.options.getChannel('kanal');
        const guildId = interaction.guild.id;

        let countingData = await CountingModel.findOne({ guildId });

        if (!countingData) {
            countingData = await CountingModel.create({
                guildId,
                channelId: selectedChannel.id,
                currentCount: 0,
                lastUserId: null
            });
        }

        countingData.channelId = selectedChannel.id;
        countingData.currentCount = 0;
        countingData.lastUserId = null;

        await interaction.reply({ content: `> \`✅\` » Der Zählkanal wurde auf <#${selectedChannel.id}> eingestellt.`, ephemeral: true });

        const countingEmbed = new EmbedBuilder()
            .setTitle('`🔢` » Zahlen Spiel Information')
            .setDescription(`Hier sind alle Informationen für das Zählspiel:\n\n\`1️⃣\` » Beginne das Zählen mit der Zahl **1**.\n\`🛑\` » Wenn du **falsch** zählst oder **zweimal hintereinander** zählst, wird das Spiel **zurückgesetzt**.\n\n\`🏆\` » **Bisheriger Zähl Rekord:** **\`${countingData.highestCount}\`**`)
            .setColor('Blurple')
            .setFooter({ text: `» ${interaction.guild.name} - System Information` })
            .setTimestamp();

        const countingEmbedMessage = await selectedChannel.send({ embeds: [countingEmbed] });
        countingData.messageId = countingEmbedMessage.id;
        await countingEmbedMessage.pin();

        await countingData.save();
    }
};
