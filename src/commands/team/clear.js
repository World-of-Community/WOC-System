const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, PermissionBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('» Lösche eine bestimmte Anzahl von Nachrichten. 🗑️')
        .addIntegerOption(option => option.setName('anzahl').setDescription('» Wie viele Nachrichten möchtest du löschen?').setRequired(true))
        .addChannelOption(option => option.setName('kanal').setDescription('» In welchen Kanal soll gelöscht werden?').setRequired(false))
        .addStringOption(option => option.setName('grund').setDescription('» Wie lautet die Begründung?').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        
        const messagedelete = interaction.options.getInteger('anzahl');
        const kanal = interaction.options.getChannel('kanal') || interaction.channel;
        const grund = interaction.options.getString('grund') || 'Kein Grund angegeben';

        if (messagedelete < 1 || messagedelete > 100) {
            return interaction.reply({ content: '> `❗` » Bitte gib eine Anzahl von Nachrichten zwischen `1 und 100` an.', ephemeral: true });
        }

        // Test

        // Prüfen, ob die Anzahl größer als 0 ist
        //if (messagedelete < 1) {
        //    return interaction.reply({ content: '> `❗` » Bitte gib eine Anzahl von Nachrichten an.', ephemeral: true });
        //}

        //let remainingMessages = messagedelete;

        //while (remainingMessages > 0) {
            // Maximal 100 Nachrichten auf einmal löschen
        //    const deleteCount = Math.min(remainingMessages, 100);

            // Nachrichten löschen
        //    await interaction.channel.bulkDelete(deleteCount, true)
        //        .then(deletedMessages => {
        //            remainingMessages -= deletedMessages.size;
        //        })
        //        .catch(error => {
        //            console.error(error);
        //            return interaction.reply({ content: '> `❗` » Ein Fehler ist beim Löschen der Nachrichten aufgetreten.', ephemeral: true });
        //        });

            // Wenn keine Nachrichten mehr übrig sind, breche die Schleife ab
        //    if (remainingMessages <= 0) {
        //        break;
        //    }
        //}

        // Test

        try {
            const messages = await kanal.bulkDelete(messagedelete, true);
            const infomessagedeleteembed = new EmbedBuilder()
                .setDescription(`> \`✅\` » Es wurden \`${messages.size}\` Nachrichten gelöscht.\n\nHier ist eine Übersicht des Vorgangs:\n- Anzahl: \`${messages.size}\`\n- Kanal: ${kanal}\n- Grund: \`${grund}\``)
                .setColor('Blurple')
                .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
                .setTimestamp();

            await interaction.reply({ embeds: [infomessagedeleteembed], ephemeral: true });
        } catch (error) {
            console.error('Fehler beim Löschen von Nachrichten:', error);
            interaction.reply({ content: '> `❗` » Beim Versuch, Nachrichten zu löschen, ist ein Fehler aufgetreten.', ephemeral: true });
        }
    },
};