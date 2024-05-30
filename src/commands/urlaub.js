const { Client, SlashCommandBuilder, EmbedBuilder, ChannelType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('urlaub')
        .setDescription('» Teile deinen Urlaub mit. 🌴')
        .addStringOption(option => option.setName('von').setDescription('Startdatum des Urlaubs (DD-MM-YYYY)').setRequired(true))
        .addStringOption(option => option.setName('bis').setDescription('Enddatum des Urlaubs (DD-MM-YYYY)').setRequired(true)),

    async execute(interaction) {
        const von = interaction.options.getString('von');
        const bis = interaction.options.getString('bis');
        const member = interaction.user;
        const channelId = '877446081036836884'; // Ersetze 'DEIN_KANAL_ID' mit der ID des gewünschten Kanals
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel || channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: '> `❗` » Der angegebene Kanal ist nicht gültig.', ephemeral: true });
        }

        const formatDate = (dateStr) => {
            const [day, month, year] = dateStr.split('-');
            return `${day}.${month}.${year}`;
        };

        const formattedVon = formatDate(von);
        const formattedBis = formatDate(bis);

        const urlaubEmbed = new EmbedBuilder()
            .setTitle('🌴 Urlaubsmeldung')
            .setDescription(`\`📅\` » ${member} hat Urlaub von \`${formattedVon}\` bis \`${formattedBis}\`.`)
            .setColor('Green')
            .setFooter({ text: `${interaction.user.displayName}'s - Urlaub`, iconURL: `${member.displayAvatarURL()}` })
            .setTimestamp();

        await channel.send({ embeds: [urlaubEmbed] });
        await interaction.reply({ content: '> `✅` » Deine Urlaubsmeldung wurde **erfolgreich** gesendet.', ephemeral: true });
    }
}