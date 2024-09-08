const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const warndb = require("../../../Datenbank/warndb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnlist')
        .setDescription('» Zeigt dir die Warnliste an. 📋')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction)  {

        // Warnungen aus der Datenbank abrufen
        const warnings = await Warning.find({ guildId: interaction.guild.id });

        if (warnings.length === 0) {
            return interaction.reply('Keine Warnungen vorhanden.');
        }

        // Warnliste formatieren
        let list = 'Warnliste:\n';
        warnings.forEach(({ userId, warnings }) => {
            list += `<@${userId}>: \`${warnings.length}\` Warnung(en)\n`;
        });

        const WarnEmbed = new EmbedBuilder()
            .setTitle('Information zu den Warnungen der Nutzer')
            .setDescription(`Hier ist eine Liste der Warnungen der Nutzer \n\n ${bans.length > 0 ? bans.join("\n") : "Keine Warnungen vorhanden!"}`)
            .setColor('Red')

        await interaction.channel.send({ embeds: [WarnEmbed] })
        await interaction.reply({ content: "> `✅` » Das Warn-Embed wurde gesendet.", ephemeral: true })
    }
}