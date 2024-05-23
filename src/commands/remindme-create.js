const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const schedule = require('node-schedule');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remindme-create')
        .setDescription('» Erstellt eine Erinnerung. ')
        .addUserOption(option => option.setName('user').setDescription('» Der User der Erinnert werden soll.').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('» Die Zeit (z.B. 10m, 1h)').setRequired(true))
        .addStringOption(option => option.setName('reminder').setDescription('» Die Erinnerung').setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const duration = interaction.options.getString('duration');
        const reminder = interaction.options.getString('reminder');

        const reminderTime = parseDuration(duration);

        if (!reminderTime) {
            return interaction.reply({ content: 'Ungültiges Dauerformat. Bitte verwende "m" für Minuten oder "h" für Stunden (z. B. 10m, 1h)', ephemeral: true });
        }

        const remindEmbed = new EmbedBuilder()
            .setDescription(`Ich werde dich in ${duration} an \`${reminder}\` erinnern.`)
            .setColor('Blurple')
            .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

        await interaction.reply({ embeds: [remindEmbed], ephemeral: true });

        schedule.scheduleJob(Date.now() + reminderTime, async () => {
            const dmEmbed = new EmbedBuilder()
                .setTitle('Hey! Ich sollte dich an etwas erinnern!')
                .setDescription(`Hallo, ${user.displayName}\n\n> Erinnerung: ${reminder}\n\n*📨 Du erhältst diese Direktnachricht, weil du eine Erinnerung erstellt hast.*`)
                .setColor('Blurple')
                .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
                .setTimestamp();

            try {
                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.error(`DM konnte nicht an ${user.username} gesendet werden:`, error);
            }
        });
    },
};

function parseDuration(duration) {
    const match = duration.match(/^(\d+)(m|h)$/);
    if (!match) return null;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    if (unit === 'm') {
        return value * 60 * 1000; // minutes to milliseconds
    } else if (unit === 'h') {
        return value * 60 * 60 * 1000; // hours to milliseconds
    } else if (unit === 'd') {
        return value * 60 * 60 * 60 * 1000; // days to milliseconds
    } else if (unit === 'mo') {
        return value * 60 * 60 * 60 * 60 * 1000; // months to milliseconds
    }

    return null;
}