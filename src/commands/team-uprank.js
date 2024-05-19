const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team-uprank')
        .setDescription('» Aktualisiere die Rolle eines Teammitgliedes. 🔁')
        .addUserOption(option => option.setName('user').setDescription('» Welcher Benutzer sollte aktualisiert werden?').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('» Auf welche Rolle soll der Benutzer befördert werden?').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        const targetChannel = interaction.guild.channels.cache.get('1173986308641804338'); // Insert channel ID
        
        if (!member || !role || !targetChannel) {
            return interaction.reply('Fehler beim Verarbeiten des Befehls.');
        }
        
        try {
            await member.roles.add(role);

            const Uprankembed = new EmbedBuilder()
                .setTitle('`🔼` | __TEAMMITGLIED RANGUPDATE__')
                .setDescription(`> Herzlichen Glückwunsch, ${member}!\n> Du wurdest **befördert!**\n\n**__Rang__**\n${role}`)
                .setColor('Blurple')
            
            await targetChannel.send({ content: `${member}`, embeds: [Uprankembed] });
            await interaction.reply({ content: `> \`✅\` » Das Teammitglied wurde **befördert.**`, ephemeral: true });
        } catch (error) {
            console.error('Fehler beim Hinzufügen der Rolle:', error);
            interaction.reply({ content: `> \`❌\` » Es ist ein Fehler aufgetreten.`, ephemeral: true });
        }
    },
};