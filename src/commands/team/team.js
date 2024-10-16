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
                        .setDescription('> Hier sind die Wichtigsten Befehle von <@1020023299448786955> aufgelistet für das **Server-Team**\n\n- </clear:1254083123227005123> - `/clear <anzahl> (Optional) <kanal> <grund>` - Löscht eine Anzahl an Nachrichten.\n\n- </message:1254083123335925896> - `/message <user> <nachricht> (Optional) <image>` - Sendet einen Nutzer eine Nachricht.\n\n- </ban:1254083123063291949> - `/ban <user> <grund> (Optional) <dauer>` - Schickt einen Nutzer in den **Bann-Bereich**.\n> `📋` » Text Gründe:\n➥ `An Verdächtiger Spam Aktivität beteiligt`\n➥ `Verdächtiger oder Spam Account`\n➥ `Gefährdeter oder Gehackter Account`\n➥ `Gegen Serverregeln verstoßen`\n\n- </unban:1254083123453362254> - `/unban <user> <grund>` - Entbannt einen Nutzer aus dem **Bann-Bereich**.\n\n- </warn:1254083123566743625> - `/warn <user> <grund>` - Warnt einen Nutzer per Direktnachricht (DM)\n\n- </event-info:1286313958222856284> - `/event-info <kanal> <nachricht> (Optional) <starten>` - Sendet eine Event-Nachricht.\n\n- </timeout:1254083123453362253> - `/timeout <user> <grund> <dauer>` - Gebe einem User eine Auszeit.\n\n- </info-bewerbung:1285983342046482517> - `/info-bewerbung` - Sendet eine Info zur Bewerbung\n\n- </team help:1259132049122525205> - `/team help` - Zeigt dir alle Team-Befehle an.\n\n- `/partner add/edit/remove` - Partner System')
                        .setColor('Orange')
                        .setFooter({ text: `${interaction.guild.name} - Team Befehle`, iconURL: `${interaction.guild.iconURL()}` })
                        .setTimestamp();

                    await interaction.reply({ embeds: [TeamHelpEmbed], ephemeral: true })
                }
        }
    },
};
