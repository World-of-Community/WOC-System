const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('teammitglied')
        .setDescription('» Fügt ein neues Teammitglied hinzu. ➕')
        .addUserOption(option => option.setName('user').setDescription('Welcher User soll eine Team-Rolle bekommen?').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('» Welche Rolle soll der User bekommen?').setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    async execute(interaction) {
        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        const targetChannel = interaction.guild.channels.cache.get('1173986308641804338'); // Kanal-ID einfügen
        const formattedDate = `<t:${Math.floor(Date.now() / 1000)}:F>`;
        
        if (!member || !role || !targetChannel) {
            return interaction.reply('Fehler beim Verarbeiten des Befehls.');
        }
        
        try {
            await member.roles.add(role);

            const { EmbedBuilder } = require('discord.js');
            const TeammitgliedEmbed = new EmbedBuilder()
                .setTitle('`➕` | __NEUES TEAMMITGLIED__')
                .setColor('Blurple')
                .setDescription(`> » Wir begrüßen ${member} herzlichst im Team. Wir hoffen auf eine gemeinsame schöne Zeit!\n\n**__Rang__**\n${role}\n\n**__Im Team seit__**\n${formattedDate}`)
            
            targetChannel.send({ content: `${member}`, embeds: [TeammitgliedEmbed] });
            await interaction.reply({ content: `Red mach du die Nachricht :P ~ vxnsin`, ephemeral: true});
        } catch (error) {
            console.error('Fehler beim Hinzufügen der Rolle:', error);
            interaction.reply('> `❌` » Es ist ein Fehler aufgetreten.');
        }
    },
};