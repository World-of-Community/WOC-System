import { EmbedBuilder } from "discord.js";
import { settings } from "#core/settings.js";

export default {
  name: "remove-role",
  description: "» Entferne eine Rolle eines Nutzers. ❌",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      name: "user",
      description: "» Der Nutzer, von dem die Rolle entfernt werden soll.",
      required: true,
      type: 6,
    },
    {
      name: "role",
      description: "» Die Rolle, die entfernt werden soll.",
      required: true,
      type: 8,
    },
  ],

  async run(client, interaction) {

    const member = interaction.options.getMember("user") || interaction.member;
    const role = interaction.options.getRole("role");

    try {
      // Entferne die angegebene Rolle vom Mitglied
      await member.roles.remove(role);
      await interaction.reply({ content: `> \`✅\` » Die Rolle <@&${role.id}> wurde von ${member} **entfernt**.`, ephemeral: true });

      // Remove Role Log
      const logchannel = await member.guild.channels.cache.get(settings.get("channels.serverLogs"));

      const removerole = new EmbedBuilder()
        .setTitle("Info zum `/remove-role` Befehl")
        .setDescription(`${member} hat den \`/remove-role\` benutzt und ${member} die ${role} Rolle entnommen.`)
        .setThumbnail(member.user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
        .setColor("Blurple")
        .setTimestamp();

      await logchannel.threads.cache.get(settings.get("logThreads.roles")).send({embeds: [removerole]});
    } catch (error) {
      await interaction.reply({ content: `> \`❌\` » Es gab einen Fehler beim Entfernen der Rolle.\n\n**${error.message}**`, ephemeral: true });
    }
  },
};
