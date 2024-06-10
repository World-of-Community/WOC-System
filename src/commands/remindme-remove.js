const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { reminders } = require('./remindme-create');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remindme-remove')
        .setDescription('» Entfernt eine deiner Erinnerungen. 🗑️')
        .addIntegerOption(option => option.setName('reminder').setDescription('Der Index der zu entfernenden Erinnerung (siehe /remindme-list)').setRequired(true)),

    async execute(interaction) {
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
    },
};
