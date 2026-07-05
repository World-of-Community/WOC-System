import { EmbedBuilder } from "discord.js";
import TeamInfo from '../../models/teaminfodb.js';
import UserDB from '../../models/userdb.js';

export default {
    name: "team-info",
    description: "» Verwaltung der Team Mitglieder",
    type: 1,
    default_member_permissions: "8",
    options: [
        {
            "type": 1,
            "name": "add",
            "description": "» Füge ein Teammitglied hinzu. 📌",
            "options": [
                {
                    "type": 3,
                    "choices": [
                        {
                            "name": "Admin",
                            "value": "Admin"
                        },
                        {
                            "name": "Developer",
                            "value": "Developer"
                        },
                        {
                            "name": "Sr-Moderator",
                            "value": "Sr-Moderator"
                        },
                        {
                            "name": "Moderator",
                            "value": "Moderator"
                        },
                        {
                            "name": "Supporter",
                            "value": "Supporter"
                        },
                        {
                            "name": "Builder",
                            "value": "Builder"
                        }
                    ],
                    "name": "bereich",
                    "description": "Bereich des Teammitglieds",
                    "required": true
                },
                {
                    "name": "user",
                    "description": "Welches Teammitglied?",
                    "required": true,
                    "type": 6
                },
                {
                    "type": 3,
                    "name": "aufgabe",
                    "description": "Aufgabe des Teammitglieds",
                    "required": true
                },
                {
                    "type": 3,
                    "name": "alter",
                    "description": "Alter des Teammitglieds (Optional, wird sonst automatisch berechnet)",
                    "required": false
                }
            ]
        },
        {
            "type": 1,
            "name": "edit",
            "description": "» Bearbeite ein bestehendes Teammitglied.",
            "options": [
                {
                    "name": "user",
                    "description": "Welches Teammitglied soll bearbeitet werden?",
                    "required": true,
                    "type": 6
                },
                {
                    "type": 3,
                    "choices": [
                        {
                            "name": "Admin",
                            "value": "Admin"
                        },
                        {
                            "name": "Developer",
                            "value": "Developer"
                        },
                        {
                            "name": "Sr-Moderator",
                            "value": "Sr-Moderator"
                        },
                        {
                            "name": "Moderator",
                            "value": "Moderator"
                        },
                        {
                            "name": "Supporter",
                            "value": "Supporter"
                        },
                        {
                            "name": "Builder",
                            "value": "Builder"
                        }
                    ],
                    "name": "bereich",
                    "description": "Neuer Bereich des Teammitglieds",
                    "required": false
                },
                {
                    "type": 3,
                    "name": "aufgabe",
                    "description": "Neue Aufgabe",
                    "required": false
                },
                {
                    "type": 3,
                    "name": "name",
                    "description": "Neuer Name",
                    "required": false
                },
                {
                    "type": 3,
                    "name": "alter",
                    "description": "Neues Alter oder \"remove\" zum Löschen",
                    "required": false
                }
            ]
        },
        {
            "type": 1,
            "name": "remove",
            "description": "» Entferne ein Team-Mitglied. 📌",
            "options": [
                {
                    "name": "user",
                    "description": "» Discord-Nutzer auswählen",
                    "required": false,
                    "type": 6
                },
                {
                    "type": 3,
                    "name": "userid",
                    "description": "» Oder gib eine Discord-ID manuell ein",
                    "required": false
                }
            ]
        },
        {
            "type": 1,
            "name": "list",
            "description": "Sendet das Team Info Embed.",
            "options": []
        },
        {
            "type": 1,
            "name": "refresh",
            "description": "Aktualisiere das Team Info Embed.",
            "options": []
        }
    ],

    async run(client, interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const bereich = interaction.options.getString('bereich');
            const user = interaction.options.getUser('user');
            const aufgabe = interaction.options.getString('aufgabe');
            let alter = interaction.options.getString('alter');

            const existing = await TeamInfo.findOne({ userID: user.id });
            if (existing) {
                return interaction.reply({ content: `> \`⚠️\` » ${user} ist bereits ein Teammitglied.`, ephemeral: true });
            }

            if (!alter) {
                const userData = await UserDB.findOne({ userId: user.id });
                if (userData?.birthday?.jahr) {
                    const heute = new Date();
                    alter = heute.getFullYear() - userData.birthday.jahr;
                    if (
                        userData.birthday.monat > (heute.getMonth() + 1) ||
                        (userData.birthday.monat === (heute.getMonth() + 1) && userData.birthday.tag > heute.getDate())
                    ) {
                        alter--;
                    }
                } else {
                    alter = '`➖`';
                }
            }

            try {
                const newMember = new TeamInfo({
                    userID: user.id,
                    alter,
                    aufgabe,
                    bereich,
                });

                await newMember.save();
                await interaction.reply({ content: `> \`✅\` » ${user} wurde dem Team im Bereich **${bereich}** hinzugefügt.`, ephemeral: true });
                await updateTeamEmbed(interaction);
            } catch (err) {
                console.error('Fehler beim Speichern:', err);
                return interaction.reply({ content: '> `❌` » Fehler beim Speichern des Teammitglieds.', ephemeral: true });
            }
        }

        else if (subcommand === 'edit') {
            const user = interaction.options.getUser('user');
            const member = await TeamInfo.findOne({ userID: user.id });

            if (!member) {
                return interaction.reply({ content: `> \`❗\` » ${user} ist kein Teammitglied.`, ephemeral: true });
            }

            const bereich = interaction.options.getString('bereich');
            const aufgabe = interaction.options.getString('aufgabe');
            let alter = interaction.options.getString('alter');

            if (alter && (alter.toLowerCase() === 'remove' || alter.toLowerCase() === 'none')) {
                alter = '`➖`';
            } else if (!alter) {
                alter = member.alter;
            }

            if (bereich !== null && bereich !== undefined) member.bereich = bereich;
            if (aufgabe !== null && aufgabe !== undefined) member.aufgabe = aufgabe;
            if (alter !== null && alter !== undefined) member.alter = alter;

            try {
                await member.save();
                await interaction.reply({ content: `> \`✅\` » Teammitglied ${user} wurde aktualisiert.`, ephemeral: true });
                await updateTeamEmbed(interaction);
            } catch (err) {
                console.error('Fehler beim Aktualisieren:', err);
                return interaction.reply({ content: '> `❌` » Fehler beim Aktualisieren des Teammitglieds.', ephemeral: true });
            }
        }

        else if (subcommand === 'remove') {
            const user = interaction.options.getUser('user');
            const userId = interaction.options.getString('userid');
            const idToRemove = user?.id || userId;

            if (!idToRemove) {
                return interaction.reply({
                    content: '> `❗` » Bitte gib einen Nutzer an oder eine ID ein.',
                    ephemeral: true
                });
            }

            const member = await TeamInfo.findOneAndDelete({ userID: idToRemove });

            if (member) {
                const displayName = user ? `${user}` : `\`${idToRemove}\``;
                await interaction.reply({
                    content: `> \`❌\` » ${displayName} wurde aus dem Team entfernt.`,
                    ephemeral: true
                });
                await updateTeamEmbed(interaction);
            } else {
                const displayName = user ? `${user}` : `\`${idToRemove}\``;
                await interaction.reply({
                    content: `> \`❗\` » ${displayName} ist kein Teammitglied.`,
                    ephemeral: true
                });
            }
        }

        else if (subcommand === 'list') {
            await sendTeamEmbed(interaction);
        }

        else if (subcommand === 'refresh') {
            await updateTeamEmbed(interaction);
            await interaction.reply({ content: '> `✅` » Das Team Embed wurde aktualisiert.', ephemeral: true });
        }
    },
};

