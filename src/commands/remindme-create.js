const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');
const schedule = require('node-schedule');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remindme-create')
        .setDescription('» Erstellt eine Erinnerung. ⏰')
        .addStringOption(option => option.setName('zeit').setDescription('» Die Zeit (z.B. 10m, 1h)').setRequired(true))
        .addStringOption(option => option.setName('erinnerung').setDescription('» Die Erinnerung').setRequired(true)),

    async execute(interaction) {

        const duration = interaction.options.getString('zeit');

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
            return await interaction.reply({content: `> \`❌\` » Die Dauer konnte nicht verarbeitet werden!`, ephemeral: true})
        }

        var endDate = new Date(new Date().getTime() + durationDauer); 

        const timestamp = Math.floor(endDate / 1000); 

        const reminder = interaction.options.getString('erinnerung');

        const remindEmbed = new EmbedBuilder()
            .setTitle('Du hast eine Erinnerung erstellt')
            .setDescription(`\`⏰\` » Ich werde dich <t:${timestamp}:R> an \`${reminder}\` erinnern.`)
            .setColor('Blurple')
            .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

        await interaction.reply({ embeds: [remindEmbed], ephemeral: true });

        schedule.scheduleJob(endDate, async () => {
            const user = interaction.user; // Benutzer festlegen

                const dmEmbed = new EmbedBuilder()
                .setTitle('Hey! Ich sollte dich an etwas erinnern!')
                .setDescription(`Hallo, ${user}\n\n> Erinnerung: **${reminder}**\n\n*📨 Du erhältst diese Direktnachricht, weil du eine Erinnerung erstellt hast.*`)
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