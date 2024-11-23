const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, PermissionBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event-system')
        .setDescription('Schickt das Event System')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        
        const eventEmbed = new EmbedBuilder()
            .setTitle('🧡 Season-Events 🧡')
            .setDescription('> **__Aktuelles Event__**\n# ```Aktuell findet kein "Season-Event" statt!```')
            .setColor('Blurple')
            .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269341310989369384/World_Of_Community.png?ex=671884f7&is=67173377&hm=f32ce42648668f4434a7055d6269bc439d88f088226cfde13b52a38b0f2457e2&')
            .setFooter({ text: `${interaction.guild.name} | 🧡 Bleibt Gesund 🧡`, iconURL: `${interaction.guild.iconURL()}` });

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('easter_event')
                    .setLabel('🐇 » Ostern')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('halloween_event')
                    .setLabel('🎃 » Halloween')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('christmas_event')
                    .setLabel('🎄 » Weihnachten')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('newyear_event')
                    .setLabel('🎆 » Silvester')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('collect_event')
                    .setLabel('Eventitem einsammeln')
                    .setStyle(ButtonStyle.Success)
            );
 
        await interaction.channel.send({ embeds: [eventEmbed], components: [buttons] })
        await interaction.reply({ content: '> `✅` » Das `Event-Embed` wurde erfolgreich gesendet', ephemeral: true });
    },

    async handleButtonInteraction(interaction) {
        if (!interaction.isButton()) return;

        switch (interaction.customId) {
            case 'easter_event':
                const OsterEmbed = new EmbedBuilder()
                    .setTitle('🐇 Oster Event')
                    .setDescription('**Dieses Event startet erst zwischen den Monaten `März` und `April`!**')
                    .setColor('Green')

                    await interaction.reply({ embeds: [OsterEmbed], ephemeral: true });
                break;

            case 'halloween_event':
                const HalloweenEmbed = new EmbedBuilder()
                    .setTitle('🎃 Halloween Event')
                    .setDescription('**Dieses Event findet erst zwischen dem `27. Oktober` und dem `02. November` statt!**')
                    .setColor('Orange')

                    await interaction.reply({ embeds: [HalloweenEmbed], ephemeral: true });
                break;

            case 'christmas_event':
                const WeihnachtsEmbed = new EmbedBuilder()
                    .setTitle('🎄 Weihnachten Event')
                    .setDescription('**Dieses Event findet erst zwischen dem `20. Dezember` und dem `26. Dezember` statt!**')
                    .setColor('Green')

                    await interaction.reply({ embeds: [WeihnachtsEmbed], ephemeral: true });
                break;

            case 'newyear_event':
                const SilvesterEmbed = new EmbedBuilder()
                    .setTitle('🎆 Silvester Event')
                    .setDescription('**Dieses Event findet erst zwischen dem `27. Dezember` und dem `02. Januar` statt!**')
                    .setColor('Grey')

                    await interaction.reply({ embeds: [SilvesterEmbed], ephemeral: true });
                break;

            case 'collect_event':
                await interaction.reply({ content: 'Eventitem erfolgreich eingesammelt!', ephemeral: true });
        }
    }
};

