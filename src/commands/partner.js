const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
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
                const owner = interaction.options.getString('owner');
                const invite = interaction.options.getString('invite');
    
                // Finde das Dokument für den aktuellen Server, oder erstelle ein neues, falls nicht vorhanden
                let serverData = await serverDB.findOneAndUpdate(
                    { guildID: interaction.guildID },
                    { $setOnInsert: { guildID: interaction.guildID, partner: null } }, // Setze partner auf null, wenn das Dokument neu eingefügt wird
                    { upsert: true, new: true } // Erstelle ein neues Dokument, falls nicht vorhanden und gib das aktualisierte Dokument zurück
                );
    
                if (!serverData.partner || !serverData.partner.msg) {
                    const newEmbed = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('Partnerliste')
                        .setDescription('Hier sind unsere Partner:')
                        .addField(kategorieValue, `1. [${name}](${invite}) (@${owner})`);
    

                    const channel = interaction.channel;
                    channel.send(newEmbed);
                    serverData.partner = {
                        msg: newEmbed,
                        channel: channel.id,
                    };
                    await serverData.save();
    
                    await interaction.reply('Partner erfolgreich hinzugefügt!'); 
                } else {
                    const existingEmbed = serverData.partner.msg;
    
                    // Neue Zeile für den Partner hinzufügen
                    const fieldIndex = existingEmbed.fields.findIndex(field => field.name === kategorieValue);
                    if (fieldIndex !== -1) {
                        const fieldValue = existingEmbed.fields[fieldIndex].value;
                        const newFieldValue = fieldValue + `\n${existingEmbed.fields[fieldIndex].value.split('\n').length}. [${name}](${invite}) (@${owner})`;
                        existingEmbed.fields[fieldIndex].value = newFieldValue;
                    } else {
                        existingEmbed.addField(kategorieValue, `1. [${name}](${invite}) (@${owner})`);
                    }
    
                    const channel = interaction.guild.channels.cache.get(serverData.partner.channel);
                    const sentMessage = await channel.messages.fetch(serverData.partner.msg.id);
                    await sentMessage.edit(existingEmbed);
    
                    await interaction.reply('Partner erfolgreich hinzugefügt!');
                }
                break;

            case 'delete':
                break;

            case 'change':
                break;
        }
    },
};