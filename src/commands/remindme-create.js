const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');
const schedule = require('node-schedule');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remindme-create')
        .setDescription('» Erstellt eine Erinnerung. ')
        .addUserOption(option => option.setName('user').setDescription('» Der User der Erinnert werden soll.').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('» Die Zeit (z.B. 10m, 1h)').setRequired(true))
        .addStringOption(option => option.setName('reminder').setDescription('» Die Erinnerung').setRequired(true)),

    async execute(interaction) {
        const member = interaction.options.getUser('user');
        const duration = interaction.options.getString('duration');

        var list = duration.split(" ");
        var durationDauer = 0;
        list.forEach(async element => {
            try {
                durationDauer += ms(element)
            }
            catch (error) {
                console.log(error)
            }
        });
        if (durationDauer !== durationDauer) {
            return await interaction.reply("Dauer konnte nicht verarbeitet werden!")
        }

        var endDate = new Date(new Date().getTime() + durationDauer); // Berechne das Enddatum

        const timestamp = Math.floor(endDate / 1000); // Generiere Timestamp für Discord

        const reminder = interaction.options.getString('reminder');

        const remindEmbed = new EmbedBuilder()
            .setTitle('Du hast eine Erinnerung erstellt')
            .setDescription(`\`⏰\` » Ich werde dich <t:${timestamp}:R> an \`${reminder}\` erinnern.`)
            .setColor('Blurple')
            .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

        await interaction.reply({ embeds: [remindEmbed], ephemeral: true });

        schedule.scheduleJob(endDate, async () => {
            const dmEmbed = new EmbedBuilder()
                .setTitle('Hey! Ich sollte dich an etwas erinnern!')
                .setDescription(`Hallo, ${member}\n\n> Erinnerung: **${reminder}**\n\n*📨 Du erhältst diese Direktnachricht, weil du eine Erinnerung erstellt hast.*`)
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