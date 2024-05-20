const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const donationsFilePath = path.resolve(__dirname, 'donations.json');

// Funktion zum Lesen der JSON-Datei
function readDonations() {
    if (!fs.existsSync(donationsFilePath)) {
        fs.writeFileSync(donationsFilePath, JSON.stringify({}));
    }
    const data = fs.readFileSync(donationsFilePath, 'utf-8');
    return JSON.parse(data);
}

// Funktion zum Schreiben in die JSON-Datei
function writeDonations(data) {
    fs.writeFileSync(donationsFilePath, JSON.stringify(data, null, 2));
}

const donations = new Map(); // In-Memory-Speicher für Spenden

module.exports = {
     // /donate command
    data: new SlashCommandBuilder()
        .setName('donate')
        .setDescription('» Zeigt die Gesamtspenden eines Benutzers an. 💖')
        .addUserOption(option => option.setName('user').setDescription('» Wähle einen Benutzer aus, um die Gesamtspenden zu sehen.').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const member = interaction.options.getUser('user');
        const totalDonations = donations.get(user.id) || 0;

        const donateEmbed = new EmbedBuilder()
            .setTitle('`💖` × GESAMTSPENDEN')
            .setDescription(`> \`✅\` » ${member} hat insgesamt \`${totalDonations}€\` gespendet!`)
            .setColor('Green')
            .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

        await interaction.reply({ embeds: [donateEmbed], ephemeral: true });
    },
};