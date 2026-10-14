import { EmbedBuilder, MessageFlags } from "discord.js";
import logger from "#core/logger.js";
import { settings } from "#core/settings.js";

export default {
  name: "give-role",
  description: "» Gebe einem Nutzer eine Rolle. 🎭",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      name: "user",
      description: "» Welcher User soll es sein?",
      required: true,
      type: 6,
    },
    {
      name: "role",
      description: "» Welche Rolle soll der User bekommen?",
      required: true,
      type: 8,
    },
  ],

  async run(client, interaction) {
    const user = interaction.options.getMember("user");
    const role = interaction.options.getRole("role");

    try {
      // Nutzer holen und Rolle zuweisen
      const member = await interaction.guild.members.fetch(user);
      await member.roles.add(role);
      await interaction.reply({
        content: `> \`✅\` » Die <@&${role.id}>-Rolle wurde an ${member} **vergeben**.`,
        flags: MessageFlags.Ephemeral,
      });

      // Log-Kanal und Thread holen
      const logchannel = interaction.guild.channels.cache.get(settings.get("channels.serverLogs"));
      if (!logchannel) {
        return interaction.followUp({
          content: "> `❌` » Logkanal nicht gefunden.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const thread = await logchannel.threads.fetch(settings.get("logThreads.roles")).catch(() => null);
      if (!thread) {
        return interaction.followUp({
          content: "> `❌` » Thread nicht gefunden oder ungültig.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // Embed erstellen und im Thread senden
      const giverole = new EmbedBuilder()
        .setTitle("Info zum `/give-role` Befehl")
        .setDescription(
          `${interaction.user} hat den \`/give-role\` Befehl benutzt und ${member} die ${role} Rolle gegeben.`,
        )
        .setThumbnail(
          member.user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }),
        )
        .setColor("Blurple")
        .setTimestamp();

      await thread.send({ embeds: [giverole] });
    } catch (error) {
      logger.error("Fehler beim Hinzufügen der Rolle:", error);
      interaction.reply({
        content: "> `❌` » Ein Fehler ist aufgetreten.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
