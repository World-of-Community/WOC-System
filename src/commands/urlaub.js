const { Client, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('urlaub')
        .setDescription('» Teile deinen Urlaub mit. 🌴')
        .addStringOption(option => option.setName('von').setDescription('Startdatum des Urlaubs (YYYY-MM-DD)').setRequired(true))
        .addStringOption(option => option.setName('bis').setDescription('Enddatum des Urlaubs (YYYY-MM-DD)').setRequired(true)),

    async execute(interaction) {
        const von = interaction.options.getString('von');
        const bis = interaction.options.getString('bis');
        const member = interaction.user;
        const channelId = '877446081036836884'; // Ersetze 'DEIN_KANAL_ID' mit der ID des gewünschten Kanals
        const channel = interaction.guild.channels.cache.get(channelId);

        const joinurlaubAt = `<t:${Math.round(member.createdTimestamp / 1000)}>`;
        const endurlaubAt = member.joinedTimestamp ? `<t:${Math.round(member.joinedTimestamp / 1000)}>` : 'N/A';

        if (!channel || channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: '> `❗` » Der angegebene Kanal ist nicht gültig.', ephemeral: true });
        }

        const urlaubEmbed = new EmbedBuilder()
            .setTitle('`🌴` | URLAUBSMELDUNG')
            .setDescription(`> \`📅\` »  ${member} hat nun Urlaub von \`${von}\` (${joinurlaubAt}) bis \`${bis}\` (${endurlaubAt}).`)
            .setColor('Green')
            .setFooter({ text: `${interaction.user.displayName}'s - Urlaub`, iconURL: `${interaction.user.displayAvatarURL()}` });

        await interaction.reply({ embeds: [urlaubEmbed] });
        await interaction.reply({ content: '> `✅` » Deine Urlaubsmeldung wurde **erfolgreich** gesendet.', ephemeral: true });
    }
}