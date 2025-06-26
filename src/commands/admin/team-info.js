const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const TeamMember = require('../../../Datenbank/teamdb');
const UserDB = require('../../../Datenbank/userdb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team-info')
        .setDescription('» Verwaltung der Team Mitglieder')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('» Füge ein Teammitglied hinzu. 📌')
                .addStringOption(option =>
                    option.setName('bereich')
                        .setDescription('Bereich des Teammitglieds')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Admin', value: 'Admin' },
                            { name: 'Developer', value: 'Developer' },
                            { name: 'Sr-Moderator', value: 'Sr-Moderator' },
                            { name: 'Moderator', value: 'Moderator' },
                            { name: 'Supporter', value: 'Supporter' },
                            { name: 'Builder', value: 'Builder' },
                        ))
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Welches Teammitglied?')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('beschreibung')
                        .setDescription('Beschreibung des Teammitglieds')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name des Teammitglieds')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('alter')
                        .setDescription('Alter des Teammitglieds (Optional, wird sonst automatisch berechnet)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('» Entferne ein Team Mitglied. 📌')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Welches Teammitglied soll entfernt werden?')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Sendet das Team Info Embed.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('refresh')
                .setDescription('Aktualisiere das Team Info Embed.')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const bereich = interaction.options.getString('bereich');
            const user = interaction.options.getUser('user');
            const name = interaction.options.getString('name');
            const beschreibung = interaction.options.getString('beschreibung');
            let alter = interaction.options.getString('alter');

            const existing = await TeamMember.findOne({ userID: user.id });
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
                    alter = 'Nicht angegeben';
                }
            }

            try {
                const newMember = new TeamMember({
                    userID: user.id,
                    name,
                    alter,
                    role: bereich,
                    beschreibung,
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

        else if (subcommand === 'remove') {
            const user = interaction.options.getUser('user');
            const member = await TeamMember.findOneAndDelete({ userID: user.id });

            if (member) {
                await interaction.reply({ content: `> \`❌\` » ${user} wurde aus dem Team entfernt.`, ephemeral: true });
                await updateTeamEmbed(interaction);
            } else {
                await interaction.reply({ content: `> \`❗\` » ${user} ist kein Teammitglied.`, ephemeral: true });
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
    const teamMembers = await TeamMember.find({});
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

        if (membersInArea.length > 0) {
            embedDescription += `${role}:\n` +
                membersInArea.map(member => `- ${member.name} (${member.beschreibung})\n⠀➥ Alter: ${member.alter}`).join('\n') + '\n\n';
        } else {
            embedDescription += `${role}:\n> \`❌\` » Aktuell kein Teammitglied in diesem Bereich.\n\n`;
        }
    });

    const TeamEmbed = new EmbedBuilder()
        .setTitle('WOC Server-Team')
        .setDescription(embedDescription || 'Keine Teammitglieder gelistet.')
        .setColor('Orange')
        .setFooter({ text: `Zuletzt Aktualisiert` })
        .setTimestamp();

    try {
        const channel = interaction.guild.channels.cache.get('1291421526238822481'); // ✅ Channel-ID prüfen
        const messageId = '1293559329961803950'; // ✅ Embed-Nachricht-ID prüfen

        const message = await channel.messages.fetch(messageId).catch(err => {
            console.error('Fehler beim Nachricht-Fetch:', err);
            return null;
        });

        if (message) await message.edit({ embeds: [TeamEmbed] });
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Embeds:', error);
    }
}

async function sendTeamEmbed(interaction) {
    const teamMembers = await TeamMember.find({});
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

        if (membersInArea.length > 0) {
            embedDescription += `${role}:\n` +
                membersInArea.map(member => `- ${member.name} (${member.beschreibung})\n⠀➥ Alter: ${member.alter}`).join('\n') + '\n\n';
        } else {
            embedDescription += `${role}:\n> \`❌\` » Aktuell kein Teammitglied in diesem Bereich.\n\n`;
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
