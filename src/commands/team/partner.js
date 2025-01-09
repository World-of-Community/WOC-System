const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const serverDB = require("../../../Datenbank/serverdb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('partner')
        .setDescription('Partner System')
        .addSubcommand(command =>
            command
                .setName('add')
                .setDescription('» Füge einen Server-Partner hinzu. 🤝')
                .addStringOption(option => option.setName('name').setDescription('» Name des Server-Partners').setRequired(true))
                .addStringOption(option => option.setName('kategorie').setDescription('» Kategorie des Server-Partners')
                    .addChoices(
                        { name: 'Kooperation Partner', value: 'Kooperation' },
                        { name: 'Normale Partner', value: 'Normale Partner' }
                    ).setRequired(true))
                .addUserOption(option => option.setName('owner').setDescription('» Besitzer des Server-Partners').setRequired(true))
                .addStringOption(option => option.setName('invite').setDescription('» Einladungslink des Server-Partners').setRequired(true))
        )
        .addSubcommand(command =>
            command
                .setName('delete')
                .setDescription('» Lösche einen Partner. 🤝')
                .addStringOption(option => option.setName('partner').setDescription('» Wähle ein Server-Partner aus').setAutocomplete(true).setRequired(true))
        )
        .addSubcommand(command =>
            command
                .setName('refresh')
                .setDescription('» Aktualisiere die Partnerliste. 🤝')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add':
                await handleAddPartner(interaction);
                break;

            case 'delete':
                await handleDeletePartner(interaction);
                break;

            case 'refresh':
                await handleRefreshPartners(interaction);
                break;

            default:
                await interaction.reply({ content: '> `❌` » Ungültiger Subcommand.', ephemeral: true });
        }
    },

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);

        if (focusedOption.name === 'partner') {
            try {
                const serverData = await serverDB.findOne({ guildID: interaction.guild.id });
                if (!serverData?.partner?.partners?.length) {
                    return interaction.respond([{ name: '> ❌ » Kein Partner gefunden', value: 'error' }]);
                }

                const filtered = serverData.partner.partners
                    .filter(partner => partner.name.toLowerCase().includes(focusedOption.value.toLowerCase()))
                    .slice(0, 25);

                await interaction.respond(filtered.map(partner => ({
                    name: `${partner.name} (${partner.category || 'N/A'})`,
                    value: partner.name,
                })));
            } catch (error) {
                console.error('Fehler bei der Autovervollständigung:', error);
            }
        }
    },
};

async function handleAddPartner(interaction) {
    const name = interaction.options.getString('name');
    const category = interaction.options.getString('kategorie');
    const owner = interaction.options.getUser('owner');
    const invite = interaction.options.getString('invite');

    if (!isValidInviteLink(invite)) {
        await interaction.reply({ content: '> `❌` » Der angegebene Einladungslink ist ungültig.', ephemeral: true });
        return;
    }

    try {
        const serverData = await serverDB.findOneAndUpdate(
            { guildID: interaction.guild.id },
            { $setOnInsert: { partner: { partners: [] } } },
            { upsert: true, new: true }
        );

        const newPartner = { name, category, ownerID: owner.id, invite };
        serverData.partner.partners.push(newPartner);

        await serverData.save();

        await interaction.reply({
            content: `> \`✅\` » Partner \`${name}\` erfolgreich hinzugefügt!`,
            ephemeral: true,
        });
    } catch (error) {
        console.error('Fehler beim Hinzufügen des Partners:', error);
        await interaction.reply({ content: '> `❌` » Fehler beim Hinzufügen des Partners.', ephemeral: true });
    }
}

async function handleDeletePartner(interaction) {
    const partnerName = interaction.options.getString('partner');

    try {
        const serverData = await serverDB.findOne({ guildID: interaction.guild.id });
        if (!serverData?.partner?.partners?.length) {
            await interaction.reply({ content: '> `❌` » Keine Partner gefunden.', ephemeral: true });
            return;
        }

        const index = serverData.partner.partners.findIndex(partner => partner.name.toLowerCase() === partnerName.toLowerCase());
        if (index === -1) {
            await interaction.reply({ content: '> `❌` » Partner nicht gefunden.', ephemeral: true });
            return;
        }

        serverData.partner.partners.splice(index, 1);
        await serverData.save();

        await interaction.reply({ content: `> \`✅\` » Partner \`${partnerName}\` erfolgreich gelöscht.`, ephemeral: true });
    } catch (error) {
        console.error('Fehler beim Löschen des Partners:', error);
        await interaction.reply({ content: '> `❌` » Fehler beim Löschen des Partners.', ephemeral: true });
    }
}

async function handleRefreshPartners(interaction) {
    try {
        const serverData = await serverDB.findOne({ guildID: interaction.guild.id });
        if (!serverData?.partner?.partners?.length) {
            await interaction.reply({ content: '> `❌` » Keine Partner gefunden.', ephemeral: true });
            return;
        }

        const embed = createPartnerListEmbed(serverData, interaction);
        await interaction.reply({ content: '> `✅` » Partnerliste aktualisiert!', embeds: [embed], ephemeral: true });
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Partnerliste:', error);
        await interaction.reply({ content: '> `❌` » Fehler beim Aktualisieren der Partnerliste.', ephemeral: true });
    }
}

function isValidInviteLink(link) {
    const regex = /^(https?:\/\/)?(discord\.(gg|io|me|li|plus)\/|discordapp\.com\/invite\/)([a-zA-Z0-9-]{2,32})\/?$/;
    return regex.test(link);
}

function createPartnerListEmbed(serverData, interaction) {
    const embed = new EmbedBuilder()
        .setTitle('Unsere Partnerliste')
        .setColor('Blurple')
        .setFooter({ text: 'Maximal 15 Server-Partner', iconURL: interaction.guild.iconURL() });

    const partnersByCategory = {
        Kooperation: [],
        'Normale Partner': [],
    };

    for (const partner of serverData.partner.partners) {
        partnersByCategory[partner.category].push(partner);
    }

    for (const [category, partners] of Object.entries(partnersByCategory)) {
        embed.addFields({
            name: category,
            value: partners.length
                ? partners.map((p, i) => `\`${i + 1}.\` [${p.name}](${p.invite}) (${interaction.guild.members.cache.get(p.ownerID)?.user.tag || 'Unbekannt'})`).join('\n')
                : '> `❌` » Kein Eintrag',
        });
    }

    return embed;
}
