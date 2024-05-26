const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const serverDB = require("../../Datenbank/serverdb")



module.exports = {
    data: new SlashCommandBuilder()
        .setName('partner')
        .setDescription('Parnter System')
        .addSubcommand((command) =>
            command
            .setName('add')
            .setDescription('» Füge einen Partner hinzu. 🤝')
            .addStringOption(option => option.setName('name').setDescription('» Name des Partners').setRequired(true))
            .addStringOption(option => option.setName('kategorie').setDescription('» Kategorie des Partners')
            .addChoices(
            { name: 'Kooperation Partner', value: 'Kooperation' },    
            { name: 'Mega Partner', value: 'Mega Partner' }, 
            { name: 'Großer Partner', value: 'Großer Partner' }, 
            { name: 'Normaler Partner', value: 'Normaler Partner' }, 
            ).setDescription('» Wähle die Kategorie des Partners aus.').setRequired(true))
            .addStringOption(option => option.setName('owner').setDescription('» Besitzer des Partners').setRequired(true))
            .addStringOption(option => option.setName('invite').setDescription('» Einladungslink des Partners').setRequired(true)))
        .addSubcommand((command) =>
            command
                .setName('edit')
                .setDescription('» LBearbeite einen Partner 🤝')
                .addUserOption(option => option.setName('partner').setDescription('» Wähle ein Partner aus').setAutocomplete(true).setRequired(true)),
        )
        .addSubcommand((command) =>
            command
                .setName('delete')
                .setDescription('» Lösche einen Partner. 🤝')
                .addIntegerOption((option) => option.setName('partner').setDescription('» Wähle ein Parnter aus').setAutocomplete(true).setRequired(true))
        ),
        async autocomplete(interaction) {
            const focusedOption = interaction.options.getFocused(true);
            if (focusedOption.name === 'partner') {
                const guilds = await interaction.client.guilds.fetch();
        
                let choices = [];
                await guilds.forEach(async guild => {
                    choices.push({ name: guild.name, value: guild.id });
                });
        
                const filtered = choices.filter(choice => choice.name.toLowerCase().includes(focusedOption.value.toLowerCase())).slice(0, 25);
        
                if (!interaction) return;
        
                await interaction.respond(
                    filtered.map(choice => ({ name: choice.name, value: choice.value }))
                );
            }
        },
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        switch (sub) {
            case 'add':
                const name = interaction.options.getString('name');
                const kategorie = interaction.options.getString('kategorie');
                const owner = interaction.options.getString('owner');
                const invite = interaction.options.getString('invite');

                let serverData = await serverDB.findOneAndUpdate(
                    { guildID: interaction.guild.id}
                );

                if (!serverData.partner || !serverData.partner.msg || !serverData.partner.channel) {
                    const newEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('Partnerliste')
                        .setDescription('Hier sind unsere Partner:')

                        
                        if(kategorie === "Kooperation") {
                            newEmbed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                            } else {
                                newEmbed.addFields({ name: "Kooperation", value: `> \`❌\` - Kein Eintrag`, inline: false });   
                            }
                            if(kategorie === "Mega Partner") {
                                newEmbed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                                } else {
                                    newEmbed.addFields({ name: "Mega Partner", value: `> \`❌\` - Kein Eintrag`, inline: false });   
                                }
                                if(kategorie === "Großer Partner") {
                                    newEmbed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                                    } else {
                                        newEmbed.addFields({ name: "Großer Partner", value: `> \`❌\` - Kein Eintrag`, inline: false });   
                                    }
                                    if(kategorie === "Normaler Partner") {
                                        newEmbed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                                        } else {
                                            newEmbed.addFields({ name: "Normaler Partner", value: `> \`❌\` - Kein Eintrag`, inline: false });   
                                        }
                    const channel = interaction.channel;
                    const sentMessage = await channel.send({ embeds: [newEmbed] });

                    const newPartner = { name, category: kategorie };
                    serverData.partner.partners.push(newPartner);
                    serverData.partner.msg = sentMessage.id;
                    serverData.partner.channel = channel.id;
                    await serverData.save();

                    await interaction.reply('> `✅` - Partner erfolgreich hinzugefügt!');
                } else {
                    let channel, sentMessage;
                    try {
                        channel = interaction.guild.channels.cache.get(serverData.partner.channel);
                        sentMessage = await channel.messages.fetch(serverData.partner.msg);
                    } catch (error) {
                        console.error('Fehler beim Abrufen des Kanals oder der Nachricht:', error);
                        const newEmbed = new EmbedBuilder()
                            .setColor('#0099ff')
                            .setTitle('Partnerliste')
                            .setDescription('Hier sind unsere Partner:')

                            if(kategorie === "Kooperation") {
                                newEmbed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                                } else {
                                    newEmbed.addFields({ name: "Kooperation", value: `> \`❌\` - Kein Eintrag`, inline: false });   
                                }
                                if(kategorie === "Mega Partner") {
                                    newEmbed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                                    } else {
                                        newEmbed.addFields({ name: "Mega Partner", value: `> \`❌\` - Kein Eintrag`, inline: false });   
                                    }
                                    if(kategorie === "Großer Partner") {
                                        newEmbed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                                        } else {
                                            newEmbed.addFields({ name: "Großer Partner", value: `> \`❌\` - Kein Eintrag`, inline: false });   
                                        }
                                        if(kategorie === "Normaler Partner") {
                                            newEmbed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                                            } else {
                                                newEmbed.addFields({ name: "Normaler Partner", value: `> \`❌\` - Kein Eintrag`, inline: false });   
                                            }

                        channel = interaction.channel;
                        sentMessage = await channel.send({ embeds: [newEmbed] });


                        const newPartner = { name, category: kategorie };
                        serverData.partner.partners.push(newPartner);
                        serverData.partner.msg = sentMessage.id;
                        serverData.partner.channel = channel.id;
                        await serverData.save();

                        await interaction.reply('> `✅` - Partner erfolgreich hinzugefügt!');
                        return;
                    }

                    const existingEmbed = EmbedBuilder.from(sentMessage.embeds[0]);
                    const existingFieldIndex = existingEmbed.data.fields.findIndex(field => field.name === kategorie);
                    
                    if (existingFieldIndex !== -1) {
                        const fieldValue = existingEmbed.data.fields[existingFieldIndex].value;
                        if (fieldValue.includes("> \`❌\` - Kein Eintrag")) {
                            existingEmbed.data.fields[existingFieldIndex].value = `${fieldValue.replace("> \`❌\` - Kein Eintrag", "")}\n${fieldValue.split('\n').length}. [${name}](${invite}) (@${owner})`;
                        } else {
                            existingEmbed.data.fields[existingFieldIndex].value += `\n${fieldValue.split('\n').length + 1}. [${name}](${invite}) (@${owner})`;
                        }
                    } 
                    
                    const newPartner = { name, category: kategorie };
                    serverData.partner.partners.push(newPartner);
                    await sentMessage.edit({ embeds: [existingEmbed] });
                    await interaction.reply('> `✅` - Partner erfolgreich hinzugefügt!');
                }
                break;

          

            case 'delete':
                break;

            case 'change':
                break;
        }
    },
};