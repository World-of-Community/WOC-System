const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require('fs')
const ms = require("ms");
const timeoutdb = require("../../Datenbank/timeoutdb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('» Gebe einem User einen Timeout für eine bestimmte Dauer. 🕒')
        .addUserOption(option => option.setName('user').setDescription('» Welcher User soll in Timeout?').setRequired(true))
        .addStringOption(option => option.setName('grund').setDescription('» Gebe ein Grund an').setRequired(true))
        .addStringOption(option => option.setName('dauer').setDescription('» Gebe eine Dauer an (5d 30m)').setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.ManageRoles),

    async execute(interaction) {
        
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return;

        const member = interaction.options.getMember('user');
        const reason = interaction.options.getString('grund');
        const duration = interaction.options.getString('dauer');
        const timeoutRole = '843515552546684949'; // Add the ID of the timeout role in your config.json
        const memberRole = '815920703067914290'; // Add the ID of the member role in your config.json
        const logChannelId = '1250954769598775308';

        const durationMs = ms(duration);

        const createdAt = `<t:${Math.round(member.user.createdTimestamp / 1000)}>`;
        const joinedAt = `<t:${Math.round(member.joinedTimestamp / 1000)}>`;

        const timeoutEmbed = new EmbedBuilder()
            .setTitle(`\`⏳\` - ${member.displayName} wurde in Timeout gesetzt.`)
            .setDescription(`${member} wurde von ${interaction.user} in Timeout gesetzt.\n\n> \`👤\` - **BENUTZER INFORMATIONEN**\n> Grund: \`${reason}\`\n> Dauer: \`${duration}\`\n> Benutzername: **${member.user.username}** (\`${member.id}\`) (${member})\n> Account erstellt am: ${createdAt}\n> Beigetreten am: ${joinedAt}`)
            .setColor('Orange')
            .setFooter({ text: `©️ ${interaction.guild.name} | Timeout-System`, iconURL: `${interaction.client.user.displayAvatarURL()}` });

            const logChannel = await interaction.guild.channels.fetch(logChannelId);
        
        member.roles.add(timeoutRole)
            .then(() => {
                member.roles.remove(memberRole);

                const newTimeout = new timeoutdb({
                    creator: interaction.user.id,
                    user: member.id,
                    reason: reason,
                    duration: durationMs,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + durationMs),
                });

                newTimeout.save();

                setTimeout(async () => {
                    await member.roles.remove(timeoutRole);
                    await member.roles.add(memberRole);
                    // You can send a message to the user or log the removal here if needed
                }, durationMs);

                interaction.reply({ content: `> \`✅\` » Du hast ${member} erfolgreich in Timeout gesetzt für **${duration}**.`, ephemeral: true });
            })
            .catch(err => {
                console.error(err);
                interaction.reply({ content: `> \`❌\` » Ein Fehler ist aufgetreten.`, ephemeral: true });
            });
    }
};