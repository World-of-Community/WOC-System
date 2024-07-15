const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Dateipfad zur JSON-Datei
const filePath = path.join(__dirname, '../.src/json/emoji.json');

// Funktion zum Laden der JSON-Daten
function loadConfig() {
    if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(rawData);
    }
    return {};
}

// Funktion zum Speichern der JSON-Daten
function saveConfig(emoji) {
    fs.writeFileSync(filePath, JSON.stringify(emoji, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji-system')
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
        const config = loadConfig();

        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '> `❌` » Du hast keine Rechte, diesen Befehl zu benutzen.', ephemeral: true });
        }

        const guildID = interaction.guild.id;

        if (interaction.options.getSubcommand() === 'add') {
            const role = interaction.options.getRole('role');

            if (config[guildID] && config[guildID].includes(role.id)) {
                return interaction.reply({ content: `> ⚠️ » Die Rolle ${role} ist bereits hinzugefügt.`, ephemeral: true });
            }

            if (!config[guildID]) {
                config[guildID] = [];
            }

            config[guildID].push(role.id);
            saveConfig(config);

            return interaction.reply({ content: `> \`✅\` » Du hast die Rolle ${role} erfolgreich hinzugefügt.`, ephemeral: true });
        }

        if (interaction.options.getSubcommand() === 'remove') {
            const role = interaction.options.getRole('role');

            if (!config[guildID] || !config[guildID].includes(role.id)) {
                return interaction.reply({ content: '> ⚠️ » Diese Rolle ist nicht in der Liste.', ephemeral: true });
            }

            config[guildID] = config[guildID].filter(id => id !== role.id);
            saveConfig(config);

            return interaction.reply({ content: `> \`✅\` » Du hast die Rolle ${role} erfolgreich entfernt.`, ephemeral: true });
        }

        if (interaction.options.getSubcommand() === 'list') {
            const roleListe = config[guildID]?.map(roleId => `<@&${roleId}>`).join('\n') || 'Keine Rollen als Emoji-Bypass aufgelistet.';

            const embed = new EmbedBuilder()
                .setTitle('ROLLENINFO `/emoji`')
                .setDescription(`Hier sind alle Rollen aufgelistet die \`/emoji\` verwenden dürfen\n\n${roleListe}`)
                .setColor('Blurple');

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};