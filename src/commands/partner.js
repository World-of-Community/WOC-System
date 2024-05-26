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
            { name: 'Kooperation Partner', value: 'Kooperation Partner' },    
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
                .addUserOption(option => option.setName('partner').setDescription('» Wähle ein Partner aus').setRequired(true)),
        )
        .addSubcommand((command) =>
            command
                .setName('delete')
                .setDescription('» Lösche einen Partner. 🤝')
                .addIntegerOption((option) => option.setName('partner').setDescription('» Wähle ein Parnter aus').setRequired(true))
        ),

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
                        embed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                        } else {
                            embed.addFields({ name: kategorie, value: `> \`❌\` - Kein Eintrag`, inline: false });   
                        }
                        if(kategorie === "Mega Partner") {
                            embed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                            } else {
                                embed.addFields({ name: kategorie, value: `> \`❌\` - Kein Eintrag`, inline: false });   
                            }
                            if(kategorie === "Großer Partner") {
                                embed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                                } else {
                                    embed.addFields({ name: kategorie, value: `> \`❌\` - Kein Eintrag`, inline: false });   
                                }
                                if(kategorie === "Normaler Partner") {
                                    embed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                                    } else {
                                    embed.addFields({ name: kategorie, value: `> \`❌\` - Kein Eintrag`, inline: false });   
                                    }

                        if(kategorie === "")
                    const channel = interaction.channel;
                    const sentMessage = await channel.send({ embeds: [newEmbed] });

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
                                embed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                                } else {
                                    embed.addFields({ name: kategorie, value: `> \`❌\` - Kein Eintrag`, inline: false });   
                                }
                                if(kategorie === "Mega Partner") {
                                    embed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                                    } else {
                                        embed.addFields({ name: kategorie, value: `> \`❌\` - Kein Eintrag`, inline: false });   
                                    }
                                    if(kategorie === "Großer Partner") {
                                        embed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                                        } else {
                                            embed.addFields({ name: kategorie, value: `> \`❌\` - Kein Eintrag`, inline: false });   
                                        }
                                        if(kategorie === "Normaler Partner") {
                                            embed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                                            } else {
                                            embed.addFields({ name: kategorie, value: `> \`❌\` - Kein Eintrag`, inline: false });   
                                            }

                        channel = interaction.channel;
                        sentMessage = await channel.send({ embeds: [newEmbed] });

                        serverData.partner.msg = sentMessage.id;
                        serverData.partner.channel = channel.id;
                        await serverData.save();

                        await interaction.reply('> `✅` - Partner erfolgreich hinzugefügt!');
                        return;
                    }

                    const existingEmbed = EmbedBuilder.from(sentMessage.embeds[0]);

                    const fieldIndex = existingEmbed.data.fields.findIndex(field => field.name === kategorie);
                    if (fieldIndex !== -1) {
                        const noEntry = existingEmbed.data.fields.findIndex(field => field.value === "> \`❌\` - Kein Eintrag")

                        if(noEntry !== -1) {
                            existingEmbed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                            existingEmbed.data.fields.splice(noEntry, 1);
                        }
                        const fieldValue = existingEmbed.data.fields[fieldIndex].value;
                        existingEmbed.data.fields[fieldIndex].value = `${fieldValue}\n${fieldValue.split('\n').length + 1}. [${name}](${invite}) (@${owner})`;
                    } else {
                        existingEmbed.addFields({ name: kategorie, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
                    }

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