const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  PermissionFlagsBits 
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('» Nutzerverwaltung und Suche. 🔍')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sub =>
      sub
        .setName('find')
        .setDescription('» Findet einen Benutzer anhand seiner ID. 🔍')
        .addStringOption(option =>
          option.setName('id')
            .setDescription('Die ID des Benutzers, den du suchen möchtest.')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('list')
        .setDescription('» Listet alle Mitglieder des Servers mit ID auf (20 pro Seite). 🔍')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Name des Nutzers, nach dem gesucht werden soll')
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'find') {
      const memberId = interaction.options.getString('id');

      await interaction.reply({ content: '> `🔍` » Ich suche nach dem Nutzer, einen Augenblick bitte...', ephemeral: true });

      try {
        await new Promise(resolve => setTimeout(resolve, 3000));

        const member = await interaction.guild.members.fetch(memberId);

        const mentionStatus = member ? `${member}` : '`❌` Nicht erwähnbar';

        const UserFindEmbed = new EmbedBuilder()
          .setTitle('Benutzer gefunden')
          .setDescription(
            `Der Benutzer mit der ID \`${memberId}\` ist **${member.user.username}**.\n\n` +
            `- Nutzer: ${member.user.displayName}\n` +
            `- Erwähnung: ${mentionStatus}`
          )
          .setColor('Green')
          .setThumbnail(member.user.displayAvatarURL())
          .setFooter({ text: 'Benutzerabfrage', iconURL: interaction.guild.iconURL() })
          .setTimestamp();

        await interaction.editReply({ 
          content: '> `✅` » Ich habe den Nutzer erfolgreich gefunden.', 
          embeds: [UserFindEmbed], 
          ephemeral: true 
        });

      } catch (error) {
        console.error('Fehler beim Abrufen des Benutzers:', error);

        const ErrorEmbed = new EmbedBuilder()
          .setTitle('Benutzer nicht gefunden')
          .setDescription('Benutzer konnte nicht gefunden werden.')
          .setColor('Red')
          .setFooter({ text: 'Benutzerabfrage', iconURL: interaction.guild.iconURL() })
          .setTimestamp();

        await interaction.editReply({ 
          content: '> `❌` » Ich konnte den Nutzer nicht finden.', 
          embeds: [ErrorEmbed], 
          ephemeral: true 
        });
      }
    }

    if (subcommand === 'list') {
      await interaction.deferReply({ ephemeral: true });

      try {
        const searchName = interaction.options.getString('name');
        const members = await interaction.guild.members.fetch();

        const memberArray = members
          .filter(member => !searchName || member.user.username.toLowerCase().includes(searchName.toLowerCase()))
          .map(member => `🆔 \`${member.id}\` | **${member.user.username}** | ${member}`);

        if (memberArray.length === 0) {
          return interaction.editReply({ content: '> `⚠️` » Keine Mitglieder gefunden.', ephemeral: true });
        }

        const pageSize = 20;
        let currentPage = 0;
        const totalPages = Math.ceil(memberArray.length / pageSize);

        const generateEmbed = (page) => {
          const start = page * pageSize;
          const end = start + pageSize;
          const pageMembers = memberArray.slice(start, end).join('\n');

          return new EmbedBuilder()
            .setTitle(`\`👥\` × Alle Server-Mitglieder (${members.size.toLocaleString('de-DE')})`)
            .setDescription(
              `${searchName ? `Hier sind die Gesuchten Ergebnisse für **${searchName}**\n\n` : ''}` +
              `${pageMembers || 'Keine Mitglieder auf dieser Seite.'}`
            )
            .setColor('Blurple')
            .setFooter({ text: `» ${interaction.guild.name} - Seite ${page + 1} von ${totalPages}`, iconURL: interaction.guild.iconURL() })
            .setTimestamp();
        };

        const generateButtons = (page) => {
          return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('prev')
              .setLabel('Vorherige Seite')
              .setEmoji('⬅️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Nächste Seite')
              .setEmoji('➡️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === totalPages - 1)
          );
        };

        const reply = await interaction.editReply({
          embeds: [generateEmbed(currentPage)],
          components: totalPages > 1 ? [generateButtons(currentPage)] : [],
          ephemeral: true
        });

        if (totalPages === 1) return;

        const collector = reply.createMessageComponentCollector();

        collector.on('collect', async (btnInteraction) => {
          if (btnInteraction.user.id !== interaction.user.id) {
            return btnInteraction.reply({ content: 'Nur der ursprüngliche Nutzer kann blättern.', ephemeral: true });
          }

          if (btnInteraction.customId === 'prev' && currentPage > 0) {
            currentPage--;
          } else if (btnInteraction.customId === 'next' && currentPage < totalPages - 1) {
            currentPage++;
          }

          await btnInteraction.update({
            embeds: [generateEmbed(currentPage)],
            components: [generateButtons(currentPage)]
          });
        });

        collector.on('end', async () => {
          await interaction.editReply({ components: [] }).catch(() => {});
        });

      } catch (error) {
        console.error('Fehler beim Abrufen der Mitglieder:', error);
        await interaction.editReply({ content: '> `❌` » Es gab einen Fehler beim Abrufen der Mitglieder.', ephemeral: true });
      }
    }
  },
};

