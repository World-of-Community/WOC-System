const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
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
                            { name: 'Team-Leitung', value: 'Team-Leitung' },
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
                .setDescription('Sendet das Team Info Embed.')
        ),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const bereich = interaction.options.getString('bereich');
            const user = interaction.options.getUser('user');
            const name = interaction.options.getString('name');
            const beschreibung = interaction.options.getString('beschreibung');
            let alter = interaction.options.getString('alter');

            if (!alter) {
                const userData = await UserDB.findOne({ userId: user.id });

                if (userData && userData.birthday && userData.birthday.jahr) {
                    const aktuellesDatum = new Date();
                    const aktuellesJahr = aktuellesDatum.getFullYear();
                    let berechnetesAlter = aktuellesJahr - userData.birthday.jahr;

                    if (
                        userData.birthday.monat > (aktuellesDatum.getMonth() + 1) || 
                        (userData.birthday.monat === (aktuellesDatum.getMonth() + 1) && userData.birthday.tag > aktuellesDatum.getDate())
                    ) {
                        berechnetesAlter--;
                    }

                    alter = berechnetesAlter;
                } else {
                    alter = 'Nicht angegeben';
                }
            }

            const newMember = new TeamMember({
                userID: user.id,
                name,
                alter,
                role: bereich,
                beschreibung,
                bereich,
            });

            await newMember.save();
            await interaction.reply({ content: `> \`✅\` » ${user} wurde dem Team hinzugefügt im Bereich ${bereich}.`, ephemeral: true });
            await updateTeamEmbed(interaction);
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
    },
};

async function updateTeamEmbed(interaction) {
    const teamMembers = await TeamMember.find({});
    let embedDescription = teamMembers.map(member => `- **${member}** (${member.beschreibung})\n⠀➥ Alter: ${member.alter}`).join('\n\n') || 'Keine Teammitglieder gelistet.';

    const TeamEmbed = new EmbedBuilder()
        .setTitle('WOC Server-Team')
        .setDescription(embedDescription)
        .setColor('Orange')
        .setTimestamp();

    try {
        const channel = interaction.guild.channels.cache.get('1291421526238822481');
        const messageId = '1293559329961803950';
        const message = await channel.messages.fetch(messageId);
        await message.edit({ embeds: [TeamEmbed] });
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Team-Embeds:', error);
    }
}

async function sendTeamEmbed(interaction) {
    const teamMembers = await TeamMember.find({});
    let embedDescription = teamMembers.map(member => `- **${member.name}** (${member.beschreibung})\n⠀➥ Alter: ${member.alter}`).join('\n\n') || 'Keine Teammitglieder gelistet.';

    const TeamEmbed = new EmbedBuilder()
        .setTitle('WOC Server-Team')
        .setDescription(embedDescription)
        .setColor('Orange')
        .setTimestamp();

    await interaction.channel.send({ embeds: [TeamEmbed] });
}
