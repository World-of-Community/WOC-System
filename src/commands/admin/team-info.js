const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const userDB = require("../../../Datenbank/teamdb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team')
        .setDescription('» Verwaltung der Team Mitglieder')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Füge ein Teammitglied hinzu')
                .addStringOption(option =>
                    option.setName('category')
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
                    option.setName('description')
                        .setDescription('Beschreibung des Teammitglieds')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name des Teammitglieds')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('age')
                        .setDescription('Alter des Teammitglieds')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Entferne ein Team Mitglied')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Welches Teammitglied soll entfernt werden?')
                        .setRequired(true))),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const category = interaction.options.getString('category');
        const user = interaction.options.getUser('user');
        const name = interaction.options.getString('name');
        const description = interaction.options.getString('description');
        const age = interaction.options.getString('age') || '';

        if (subcommand === 'add') {
            const newMember = new TeamMember({
                userId: user.id,
                name: name,
                age: age,
                role: category,
                description: description,
                category: category,
            });

            await newMember.save();

            await interaction.reply({ content: `> \`✅\` » ${user} wurde dem Team hinzugefügt im Bereich ${category}.`, ephemeral: true });

            updateTeamEmbed(interaction);
        } else if (subcommand === 'remove') {
            const member = await TeamMember.findOneAndDelete({ userId: user.id });

            if (member) {
                await interaction.reply({ content: `> \`❌\` » ${user} wurde aus dem Team entfernt.`, ephemeral: true });
                updateTeamEmbed(interaction);
            } else {
                await interaction.reply({ content: `> \`❗\` » ${user} ist kein Teil des Teams.`, ephemeral: true });
            }
        }
    },
};

// Funktion zum Aktualisieren des Embeds mit Teammitgliedern
async function updateTeamEmbed(interaction) {
    const teamMembers = await TeamMember.find({});
    let embedDescription = '';

    teamMembers.forEach(member => {
        embedDescription += `- ${member.name} (${member.description})\n⠀➥ Alter: ${member.age}\n\n`;
    });

    const TeamEmbed = new EmbedBuilder()
        .setTitle('WOC Server-Team')
        .setDescription(embedDescription || 'Keine Team Mitglieder gelistet.')
        .setColor('Orange')
        .setTimestamp();

    const channel = interaction.channel;
    const messageId = '1293559329961803950';  // Diese Nachricht-ID muss an einem persistenten Ort gespeichert werden
    const message = await channel.messages.fetch(messageId);
    
    await message.edit({ embeds: [TeamEmbed] });
}
