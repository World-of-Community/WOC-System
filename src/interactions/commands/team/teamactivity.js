import {EmbedBuilder} from "discord.js";
import teamdb from "#models/TeamMember.js";
import { settings } from "#core/settings.js";

// Hier kannst du die Nachrichtenziele dynamisch speichern (z.B. in einer Datenbank)
const messageGoals = {};

export default {
  name: "teamactivity",
  description: "» Setzt das Nachrichtenziel for eine Rolle oder zeigt die Aktivität eines Benutzers an.",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      "type": 1,
      "name": "setgoal",
      "description": "» Setzt das Nachrichtenziel für eine Rolle.",
      "options": [
        {
          "name": "role",
          "description": "Die Rolle, für die das Ziel festgelegt wird",
          "required": true,
          "type": 8,
        },
        {
          "type": 4,
          "name": "messagegoal",
          "description": "Das Nachrichtenziel für diese Rolle",
          "required": true,
        },
      ],
    },
    {
      "type": 1,
      "name": "check",
      "description": "» Überprüft die Nachrichtenaktivität eines Benutzers.",
      "options": [
        {
          "name": "user",
          "description": "Der Benutzer, dessen Aktivität angezeigt werden soll",
          "required": true,
          "type": 6,
        },
      ],
    },
  ],

  async run(client, interaction) {

    if (interaction.options.getSubcommand() === "setgoal") {

      const role = interaction.options.getRole("role");
      const messagegoal = interaction.options.getInteger("messagegoal");

      // Setze das Nachrichtenziel für die Rolle
      messageGoals[role.id] = messagegoal;

      // Rückmeldung an den Benutzer
      await interaction.reply({ content: `> \`✅\` » Das Nachrichtenziel für die Rolle ${role} wurde auf \`${messagegoal}\` Nachrichten gesetzt.`, ephemeral: true });
    }

    if (interaction.options.getSubcommand() === "check") {
      const member = interaction.options.getMember("user");

      // noch beheben
      //if (messageGoal === 0) {
      //    return interaction.reply({ content: `> \`📌\` » ${member} hat **keine** Nachrichten als Team Mitglied gesammelt.`, ephemeral: true });
      //}

      const TeamRoleIds = [
        settings.get("teamRoles.admin"), // Admin
        settings.get("teamRoles.teamLead"), // Team-leitung
        settings.get("teamRoles.developer"), // Developer
        settings.get("teamRoles.srModerator"), // Sr-Moderator
        settings.get("teamRoles.moderator"), // Moderator
        settings.get("teamRoles.supporter"), // Supporter
        settings.get("teamRoles.builder"), // Builder
      ];

      let teamRoleMention = "";

      const hasTeamRole = TeamRoleIds.some(roleId => {
        const role = member.roles.cache.get(roleId); // Rolle abrufen
        if (role) {
          teamRoleMention = `<@&${roleId}>`; // Rolle als Erwähnung speichern
          return true;
        }
        return false;
      });

      const teamUser = await teamdb.findOne({ userID: member.id });
      const messageProgress = `\`${teamUser.messages}/${200}\` Nachrichten`;

      // Erstelle ein Embed für den Fortschritt
      const activityEmbed = new EmbedBuilder()
        .setTitle(`Nachrichtenaktivität von ${member.user.username}`)
        .setDescription(`${member} (${hasTeamRole ? teamRoleMention : "Keine Rolle"})\n\n> Hat bereits ${messageProgress} erreicht.`)
        .setColor("Blurple")
        .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
        .setTimestamp();

      await interaction.reply({ embeds: [activityEmbed] });
    }
  },
};
