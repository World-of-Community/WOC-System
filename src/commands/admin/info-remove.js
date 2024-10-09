const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionBitField } = require('discord.js');

let teamEmbedMessageId = '1293559329961803950';

// Struktur zum Speichern von Teammitgliedern nach Kategorie
const teamMembers = {
    '> `🎯` | <@&959869691529154631>': [], // Admin
    '> `👨‍✈️` | <@&893423428558782465>': [], // Team-Leitung
    '> `👨‍💻` | <@&929349039433056276>': [], // Developer
    '> `🕵` | <@&816985466230145044>': [], // Sr-Moderator
    '> `👮` | <@&815920052385480754>': [], // Moderator
    '> `🧩` | <@&815920170371383366>': [], // Supporter
    '> `🪓` | <@&1263643648441241700>': [] // Builder
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info-remove')
        .setDescription('Entferne ein Teammitglied aus dem Embed. 🗑️')
        .addStringOption(option => 
            option.setName('bereich')
                .setDescription('Der Bereich des Teams')
                .setRequired(true)
                .addChoices(
                    { name: '🎯 Admin', value: '> `🎯` | <@&959869691529154631>' },
                    { name: '👨‍✈️ Team-Leitung', value: '> `👨‍✈️` | <@&893423428558782465>' },
                    { name: '👨‍💻 Developer', value: '> `👨‍💻` | <@&929349039433056276>' },
                    { name: '🕵 Sr-Moderator', value: '> `🕵` | <@&816985466230145044>' },
                    { name: '👮 Moderator', value: '> `👮` | <@&815920052385480754>' },
                    { name: '🧩 Supporter', value: '> `🧩` | <@&815920170371383366>' },
                    { name: '🪓 Builder', value: '> `🪓` | <@&1263643648441241700>' }
                ))
        .addUserOption(option => option.setName('user').setDescription('Das Teammitglied').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const bereich = interaction.options.getString('bereich');
        const user = interaction.options.getUser('user');

        // Finde den entsprechenden Schlüssel
        const key = Object.keys(teamMembers).find(k => k.includes(bereich));

        if (key) {
            // Entferne das Mitglied aus der entsprechenden Kategorie
            const memberEntry = `- ${user} (${interaction.options.getString('beschreibung') || 'keine Beschreibung'})`;
            const memberIndex = teamMembers[key].indexOf(memberEntry);

            if (memberIndex !== -1) {
                // Mitglied aus der Liste entfernen
                teamMembers[key].splice(memberIndex, 1);
                await interaction.reply({ content: '> `✅` » Das Teammitglied wurde entfernt!', ephemeral: true });
            } else {
                return interaction.reply({ content: '> `❌` » Das Teammitglied wurde nicht gefunden!', ephemeral: true });
            }
        } else {
            return interaction.reply({ content: 'Ungültiger Bereich angegeben!', ephemeral: true });
        }

        // Erstellung der Embed-Beschreibung aus den Teammitgliedern nach Kategorie
        let embedDescription = '';
        for (const [key, members] of Object.entries(teamMembers)) {
            if (members.length > 0) {
                // Sortiere Mitglieder alphabetisch nach Benutzernamen
                members.sort((a, b) => a.localeCompare(b));
                embedDescription += `${key}\n${members.join('\n')}\n\n`;
            }
        }

        // Überprüfe, ob das Embed existiert
        if (teamEmbedMessageId) {
            const channel = interaction.channel;
            const message = await channel.messages.fetch(teamEmbedMessageId);

            const embed = new EmbedBuilder(message.embeds[0]);
            embed.setDescription(embedDescription || 'Aktuell sind keine Teammitglieder aufgelistet. Bitte später erneut versuchen!');

            await message.edit({ embeds: [embed] });
        }
    },
};
