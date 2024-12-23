const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const ms = require("ms");
const bandb = require("../../../Datenbank/bandb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('» Banne einen User. 🔒')
        .addUserOption(option =>
            option.setName('user').setDescription('» Welcher User soll gebannt werden?').setRequired(true))
        .addStringOption(option =>
            option.setName('grund').setDescription('» Gebe einen Grund an').setRequired(true))
        .addStringOption(option =>
            option.setName('dauer').setDescription('» Gebe eine Dauer an (z.B. 5d 30m)')
                .addChoices(
                    { name: '🕒 » 15 Minuten', value: '15m' },
                    { name: '🕒 » 30 Minuten', value: '30m' },
                    { name: '🕒 » 45 Minuten', value: '45m' },
                    { name: '🕒 » 1 Stunde', value: '1h' },
                    { name: '🕒 » 2 Stunden', value: '2h' },
                    { name: '🕒 » 6 Stunden', value: '6h' },
                    { name: '⛔ » PERMANENT', value: 'PERMANENT' }
                ).setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const member = interaction.options.getMember('user');
        const reason = interaction.options.getString('grund');
        const durationInput = interaction.options.getString('dauer') || 'PERMANENT';

        const banRole = interaction.guild.roles.cache.get("886989738244964362");
        const memberRole = interaction.guild.roles.cache.get("815920703067914290");
        const logChannel = interaction.guild.channels.cache.get("1269998219266490538");

        if (!banRole || !memberRole || !logChannel) {
            return interaction.reply({ content: '> \`❌\` » Rollen oder Log-Kanal konnten nicht gefunden werden.', ephemeral: true });
        }

        const createdAt = `<t:${Math.round(member.user.createdTimestamp / 1000)}>`;
        const joinedAt = `<t:${Math.round(member.joinedTimestamp / 1000)}>`;
        const durationMs = durationInput !== 'PERMANENT' ? ms(durationInput) : null;
        const endTime = durationMs ? new Date(Date.now() + durationMs) : null;

        // Apply Roles
        await member.roles.add(banRole);
        await member.roles.remove(memberRole);

        // Create Embed
        const banEmbed = new EmbedBuilder()
            .setTitle(`\`⛔\` - ${member.displayName} wurde gebannt.`)
            .setDescription(`${member} wurde von ${interaction.user} gebannt.\n\n\`👤\` **Benutzer Informationen:**\n> **Grund:** \`${reason}\`\n> **Dauer:** \`${durationInput === 'PERMANENT' ? 'Permanent' : ms(durationMs, { long: true })}\`\n> **Benutzername:** ${member.user.username} (\`${member.id}\`)\n> **Account erstellt am:** ${createdAt}\n> **Beigetreten am:** ${joinedAt}`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setColor('Red')
            .setFooter({ text: `©️ ${interaction.guild.name} | Bann-System`, iconURL: interaction.client.user.displayAvatarURL() });

        // Save Ban to Database
        try {
            await new bandb({
                creator: interaction.user.id,
                user: member.id,
                reason,
                duration: durationInput === 'PERMANENT' ? null : durationMs,
                startTime: new Date(),
                endTime,
            }).save();
        } catch (err) {
            return interaction.reply({ content: '> \`❌\` » Fehler beim Speichern des Banns in der Datenbank.', ephemeral: true });
        }

        // Send Logs and Reply
        await logChannel.send({ embeds: [banEmbed] });
        await interaction.reply({ content: `> \`✅\` » ${member} wurde erfolgreich gebannt.`, ephemeral: true });
    }
};
