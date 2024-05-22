// const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
// const fs = require('fs');
// const path = require('path');

// const donationsFilePath = path.resolve(__dirname, 'donations.json');

// // Funktion zum Lesen der JSON-Datei
// function readDonations() {
//     if (!fs.existsSync(donationsFilePath)) {
//         fs.writeFileSync(donationsFilePath, JSON.stringify({}));
//     }
//     const data = fs.readFileSync(donationsFilePath, 'utf-8');
//     return JSON.parse(data);
// }                                                                                               // was soll der scheiss hier?

// // Funktion zum Schreiben in die JSON-Datei
// function writeDonations(data) {
//     fs.writeFileSync(donationsFilePath, JSON.stringify(data, null, 2));
// }

// // Spendenbetrag hinzufügen
// const donations = readDonations();
// if (!donations[user.id]) {
//     donations[user.id] = 0;
// }
// donations[user.id] += amount;
// writeDonations(donations);

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('donate-add')
//         .setDescription('» Füge den Betrag der Spende an einem User hinzu. 💸')
//         .addUserOption(option => option.setName('user').setDescription('» Wähle einen Benutzer aus, der die Spende erhalten soll.').setRequired(true))
//         .addIntegerOption(option => option.setName('amount').setDescription('» Gib den Betrag der Spende ein.').setRequired(true))
//         .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

//     async execute(interaction) {
//         const member = interaction.options.getUser('user');
//         const amount = interaction.options.getInteger('amount');

//         if (amount <= 0) {
//             return interaction.reply({ content: '> `❗` » Bitte gib einen gültigen Spendenbetrag größer als 0 an.', ephemeral: true });
//         }

//         const donateEmbed = new EmbedBuilder()
//             .setTitle('`💖` × SPENDE ERHALTEN!')
//             .setDescription(`> \`✅\` » ${interaction.user} hat ${member} eine Spende von \`${amount}€\` erhalten!`)
//             .setColor('Green')
//             .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
//             .setTimestamp();

//         await interaction.reply({ embeds: [donateEmbed], ephemeral: true });
//     },
// };