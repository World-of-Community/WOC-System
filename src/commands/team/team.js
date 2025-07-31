const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionBitField } = require('discord.js');
const teamdb = require("../../../Datenbank/teamdb");
const serverdb = require("../../../Datenbank/serverdb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team')
        .setDescription('Team')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand((command) =>
            command
                .setName('urlaub')
                .setDescription('» Teile deinen Urlaub mit. 🌴')
                .addStringOption(option => option.setName('von').setDescription('Startdatum des Urlaubs (DD.MM.YYYY)').setRequired(true))
                .addStringOption(option => option.setName('bis').setDescription('Enddatum des Urlaubs (DD.MM.YYYY)').setRequired(true))
                .addStringOption(option => option.setName('grund').setDescription('Grund des Urlaubs').setRequired(false))
        )
        .addSubcommand((command) =>
            command
                .setName('plan')
                .setDescription('» Plane ein Meeting 📅')
                .addStringOption(option => option.setName('datum').setDescription('» Datum und Uhrzeit des Meetings (DD.MM.YYYY HH:MM)').setRequired(true))
                .addStringOption(option => option.setName('beschreibung').setDescription('» Beschreibung des Meetings').setRequired(false))
        )
        .addSubcommand((command) =>
            command
                .setName('meeting')
                .setDescription('» Schau nach wann die Nächste Team-Besprechung stattfindet. 📣')
        )
        .addSubcommand((command) =>
            command
                .setName('help')
                .setDescription('» Zeigt dir alle Team-Befehle an. 🎯')
        ),
    
    async execute(interaction, client) {
        const targetChannel = interaction.guild.channels.cache.get('877446081036836884'); 
        const sub = interaction.options.getSubcommand();
        const grund = interaction.options.getString('grund') || 'Kein Grund angegeben';

        if (!targetChannel) {
            return interaction.reply('> `❌` » Fehler beim Verarbeiten des Befehls.');
        }

        switch (sub) {
            case "urlaub":
                const vonStr = interaction.options.getString('von');
                const bisStr = interaction.options.getString('bis');

                const convertDate = (dateStr) => {
                    const [day, month, year] = dateStr.split('.').map(Number);
                    return `${year}-${month}-${day}`;
                };

                const formattedVon = convertDate(vonStr);
                const formattedBis = convertDate(bisStr);

                if (!formattedVon || !formattedBis) {
                    return interaction.reply({ content: '> `❌` » Bitte gib gültige Daten im Format `DD.MM.YYYY` ein.', ephemeral: true });
                }

                const vonDate = new Date(formattedVon);
                const bisDate = new Date(formattedBis);

                if (vonDate > bisDate) {
                    return interaction.reply({ content: '> `❌` » Das Enddatum muss nach dem Startdatum liegen.', ephemeral: true });
                }

                const teamData = await teamdb.findOneAndUpdate(
                    { userID: interaction.user.id },
                    {
                        $set: {
                            'urlaub.beginn': formattedVon,
                            'urlaub.ende': formattedBis,
                            'urlaub.grund': grund,
                            'urlaub.messageID': null
                        },
                        $inc: { 'counter.urlaub': 1 } 
                    },
                    { new: true, upsert: true }
                );

                const urlaubEmbed = new EmbedBuilder()
                    .setTitle('🌴 Urlaubsmeldung')
                    .setDescription(`\`📅\` ${interaction.user} hat Urlaub von \`${vonStr}\` bis \`${bisStr}\`.\n\n\`📋\` Grund: \`${grund}\``)
                    .setColor('Green')
                    .setFooter({ text: `${interaction.user.username}'s Urlaub`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                const message = await targetChannel.send({ embeds: [urlaubEmbed] });
                teamData.urlaub.messageID = message.id;
                await teamData.save();

                await interaction.reply({ content: '> `✅` » Deine Urlaubsmeldung wurde **erfolgreich** gesendet.', ephemeral: true });
                break;

                case 'plan': {
                    const dateStr = interaction.options.getString('datum');
                    const description = interaction.options.getString('beschreibung') || 'Keine Beschreibung angegeben';

                    const datePattern = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/;
                        const match = dateStr.match(datePattern);
                    
                        if (!match) {
                            return interaction.reply({ content: '> `❌` » Bitte gib das Datum im Format `DD.MM.YYYY HH:MM` ein.', ephemeral: true });
                        }
                    
                        const [_, day, month, year, hour, minute] = match;
                    
                        // Erstelle das Meeting-Datum in UTC
                        const meetingDateUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));

                        // Überprüfe die Gültigkeit des Datums
                        if (isNaN(meetingDateUTC.getTime())) {
                            return interaction.reply({ content: '> `❌` » Das Datum scheint ungültig zu sein. Bitte überprüfe deine Eingabe.', ephemeral: true });
                        }
                    
                        // Speichern des Meetings in der Datenbank
                        try {
                            const teamDataMeeting =await serverdb.findOneAndUpdate(
                                { guildID: "815919809379172354" },
                                {
                                    $push: {
                                        meetings: {
                                            date: meetingDateUTC,
                                            description: description,
                                            reminders: [],
                                            attendees: [],
                                            nonAttendees: [],
                                            messageID: null,
                                        }
                                    }
                                },
                                { new: true, upsert: true }
                            );
                    
                            await interaction.reply({ content: '> `✅` » Das Meeting wurde **erfolgreich** geplant.', ephemeral: true });

                            const localDate = new Date(meetingDateUTC.getTime() - meetingDateUTC.getTimezoneOffset() * 60000);
                            const dayName = days[localDate.getDay()];
                            const day = localDate.getDate().toString().padStart(2, '0');
                            const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
                            const year = localDate.getFullYear();
                            const hour = localDate.getHours().toString().padStart(2, '0');
                            const minute = localDate.getMinutes().toString().padStart(2, '0');

                            const TeamMeetingEmbed = new EmbedBuilder()
                            .setTitle('`📅` » Eine Team-Besprechung wurde geplant.')
                            .setDescription(`> **Datum:** ${dayName}, ${day}.${month}.${year} ${hour}:${minute}\n> **Beschreibung:** ${description}`)

                            const remindMeButton = new ButtonBuilder()
                                .setCustomId('remindMe')
                                .setLabel('🕒 Remind Me')
                                .setStyle(ButtonStyle.Primary);
                    
                            const attendButton = new ButtonBuilder()
                                .setCustomId('attend')
                                .setLabel('✅ Teilnehmen')
                                .setStyle(ButtonStyle.Success);
                    
                            const declineButton = new ButtonBuilder()
                                .setCustomId('decline')
                                .setLabel('❌ Nicht Teilnehmen')
                                .setStyle(ButtonStyle.Secondary);

                            const listButton = new ButtonBuilder()
                                .setCustomId('list')
                                .setLabel('📋 Teilnehmerliste')
                                .setStyle(ButtonStyle.Secondary);
                
                        const row = new ActionRowBuilder().addComponents(remindMeButton, attendButton, declineButton, listButton);
                
                        const meetingMessage = await targetChannel2.send({ embeds: [TeamMeetingEmbed], components: [row] });

                        const meetingIndex = teamDataMeeting.meetings.length - 1;
                        teamDataMeeting.meetings[meetingIndex].messageID = meetingMessage.id;
                
                        await teamDataMeeting.save();

                        const reminderDate = new Date(meetingDateUTC.getTime() - 10 * 60000);
                        const deleteDate = new Date(meetingDateUTC.getTime() + 60000); 
                
                        schedule.scheduleJob(reminderDate, () => {
                            remindUsers(client, meetingDateUTC);
                        });
    
                        schedule.scheduleJob(deleteDate, () => {
                            deleteMeetingMessage(client, meetingDateUTC);
                        });
    
                        } catch (error) {
                            console.error('Fehler beim Speichern des Meetings:', error);
                            await interaction.reply({ content: '> `❌` » Es ist ein Fehler beim Planen des Meetings aufgetreten.', ephemeral: true });
                        }  
                        break;
                }

                case 'meeting': {
                    const serverData = await serverdb.findOne({ guildID: "815919809379172354" });
    
                    if (!serverData || !serverData.meetings || serverData.meetings.length === 0) {
                        return interaction.reply({ content: '> `❌` » Derzeit ist keine Team-Besprechung geplant.', ephemeral: true });
                    }
    
                    const sortedMeetings = serverData.meetings.sort((a, b) => a.date - b.date);

                    const embed = new EmbedBuilder()
                        .setTitle('`📅` Geplante Team-Besprechungen')
                        .setColor('Blurple')
                        .setTimestamp();
            
                    sortedMeetings.forEach(meeting => {

                        const utcDate = new Date(meeting.date.toISOString());
                        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' };
                        const formattedDate = utcDate.toLocaleString('de-DE', options);

                        embed.addFields({
                            name: `> Besprechung am: \`${formattedDate}\``,
                            value: `➥ ${meeting.description}`,
                            inline: false
                        });
                    });
    
                    await interaction.reply({ embeds: [embed], ephemeral: true });  
                } 
                break;

                case 'help': {
                    const TeamHelpEmbed = new EmbedBuilder()
                        .setTitle('`🎯` » Team Befehle Information')
                        .setDescription('> Hier sind die Wichtigsten Befehle von <@1020023299448786955> aufgelistet für das **Server-Team**\n\n- `/clear <anzahl> (Optional) <kanal> <grund>`\n» Löscht eine Anzahl an Nachrichten.\n\n- `/message <user> <nachricht> (Optional) <image>`\n» Sendet einen Nutzer eine Nachricht.\n\n- `/ban <user> <grund> (Optional) <dauer>`\n» Schickt einen Nutzer in den **Bann-Bereich**.\n> `📋` » Text Gründe:\n➥ `An Verdächtiger Spam Aktivität beteiligt`\n➥ `Verdächtiger oder Spam Account`\n➥ `Gefährdeter oder Gehackter Account`\n➥ `Gegen Serverregeln verstoßen`\n\n- `/unban <user> <grund>`\n» Entbannt einen Nutzer aus dem **Bann-Bereich**.\n\n- `/unban-info`\n» Sendet Informationen zur Entbannung.\n\n- `/warn <user> <grund>`\n» Warnt einen Nutzer per Direktnachricht (DM)\n\n- `/event-info <kanal> <nachricht> (Optional) <starten>`\n» Sendet eine Event-Nachricht.\n\n- `/timeout <user> <grund> <dauer>`\n» Gebe einem User eine Auszeit.\n\n- `/user-find`\n» Findet einen Benutzer anhand seiner ID.\n\n- `/user-list`\n» Listet alle Mitglieder des Servers mit ID auf (20 pro Seite).\n\n- `/rewardinfo`\n» Zeigt die Belohnungen mit Wahrscheinlichkeiten 🎁\n\n- `/info <rolle>`\n» Zeigt an welche Nutzer die bestimmte Rolle besitzen.\n\n- `/info-bewerbung`\n» Sendet eine Info zur Bewerbung\n\n- `/userinfo`\n» Rufe Informationen über einen User ab.\n\n- `/vorschlag`\n» Verwalte einen Vorschlag in <#1254340245772701747>\n\n- `/partner add/edit/remove`\n» Verwalte das Partner System')
                        .setColor('Orange')
                        .setFooter({ text: `${interaction.guild.name} - Team Befehle`, iconURL: `${interaction.guild.iconURL()}` })
                        .setTimestamp();

                    await interaction.reply({ embeds: [TeamHelpEmbed], ephemeral: true })
                }
        }
    },
};
