const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const warndb = require("../../../Datenbank/warndb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnlist')
        .setDescription('» Zeigt dir die Warnliste an. 📋')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction)  {

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: '`❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.', ephemeral: true });
        }

        // Fetch all warning data for the guild
        let warnings = await warndb.find({ guildId: interaction.guild.id });

        // Warnliste formatieren
        let list = 'Warnliste:\n';
        warnings.forEach(({ userId, warnings }) => {
            list += `<@${userId}>: \`${warnings.length}\` Warnung(en)\n`;
        });

        const WarnEmbed = new EmbedBuilder()
            .setTitle('Information zu den Warnungen der Nutzer')
            .setDescription(warnings.length > 0 ? list : "> `❌` » Keine Warnungen vorhanden!")
            .setColor('Red');

        // Send the embed to the channel
        await interaction.channel.send({ embeds: [WarnEmbed] });
        await interaction.reply({ content: "> `✅` » Das Warn-Embed wurde gesendet.", ephemeral: true });
    }
};