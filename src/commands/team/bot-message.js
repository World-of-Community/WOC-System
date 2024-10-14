const { SlashCommandBuilder, ChannelType, EmbedBuilder, PermissionBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-image')
        .setDescription('» Sende ein Bild mit dem Bot in einen Kanal. 📌')
        .addChannelOption(option =>  option.setName('kanal').setDescription('Der Kanal, in den das Bild gesendet werden soll').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addStringOption(option =>  option.setName('image').setDescription('» URL des Bildes, das hinzugefügt werden soll').setRequired(true))
        .addStringOption(option =>  option.setName('starten_in').setDescription('Wann soll es gesendet werden? (z.B. 10s, 5m, 2h, 1d)').setRequired(false)),

    async execute(interaction, client) {
        const kanal = interaction.options.getChannel('kanal');
        const imageUrl = interaction.options.getString('image');
        const zeit = interaction.options.getString('starten_in');

        let verzögerungInMs;
        
        if (zeit) {

            const zeitwert = parseInt(zeit.slice(0, -1)); // Get the numeric part
            const einheit = zeit.slice(-1); // Get the unit part

            // Calculate delay in milliseconds based on the unit
            switch (einheit) {
                case 's':
                    verzögerungInMs = zeitwert * 1000; // Seconds to milliseconds
                    break;
                case 'm':
                    verzögerungInMs = zeitwert * 60 * 1000; // Minutes to milliseconds
                    break;
                case 'h':
                    verzögerungInMs = zeitwert * 60 * 60 * 1000; // Hours to milliseconds
                    break;
                case 'd':
                    verzögerungInMs = zeitwert * 24 * 60 * 60 * 1000; // Days to milliseconds
                    break;
                default:
                    return interaction.reply({ content: '> `❗` » Bitte gib eine gültige Zeiteinheit an (s, m, h, d).', ephemeral: true });
            }

            // Calculate Unix timestamp (in seconds)
            const timestamp = Math.floor((Date.now() + verzögerungInMs) / 1000);
            await interaction.reply({ content: `> \`📌\` » Das Bild wird in ${zeit} im Kanal ${kanal} gesendet. Geplanter Zeitpunkt: <t:${timestamp}:F> (<t:${timestamp}:R>)`, ephemeral: true });
        } else {
            await interaction.reply({ content: `> \`📌\` » Das Bild wird sofort im Kanal ${kanal} gesendet.`, ephemeral: true });
        }

        // Unix-Timestamp berechnen (in Sekunden)
        const timestamp = Math.floor((Date.now() + verzögerungInMs) / 1000);

        await interaction.reply({ content: `> \`📌\` » Das Bild wird in ${zeit} im Kanal ${kanal} gesendet. Geplanter Zeitpunkt: <t:${timestamp}:F> (<t:${timestamp}:R>)`, ephemeral: true });

        const imageEmbed = new EmbedBuilder()
            .setImage(imageUrl)
            .setColor('Blurple')
            .setFooter({ text: `» ${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` });

        // Plane den Versand des Bildes
        setTimeout(() => {
            kanal.send({ embeds: [imageEmbed] });
        }, verzögerungInMs);
    },
};

