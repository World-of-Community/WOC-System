const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const colorMap = {
    red: '#FF0000',
    blue: '#0000FF',
    green: '#008000',
    yellow: '#FFFF00',
    purple: '#800080',
    orange: '#FFA500',
    pink: '#FFC0CB',
    cyan: '#00FFFF',
    white: '#FFFFFF',
    black: '#000000',
    brown: '#A52A2A',
    gray: '#808080',
    grey: '#808080',
    gold: '#FFD700',
    silver: '#C0C0C0',
    lime: '#00FF00',
    navy: '#000080',
    teal: '#008080',
    maroon: '#800000',
    olive: '#808000',
    violet: '#EE82EE',
    magenta: '#FF00FF',
    indigo: '#4B0082',
    turquoise: '#40E0D0',
    beige: '#F5F5DC',
    coral: '#FF7F50',
    lavender: '#E6E6FA',
    salmon: '#FA8072',
    chocolate: '#D2691E',
    crimson: '#DC143C',
    khaki: '#F0E68C',
    azure: '#F0FFFF',
    tan: '#D2B48C',
    orchid: '#DA70D6',
    plum: '#DDA0DD',
    wheat: '#F5DEB3',
    tomato: '#FF6347',
    periwinkle: '#CCCCFF',
    chartreuse: '#7FFF00',
    seashell: '#FFF5EE'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed-create')
        .setDescription('Erstellt ein Embed mit Titel, Beschreibung, Farbe, Bild und Footer')
        .addStringOption(option => 
            option.setName('title')
                .setDescription('Der Titel des Embeds')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('description')
                .setDescription('Die Beschreibung des Embeds (Nutze \n für Zeilenumbrüche)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('color')
                .setDescription('Die Farbe des Embeds als Hex oder Name (z. B. red, #ff0000)')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('image')
                .setDescription('Die URL des Bildes für das Embed')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('footer')
                .setDescription('Der Footer-Text des Embeds')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description').replace(/\\n/g, '\n');
        const imageUrl = interaction.options.getString('image');
        const footer = interaction.options.getString('footer');
        let color = interaction.options.getString('color') || '#00AE86';

        if (colorMap[color.toLowerCase()]) {
            color = colorMap[color.toLowerCase()];
        }

        const EmbedCreate = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color);

        if (imageUrl) {
            EmbedCreate.setImage(imageUrl);
        }

        if (footer) {
            EmbedCreate.setFooter({ 
                text: footer,
                iconURL: interaction.guild.iconURL({ dynamic: true }) || ''
            });
        }

        await interaction.reply({ embeds: [EmbedCreate] });
    }
};

const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

const colorMap = {
    red: '#FF0000',
    blue: '#0000FF',
    green: '#008000',
    yellow: '#FFFF00',
    purple: '#800080',
    orange: '#FFA500',
    pink: '#FFC0CB',
    cyan: '#00FFFF',
    white: '#FFFFFF',
    black: '#000000',
    brown: '#A52A2A',
    gray: '#808080',
    grey: '#808080',
    gold: '#FFD700',
    silver: '#C0C0C0',
    lime: '#00FF00',
    navy: '#000080',
    teal: '#008080',
    maroon: '#800000',
    olive: '#808000',
    violet: '#EE82EE',
    magenta: '#FF00FF',
    indigo: '#4B0082',
    turquoise: '#40E0D0',
    beige: '#F5F5DC',
    coral: '#FF7F50',
    lavender: '#E6E6FA',
    salmon: '#FA8072',
    chocolate: '#D2691E',
    crimson: '#DC143C',
    khaki: '#F0E68C',
    azure: '#F0FFFF',
    tan: '#D2B48C',
    orchid: '#DA70D6',
    plum: '#DDA0DD',
    wheat: '#F5DEB3',
    tomato: '#FF6347',
    periwinkle: '#CCCCFF',
    chartreuse: '#7FFF00',
    seashell: '#FFF5EE'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed-create')
        .setDescription('Erstellt ein Embed mit Titel, Beschreibung, Farbe, Bild und Footer')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Der Textkanal, in den das Embed gesendet wird')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addStringOption(option => 
            option.setName('title')
                .setDescription('Der Titel des Embeds')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('description')
                .setDescription('Die Beschreibung des Embeds (Nutze \n für Zeilenumbrüche)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('color')
                .setDescription('Die Farbe des Embeds als Hex oder Name (z. B. red, #ff0000)')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('image')
                .setDescription('Die URL des Bildes für das Embed')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('footer')
                .setDescription('Der Footer-Text des Embeds')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description').replace(/\\n/g, '\n');
        const imageUrl = interaction.options.getString('image');
        const footer = interaction.options.getString('footer');
        let color = interaction.options.getString('color') || '#00AE86';

        if (colorMap[color.toLowerCase()]) {
            color = colorMap[color.toLowerCase()];
        }

        const EmbedCreate = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color);

        if (imageUrl) {
            EmbedCreate.setImage(imageUrl);
        }

        if (footer) {
            EmbedCreate.setFooter({ 
                text: footer,
                iconURL: interaction.guild.iconURL({ dynamic: true }) || ''
            });
        }

        await channel.send({ embeds: [EmbedCreate] });
        await interaction.reply({ content: `> \`✅\` » Das **${Title}**-Embed erfolgreich gesendet!`, ephemeral: true });
    }
};


