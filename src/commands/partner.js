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
            { name: 'Normaler Partner', value: 'normal' }, 
            { name: 'Kooperation', value: 'kooperation' }, 
            { name: 'Kleiner Partner', value: 'klein' }
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
                const kategorieValue = interaction.options.getString('kategorie');
                const kategorieName = interaction.options.get('kategorie').name;
                const owner = interaction.options.getString('owner');
                const invite = interaction.options.getString('invite');

                let serverData = await serverDB.findOneAndUpdate(
                    { guildID: interaction.guild.id },
                    { $setOnInsert: { guildID: interaction.guild.id, partner: { msgId: null, channelId: null } } },
                    { upsert: true, new: true }
                );

                if (!serverData.partner.msgId || !serverData.partner.channelId) {
                    const newEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('Partnerliste')
                        .setDescription('Hier sind unsere Partner:')
                        .addFields({ name: kategorieName, value: `1. [${name}](${invite}) (@${owner})`, inline: false });

                    const channel = interaction.channel;
                    const sentMessage = await channel.send({ embeds: [newEmbed] });

                    serverData.partner = {
                        msgId: sentMessage.id,
                        channelId: channel.id
                    };
                    await serverData.save();

                    await interaction.reply('> `✅` - Partner erfolgreich hinzugefügt!');
                } else {
                    let channel, sentMessage;
                    try {
                        channel = interaction.guild.channels.cache.get(serverData.partner.channelId);
                        sentMessage = await channel.messages.fetch(serverData.partner.msgId);
                    } catch (error) {
                        const newEmbed = new EmbedBuilder()
                            .setColor('#0099ff')
                            .setTitle('Partnerliste')
                            .setDescription('Hier sind unsere Partner:')
                            .addFields({ name: kategorieName, value: `1. [${name}](${invite}) (@${owner})`, inline: false });

                        channel = interaction.channel;
                        sentMessage = await channel.send({ embeds: [newEmbed] });

                        serverData.partner.msgId = sentMessage.id;
                        serverData.partner.channelId = channel.id;
                        await serverData.save();

                        await interaction.reply('> `✅` - Partner erfolgreich hinzugefügt!');
                        return;
                    }

                    const existingEmbed = EmbedBuilder.from(sentMessage.embeds[0]);

                    const fieldIndex = existingEmbed.data.fields.findIndex(field => field.name === kategorieName);
                    if (fieldIndex !== -1) {
                        const fieldValue = existingEmbed.data.fields[fieldIndex].value;
                        const newFieldValue = `${fieldValue}\n${fieldValue.split('\n').length + 1}. [${name}](${invite}) (@${owner})`;
                        existingEmbed.data.fields[fieldIndex].value = newFieldValue;
                    } else {
                        existingEmbed.addFields({ name: kategorieName, value: `1. [${name}](${invite}) (@${owner})`, inline: false });
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