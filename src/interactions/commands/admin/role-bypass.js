import { EmbedBuilder } from "discord.js";
import serverdb from "#models/serverdb.js";
export default {
  name: "role-bypass",
  description: "» Einstellen der Rollen für das Gewinnspiel-System. 🎁",
  type: 1,
  options: [
    {
      "type": 1,
      "name": "add",
      "description": "» Lege eine Rolle fest, welche keine GW-Anforderungen erfüllen muss. 🎀",
      "options": [
        {
          "name": "role",
          "description": "Welche Rolle möchtest du wählen?",
          "required": true,
          "type": 8,
        },
      ],
    },
    {
      "type": 1,
      "name": "remove",
      "description": "» Entferne eine Rolle fest, welche keine GW-Anforderungen erfüllen muss. 🎀",
      "options": [
        {
          "name": "role",
          "description": "Welche Rolle möchtest du wählen?",
          "required": true,
          "type": 8,
        },
      ],
    },
    {
      "type": 1,
      "name": "list",
      "description": "» Zeigt alle Rollen an, welche keine GW-Anforderungen erfüllen muss. 🎀",
      "options": [],
    },
  ],

  async run(client, interaction) {

    if (!interaction.member.permissions.has("Administrator")) {return interaction.reply({ content: "> `❌` » Du hast dazu keine Rechte diesen Befehl zu benutzen.", ephemeral: true });}
    if (interaction.options.getSubcommand() === "add") {
      const role = interaction.options.getRole("role");
      const data = await serverdb.findOne({ guildID: interaction.guild.id, roleBypass: { $in: [role.id] } });

      if (data) {return interaction.reply({ content: `> ⚠️ » die ${role} ist bereits hinzugefügt.`, ephemeral: true });}
      await serverdb.findOneAndUpdate({ guildID: interaction.guild.id }, { $push: { roleBypass: role.id } });

      await interaction.reply({ content: `> \`✅\` » Du hast die ${role} erfolgreich hinzugefügt.`, ephemeral: true });
    }

    if (interaction.options.getSubcommand() === "remove") {
      const role = interaction.options.getRole("role");
      const data = await serverdb.findOne({ guildID: interaction.guild.id, roleBypass: { $in: [role.id] } });

      if (!data) {return interaction.reply({ content: "> ⚠️ » Diese Rolle wurde bereits entfernt.", ephemeral: true });}
      await serverdb.findOneAndUpdate({ guildID: interaction.guild.id }, { $pull: { roleBypass: role.id } });

      await interaction.reply({ content: `> \`✅\` » Du hast die ${role} erfolgreich entfernt.`, ephemeral: true });
    }

    if (interaction.options.getSubcommand() === "list") {
      const serverData = await serverdb.findOne({ guildID: interaction.guild.id });

      const roleListe = serverData.roleBypass.map(roleId => `<@&${roleId}>`).join("\n");
      const embed = new EmbedBuilder()
        .setTitle("Hier sind alle ByPass Rollen aufgelistet")
        .setDescription(`${roleListe || "**Keine Rollen als Bypass aufgelistet.**"}`)
        .setColor("Blurple");
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
