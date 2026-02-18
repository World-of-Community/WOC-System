const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const reminders = new Map();

function parseDate(input) {
    const parts = input.split(".");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (!day || !month || !year) return null;
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
        return null;
    return date;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tageszähler')
        .setDescription('Tageszähler mit Live-Countdown')
        .addStringOption(option =>
            option.setName('anfangsdatum')
                .setDescription('Format: DD.MM.YYYY')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('enddatum')
                .setDescription('Format: DD.MM.YYYY')
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
                content: '> `❌` » Bitte benutze das Format: DD.MM.YYYY',
                ephemeral: true
            });
        }

        const startUnix = Math.floor(startDate.getTime() / 1000);
        const endUnix = Math.floor(endDate.getTime() / 1000);

        try {
            // DM einmalig senden
            const dmMessage = await interaction.user.send({
                embeds: [new EmbedBuilder().setTitle('`⏳` Lade Tageszähler…').setColor(0x00AEFF)]
            });

            await interaction.reply({
                content: '> `✅` » Ich habe dir eine DM mit dem Tageszähler geschickt!',
                ephemeral: true
            });

            // Intervall alle Minute
            const intervalId = setInterval(async () => {
                const now = new Date();
                const diffTime = endDate - now; // aktuelle Differenz

                const isFuture = diffTime >= 0;
                const totalMinutes = Math.floor(Math.abs(diffTime) / (1000 * 60));
                const totalHours = Math.floor(totalMinutes / 60);
                const totalDays = Math.floor(totalHours / 24);
                const totalWeeks = Math.floor(totalDays / 7);

                const weeks = Math.floor(totalDays / 7);
                const days = totalDays % 7;
                const hours = totalHours % 24;
                const minutes = totalMinutes % 60;

                const relationText = isFuture
                    ? `> \`🔥\` Noch \`${totalDays}\` Tage bis zum Enddatum`
                    : `> \`⏳\` Seit \`${totalDays}\` Tagen vorbei`;

                const embed = new EmbedBuilder()
                    .setTitle('`📅` Tageszähler – Live-Countdown')
                    .setColor(0x00AEFF)
                    .setDescription(description ? `\`📝\` **Beschreibung:**\n${description}\n\n${relationText}` : relationText)
                    .addFields(
                        { name: '`📆` Anfangsdatum', value: `<t:${startUnix}:F>` },
                        { name: '`📆` Enddatum', value: `<t:${endUnix}:F>` },
                        {
                            name: '`⏳` Exakte Differenz',
                            value: `\`${weeks}\` Wochen\n` +
                                   `\`${days}\` Tage\n` +
                                   `\`${hours}\` Stunden\n` +
                                   `\`${minutes}\` Minuten`
                        },
                        {
                            name: '`📊` Gesamtwerte',
                            value: `\`${totalWeeks}\` Gesamt-Wochen\n` +
                                   `\`${totalDays}\` Gesamt-Tage\n` +
                                   `\`${totalHours}\` Gesamt-Stunden\n` +
                                   `\`${totalMinutes}\` Gesamt-Minuten`
                        }
                    )
                    .setFooter({ text: `Angefragt von ${interaction.user.tag}` })
                    .setTimestamp();

                await dmMessage.edit({ embeds: [embed] });

                // Enddatum erreicht → Erinnerung und Intervall stoppen
                if (!isFuture) {
                    await interaction.user.send({
                        embeds: [new EmbedBuilder()
                            .setTitle('`🔔` Erinnerung!')
                            .setColor(0x00FF00)
                            .setDescription(`Dein Tageszähler ist jetzt erreicht!\n\n📆 <t:${endUnix}:F>`)
                            .setTimestamp()]
                    });

                    clearInterval(intervalId);
                    reminders.delete(interaction.user.id);
                }
            }, 60 * 1000); // jede Minute

            reminders.set(interaction.user.id, intervalId);

        } catch (err) {
            console.error(err);
            await interaction.reply({
                content: '> `❌` » Ich konnte dir keine DM senden. Bitte aktiviere deine Direktnachrichten.',
                ephemeral: true
            });
        }
    }
};