async function updateTeamEmbed(interaction) {
    const teamMembers = await TeamInfo.find({});
    const bereiche = [
        { name: 'Admin', id: '959869691529154631' },
        { name: 'Developer', id: '929349039433056276' },
        { name: 'Sr-Moderator', id: '816985466230145044' },
        { name: 'Moderator', id: '815920052385480754' },
        { name: 'Supporter', id: '815920170371383366' },
        { name: 'Builder', id: '1263645368441241700' }
    ];

    let embedDescription = '';

    bereiche.forEach(bereich => {
        const role = interaction.guild.roles.cache.get(bereich.id) || `<@&${bereich.id}>`;
        const membersInArea = teamMembers.filter(m => m.bereich === bereich.name);

        const countDisplay = `(\`${membersInArea.length}👥\`)`;

        if (membersInArea.length > 0) {
            embedDescription += `${role} ${countDisplay}:\n` +
                membersInArea.map(member => {
                    const mention = `<@${member.userID}>`;
                    const displayedAge = member.alter || '`➖`';
                    return `- ${mention} (${member.aufgabe}) - (Alter: ${displayedAge})`;
                }).join('\n') + '\n\n';
        } else {
            embedDescription += `${role} ${countDisplay}:\n> \`❌\` » Aktuell kein Teammitglied in diesem Bereich.\n\n`;
        }
    });

    const TeamEmbed = new EmbedBuilder()
        .setTitle('WOC Server-Team')
        .setDescription(embedDescription || 'Keine Teammitglieder gelistet.')
        .setColor('Orange')
        .setFooter({ text: `Zuletzt Aktualisiert` })
        .setTimestamp();

    try {
        const channel = interaction.guild.channels.cache.get('1291421526238822481'); // Channel-ID prüfen
        const messageId = '1293559329961803950'; // Embed-Nachricht-ID prüfen

        if (!channel) return console.error('Team-Channel nicht gefunden.');
        const message = await channel.messages.fetch(messageId).catch(err => {
            console.error('Fehler beim Nachricht-Fetch:', err);
            return null;
        });

        if (message) await message.edit({ embeds: [TeamEmbed] });
        else console.error('Embed-Nachricht nicht gefunden.');
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Embeds:', error);
    }
}

