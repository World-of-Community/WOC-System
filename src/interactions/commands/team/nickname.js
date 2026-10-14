import { MessageFlags } from "discord.js";
import logger from "#core/logger.js";
export default {
  name: "nick",
  description: "Verwalte Nicknamen für Benutzer",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      type: 1,
      name: "set",
      description: "Setze einen neuen Nicknamen für einen Benutzer",
      options: [
        {
          type: 3,
          name: "nickname",
          description: "Der neue Nickname",
          required: true,
        },
        {
          name: "benutzer",
          description: "Der Benutzer, dessen Nickname geändert werden soll",
          required: false,
          type: 6,
        },
      ],
    },
    {
      type: 1,
      name: "remove",
      description: "Entferne den Nicknamen eines Benutzers",
      options: [
        {
          name: "benutzer",
          description: "Der Benutzer, dessen Nickname entfernt werden soll",
          required: false,
          type: 6,
        },
      ],
    },
  ],

  async run(client, interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser("benutzer") || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: "> `❌` » Benutzer nicht gefunden.", flags: MessageFlags.Ephemeral });
    }

    try {
      if (subcommand === "set") {
        const nickname = interaction.options.getString("nickname");
        await member.setNickname(nickname);
        await interaction.reply({ content: `> \`✅\` » Der Nickname von \`${user.username}\` wurde erfolgreich auf \`${nickname}\` gesetzt.`, flags: MessageFlags.Ephemeral });
      } else if (subcommand === "remove") {
        await member.setNickname(null);
        await interaction.reply({ content: `> \`✅\` » Der Nickname von \`${user.username}\` wurde erfolgreich entfernt.`, flags: MessageFlags.Ephemeral });
      }
    } catch (error) {
      logger.error(error);
      await interaction.reply({ content: "> `❌` » Ich habe keine Berechtigung, den Nicknamen dieses Benutzers zu ändern.", flags: MessageFlags.Ephemeral });
    }
  },
};
