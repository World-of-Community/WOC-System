//const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
//const bandb = require("../../../Datenbank/bandb");
//
//module.exports = {
//    data: new SlashCommandBuilder()
//        .setName('banliste')
//        .setDescription('» Zeigt dir die Bannliste an. 📋')
//        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
//
//    async execute(interaction) {
//
//        async function getMemberList(roleID) {
//            const list = [];
//            const role = interaction.guild.roles.cache.find((r) => r.id === roleID);
//            if (!role) {
//                console.log("Rolle nicht gefunden.");
//                return list; // Leere Liste zurückgeben, falls die Rolle nicht existiert
//            }
//
//            const roleMembers = role.members;
//            for (const member of roleMembers.values()) {
//                try {
//                    const banData = await bandb.findOne({ user: member.id });
//                    list.push(
//                        `${member} - ${member.user.username} (${banData?.reason || 'Kein Grund angegeben'})`
//                    );
//                } catch (error) {
//                    console.error(`Fehler beim Abrufen der Bann-Daten für ${member.user.tag}: ${error.message}`);
//                }
//            }
//
//            return list;
//        }
//
//        const gebannt = interaction.guild.roles.cache.get('886989738244964362');
//        if (!gebannt) {
//            return interaction.reply({
//                content: "> `❌` » Die Rolle für gebannte Nutzer wurde nicht gefunden.",
//                ephemeral: true,
//            });
//        }
//
//        const roleCountg = gebannt.members.size;
//        const bans = await getMemberList(gebannt.id);
//
//        const currentTime = new Date(); // Aktuelle Zeit abrufen
//        const formattedTime = currentTime.toLocaleDateString('de-DE', {
//            weekday: 'long',   // Montag, Dienstag etc.
//            day: '2-digit',    // 01, 02, 03 ...
//            month: 'long',     // Januar, Februar etc.
//            year: 'numeric',   // 2025
//        });
//
//        const bannembed = new EmbedBuilder()
//            .setTitle('Information zu den Gebannten Nutzern')
//            .setDescription(`Hier ist eine Liste der gebannten Nutzer (\`${bans.length}👥\`):\n\n${bans.length > 0 ? bans.join("\n") : "Keine Bans vorhanden!"}`)
//            .setColor('Red')
//            .setFooter({ text: `» Bann System - Aktualisiert am: ${formattedTime}`, iconURL: `${interaction.guild.iconURL()}` });
//
//        await interaction.channel.send({ embeds: [bannembed] });
//        await interaction.reply({ content: "> `✅` » Das Embed wurde gesendet.", ephemeral: true });
//    },
//};

//

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const bandb = require("../../../Datenbank/bandb");

const BANLISTE_MESSAGE_ID = "1298680434347081730"; // Falls du es automatisch speichern willst, sag Bescheid!

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banliste')
        .setDescription('» Zeigt dir die Bannliste an. 📋')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const gebannt = interaction.guild.roles.cache.get('886989738244964362');
        if (!gebannt) {
            return interaction.reply({
                content: "> `❌` » Die Rolle für gebannte Nutzer wurde nicht gefunden.",
                ephemeral: true,
            });
        }

        // Schnelle Antwort senden
        await interaction.reply({ content: "> `🔄` » Lade Bannliste...", ephemeral: true });

        const bans = await Promise.all(
            gebannt.members.map(async (member) => {
                try {
                    const banData = await bandb.findOne({ user: member.id });
                    return `${member} - ${member.user.username} (\`${banData?.reason || 'Kein Grund angegeben'}\`)`;
                } catch (error) {
                    console.error(`Fehler beim Abrufen der Bann-Daten für ${member.user.tag}: ${error.message}`);
                    return `${member} - ${member.user.username} (Fehler beim Laden)`;
                }
            })
        );

        const currentTime = new Date().toLocaleDateString('de-DE', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });

        const bannembed = new EmbedBuilder()
            .setTitle('Information zu den Gebannten Nutzern')
            .setDescription(`Hier ist eine Liste der gebannten Nutzer\n> \`⛔\` 𑁉 <@&886989738244964362> (\`${bans.length}👥\`):\n\n${bans.length > 0 ? bans.join("\n") : "Keine Bans vorhanden!"}`)
            .setColor('Red')
            .setFooter({ text: `» Bann System - Aktualisiert am: ${currentTime}`, iconURL: interaction.guild.iconURL() });

        try {
            const message = await interaction.channel.messages.fetch(BANLISTE_MESSAGE_ID);
            if (message) {
                await message.edit({ embeds: [bannembed] });
                await interaction.editReply({ content: "> `✅` » Die Bannliste wurde aktualisiert." });
            }
        } catch (error) {
            console.log("Banliste-Nachricht nicht gefunden oder gelöscht. Erstelle eine neue...");
            const newMessage = await interaction.channel.send({ embeds: [bannembed] });
            await interaction.editReply({ content: "> `✅` » Die Bannliste wurde erstellt." });

            console.log(`Neue Banliste-ID: ${newMessage.id}`);
        }
    },
};
