const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('» Warne einen User. ❗')
        .addUserOption(option => option.setName('user').setDescription('» Welchen User möchtest du Warnen?').setRequired(true))
        .addStringOption(option => option.setName('grund').setDescription('» Der Grund der Warnung').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction)  {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('grund');

        let list = 'Warnliste:\n';
        for (const userId in warns) {
            const userWarns = warns[userId];
            list += `${userWarns.name}: ${userWarns.warns} Warnung(en)\n`;
        }

        await interaction.reply(list || 'Keine Warnungen vorhanden.');

        const WarnEmbed = new EmbedBuilder()
            .setTitle('Information zu den Warnungen der Nutzer')
            .setDescription(`Hier ist eine Liste der gebannten Nutzer (\`${bans.length}👥\`)\n\n ${bans.length > 0 ? bans.join("\n") : "Keine Bans vorhanden!"}`)
            .setColor('Red')

        await interaction.channel.send({ embeds: [WarnEmbed] })
        await interaction.reply({ content: "> `✅` » Das Warn-Embed wurde gesendet.", ephemeral: true })
    }
}