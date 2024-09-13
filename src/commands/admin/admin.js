const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const teamdb = require("../../../Datenbank/teamdb");
const serverdb = require("../../../Datenbank/serverdb");
const schedule = require('node-schedule');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
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
        .addSubcommand((command) =>
            command
                .setName('aktivieren')
                .setDescription('» Aktiviere eine Funktion. 🟢')
                .addStringOption(option => option.setName('system').setDescription('» Welches System soll aktiviert werden?').setRequired(true)
                .addChoices({ name: 'Changelog', value: 'changelog' }, { name: 'Spielersuche', value: 'spielersuche' }, { name: 'Vorschläge', value: 'vorschläge' }, { name: 'Willkommensnachrichten', value: 'willkommensnachrichten' }))
        )
        .addSubcommand((command) =>
            command
                .setName('deaktivieren')
                .setDescription('» Deaktiviere eine Funktion. 🔴')
                .addStringOption(option => option.setName('system').setDescription('» Welches System soll deaktiviert werden?').setRequired(true)
                .addChoices({ name: 'Changelog', value: 'changelog' }, { name: 'Spielersuche', value: 'spielersuche' }, { name: 'Vorschläge', value: 'vorschläge' }, { name: 'Willkommensnachrichten', value: 'willkommensnachrichten' }))
        )
        .addSubcommand((command) =>
            command
                .setName('donate')
                .setDescription('» Füge den Betrag der Spende an einem User hinzu. 💸')
                .addUserOption(option => option.setName('user').setDescription('» Wähle einen Benutzer aus, der die Spende erhalten soll.').setRequired(true))
                .addIntegerOption(option => option.setName('amount').setDescription('» Gib den Betrag der Spende ein.').setMinValue(1).setRequired(true))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        const reason = interaction.options.getString('reason') || 'Kein Grund angegeben';
        const targetChannel = interaction.guild.channels.cache.get('1173986308641804338'); 
        const targetChannel2 = interaction.guild.channels.cache.get('877446081036836884'); 
        const formattedDate = `<t:${Math.floor(Date.now() / 1000)}:F>`;
        const sub = interaction.options.getSubcommand();
        const teamrole = interaction.guild.roles.cache.get('820658664536145940');
    
        switch (sub) {
            case "uprank":
                try {
                    // Definiere die alten und neuen Rollengruppen (zum Beispiel Teamrollen)
                    const teamRoles = [
                        '959869691529154631', // Admin
                        '893423428558782465', // Team-Leitung
                        '929349039433056276', // Developer
                        '838840742742458368', // T-Developer
                        '816985466230145044', // Sr-Moderator
                        '815920052385480754', // Moderator
                        '815920170371383366', // Supporter
                        '1155564692455034990', // T-Supporter
                        '1263645368441241700', // Builder
                    ]; // IDs der Teamrollen
                    const currentRoles = member.roles.cache; // Aktuelle Rollen des Nutzers
                
                    // Finde die alte Rolle (eine, die der Nutzer derzeit hat und in den Teamrollen vorkommt)
                    const alteRolle = currentRoles.find(r => teamRoles.includes(r.id));
                
                    // Logik zur Festlegung der neuen Rolle (zum Beispiel die nächst höhere Rolle)
                    let neueRolle;
                    if (alteRolle) {
                        const alteRolleIndex = teamRoles.indexOf(alteRolle.id);
                        if (alteRolleIndex < teamRoles.length - 1) {
                            neueRolle = teamRoles[alteRolleIndex + 1]; // Wähle die nächst höhere Rolle
                        }
                    }
                
                    if (!neueRolle) {
                        return interaction.reply({ content: '> `❌` » Es konnte keine passende Rolle für die Beförderung gefunden werden.', ephemeral: true });
                    }
                
                    const neueRolleObjekt = interaction.guild.roles.cache.get(neueRolle);
                
                    // Alte Rolle entfernen, falls vorhanden
                    if (alteRolle) {
                        await member.roles.remove(alteRolle);
                    }
                
                    // Neue Rolle hinzufügen
                    await member.roles.add(neueRolleObjekt);
                
                    // Embed für das Rollenupdate
                    const Uprankembed = new EmbedBuilder()
                        .setTitle('`🔼` | __TEAMMITGLIED RANGUPDATE__')
                        .setDescription(`> Herzlichen Glückwunsch, ${member}!\n> Du wurdest **befördert!**\n\n**__Neuer Rang__**: ${neueRolleObjekt}\n**__Alter Rang__**: ${alteRolle ? alteRolle : 'Keine'}`)
                        .setColor('Blurple')
                        .setTimestamp();
                
                    // Nachricht im Zielkanal senden
                    await targetChannel.send({ content: `${member}`, embeds: [Uprankembed] });
                
                    // Antwort an den interagierenden Nutzer
                    await interaction.reply({ content: `> \`✅\` » Das Teammitglied wurde **befördert.**`, ephemeral: true });
                } catch (error) {
                    console.error('Fehler beim Hinzufügen der Rolle:', error);
                    interaction.reply({ content: `> \`❌\` » Es ist ein Fehler aufgetreten.`, ephemeral: true });
                }
                break;

            case "downrank":
                try {
                    // Definiere die alten und neuen Rollengruppen (zum Beispiel Teamrollen)
                    const teamRoles = [
                        '959869691529154631', // Admin
                        '893423428558782465', // Team-Leitung
                        '929349039433056276', // Developer
                        '838840742742458368', // T-Developer
                        '816985466230145044', // Sr-Moderator
                        '815920052385480754', // Moderator
                        '815920170371383366', // Supporter
                        '1155564692455034990', // T-Supporter
                        '1263645368441241700', // Builder
                    ]; // IDs der Teamrollen
                    const currentRoles = member.roles.cache; // Aktuelle Rollen des Nutzers
                
                    // Finde die alte Rolle (eine, die der Nutzer derzeit hat und in den Teamrollen vorkommt)
                    const alteRolle = currentRoles.find(r => teamRoles.includes(r.id));
                
                    // Logik zur Festlegung der neuen Rolle (zum Beispiel die nächstniedrigere Rolle)
                    let neueRolle;
                    if (alteRolle) {
                        const alteRolleIndex = teamRoles.indexOf(alteRolle.id);
                        if (alteRolleIndex > 0) {
                            neueRolle = teamRoles[alteRolleIndex - 1]; // Wähle die nächstniedrigere Rolle
                        }
                    }
                
                    if (!alteRolle || !neueRolle) {
                        return interaction.reply({ content: '> `❌` » Es konnte keine passende Rolle für die Herabstufung gefunden werden.', ephemeral: true });
                    }
                
                    const neueRolleObjekt = interaction.guild.roles.cache.get(neueRolle);
                
                    // Alte Rolle entfernen und neue Rolle hinzufügen
                    await member.roles.remove(alteRolle);
                    await member.roles.add(neueRolleObjekt);
                
                    // Embed für das Rollenupdate
                    const RangUpdateembed = new EmbedBuilder()
                        .setTitle('`🔽` | __TEAMMITGLIED RANGUPDATE__')
                        .setDescription(`Der Nutzer ${member} wurde **herabgestuft.**\n\n**__Neuer Rang__**: ${neueRolleObjekt}\n**__Alter Rang__**: ${alteRolle}`)
                        .setColor('Blurple')
                        .setTimestamp();
                
                    // Nachricht im Zielkanal senden
                    targetChannel.send({ embeds: [RangUpdateembed] });
                
                    // Antwort an den interagierenden Nutzer
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

                            const TeamMeetingEmbed = new EmbedBuilder()
                            .setTitle('📅 » Eine Team-Besprechung wurde geplant.')
                            .setDescription(`> **Datum:** ${day}.${month}.${year} ${hour}:${minute}\n> **Beschreibung:** ${description}`)

                            const remindMeButton = new ButtonBuilder()
                                .setCustomId('remindMe')
                                .setLabel('Remind Me')
                                .setStyle(ButtonStyle.Primary);
                    
                            const attendButton = new ButtonBuilder()
                                .setCustomId('attend')
                                .setLabel('Teilnehmen')
                                .setStyle(ButtonStyle.Success);
                    
                            const declineButton = new ButtonBuilder()
                                .setCustomId('decline')
                                .setLabel('Nicht Teilnehmen')
                                .setStyle(ButtonStyle.Danger);
                
                        const row = new ActionRowBuilder().addComponents(remindMeButton, attendButton, declineButton);
                
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

                    case "aktivieren":
                    case "deaktivieren":
                        const system = await interaction.options.getString('system')
                        const serverData = await serverdb.findOne({ guildID: interaction.guildId })
                        if (!serverData) return;
                        
                        if(sub === "aktivieren") {
                            await serverdb.findOneAndUpdate({ guildID: interaction.guildId }, { $pull: { deactivated: `${system}` } })
                            await interaction.reply({ content: `> \`🟢\` » Das \`${system}\` System wurde **erfolgreich** __aktiviert.__`, ephemeral: true })
                        } else if(sub === "deaktivieren") {
                            await serverdb.findOneAndUpdate({ guildID: interaction.guildId }, { $push: { deactivated: `${system}` } })
                            await interaction.reply({ content: `> \`🔴\` » Das \`${system}\` System wurde **erfolgreich** __deaktiviert.__`, ephemeral: true })
                        }
                        break;

                    case "donate":
                            const amount = interaction.options.getInteger('amount');

                            let userData = await userDB.findOne({userID: member.id})
                    
                            if(!userData) {
                                userData = new userDB({
                                    userID: member.id, 
                                    donation: 0,
                                    reactions: {}
                                })
                            }
                    
                            const confirmButton = new ButtonBuilder()
                            .setCustomId('confirm')
                            .setLabel('Bestätigen')
                            .setStyle(ButtonStyle.Danger);
                    
                            const cancelButton = new ButtonBuilder()
                                .setCustomId('cancel')
                                .setLabel('Abbrechen')
                                .setStyle(ButtonStyle.Secondary);
                    
                            const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
                            
                            const response1 = await interaction.reply({
                                content: `> \`❗\` » Möchtest du wirklich den Betrag in Höhe von \`${amount}\` hinzufügen?`,
                                components: [row],
                                ephemeral: true,
                                
                            });
                            const collectorFilter1 = i => i.user.id === interaction.user.id;
                        
                        try {
                            const confirmation = await response1.awaitMessageComponent({ filter: collectorFilter1, time: 30_000 });
                                if (confirmation.customId === 'confirm') {     
                                    userData.donation = Number(userData.donation += amount);
                                    await userData.save();
                            
                                    const donateEmbed = new EmbedBuilder()
                                        .setTitle('`💖` × SPENDE ERHALTEN!')
                                        .setDescription(`> \`✅\` » ${interaction.user} hat ${member} eine Spende von \`${amount}€\` erhalten!`)
                                        .setColor('Green')
                                        .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
                                        .setTimestamp();
                            
                                    await confirmation.update({ content: null, embeds: [donateEmbed], ephemeral: true, components: [] });
                            } else if (confirmation.customId === 'cancel') {
                                await confirmation.update({ content:  `> \`❌\` » Du hast die Spende in Höhe von \`${amount}\` **nicht hinzugefügt**`, ephemeral: true, components: [] });
                            }
                        } catch (e) {
                            console.log(e)
                            await interaction.editReply({ content: "> `⏰` » Zeit ist abgelaufen", ephemeral: true, components: [] });
                            }
                        break;
        }
    },
};

async function remindUsers(client, meetingDateUTC) {
    const meeting = await serverdb.findOne({ "meetings.date": meetingDateUTC });

    if (!meeting) return;

    for (const userId of meeting.reminders) {
        const user = await client.users.fetch(userId);
        if (user) {
            await user.send(`> \`📣\` » Erinnerung: Das Meeting beginnt in **10 Minuten**.\nDatum: ${meetingDateUTC}`);
        }
    }
}

async function deleteMeetingMessage(client, meetingDateUTC) {
    const meeting = await serverdb.findOne({ "meetings.date": meetingDateUTC });

    if (!meeting) return;

    const messageID = meeting.messageID;
    const channel = await client.channels.fetch("877446081036836884");

    if (channel && messageID) {
        try {
            const message = await channel.messages.fetch(messageID);
            if (message) {
                await message.delete();
            }
        } catch (error) {
            console.error(`Fehler beim Löschen der Nachricht: ${error}`);
        }
    }
}