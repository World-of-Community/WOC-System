/*
import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} from 'discord.js';

import {
    DiscordBlacklist,
    MinecraftBlacklist
} from '../../../Datenbank/blacklistdb.js';

function getTimestamp() {
    return new Date().toISOString();
}

// ================= EMBED BUILDER =================
function buildEmbed(type, data) {
    const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle(`📋 Blacklist (${type.toUpperCase()})`);

    const text = data.length
        ? data.map(e =>
            type === 'discord'
                ? `👤 **${e.name}**\n📝 ${e.grund}\n📅 ${e.addedAt}`
                : `🎮 **${e.name}**\n📝 ${e.grund}\n📅 ${e.addedAt}`
        ).join('\n\n')
        : 'Keine Einträge';

    embed.setDescription(text.slice(0, 4000));
    return embed;
}

// ================= BUTTONS =================
function buildButtons(active) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('blacklist_discord')
            .setLabel('Discord')
            .setStyle(active === 'discord' ? ButtonStyle.Danger : ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('blacklist_minecraft')
            .setLabel('Minecraft')
            .setStyle(active === 'minecraft' ? ButtonStyle.Success : ButtonStyle.Secondary)
    );
}

export default {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Blacklist System')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        // ================= ADD =================
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Zur Blacklist hinzufügen')
                .addStringOption(o =>
                    o.setName('type')
                        .setDescription('discord oder minecraft')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Discord', value: 'discord' },
                            { name: 'Minecraft', value: 'minecraft' }
                        )
                )
                .addStringOption(o =>
                    o.setName('name')
                        .setDescription('Name')
                        .setRequired(true)
                )
                .addStringOption(o =>
                    o.setName('grund')
                        .setDescription('Grund')
                        .setRequired(true)
                )
        )

        // ================= SHOW =================
        .addSubcommand(sub =>
            sub.setName('show')
                .setDescription('Blacklist anzeigen')
        )

        // ================= EDIT =================
        .addSubcommand(sub =>
            sub.setName('edit')
                .setDescription('Eintrag bearbeiten')
                .addStringOption(o =>
                    o.setName('type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Discord', value: 'discord' },
                            { name: 'Minecraft', value: 'minecraft' }
                        )
                )
                .addStringOption(o =>
                    o.setName('name')
                        .setRequired(true)
                )
                .addStringOption(o =>
                    o.setName('grund')
                        .setRequired(true)
                )
        )

        // ================= REMOVE =================
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Eintrag entfernen')
                .addStringOption(o =>
                    o.setName('type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Discord', value: 'discord' },
                            { name: 'Minecraft', value: 'minecraft' }
                        )
                )
                .addStringOption(o =>
                    o.setName('name')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {

        const sub = interaction.options.getSubcommand();

        // ================= ADD =================
        if (sub === 'add') {

            const type = interaction.options.getString('type');
            const name = interaction.options.getString('name');
            const grund = interaction.options.getString('grund');

            const Model = type === 'discord'
                ? DiscordBlacklist
                : MinecraftBlacklist;

            await Model.create({
                name,
                grund,
                addedAt: getTimestamp()
            });

            return interaction.reply({
                content: `✅ **${name}** wurde zur ${type} Blacklist hinzugefügt.`,
                ephemeral: true
            });
        }

        // ================= SHOW =================
        if (sub === 'show') {

            const discordData = await DiscordBlacklist.find();
            const mcData = await MinecraftBlacklist.find();

            let active = 'discord';

            await interaction.reply({
                embeds: [buildEmbed(active, discordData)],
                components: [buildButtons(active)],
                ephemeral: true
            });

            const msg = await interaction.fetchReply();

            const collector = msg.createMessageComponentCollector();

            collector.on('collect', async (i) => {

                if (i.user.id !== interaction.user.id) {
                    return i.reply({
                        content: '❌ Nicht dein Menü.',
                        ephemeral: true
                    });
                }

                if (i.customId === 'blacklist_discord') {
                    active = 'discord';

                    return i.update({
                        embeds: [buildEmbed('discord', discordData)],
                        components: [buildButtons('discord')]
                    });
                }

                if (i.customId === 'blacklist_minecraft') {
                    active = 'minecraft';

                    return i.update({
                        embeds: [buildEmbed('minecraft', mcData)],
                        components: [buildButtons('minecraft')]
                    });
                }
            });
        }

        // ================= EDIT =================
        if (sub === 'edit') {

            const type = interaction.options.getString('type');
            const name = interaction.options.getString('name');
            const grund = interaction.options.getString('grund');

            const Model = type === 'discord'
                ? DiscordBlacklist
                : MinecraftBlacklist;

            const entry = await Model.findOne({ name });

            if (!entry) {
                return interaction.reply({
                    content: `❌ Eintrag nicht gefunden.`,
                    ephemeral: true
                });
            }

            entry.grund = grund;
            await entry.save();

            return interaction.reply({
                content: `✏️ Eintrag **${name}** wurde aktualisiert.`,
                ephemeral: true
            });
        }

        // ================= REMOVE =================
        if (sub === 'remove') {

            const type = interaction.options.getString('type');
            const name = interaction.options.getString('name');

            const Model = type === 'discord'
                ? DiscordBlacklist
                : MinecraftBlacklist;

            const deleted = await Model.findOneAndDelete({ name });

            if (!deleted) {
                return interaction.reply({
                    content: `❌ Eintrag nicht gefunden.`,
                    ephemeral: true
                });
            }

            return interaction.reply({
                content: `🗑️ **${name}** wurde entfernt.`,
                ephemeral: true
            });
        }
    }
};
*/