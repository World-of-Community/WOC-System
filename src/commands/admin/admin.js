const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const teamdb = require("../../../Datenbank/teamdb");
const serverdb = require("../../../Datenbank/serverdb");
const userdb = require("../../../Datenbank/userdb");
const schedule = require('node-schedule');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Team')
        .addSubcommand((command) =>
            command
                .setName('uprank')
                .setDescription('» Setzt einen Benutzer auf eine höhere Rolle. 🔼')
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
                .setName('bereichswechsel')
                .setDescription('» Aktualisiere den Bereich eines Teammitgliedes. 🔄')
                .addUserOption(option => option.setName('user').setDescription('» Welcher Benutzer sollte aktualisiert werden?').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('» Auf welche Rolle soll der Benutzer wechseln?').setRequired(true))
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
                    // Füge die Rolle zum Nutzer hinzu
                    await member.roles.add(role);
                
                    // Embed für das Rollenupdate erstellen
                    const Uprankembed = new EmbedBuilder()
                        .setTitle('`🔼` | __TEAMMITGLIED RANGUPDATE__')
                        .setDescription(`Herzlichen Glückwunsch, ${member}!\nDu wurdest **befördert!**\n\n**__Rang__**:\n${role}`)
                        .setColor('Blurple')
                        .setTimestamp();
                
                    // Nachricht im Zielkanal senden
                    await targetChannel.send({ content: `${member}`, embeds: [Uprankembed] });
                
                    // Antwort an den interagierenden Nutzer senden
                    await interaction.reply({ content: '> `✅` » Das Teammitglied wurde **befördert.**', ephemeral: true });
                } catch (error) {
                    console.error('Fehler beim Hinzufügen der Rolle:', error);
                    // Fehlerantwort an den interagierenden Nutzer senden
                    await interaction.reply({ content: '> ❌ » Es ist ein Fehler aufgetreten.', ephemeral: true });
                }
                break;

            case "downrank":
                try {
                    // Entferne die Rolle des Nutzers
                    await member.roles.remove(role);
                
                    // Embed für das Rollenupdate erstellen
                    const RangUpdateembed = new EmbedBuilder()
                        .setTitle('`🔽` | __TEAMMITGLIED RANGUPDATE__')
                        .setDescription(`${member} wurde **herabgestuft.**\n\n**__Rang__**:\n${role}`)
                        .setColor('Blurple')
                        .setTimestamp();
                
                    // Nachricht im Zielkanal senden
                    await targetChannel.send({ embeds: [RangUpdateembed] });
                
                    // Antwort an den interagierenden Nutzer senden
                    await interaction.reply({ content: '> `✅` » Das Teammitglied wurde **herabgestuft.**', ephemeral: true });
                } catch (error) {
                    console.error('Fehler beim Herabstufen des Benutzers:', error);
                    // Fehlerantwort an den interagierenden Nutzer senden
                    await interaction.reply({ content: '> ❌ » Es ist ein Fehler aufgetreten.', ephemeral: true });
                }
                break;

            case "bereichswechsel":
                try {

                    const areaRoles = [
                        "929349039433056276", // Developer
                        "816985466230145044", // Sr-Moderator
                        "815920052385480754", // Moderator
                        "815920170371383366", // Supporter
                        "1263645368441241700", // Builder

                        "1154345358030282782", // Developer leitung
                        "1155080722466488351", // Support leitung
                        "1258773853249863734", // Builder leitung
                        "1175879013688954980", // Partner leitung
                    ];
                    const oldRole = member.roles.cache.find(r => areaRoles.includes(r.id));

                    // Alte Bereichsrollen entfernen
                    await member.roles.remove(areaRoles);
            
                    // Neue Rolle hinzufügen
                    await member.roles.add(role);

                    const AreaChangeEmbed = new EmbedBuilder()
                        .setTitle('`🔄` | __TEAMMITGLIED BEREICHSWECHSEL__')
                        .setDescription(
                            `${member} hat den Bereich gewechselt.\n\n` +
                            `**__Alter Bereich__**:\n${oldRole ? oldRole : "Kein Bereich"}\n\n` +
                            `**__Neuer Bereich__**:\n${role}`
                        )
                        .setColor('Blurple')
                        .setTimestamp();
            
                    await targetChannel.send({ embeds: [AreaChangeEmbed] });
            
                    await interaction.reply({ 
                        content: '> `✅` » Der Bereich wurde erfolgreich geändert.', 
                        ephemeral: true 
                    });
            
                } catch (error) {
            
                    console.error('Fehler beim Bereichswechsel:', error);
            
                    await interaction.reply({ 
                        content: '> `❌` » Es ist ein Fehler aufgetreten.', 
                        ephemeral: true 
                    });
            
                }
                break;

                case "add":
                    try {
                        // Teamrolle + Hauptrang hinzufügen
                        await member.roles.add(role);
                        await member.roles.add(teamrole);
                
                        //// Datum für Embed
                        //const formattedDate = new Date().toLocaleDateString('de-DE', {
                        //    day: '2-digit',
                        //    month: '2-digit',
                        //    year: 'numeric',
                        //});
                
                        // ID der Supporter-Rolle
                        const supporterRoleId = '815920170371383366'; // ← diese ID anpassen!
                
                        // Zusätzliche Rollen für Supporter (4 Rollen)
                        const supporterExtraRoles = [
                            '1011207481357238272', // Ticket Support
                            '1270369938972082177', // Ticket Bereich
                            '1209101841015504916', // Bann Support
                            '1155570143393488896', // Bann Bereich
                            '1285728292367892584' // Report Log
                        ];
                
                        // Zusätzliche Rollen für andere Teamränge (3 Rollen)
                        const defaultExtraRoles = [
                            '1270369938972082177', // Ticket Bereich
                            '1155570143393488896', // Bann Bereich
                            '1285728292367892584' // Report Log
                        ];
                
                        // Prüfen, ob der gegebene Rang die Supporter-ID hat
                        if (role.id === supporterRoleId) {
                            for (const r of supporterExtraRoles) {
                                await member.roles.add(r).catch(() => {});
                            }
                        } else {
                            for (const r of defaultExtraRoles) {
                                await member.roles.add(r).catch(() => {});
                            }
                        }

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
                    const extraRoles = [
                        '1011207481357238272', // Ticket Support
                        '1270369938972082177', // Ticket Bereich
                        '1209101841015504916', // Bann Support
                        '1155570143393488896', // Bann Bereich
                        '1285728292367892584' // Report Log
                    ];

                    // Hauptrollen entfernen
                    await member.roles.remove(role).catch(() => {});
                    await member.roles.remove(teamrole).catch(() => {});
            
                    // Zusätzliche Rollen prüfen und entfernen
                    for (const roleId of extraRoles) {
                        const extraRole = interaction.guild.roles.cache.get(roleId);
                        if (extraRole && member.roles.cache.has(roleId)) {
                            await member.roles.remove(roleId).catch(() => {});
                        }
                    }
                    try {

                        const kickEmbed = new EmbedBuilder()
                            .setTitle('`❌` | __TEAMMITGLIED ENTFERNT__')
                            .setDescription(`${member} wurde von **${interaction.user.displayName}** aus dem Server-Team **Entfernt**.\n\nGrund: \`${reason}\``)
                            .setColor('Red')
                            .setTimestamp();

                        targetChannel.send({ embeds: [kickEmbed] });
                        await interaction.reply({ content: '> \`✅\` » Das Teammitglied wurde aus dem Server-Team **Entfernt.**', ephemeral: true });
                    } catch (error) {
                        console.error('❌  | Fehler beim Kicken des Benutzers:', error);
                        interaction.reply({ content: `> \`❌\` » Es ist ein Fehler aufgetreten.`, ephemeral: true });
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
                        
                        const confirmButton = new ButtonBuilder()
                            .setCustomId('confirm')
                            .setLabel('✅ » Bestätigen')
                            .setStyle(ButtonStyle.Primary);
                        
                        const cancelButton = new ButtonBuilder()
                            .setCustomId('cancel')
                            .setLabel('❌ » Abbrechen')
                            .setStyle(ButtonStyle.Secondary);
                        
                        const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
                        
                        const response1 = await interaction.reply({
                            content: `> \`❗\` » Möchtest du wirklich den Betrag in Höhe von \`${amount}€\` hinzufügen?`,
                            components: [row],
                            ephemeral: true,
                        });
                        
                        const collectorFilter1 = (i) => i.user.id === interaction.user.id;

                        try {
                            const confirmation = await response1.awaitMessageComponent({ filter: collectorFilter1, time: 60_000 });
                            
                            if (confirmation.customId === "confirm") {

                                let userData = await userdb.findOneAndUpdate(
                                    { userID: member.id }, 
                                    { 
                                        $inc: { donation: amount },
                                        $setOnInsert: { reactions: {} } 
                                    },
                                    { new: true, upsert: true }
                                );
                    
                                await userData.save();
                                
                                const donateEmbed = new EmbedBuilder()
                                    .setTitle('`💖` × SPENDE HINZUGEFÜGT!')
                                    .setDescription(`> \`✅\` » ${member} hat nun \`${userData.donation}€\` (\`+ ${amount}€\`) gespendet!`)
                                    .setColor('Green')
                                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                                    .setTimestamp();
                                
                                await confirmation.update({ content: null, embeds: [donateEmbed], ephemeral: true, components: [] });
                            } else if (confirmation.customId === 'cancel') {
                                // Handle cancellation
                                await confirmation.update({
                                    content: `> \`❌\` » Du hast die Spende in Höhe von \`${amount}€\` **nicht hinzugefügt**`,
                                    ephemeral: true,
                                    components: []
                                });
                            }
                        } catch (err) {
                            console.error(err)
                            await interaction.followUp({ content: `> \`⚠️\` » Die Aktion wurde nicht rechtzeitig bestätigt.`, ephemeral: true });
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