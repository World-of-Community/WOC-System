const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ms = require('ms');
const schedule = require('node-schedule');

const reminders = new Map(); 

module.exports = {
   data: new SlashCommandBuilder()
      .setName('remindme')
      .setDescription('Remindme')
      .addSubcommand((command) =>
        command
            .setName('create')
            .setDescription('» Erstellt eine Erinnerung. ⏰')
            .addStringOption(option => option.setName('zeit').setDescription('» Die Zeit (z.B. 10m, 1h)').setRequired(true))
            .addStringOption(option => option.setName('erinnerung').setDescription('» Die Erinnerung').setRequired(true)),
    )
    .addSubcommand((command) =>
        command
            .setName('list')
            .setDescription('» Listet alle deine Erinnerungen auf. 📋'),
    )
    .addSubcommand((command) =>
        command
            .setName('remove')
            .setDescription('» Entfernt eine deiner Erinnerungen. 🗑️')
            .addIntegerOption(option => option.setName('reminder').setDescription('Der Index der zu entfernenden Erinnerung (siehe /remindme-list)').setRequired(true)),
    ),

async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
        case "create":
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
    
                const userReminders = reminders.get(userId).filter(r => r.timestamp !== timestamp);
                reminders.set(userId, userReminders);
            });
            break;

        case "list":
            const userId = interaction.user.id;

            if (!reminders.has(userId) || reminders.get(userId).length === 0) {
                return await interaction.reply({ content: '> `❌` » Du hast keine Erinnerungen gesetzt.', ephemeral: true });
            }
    
            const userReminders = reminders.get(userId);
            const reminderList = userReminders.map((reminder, index) => 
                `${index + 1}. **${reminder.reminder}** - <t:${reminder.timestamp}:R>`
            ).join('\n');
    
            const listEmbed = new EmbedBuilder()
                .setTitle('Deine Erinnerungen')
                .setDescription(reminderList)
                .setColor('Blurple')
                .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
                .setTimestamp();
    
            await interaction.reply({ embeds: [listEmbed], ephemeral: true });
            break;

        case "remove":
            const userId = interaction.user.id;
            const index = interaction.options.getInteger('reminder') - 1;
    
            if (!reminders.has(userId) || reminders.get(userId).length === 0) {
                return await interaction.reply({ content: '> `❌` » Du hast keine Erinnerungen gesetzt.', ephemeral: true });
            }
    
            const userReminders = reminders.get(userId);
    
            if (index < 0 || index >= userReminders.length) {
                return await interaction.reply({ content: 'Ungültiger Index. Bitte überprüfe die Liste deiner Erinnerungen.', ephemeral: true });
            }
    
            const removedReminder = userReminders.splice(index, 1)[0];
    
            reminders.set(userId, userReminders);
    
            const removeEmbed = new EmbedBuilder()
                .setTitle('Erinnerung entfernt')
                .setDescription(`\`🗑️\` » Die Erinnerung **${removedReminder.reminder}** wurde **entfernt**.`)
                .setColor('Red')
                .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
                .setTimestamp();
    
            await interaction.reply({ embeds: [removeEmbed], ephemeral: true });
            break;
    }
},
};