const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('» Warne einen User. ❗')
        .addUserOption(option => option.setName('user').setDescription('» Welchen User möchtest du Warnen?').setRequired(true))
        .addStringOption(option => option.setName('grund').setDescription('» Der Grund der Warnung').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
        
async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.reply({ content: '`❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.', ephemeral: true });
    }

    // Benutzer und Grund aus den Optionen erhalten
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('grund');

    // Warnung in der Datenbank speichern
    const warningData = await Warning.findOne({ guildId: interaction.guild.id, userId: member.id });
    if (warningData) {
        warningData.warnings.push({ reason });
        await warningData.save();
    } else {
        await new Warning({
            guildId: interaction.guild.id,
            userId: member.id,
            warnings: [{ reason }],
        }).save();
    }

    // Embed für die DM-Nachricht erstellen
    const WarnEmbed = new EmbedBuilder()
    .setTitle('DU WURDEST GERADE GEWARNT!')
    .setDescription(`\`❗\` » Du wurdest gerade auf **${interaction.guild.name}** gewarnt.\n\nGrund dafür: \`${reason}\`\n\nEs war eine falsche Entscheidung?\nÖffne ein Ticket im <#819555839362072606>`)
    .setColor('Red')
    .setFooter({ text: `${interaction.client.user.displayName}`, iconURL: `${interaction.guild.iconURL({ dynamic: true })}` })
    .setTimestamp();    

    // Benutzer über DM warnen

    try {
        await member.send({ embeds: [WarnEmbed] });
        await interaction.reply({ content: `> \`✅\` » ${member} wurde **erfolgreich** gewarnt.`, ephemeral: true });
    } catch (error) {
        console.error(`Konnte keine DM an ${member} senden:`, error);
        await interaction.reply({ content: `> \`❌\` » Es konnte **keine** DM an ${member} gesendet werden.`, ephemeral: true });
    } 
  },
};