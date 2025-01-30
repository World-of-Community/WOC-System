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

                case 'meeting': {
                    const serverData = await serverdb.findOne({ guildID: "815919809379172354" });
    
                    if (!serverData || !serverData.meetings || serverData.meetings.length === 0) {
                        return interaction.reply({ content: '> `❌` » Derzeit ist keine Team-Besprechung geplant.', ephemeral: true });
                    }
    
                    const sortedMeetings = serverData.meetings.sort((a, b) => a.date - b.date);

                    const embed = new EmbedBuilder()
                        .setTitle('📅 Geplante Team-Besprechungen')
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
                        .setDescription('> Hier sind die Wichtigsten Befehle von <@1020023299448786955> aufgelistet für das **Server-Team**\n\n- `/clear <anzahl> (Optional) <kanal> <grund>`\n» Löscht eine Anzahl an Nachrichten.\n\n- `/message <user> <nachricht> (Optional) <image>`\n» Sendet einen Nutzer eine Nachricht.\n\n- `/ban <user> <grund> (Optional) <dauer>`\n» Schickt einen Nutzer in den **Bann-Bereich**.\n> `📋` » Text Gründe:\n➥ `An Verdächtiger Spam Aktivität beteiligt`\n➥ `Verdächtiger oder Spam Account`\n➥ `Gefährdeter oder Gehackter Account`\n➥ `Gegen Serverregeln verstoßen`\n\n- `/unban <user> <grund>`\n» Entbannt einen Nutzer aus dem **Bann-Bereich**.\n\n- `/warn <user> <grund>`\n Warnt einen Nutzer per Direktnachricht (DM)\n\n- `/event-info <kanal> <nachricht> (Optional) <starten>`\n» Sendet eine Event-Nachricht.\n\n- `/timeout <user> <grund> <dauer>`\n» Gebe einem User eine Auszeit.\n\n- `/user-find`\n» Findet einen Benutzer anhand seiner ID.\n\n- `/user-list`\n» Listet alle Mitglieder des Servers mit ID auf (20 pro Seite).\n\n- `/info <rolle>`\n» Zeigt an welche Nutzer die bestimmte Rolle besitzen.\n\n- `/info-bewerbung`\n» Sendet eine Info zur Bewerbung\n\n- `/userinfo`\n» Rufe Informationen über einen User ab.\n\n- `/vorschlag`\n» Verwalte einen Vorschlag in <#1254340245772701747>\n\n- `/partner add/edit/remove`\n» Verwalte das Partner System')
                        .setColor('Orange')
                        .setFooter({ text: `${interaction.guild.name} - Team Befehle`, iconURL: `${interaction.guild.iconURL()}` })
                        .setTimestamp();

                    await interaction.reply({ embeds: [TeamHelpEmbed], ephemeral: true })
                }
        }
    },
};
