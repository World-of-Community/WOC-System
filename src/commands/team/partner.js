const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const serverDB = require('../../../Datenbank/serverdb');

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
                        { name: 'Normale Partner', value: 'Normale Partner' },
                    )
                    .setRequired(true))
                .addUserOption(option => option.setName('owner').setDescription('» Besitzer des Server-Partners').setRequired(true))
                .addStringOption(option => option.setName('invite').setDescription('» Einladungslink des Server-Partners').setRequired(true))
        )
        .addSubcommand(command =>
            command
                .setName('edit')
                .setDescription('» Bearbeite einen Partner 🤝')
                .addStringOption(option => option.setName('partner').setDescription('» Wähle ein Server-Partner aus').setAutocomplete(true).setRequired(true))
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

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name === 'partner') {
            try {
                const serverData = await serverDB.findOne({ guildID: interaction.guild.id });
                if (!serverData || !serverData.partner || !serverData.partner.partners) {
                    await interaction.respond([{ name: '`❌` » Kein Partner gefunden', value: 'error' }]);
                    return;
                }

                const partners = serverData.partner.partners;
                const filtered = partners
                    .filter(partner => partner.name.toLowerCase().includes(focusedOption.value.toLowerCase()))
                    .slice(0, 25);

                if (filtered.length === 0) {
                    filtered.push({ name: '`❌` » Kein Eintrag', value: 'Kein Eintrag' });
                }

                await interaction.respond(
                    filtered.map(partner => ({ name: `${partner.name} (${partner.category || 'N/A'})`, value: partner.name }))
                );
            } catch (error) {
                console.error('Fehler beim Abrufen der Server-Partner aus der Datenbank:', error);
            }
        }
    },

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        switch (sub) {
            case 'add': {
                const name = interaction.options.getString('name');
                const kategorie = interaction.options.getString('kategorie');
                const owner = interaction.options.getUser('owner');
                const invite = interaction.options.getString('invite');

                const serverData = await serverDB.findOne({ guildID: interaction.guild.id });

                if (!isValidInviteLink(invite)) {
                    await interaction.reply({ content: '`❌` » Der angegebene Einladungslink ist ungültig.', ephemeral: true });
                    return;
                }

                if (!serverData || !serverData.partner) {
                    serverData.partner = { partners: [] };
                }

                const newPartner = { name, category: kategorie, ownerID: owner.id, invite };
                serverData.partner.partners.push(newPartner);

                try {
                    await serverData.save();
                    await interaction.reply({ content: `> \`✅\` » Der Server-Partner **${name}** (${owner}) wurde im Bereich **${kategorie}** erfolgreich hinzugefügt!`, ephemeral: true });
                } catch (error) {
                    console.error('Fehler beim Speichern der Partnerdaten:', error);
                    await interaction.reply({ content: '`❌` » Fehler beim Speichern der Partnerdaten.', ephemeral: true });
                }

                break;
            }

            case 'delete': {
                const partnerNameToDelete = interaction.options.getString('partner');

                try {
                    const serverData = await serverDB.findOne({ guildID: interaction.guild.id });

                    if (!serverData || !serverData.partner || !serverData.partner.partners) {
                        await interaction.reply({ content: '`❌` » Keine Server-Partner zum Löschen gefunden.', ephemeral: true });
                        return;
                    }

                    const partnerIndex = serverData.partner.partners.findIndex(
                        partner => partner.name.toLowerCase() === partnerNameToDelete.toLowerCase()
                    );

                    if (partnerIndex === -1) {
                        await interaction.reply({ content: '`❌` » Der angegebene Server-Partner wurde nicht gefunden.', ephemeral: true });
                        return;
                    }

                    serverData.partner.partners.splice(partnerIndex, 1);
                    await serverData.save();

                    await interaction.reply({ content: `> \`✅\` » Server-Partner **${partnerNameToDelete}** wurde erfolgreich gelöscht.`, ephemeral: true });
                } catch (error) {
                    console.error('Fehler beim Löschen des Partners:', error);
                    await interaction.reply({ content: '`❌` » Fehler beim Löschen des Partners.', ephemeral: true });
                }

                break;
            }

            case 'refresh': {
                try {
                    const serverData = await serverDB.findOne({ guildID: interaction.guild.id });

                    if (!serverData || !serverData.partner || !serverData.partner.partners || serverData.partner.partners.length === 0) {
                        await interaction.reply({ content: '> `❌` » Keine Server-Partner zum Aktualisieren gefunden.', ephemeral: true });
                        return;
                    }

                    const newEmbed = createPartnerListEmbed(serverData, interaction);
                    const channel = interaction.guild.channels.cache.get(serverData.partner.channel);
                    const sentMessage = await channel.messages.fetch(serverData.partner.msg);

                    await sentMessage.edit({ embeds: [newEmbed] });
                    await interaction.reply({ content: '> `✅` » Die Partnerliste wurde erfolgreich aktualisiert!', ephemeral: true });
                } catch (error) {
                    console.error('Fehler beim Aktualisieren der Partnerliste:', error);
                    await interaction.reply({ content: '> `❌` » Fehler beim Aktualisieren der Partnerliste.', ephemeral: true });
                }

                break;
            }
        }
    },
};

function isValidInviteLink(link) {
    const inviteRegex = /^(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|plus)\/|discordapp\.com\/invite\/)([a-zA-Z0-9]{2,32})$/;
    return inviteRegex.test(link);
}

function createPartnerListEmbed(serverData, interaction) {
    const embed = new EmbedBuilder()
        .setTitle('Unsere Partnerliste')
        .setColor('Blurple')
        //.setFooter({ text: 'Maximal 15 Server-Partner - Zuletzt aktualisiert:', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    
    const Info = "> Hier sind alle unsere Server-Partner - Wenn du selbst\n>ein Server-Partner werden möchtest,\n> schau bei <#1172819623935221810> vorbei.\n\n";

    const description = serverData.partner.partners.length > 0
        ? serverData.partner.partners
            .map((partner, index) => `\`${index + 1}.\` [${partner.name}](${partner.invite}) (${interaction.guild.members.cache.get(partner.ownerID)?.user.username || 'Unbekannt'})`)
            .join('\n')
        : '❌ » Keine Partner eingetragen';

    const currentTime = new Date(); // Aktuelle Zeit abrufen
    const formattedTime = currentTime.toLocaleString('de-DE', {
        timeZone: 'Europe/Berlin', // Setze die Zeitzone
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    embed.setDescription(Info + description)
         .setFooter({ text: `Zuletzt Aktualisiert: ${formattedTime}`, iconURL: interaction.guild.iconURL() });
         
    return embed;
}
