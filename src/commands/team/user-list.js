const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user-list')
    .setDescription('» Listet alle Mitglieder des Servers mit ID auf (20 pro Seite). 🔍')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles) // Nur für Mitglieder mit "Manage Roles"
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name des Nutzers, nach dem gesucht werden soll')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Verzögerte Antwort, falls es länger dauert

    try {
      const searchName = interaction.options.getString('name'); // Optionaler Name-Parameter
      const members = await interaction.guild.members.fetch(); // Alle Mitglieder abrufen

      // Filtere Mitglieder nach dem angegebenen Namen, falls ein Name angegeben wurde
      const memberArray = members
        .filter(member => !searchName || member.user.username.toLowerCase().includes(searchName.toLowerCase()))
        .map(member => `🆔 \`${member.id}\` | **${member.user.username}** | ${member}`);

      // Falls keine Mitglieder gefunden wurden
      if (memberArray.length === 0) {
        return interaction.editReply({ content: '> `⚠️` » Keine Mitglieder gefunden.', ephemeral: true });
      }

      const pageSize = 20; // Maximal 20 Mitglieder pro Seite
      let currentPage = 0;
      const totalPages = Math.ceil(memberArray.length / pageSize);

      // Funktion zum Erstellen des Embeds basierend auf der Seite
      const generateEmbed = (page) => {
        const start = page * pageSize;
        const end = start + pageSize;
        const pageMembers = memberArray.slice(start, end).join('\n');

        return new EmbedBuilder()
          .setTitle(`\`👥\` × Alle Server-Mitglieder (${members.size.toLocaleString('de-DE')})`)
          .setDescription(pageMembers || 'Keine Mitglieder auf dieser Seite.')
          .setColor('Blurple')
          .setFooter({ text: `» ${interaction.guild.name} - Seite ${page + 1} von ${totalPages}`, iconURL: interaction.guild.iconURL() })
          .setTimestamp();
      };

      // Funktion zum Erstellen der Buttons
      const generateButtons = (page) => {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Vorherige Seite')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0), // Deaktiviert, wenn es die erste Seite ist
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Nächste Seite')
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === totalPages - 1) // Deaktiviert, wenn es die letzte Seite ist
        );
      };

      const reply = await interaction.editReply({
        embeds: [generateEmbed(currentPage)],
        components: totalPages > 1 ? [generateButtons(currentPage)] : [], // Buttons nur anzeigen, wenn mehrere Seiten existieren
        ephemeral: true
      });

      if (totalPages === 1) return; // Falls nur eine Seite, keine Interaktion nötig

      // Listener für Button-Klicks
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
  },
};
