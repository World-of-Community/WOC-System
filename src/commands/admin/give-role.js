const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give-role')
        .setDescription('» Gebe einem Nutzer eine Rolle. 🎭')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('» Welcher User soll es sein?')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('» Welche Rolle soll der User bekommen?')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const user = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');

        try {
            // Nutzer holen und Rolle zuweisen
            const member = await interaction.guild.members.fetch(user);
            await member.roles.add(role);
            await interaction.reply({
                content: `> \`✅\` » Die <@&${role.id}>-Rolle wurde an ${member} **vergeben**.`,
                ephemeral: true,
            });

            // Log-Kanal und Thread holen
            const logchannel = interaction.guild.channels.cache.get("1263436406655680513");
            if (!logchannel) {
                return interaction.followUp({
                    content: '> `❌` » Logkanal nicht gefunden.',
                    ephemeral: true,
                });
            }

            const thread = await logchannel.threads.fetch("1269998221518831721").catch(() => null);
            if (!thread) {
                return interaction.followUp({
                    content: '> `❌` » Thread nicht gefunden oder ungültig.',
                    ephemeral: true,
                });
            }

            // Embed erstellen und im Thread senden
            const giverole = new EmbedBuilder()
                .setTitle('Info zum `/give-role` Befehl')
                .setDescription(
                    `${interaction.user} hat den \`/give-role\` Befehl benutzt und ${member} die ${role} Rolle gegeben.`
                )
                .setThumbnail(
                    member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 })
                )
                .setColor('Blurple')
                .setTimestamp();

            await thread.send({ embeds: [giverole] });
        } catch (error) {
            console.error('Fehler beim Hinzufügen der Rolle:', error);
            interaction.reply({
                content: '> `❌` » Ein Fehler ist aufgetreten.',
                ephemeral: true,
            });
        }
    },
};
