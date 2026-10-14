import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } from "discord.js";

export default {
  name: "admin-info",
  description: "» Zeigt eine Liste von Benutzern mit einer bestimmten Rolle an. 🎭",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      name: "rolle",
      description: "Die Rolle, die abgefragt werden soll",
      required: true,
      type: 8,
    },
  ],

  async run(client, interaction) {
    const role = interaction.options.getRole("rolle");

    const membersWithRole = interaction.guild.members.cache.filter(member =>
      member.roles.cache.has(role.id),
    );

    if (membersWithRole.size === 0) {
      return interaction.reply({
        content: `> \`❌\` » Es gibt keine Mitglieder mit der Rolle ${role.toString()}`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // ⬇️ Nach Username sortieren (ABC)
    const membersArray = membersWithRole
      .sort((a, b) => a.user.username.localeCompare(b.user.username))
      .map(member => `${member.toString()} (${member.user.username})`);

    const itemsPerPage = 10;
    const totalPages = Math.ceil(membersArray.length / itemsPerPage);
    let currentPage = 0;

    const generateEmbed = (page) => {
      const start = page * itemsPerPage;
      const end = start + itemsPerPage;
      const currentMembers = membersArray.slice(start, end);

      return new EmbedBuilder()
        .setTitle("Benutzer mit der Rolle:")
        .setDescription(
          `${role.toString()} (\`${membersWithRole.size}👥\`)\n\n> ${currentMembers.join("\n> ")}`,
        )
        .setFooter({ text: `Seite ${page + 1} von ${totalPages}` })
        .setColor("Blurple");
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("⬅️ Zurück")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("➡️ Weiter")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(totalPages <= 1),
    );

    const message = await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: [row],
      flags: MessageFlags.Ephemeral,
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 0,
    });

    collector.on("collect", async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.deferUpdate();
      }
      if (btnInteraction.customId === "next") {currentPage++;}
      if (btnInteraction.customId === "prev") {currentPage--;}

      const newRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("⬅️ Zurück")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("➡️ Weiter")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === totalPages - 1),
      );

      await btnInteraction.update({
        embeds: [generateEmbed(currentPage)],
        components: [newRow],
      });
    });
  },
};
