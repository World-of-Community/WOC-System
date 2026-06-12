import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} from 'discord.js';

import { DiscordBlacklist, MinecraftBlacklist } from '../../../Datenbank/blacklistdb.js';

function getTimestamp() {
    return new Date().toISOString();
}

export default {
    data: new SlashCommandBuilder()
        .setName('blacklist-v2')
        .setDescription('Blacklist System')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        // ===================== ADD =====================
        .addSubcommand(sub =>
            sub
                .setName('add')
                .setDescription('User zur Blacklist hinzufügen')
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

        // ===================== SHOW =====================
        .addSubcommand(sub =>
            sub
                .setName('show')
                .setDescription('Blacklist anzeigen')
        )

        // ===================== EDIT =====================
        .addSubcommand(sub =>
            sub
                .setName('edit')
                .setDescription('Blacklist Eintrag bearbeiten')
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
                        .setDescription('Neuer Grund')
                        .setRequired(true)
                )
        )

        // ===================== REMOVE =====================
        .addSubcommand(sub =>
            sub
                .setName('remove')
                .setDescription('Blacklist Eintrag entfernen')
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
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        // ===================== ADD =====================
        if (sub === 'add') {
            const type = interaction.options.getString('type');
            const name = interaction.options.getString('name');
            const grund = interaction.options.getString('grund');

            const data = {
                name,
                grund,
                addedAt: getTimestamp()
            };

            if (type === 'discord') {
                await DiscordBlacklist.create(data);
            } else {
                await MinecraftBlacklist.create(data);
            }

            return interaction.reply({
                content: `✅ ${type} **${name}** wurde zur Blacklist hinzugefügt.`,
                ephemeral: true
            });
        }

        // ===================== SHOW =====================
        if (sub === 'show') {
            const discordList = await DiscordBlacklist.find();
            const mcList = await MinecraftBlacklist.find();

            const embed = new EmbedBuilder()
                .setTitle('📋 Blacklist Übersicht')
                .setColor('Red');

            const discordText = discordList.length
                ? discordList.map(e =>
                    `👤 **${e.name}**\n📝 ${e.grund}\n📅 ${e.addedAt}`
                ).join('\n\n')
                : 'Keine Einträge';

            const mcText = mcList.length
                ? mcList.map(e =>
                    `🎮 **${e.name}**\n📝 ${e.grund}\n📅 ${e.addedAt}`
                ).join('\n\n')
                : 'Keine Einträge';

            embed.addFields(
                { name: 'Discord Blacklist', value: discordText.substring(0, 1024) },
                { name: 'Minecraft Blacklist', value: mcText.substring(0, 1024) }
            );

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // ===================== EDIT =====================
        if (sub === 'edit') {
            const type = interaction.options.getString('type');
            const name = interaction.options.getString('name');
            const grund = interaction.options.getString('grund');

            const Model = type === 'discord' ? DiscordBlacklist : MinecraftBlacklist;

            const entry = await Model.findOne({ name });
            if (!entry) {
                return interaction.reply({
                    content: `❌ Eintrag **${name}** nicht gefunden.`,
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

        // ===================== REMOVE =====================
        if (sub === 'remove') {
            const type = interaction.options.getString('type');
            const name = interaction.options.getString('name');

            const Model = type === 'discord' ? DiscordBlacklist : MinecraftBlacklist;

            const deleted = await Model.findOneAndDelete({ name });

            if (!deleted) {
                return interaction.reply({
                    content: `❌ Eintrag **${name}** nicht gefunden.`,
                    ephemeral: true
                });
            }

            return interaction.reply({
                content: `🗑️ Eintrag **${name}** wurde entfernt.`,
                ephemeral: true
            });
        }
    }
};