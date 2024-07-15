const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const serverdb = require('../../Datenbank/serverdb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription('» Verwaltung der Emoji-Rechte für bestimmte Rollen. 🎭')
        .addSubcommand(subcommand => 
            subcommand.setName('add')
                .setDescription('» Füge eine Rolle hinzu, die Emojis verwenden darf.')
                .addRoleOption(option => 
                    option.setName('role')
                        .setDescription('Welche Rolle möchtest du hinzufügen?')
                        .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand.setName('remove')
                .setDescription('» Entferne eine Rolle, die Emojis verwenden darf.')
                .addRoleOption(option => 
                    option.setName('role')
                        .setDescription('Welche Rolle möchtest du entfernen?')
                        .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand.setName('list')
                .setDescription('» Zeige alle Rollen an, die Emojis verwenden dürfen.')),

    async execute(interaction) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '> `❌` » Du hast keine Rechte, diesen Befehl zu benutzen.', ephemeral: true });
        }

        if (interaction.options.getSubcommand() === 'add') {
            const role = interaction.options.getRole('role');
            const data = await serverdb.findOne({ guildID: interaction.guild.id, emojiRoles: { $in: [role.id] } });

            if (data) {
                return interaction.reply({ content: `> ⚠️ » Die Rolle ${role} ist bereits hinzugefügt.`, ephemeral: true });
            }

            await serverdb.findOneAndUpdate({ guildID: interaction.guild.id }, { $push: { emojiRoles: role.id } }, { upsert: true });
            return interaction.reply({ content: `> \`✅\` » Du hast die Rolle ${role} erfolgreich hinzugefügt.`, ephemeral: true });
        }

        if (interaction.options.getSubcommand() === 'remove') {
            const role = interaction.options.getRole('role');
            const data = await serverdb.findOne({ guildID: interaction.guild.id, emojiRoles: { $in: [role.id] } });

            if (!data) {
                return interaction.reply({ content: '> ⚠️ » Diese Rolle ist nicht in der Liste.', ephemeral: true });
            }

            await serverdb.findOneAndUpdate({ guildID: interaction.guild.id }, { $pull: { emojiRoles: role.id } });
            return interaction.reply({ content: `> \`✅\` » Du hast die Rolle ${role} erfolgreich entfernt.`, ephemeral: true });
        }

        if (interaction.options.getSubcommand() === 'list') {
            const serverData = await serverdb.findOne({ guildID: interaction.guild.id });
            const roleListe = serverData?.emojiRoles?.map(roleId => `<@&${roleId}>`).join('\n') || 'Keine Rollen als Emoji-Bypass aufgelistet.';

            const embed = new EmbedBuilder()
                .setTitle('ROLLENINFO `/emoji`')
                .setDescription(`Hier sind alle Rollen aufgelistet die \`/emoji\` verwenden dürfen\n\n${roleListe}`)
                .setColor('Blurple');

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