async function sendTeamEmbed(interaction) {
    const teamMembers = await TeamInfo.find({});
    const bereiche = [
        { name: 'Admin', id: '959869691529154631' },
        { name: 'Developer', id: '929349039433056276' },
        { name: 'Sr-Moderator', id: '816985466230145044' },
        { name: 'Moderator', id: '815920052385480754' },
        { name: 'Supporter', id: '815920170371383366' },
        { name: 'Builder', id: '1263645368441241700' }
    ];

    let embedDescription = '';

    bereiche.forEach(bereich => {
        const role = interaction.guild.roles.cache.get(bereich.id) || `<@&${bereich.id}>`;
        const membersInArea = teamMembers.filter(m => m.bereich === bereich.name);

        const countDisplay = `(\`${membersInArea.length}👥\`)`;

        if (membersInArea.length > 0) {
            embedDescription += `${role} ${countDisplay}:\n` +
                membersInArea.map(member => {
                    const mention = `<@${member.userID}>`;
                    const displayedAge = member.alter || '`➖`';
                    return `- ${mention} (${member.aufgabe}) - (Alter: ${displayedAge})`;
                }).join('\n') + '\n\n';
        } else {
            embedDescription += `${role} ${countDisplay}:\n> \`❌\` » Aktuell kein Teammitglied in diesem Bereich.\n\n`;
        }
    });

    const TeamEmbed = new EmbedBuilder()
        .setTitle('WOC Server-Team')
        .setDescription(embedDescription || 'Keine Teammitglieder gelistet.')
        .setColor('Orange')
        .setFooter({ text: `Zuletzt Aktualisiert` })
        .setTimestamp();

    await interaction.reply({ embeds: [TeamEmbed], ephemeral: true });
}
