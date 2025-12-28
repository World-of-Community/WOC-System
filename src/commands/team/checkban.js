const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("checkban")
    .setDescription("» Überprüft, ob ein Benutzer aktuell gebannt ist.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("» Welcher Benutzer soll überprüft werden?")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    try {
      const banInfo = await interaction.guild.bans.fetch(user.id);

      const bannedEmbed = new EmbedBuilder()
        .setTitle("`🚫` Benutzer ist gebannt")
        .setColor("Red")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "Benutzer", value: `${user.tag} (\`${user.id}\`)`, inline: false },
          { name: "Grund", value: `${banInfo.reason || "Kein Grund angegeben."}`, inline: false },
          { name: "Status", value: "Dieser Benutzer ist aktuell **gebannt**.", inline: false },
        )
        .setFooter({ text: `${interaction.guild.name} | Ban-System`, iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

      return interaction.reply({ embeds: [bannedEmbed], ephemeral: true });

    } catch {
      const notBannedEmbed = new EmbedBuilder()
        .setTitle("`✅` Benutzer ist nicht gebannt")
        .setColor("Green")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "Benutzer", value: `${user.tag} (\`${user.id}\`)`, inline: false },
          { name: "Status", value: "Dieser Benutzer ist aktuell **nicht gebannt**.", inline: false },
        )
        .setFooter({ text: `${interaction.guild.name} | Ban-Check-System`, iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

      return interaction.reply({ embeds: [notBannedEmbed], ephemeral: true });
    }
  },
};
