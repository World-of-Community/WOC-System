const { SlashCommandBuilder } = require('discord.js');

// Hier kannst du die Nachrichtenziele dynamisch speichern (z.B. in einer Datenbank)
let messageGoals = {};

// embed für den Progress machen 
// im embed das der User mit der rolle angezeigt wird 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('teamactivity')
        .setDescription('» Setzt das Nachrichtenziel für eine Rolle oder zeigt die Aktivität eines Benutzers an.')
        .addSubcommand(subcommand => 
            subcommand
                .setName('setgoal')
                .setDescription('» Setzt das Nachrichtenziel für eine Rolle.')
                .addRoleOption(option =>  option.setName('role').setDescription('Die Rolle, für die das Ziel festgelegt wird').setRequired(true))
                .addIntegerOption(option =>  option.setName('messagegoal').setDescription('Das Nachrichtenziel für diese Rolle').setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('check')
                .setDescription('» Überprüft die Nachrichtenaktivität eines Benutzers.')
                .addUserOption(option =>  option.setName('user').setDescription('Der Benutzer, dessen Aktivität angezeigt werden soll').setRequired(true))),
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
            const targetUser = interaction.options.getUser('user');
            const member = await interaction.guild.members.fetch(targetUser.id);

            // Finde das Nachrichtenziel basierend auf der Rolle des Benutzers
            const userRoles = member.roles.cache;
            let messageGoal = 0;

            userRoles.forEach(role => {
                if (messageGoals[role.id]) {
                    messageGoal = messageGoals[role.id];
                }
            });

            if (messageGoal === 0) {
                return interaction.reply({ content: `> \`📌\` » ${targetUser} hat keine definierte Rolle für Nachrichtenaktivität.`, ephemeral: true });
            }

            const currentMessages = await getMessagesForUser(targetUser.id); // Nachrichtenanzahl aus Datenbank holen
            const messageProgress = `${currentMessages}/${messageGoal} Nachrichten`;

            // Erstelle ein Embed für den Fortschritt
            const activityEmbed = new EmbedBuilder()
                .setTitle(`Nachrichtenaktivität von ${targetUser}`)
                .setDescription(`${targetUser} (${userRole})\n\n> Hat bereits ${messageProgress} erreicht.`)
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
    const messages = await database.getMessageCount(userId);
    return messages || 0;
}