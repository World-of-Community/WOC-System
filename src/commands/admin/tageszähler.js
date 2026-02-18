const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

function parseDate(input) {
    const parts = input.split(".");
    if (parts.length !== 3) return null;

    const [day, month, year] = parts.map(Number);
    if (!day || !month || !year) return null;

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tageszähler')
        .setDescription('Wandelt zwei Daten (DD.MM.YYYY) in Unix-Timestamps um')
        .addStringOption(option =>
            option.setName('anfangsdatum')
                .setDescription('Format: DD.MM.YYYY (z.B. 18.02.2026)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('enddatum')
                .setDescription('Format: DD.MM.YYYY (z.B. 25.02.2026)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('beschreibung')
                .setDescription('Optionale Beschreibung')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const startInput = interaction.options.getString('anfangsdatum');
        const endInput = interaction.options.getString('enddatum');
        const description = interaction.options.getString('beschreibung');

        const startDate = parseDate(startInput);
        const endDate = parseDate(endInput);

        if (!startDate || !endDate) {
            return interaction.reply({
                content: '> `❌` » Bitte benutze das Format: DD.MM.YYYY (z.B. 18.02.2026)',
                ephemeral: true
            });
        }

        const startUnix = Math.floor(startDate.getTime() / 1000);
        const endUnix = Math.floor(endDate.getTime() / 1000);

        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const embed = new EmbedBuilder()
            .setTitle('`📅` Tageszähler – Tage Zählen')
            .setColor(0x00AEFF)
            .addFields(
                { name: '`📆` Anfangsdatum', value: `<t:${startUnix}:F>\nUnix: \`${startUnix}\`` },
                { name: '`📆` Enddatum', value: `<t:${endUnix}:F>\nUnix: \`${endUnix}\`` },
                { name: '`⏳` Differenz', value: `\`${diffDays}\` Tage` }
            )
            .setFooter({ text: `Angefragt von ${interaction.user.tag}` })
            .setTimestamp();

        if (description) {
            embed.setDescription(`\`📝\` **Beschreibung:**\n${description}`);
        }

        try {
            await interaction.user.send({ embeds: [embed] });

            await interaction.reply({
                content: '> `✅` » Ich habe dir eine DM mit dem Tageszähler geschickt!',
                ephemeral: true
            });

        } catch (err) {
            await interaction.reply({
                content: '> `❌` » Ich konnte dir keine DM senden. Bitte aktiviere deine Direktnachrichten.',
                ephemeral: true
            });
        }
    }
};