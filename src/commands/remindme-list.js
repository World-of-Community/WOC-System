const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const reminders = require('./remindme-create').reminders;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remindme-list')
        .setDescription('» Listet alle deine Erinnerungen auf. 📋'),

    async execute(interaction) {
        const userId = interaction.user.id;

        if (!reminders.get(userId) || reminders.get(userId).length === 0) {
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
    },
};