const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const warndb = require("../../../Datenbank/warndb");
const { getWarnlistEmbed } = require('../../../functions/warn');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnlist')
        .setDescription('» Zeigt dir die Warnliste an. 📋')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction)  {

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: '`❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.', ephemeral: true });
        }

        const WarnEmbed = await getWarnlistEmbed(interaction);

        // Send the embed to the channel
        await interaction.channel.send({ embeds: [WarnEmbed] });
        await interaction.reply({ content: "> `✅` » Das Warn-Embed wurde gesendet.", ephemeral: true });
    }
};