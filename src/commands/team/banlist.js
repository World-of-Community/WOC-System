const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionBitField } = require("discord.js");
const fs = require('fs');
const bandb = require("../../../Datenbank/bandb");

// Folgende Punkte abarbeiten
// Nutzer untereinander auflisten hinter den Namen in klammern also @User (Test) den banngrund wenn man bei /ban command ausführt
// Embed aktualiseren (bearbeiten) sobald man jemanden bannt

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banliste')
        .setDescription('» Zeigt dir die Bannliste an. 📋')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {

        async function getMemberList(roleID) {
            var list = [];
            const bans = await interaction.guild.bans.fetch();
            const role = interaction.guild.roles.cache.find((r) => r.id === roleID);
            const rolemember = role.members

            rolemember.forEach(async member => {
                try {
                    const banData = await bandb.findOne({ user: member.id })
                    list.push(`${member.username} - ${member.displayName} (${member}) (${banData.reason})`)
                } catch (error) {
                    console.log(error.message)
                }

            });
            console.log(list)
            return list;
        }

        const gebannt = await interaction.guild.roles.cache.get('886989738244964362')
        const roleCountg = gebannt.members.size

        const bans = await getMemberList(gebannt.id)
        console.log(bans)
        
        const bannembed = new EmbedBuilder()
            .setTitle('Information zu den Gebannten Nutzern')
            .setDescription(`Hier ist eine Liste der gebannten Nutzer (\`${bans.length}👥\`)\n\n${bans.length > 0 ? bans.join("\n") : "Keine Bans vorhanden!"}`)
            .setColor('Red')

        await interaction.channel.send({ embeds: [bannembed] })
        await interaction.reply({content: "> `✅` » Das Embed wurde gesendet.", ephemeral: true})
    }
}