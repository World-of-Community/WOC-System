const { SlashCommandBuilder, PermissionBitField } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event-info')
        .setDescription('» Sende eine Info Event Nachricht. 💬')
        .addChannelOption(option => option.setName('kanal').setDescription('Der Kanal, in den die Nachricht gesendet werden soll').setRequired(true))
        .addStringOption(option => option.setName('nachricht').setDescription('Die Nachricht, die gesendet werden soll').setRequired(true))
        .addStringOption(option => option.setName('starten').setDescription('Wann soll die Nachricht gesendet werden? (z.B. 5s, 10m, 1h)').setRequired(false)),
    
    async execute(interaction) {
        const channel = interaction.options.getChannel('kanal');
        const message = interaction.options.getString('nachricht');
        const time = interaction.options.getString('starten');

        // Check permissions
        if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionBitField.Flags.SendMessages)) {
            return await interaction.reply({ content: '> `❌` » Ich habe keine Berechtigung, in diesem Kanal zu senden.', ephemeral: true });
        }

        const timeMs = ms(time);
        if (!timeMs) {
            return await interaction.reply({ content: '> `❌` » Bitte gib eine gültige Zeit für die Verzögerung ein (z.B. 10s, 5m, 1h).', ephemeral: true });
        }

        const endDate = new Date(Date.now() + timeMs);
        const timestamp = Math.floor(endDate / 1000);

        await interaction.reply({ content: `> \`⏳\` » Die Nachricht wird <t:${timestamp}:R> gesendet.`, ephemeral: true });

        setTimeout(async () => {
            try {
                await channel.send(message);
                await interaction.editReply({ content: `> \`✅\` » Die Nachricht wurde erfolgreich gesendet.`, ephemeral: true });
            } catch (error) {
                console.error('Fehler beim Senden der Nachricht:', error);
                await interaction.editReply({ content: '> `❌` » Ein Fehler ist beim Senden der Nachricht aufgetreten.', ephemeral: true });
            }
        }, timeMs);
    },
};
