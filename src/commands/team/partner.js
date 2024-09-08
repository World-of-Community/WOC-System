const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const serverDB = require("../../../Datenbank/serverdb")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('partner')
        .setDescription('Partner System')
        .addSubcommand((command) =>
            command
            .setName('add')
            .setDescription('» Füge einen Server-Partner hinzu. 🤝')
            .addStringOption(option => option.setName('name').setDescription('» Name des Server-Partners').setRequired(true))
            .addStringOption(option => option.setName('kategorie').setDescription('» Kategorie des Server-Partners')
            .addChoices(
            { name: 'Kooperation Partner', value: 'Kooperation' },     
            { name: 'Normale Partner', value: 'Normale Partner' }, 
            ).setDescription('» Wähle die Kategorie des Partners aus.').setRequired(true))
            .addUserOption(option => option.setName('owner').setDescription('» Besitzer des Server-Partners').setRequired(true))
            .addStringOption(option => option.setName('invite').setDescription('» Einladungslink des Server-Partners').setRequired(true)))
        .addSubcommand((command) =>
            command
                .setName('edit')
                .setDescription('» Bearbeite einen Partner 🤝')
                .addStringOption(option => option.setName('partner').setDescription('» Wähle ein Server-Partner aus').setAutocomplete(true).setRequired(true)),
        )
        .addSubcommand((command) =>
            command
                .setName('delete')
                .setDescription('» Lösche einen Partner. 🤝')
                .addStringOption((option) => option.setName('partner').setDescription('» Wähle ein Server-Partner aus').setAutocomplete(true).setRequired(true))
        )
        .addSubcommand((command) =>
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
                        await interaction.respond({name: "> ❌ » Kein Partner gefunden", value: "error"});
                        console.log('Keine Partner gefunden.');
                        return;
                    }
        
                    const partners = serverData.partner.partners;

        
                    const filtered = partners.filter(partner => partner.name.toLowerCase().includes(focusedOption.value.toLowerCase())).slice(0, 25);

                    if (filtered.length === 0) {
                        filtered.push({ name: '❌ » Kein Eintrag', value: 'Kein Eintrag' });
                    }
                    
                    await interaction.respond(filtered.map(partner => ({ name: partner.name + ` (${undefined ?  "N/A" : partner.category})`, value: partner.name })));
                } catch (error) {
                    console.error('Fehler beim Abrufen der Server-Partner aus der Datenbank:', error);
                }
            }
        },
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        switch (sub) {
            case 'add':
                const name = interaction.options.getString('name');
                const kategorie = interaction.options.getString('kategorie');
                const owner = interaction.options.getUser('owner');
                const invite = interaction.options.getString('invite');

                let serverData = await serverDB.findOneAndUpdate(
                    { guildID: interaction.guild.id}
                );

                if (!isValidInviteLink(invite)) {
                    await interaction.reply({ content: '> `❌` » Der angegebene Einladungslink ist ungültig.', ephemeral: true });
                    return;
                }

                if (!owner) {
                    await interaction.reply({ content: '> ❌ » Nutzer wurde nicht gefunden.', ephemeral: true });
                    return;
                }

                if (!serverData.partner || !serverData.partner.msg || !serverData.partner.channel) {
                    const newEmbed = new EmbedBuilder()
                        .setTitle('Partnerliste')
                        .setColor('Blurple')
                        .setDescription('» Hier findest du alles über unsere Server-Partner - Wenn du selbst ein\nServer-Partner werden möchtest schau in <#1172819623935221810> vorbei.')
                        .setFooter({ text: `Maximale Server-Partner sind (**15**)`, iconURL: `${interaction.guild.iconURL()}` })

                        if(kategorie === "Kooperation") {
                            newEmbed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (${owner})`, inline: false });
                            } else {
                                newEmbed.addFields({ name: "Kooperation", value: `> \`❌\` » Kein Eintrag`, inline: false });   
                            }
                                    if(kategorie === "Normale Partner") {
                                        newEmbed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (${owner})`, inline: false });
                                        } else {
                                            newEmbed.addFields({ name: "Normale Partner", value: `> \`❌\` » Kein Eintrag`, inline: false });
                                        }
                    const channel = interaction.channel;
                    const sentMessage = await channel.send({ embeds: [newEmbed] });

                    const newPartner = { name, category: kategorie };
                    serverData.partner.partners.push(newPartner);
                    serverData.partner.msg = sentMessage.id;
                    serverData.partner.channel = channel.id;
                    await serverData.save();

                    await interaction.reply({content: '> `✅` » Partner erfolgreich hinzugefügt!', ephemeral: true});
                } else {
                    let channel, sentMessage;
                    try {
                        channel = interaction.guild.channels.cache.get(serverData.partner.channel);
                        sentMessage = await channel.messages.fetch(serverData.partner.msg);
                    } catch (error) {
                        console.error('Fehler beim Abrufen des Kanals oder der Nachricht:', error);
                        const newEmbed = new EmbedBuilder()
                            .setTitle('Unsere Partnerliste')
                            .setColor('Blurple')
                            .setDescription('» Hier findest du alles über unsere Server-Partner - Wenn du selbst ein\nServer-Partner werden möchtest schau in <#1172819623935221810> vorbei.')

                            if(kategorie === "Kooperation") {
                                newEmbed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (${owner})`, inline: false });
                                } else {
                                    newEmbed.addFields({ name: "Kooperation", value: `> \`❌\` » Kein Eintrag`, inline: false });   
                                }
                                        if(kategorie === "Normale Partner") {
                                            newEmbed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (${owner})`, inline: false });
                                            } else {
                                                newEmbed.addFields({ name: "Normale Partner", value: `> \`❌\` » Kein Eintrag`, inline: false });   
                                            }

                        channel = interaction.channel;
                        sentMessage = await channel.send({ embeds: [newEmbed] });


                        const newPartner = { name, category: kategorie, ownerID: owner.id, invite };
                        serverData.partner.partners.push(newPartner);
                        serverData.partner.msg = sentMessage.id;
                        serverData.partner.channel = channel.id;
                        try {
                            await serverData.save();
                            await interaction.reply({content: `> \`✅\` » Der Server-Partner \`${name}\` (${owner}) wurde im Bereich \`${kategorie}\` erfolgreich hinzugefügt!`, ephemeral: true});
                        } catch (error) {
                            await interaction.reply('> `❌` » Fehler!');
                            await interaction.reply('Fehler beim Speichern der Partnerdaten.');
                        }
                        return;
                    }

                    const existingEmbed = EmbedBuilder.from(sentMessage.embeds[0]);
                    const existingFieldIndex = existingEmbed.data.fields.findIndex(field => field.name === kategorie);
                    
                    if (existingFieldIndex !== -1) {
                        const fieldValue = existingEmbed.data.fields[existingFieldIndex].value;
                        if (fieldValue.includes("> \`❌\` » Kein Eintrag")) {
                            existingEmbed.data.fields[existingFieldIndex].value = `${fieldValue.replace("> \`❌\` » Kein Eintrag", "")}\n${fieldValue.split('\n').length}. [${name}](${invite}) (${owner})`;
                        } else {
                            existingEmbed.data.fields[existingFieldIndex].value += `\n${fieldValue.split('\n').length + 1}. [${name}](${invite}) (${owner})`;
                        }
                    } 
                    
                    const newPartner = { name, category: kategorie, ownerID: owner.id, invite };
                    serverData.partner.partners.push(newPartner);
                    await sentMessage.edit({ embeds: [existingEmbed] });
                    try {
                        await serverData.save();
                        await interaction.reply({content: `> \`✅\` » Der Server-Partner \`${name}\` (${owner}) wurde im Bereich \`${kategorie}\` erfolgreich hinzugefügt!`, ephemeral: true});
                    } catch (error) {
                        console.error('Fehler beim Speichern der Partnerdaten:', error);
                        await interaction.reply('> `❌` » Fehler!');
                    }
                }
                break;

                case 'delete':
                    const partnerNameToDelete = interaction.options.getString('partner');
                    
                    try {
                        const serverData = await serverDB.findOne({ guildID: interaction.guild.id });
                    
                        if (!serverData || !serverData.partner || !serverData.partner.partners || serverData.partner.partners.length === 0) {
                            await interaction.reply({content: '> `❌` » Keine Server-Partner zum Löschen gefunden.', ephemeral: true});
                            return;
                        }
                    
                        const partnerIndex = serverData.partner.partners.findIndex(partner => partner.name.toLowerCase() === partnerNameToDelete.toLowerCase());
                    
                        if (partnerIndex === -1) {
                            await interaction.reply({content: '> `❌` » Der angegebene Server-Partner wurde nicht gefunden.', ephemeral: true});
                            return;
                        }
                    
                        const deletedPartner = serverData.partner.partners.splice(partnerIndex, 1)[0];
                    
                        await serverData.save();

                        const channel = interaction.guild.channels.cache.get(serverData.partner.channel);
                        const sentMessage = await channel.messages.fetch(serverData.partner.msg);
                        const existingEmbed = EmbedBuilder.from(sentMessage.embeds[0]);
                        const existingFieldIndex = existingEmbed.data.fields.findIndex(field => field.name.toLowerCase() === deletedPartner.category.toLowerCase());
                        
                        if (existingFieldIndex !== -1) {
                            const partnersInSameCategory = serverData.partner.partners.filter(partner => partner.category.toLowerCase() === deletedPartner.category.toLowerCase());
                            existingEmbed.data.fields[existingFieldIndex].value = partnersInSameCategory.map((partner, index) => `${index + 1}. [${partner.name}](${partner.invite}) (${interaction.guild.members.cache.get(partner.ownerID)})`).join('\n');
                            
                            if (partnersInSameCategory.length === 0) {
                                existingEmbed.data.fields[existingFieldIndex].value = '> \`❌\` » Kein Eintrag';
                            }
                    
                            await sentMessage.edit({ embeds: [existingEmbed] });
                        }
                    
                        await interaction.reply({content: `> \`✅\` » Server-Partner \`${partnerNameToDelete}\` wurde erfolgreich gelöscht.`, ephemeral: true});
                    } catch (error) {
                        console.error('Fehler beim Löschen des Partners:', error);
                        await interaction.reply('Fehler beim Löschen des Partners.');
                    }
                    break;  
                
            case 'edit':
                break;

            case 'refresh':
                try {
                    const serverData = await serverDB.findOne({ guildID: interaction.guild.id });

                    if (!serverData || !serverData.partner || !serverData.partner.partners || serverData.partner.partners.length === 0) {
                        await interaction.reply({ content: '> `❌` » Keine Server-Partner zum Aktualisieren gefunden.', ephemeral: true });
                        return;
                    }

                    const channel = interaction.guild.channels.cache.get(serverData.partner.channel);
                    const sentMessage = await channel.messages.fetch(serverData.partner.msg);

                    const newEmbed = new EmbedBuilder()
                        .setTitle('Unsere Partnerliste')
                        .setColor('Blurple')
                        .setDescription('» Hier findest du alles über unsere Server-Partner - Wenn du selbst ein\nServer-Partner werden möchtest schau in <#1172819623935221810> vorbei.')
                        .setFooter({ text: `Maximal 15 Server-Partner`, iconURL: `${interaction.guild.iconURL()}` });

                    const cooperationPartners = serverData.partner.partners.filter(partner => partner.category === 'Kooperation');
                    const normalPartners = serverData.partner.partners.filter(partner => partner.category === 'Normale Partner');

                    if (cooperationPartners.length > 0) {
                        newEmbed.addFields({
                            name: 'Kooperation',
                            value: cooperationPartners.map((partner, index) => `${index + 1}. [${partner.name}](${partner.invite}) (${interaction.guild.members.cache.get(partner.ownerID)})`).join('\n'),
                            inline: false,
                        });
                    } else {
                        newEmbed.addFields({ name: 'Kooperation', value: '> `❌` » Kein Eintrag', inline: false });
                    }

                    if (normalPartners.length > 0) {
                        newEmbed.addFields({
                            name: 'Normale Partner',
                            value: normalPartners.map((partner, index) => `${index + 1}. [${partner.name}](${partner.invite}) (${interaction.guild.members.cache.get(partner.ownerID)})`).join('\n'),
                            inline: false,
                        });
                    } else {
                        newEmbed.addFields({ name: 'Normale Partner', value: '> `❌` » Kein Eintrag', inline: false });
                    }

                    // Update the message with the new embed
                    await sentMessage.edit({ embeds: [newEmbed] });

                    await interaction.reply({ content: '> `✅` » Die Partnerliste wurde erfolgreich aktualisiert!', ephemeral: true });

                } catch (error) {
                    console.error('Fehler beim Aktualisieren der Partnerliste:', error);
                    await interaction.reply({ content: '> `❌` » Fehler beim Aktualisieren der Partnerliste.', ephemeral: true });
                }
                break;
        }
    },
};
function isValidInviteLink(link) {
    const inviteRegex = /^(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|plus)\/|discordapp\.com\/invite\/)([a-zA-Z0-9]{2,32})\/?$/;
    return inviteRegex.test(link);
}