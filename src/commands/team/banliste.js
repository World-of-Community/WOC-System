const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const bandb = require("../../../Datenbank/bandb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banliste')
        .setDescription('» Zeigt dir die Bannliste an. 📋')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {

        async function getMemberList(roleID) {
            const list = [];
            const role = interaction.guild.roles.cache.find((r) => r.id === roleID);
            if (!role) {
                console.log("Rolle nicht gefunden.");
                return list; // Leere Liste zurückgeben, falls die Rolle nicht existiert
            }

            const roleMembers = role.members;
            for (const member of roleMembers.values()) {
                try {
                    const banData = await bandb.findOne({ user: member.id });
                    list.push(
                        `${member} - ${member.user.username} (${banData?.reason || 'Kein Grund angegeben'})`
                    );
                } catch (error) {
                    console.error(`Fehler beim Abrufen der Bann-Daten für ${member.user.tag}: ${error.message}`);
                }
            }

            return list;
        }

        const gebannt = interaction.guild.roles.cache.get('886989738244964362');
        if (!gebannt) {
            return interaction.reply({
                content: "> `❌` » Die Rolle für gebannte Nutzer wurde nicht gefunden.",
                ephemeral: true,
            });
        }

        const roleCountg = gebannt.members.size;
        const bans = await getMemberList(gebannt.id);

        const currentTime = new Date(); // Aktuelle Zeit abrufen
        const formattedTime = currentTime.toLocaleDateString('de-DE', {
            weekday: 'long',   // Montag, Dienstag etc.
            day: '2-digit',    // 01, 02, 03 ...
            month: 'long',     // Januar, Februar etc.
            year: 'numeric',   // 2025
        });

        const bannembed = new EmbedBuilder()
            .setTitle('Information zu den Gebannten Nutzern')
            .setDescription(`Hier ist eine Liste der gebannten Nutzer (\`${bans.length}👥\`):\n\n${bans.length > 0 ? bans.join("\n") : "Keine Bans vorhanden!"}`)
            .setColor('Red')
            .setFooter({ text: `» Bann System - Aktualisiert am: ${formattedTime}`, iconURL: `${interaction.guild.iconURL()}` });

        await interaction.channel.send({ embeds: [bannembed] });
        await interaction.reply({ content: "> `✅` » Das Embed wurde gesendet.", ephemeral: true });
    },
};
