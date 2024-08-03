const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const teamdb = require("../../Datenbank/teamdb");
const serverdb = require("../../Datenbank/serverdb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team-admin')
        .setDescription('Team')
        .addSubcommand((command) =>
            command
                .setName('uprank')
                .setDescription('» Aktualisiere die Rolle eines Teammitgliedes. 🔁')
                .addUserOption(option => option.setName('user').setDescription('» Welcher Benutzer sollte aktualisiert werden?').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('» Auf welche Rolle soll der Benutzer befördert werden?').setRequired(true))
        )
        .addSubcommand((command) =>
            command
                .setName('downrank')
                .setDescription('» Setzt einen Benutzer auf eine niedrigere Rolle. 🔽')
                .addUserOption(option => option.setName('user').setDescription('» Der Benutzer, der herabgestuft werden soll.').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('» Die Rolle, auf die der Benutzer herabgestuft werden soll.').setRequired(true))
        )
        .addSubcommand((command) =>
            command
                .setName('add')
                .setDescription('» Fügt ein neues Teammitglied hinzu. ➕')
                .addUserOption(option => option.setName('user').setDescription('» Welcher User soll eine Team-Rolle bekommen?').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('» Welche Rolle soll der User bekommen?').setRequired(true))
        )
        .addSubcommand((command) =>
            command
                .setName('kick')
                .setDescription('» Entfernt einen Benutzer aus dem Server-Team. ❌')
                .addUserOption(option => option.setName('user').setDescription('» Der Benutzer, der entfernt werden soll.').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('» Die Rolle, die entfernt werden soll.').setRequired(true))
                .addStringOption(option => option.setName('reason').setDescription('» Der Grund für das Entfernen aus dem Team.').setRequired(false))
        )
        .addSubcommand((command) =>
            command
                .setName('plan')
                .setDescription('» Plane ein Meeting 📅')
                .addStringOption(option => option.setName('datum').setDescription('» Datum und Uhrzeit des Meetings (DD.MM.YYYY HH:MM)').setRequired(true))
                .addStringOption(option => option.setName('beschreibung').setDescription('» Beschreibung des Meetings').setRequired(false))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction, client) {
        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        const reason = interaction.options.getString('reason') || 'Kein Grund angegeben';
        const targetChannel = interaction.guild.channels.cache.get('1173986308641804338'); 
        const formattedDate = `<t:${Math.floor(Date.now() / 1000)}:F>`;
        const sub = interaction.options.getSubcommand();
        const teamrole = interaction.guild.roles.cache.get('820658664536145940');

        if (!member || !role || !targetChannel) {
            return interaction.reply('> `❌` » Fehler beim Verarbeiten des Befehls.');
        }
    
        switch (sub) {
            case "uprank":
                try {
                    await member.roles.add(role);
        
                    const Uprankembed = new EmbedBuilder()
                        .setTitle('`🔼` | __TEAMMITGLIED RANGUPDATE__')
                        .setDescription(`> Herzlichen Glückwunsch, ${member}!\n> Du wurdest **befördert!**\n\n**__Rang__**\n${role}`)
                        .setColor('Blurple')
                        .setTimestamp();
                    
                    await targetChannel.send({ content: `${member}`, embeds: [Uprankembed] });
                    await interaction.reply({ content: `> \`✅\` » Das Teammitglied wurde **befördert.**`, ephemeral: true });
                } catch (error) {
                    console.error('Fehler beim Hinzufügen der Rolle:', error);
                    interaction.reply({ content: `> \`❌\` » Es ist ein Fehler aufgetreten.`, ephemeral: true });
                }
                break;
            case "downrank":
                try {
                    await member.roles.remove(role);
        
                    const RangUpdateembed = new EmbedBuilder()
                        .setTitle('`🔽` | __TEAMMITGLIED RANGUPDATE__')
                        .setDescription(`Der Nutzer ${member} wurde **herabgestuft.**\n\n**__Rang__**:\n${role}`)
                        .setColor('Blurple')
                        .setTimestamp();
        
                    targetChannel.send({ embeds: [RangUpdateembed] });
                    await interaction.reply({ content: '> \`✅\` » Das Teammitglied wurde **herabgestuft.**', ephemeral: true });
                } catch (error) {
                    console.error('Fehler beim Herabstufen des Benutzers:', error);
                    interaction.reply({ content: `> \`❌\` » Es ist ein Fehler aufgetreten.`, ephemeral: true });
                }
                break;
                case "add":
                    try {
                        await member.roles.add(role);
                        await member.roles.add(teamrole)

                        const { EmbedBuilder } = require('discord.js');
                        const TeammitgliedEmbed = new EmbedBuilder()
                            .setTitle('`➕` | __NEUES TEAMMITGLIED__')
                            .setColor('Blurple')
                            .setDescription(`> » Wir begrüßen ${member} herzlichst im Team.\n> Wir hoffen auf eine gemeinsame schöne Zeit!\n\n**__Rang__**\n${role}\n\n**__Im Team seit__**\n${formattedDate}`)
                            .setTimestamp();

                        targetChannel.send({ content: `${member}`, embeds: [TeammitgliedEmbed] });
                        await interaction.reply({ content: `> \`✅\` » Ein neues Teammitglied ist nun da.`, ephemeral: true});
                    } catch (error) {
                        console.error('Fehler beim Hinzufügen der Rolle:', error);
                        interaction.reply({ content: `> \`❌\` » Es ist ein Fehler aufgetreten.`, ephemeral: true });
                    }
                break;
                case "kick":
                    try {
                        await member.roles.remove(role);
                        await member.roles.remove(teamrole)

                        const dmEmbed = new EmbedBuilder()
                            .setTitle('`❗` | __DU WURDEST AUS DEM SERVER-TEAM ENTLASSEN__')
                            .setDescription(`Hallo ${member}, Du wurdest aus dem Server-Team entlassen.\n\nGrund: \`${reason}\``)
                            .setColor('Red')
                            .setTimestamp();
            
                        try {
                            await member.send({ embeds: [dmEmbed] });
                        } catch (dmError) {
                            console.error('Fehler beim Senden der DM:', dmError);
                        }
                        const kickEmbed = new EmbedBuilder()
                            .setTitle('`❌` | __TEAMMITGLIED ENTFERNT__')
                            .setDescription(`Der Nutzer ${member} wurde von ${interaction.user.displayName} aus dem Server-Team **Entfernt**.\n\nGrund: \`${reason}\``)
                            .setColor('Red')
                            .setTimestamp();

                        targetChannel.send({ embeds: [kickEmbed] });
                        await interaction.reply({ content: '> \`✅\` » Das Teammitglied wurde aus dem Server-Team **Entfernt.**', ephemeral: true });
                    } catch (error) {
                        console.error('Fehler beim Kicken des Benutzers:', error);
                        interaction.reply({ content: `> \`❌\` » Es ist ein Fehler aufgetreten.`, ephemeral: true });
                    }
                    break;      
            case "plan":
                const dateStr = interaction.options.getString('datum');
                const description = interaction.options.getString('beschreibung') || 'Keine Beschreibung angegeben';

                const [day, month, year, time] = dateStr.split(/[\s.:-]+/);
                const [hour, minute] = time ? time.split(':') : [0, 0];

                const meetingDate = new Date(year, month - 1, day, hour, minute);

                if (isNaN(meetingDate.getTime())) {
                    return interaction.reply({ content: '> `❌` » Bitte gib ein gültiges Datum im Format `DD.MM.YYYY HH:MM` ein.', ephemeral: true });
                }

                const teamData = await serverDB.findOneAndUpdate(
                    { guildID: "815919809379172354"},
                    {
                        $push: {
                            meetings: {
                                date: meetingDate,
                                description
                            }
                        }
                    },
                    { new: true, upsert: true }
                );

                await interaction.reply({ content: '> `✅` » Das Meeting wurde **erfolgreich** geplant.', ephemeral: true });
                break;          
        }
    },
};