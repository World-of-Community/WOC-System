const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionBitField } = require('discord.js');
const teammessagedb = require("../../../Datenbank/teammessagedb.js");
const teamdb = require("../../../Datenbank/teamdb.js");

// Hier kannst du die Nachrichtenziele dynamisch speichern (z.B. in einer Datenbank)
let messageGoals = {};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('teamactivity')
        .setDescription('» Setzt das Nachrichtenziel für eine Rolle oder zeigt die Aktivität eines Benutzers an.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand => 
            subcommand
                .setName('setgoal')
                .setDescription('» Setzt das Nachrichtenziel für eine Rolle.')
                .addRoleOption(option =>  option.setName('role').setDescription('Die Rolle, für die das Ziel festgelegt wird').setRequired(true))
                .addIntegerOption(option =>  option.setName('messagegoal').setDescription('Das Nachrichtenziel für diese Rolle').setRequired(true)))
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand => 
            subcommand
                .setName('check')
                .setDescription('» Überprüft die Nachrichtenaktivität eines Benutzers.')
                .addUserOption(option =>  option.setName('user').setDescription('Der Benutzer, dessen Aktivität angezeigt werden soll').setRequired(true)))
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'setgoal') {
            const role = interaction.options.getRole('role');
            const messageGoal = interaction.options.getInteger('messagegoal');
            
            // Setze das Nachrichtenziel für die Rolle
            messageGoals[role.id] = messageGoal;

            // Rückmeldung an den Benutzer
            await interaction.reply({ content: `> \`✅\` » Das Nachrichtenziel für die Rolle ${role} wurde auf \`${messageGoal}\` Nachrichten gesetzt.`, ephemeral: true });
        }

        if (interaction.options.getSubcommand() === 'check') {
            const member = interaction.options.getMember('user');

            /*
            if (messageGoal === 0) {
                return interaction.reply({ content: `> \`📌\` » ${member} hat keine Nachrichten als Team Mitglied gesammelt.`, ephemeral: true });
            }
            */

            const teamUser = await teamdb.findOne({ userID: member.id })
            const messageProgress = `${teamUser.messages}/${200} Nachrichten`;

            // Erstelle ein Embed für den Fortschritt
            const activityEmbed = new EmbedBuilder()
                .setTitle(`Nachrichtenaktivität von ${member.user.username}`)
                .setDescription(`${member} (${undefined})\n\n> Hat bereits ${messageProgress} erreicht.`)
                .setColor('Blurple')
                .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
                .setTimestamp();

            await interaction.reply({ embeds: [activityEmbed] });
        }
    },
};

// Funktion, um Nachrichten aus der Datenbank zu holen
async function getMessagesForUser(userId) {
    // Beispiel-Datenbankabfrage
    const messages = await teammessagedb.getMessageCount(userId);
    return messages || 0;
}
