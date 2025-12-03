const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

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
    .setName('embed')
    .setDescription('Erstellt oder bearbeitet ein Embed')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('Erstellt ein Embed')
        .addChannelOption(opt =>
          opt.setName('channel').setDescription('Zielkanal').setRequired(true))
        .addStringOption(opt =>
          opt.setName('title').setDescription('Titel').setRequired(true))
        .addStringOption(opt =>
          opt.setName('description').setDescription('Beschreibung (\\n für Zeilenumbruch)').setRequired(true))
        .addStringOption(opt =>
          opt.setName('color').setDescription('Farbe als Name oder Hex'))
        .addStringOption(opt =>
          opt.setName('image').setDescription('Bild-URL'))
        .addStringOption(opt =>
          opt.setName('footer').setDescription('Footer-Text'))
    )
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('Bearbeitet ein bestehendes Embed')
        .addChannelOption(opt =>
          opt.setName('channel').setDescription('Zielkanal').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addStringOption(opt =>
          opt.setName('message_id').setDescription('Nachrichten-ID').setRequired(true))
        .addStringOption(opt =>
          opt.setName('title').setDescription('Neuer Titel'))
        .addStringOption(opt =>
          opt.setName('description').setDescription('Neue Beschreibung (\\n für Zeilenumbruch)'))
        .addStringOption(opt =>
          opt.setName('color').setDescription('Neue Farbe'))
        .addStringOption(opt =>
          opt.setName('image').setDescription('Neue Bild-URL'))
        .addStringOption(opt =>
          opt.setName('footer').setDescription('Neuer Footer-Text'))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const colorInput = interaction.options.getString('color')?.toLowerCase();
    const color = colorInput && colorMap[colorInput] ? colorMap[colorInput] : (colorInput || '#00AE86');

    if (sub === 'create') {
      const channel = interaction.options.getChannel('channel');
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description').replace(/\\n/g, '\n');
      const image = interaction.options.getString('image');
      const footer = interaction.options.getString('footer');

      const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor(color);
      if (image) embed.setImage(image);
      if (footer) embed.setFooter({ text: footer, iconURL: interaction.guild.iconURL({ dynamic: true }) || '' });

      await channel.send({ embeds: [embed] });
      return interaction.reply({ content: '> ✅ » Embed erfolgreich erstellt.', ephemeral: true });
    }

    if (sub === 'edit') {
      const channel = interaction.options.getChannel('channel');
      const messageId = interaction.options.getString('message_id');
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description')?.replace(/\\n/g, '\n');
      const image = interaction.options.getString('image');
      const footer = interaction.options.getString('footer');

      try {
        const message = await channel.messages.fetch(messageId);
        const embed = EmbedBuilder.from(message.embeds[0]);

        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        if (color) embed.setColor(color);
        if (image) embed.setImage(image);
        if (footer) embed.setFooter({ text: footer, iconURL: interaction.guild.iconURL({ dynamic: true }) || '' });

        await message.edit({ embeds: [embed] });
        return interaction.reply({ content: '> ✅ » Embed erfolgreich bearbeitet.', ephemeral: true });
      } catch (err) {
        console.error(err);
        return interaction.reply({ content: '> ❌ » Fehler: Nachricht nicht gefunden oder Bearbeitung fehlgeschlagen.', ephemeral: true });
      }
    }
  }
};

