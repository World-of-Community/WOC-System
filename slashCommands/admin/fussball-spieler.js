import { Team } from "../../models/fussballdb.js";

export default {
  name: "spieler-hinzufügen",
  description: "Füge einem Team einen Spieler hinzu.",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      "type": 3,
      "name": "team",
      "description": "Name des Teams",
      "required": true,
    },
    {
      "type": 3,
      "name": "spieler",
      "description": "Name des Spielers",
      "required": true,
    },
  ],

  async run(client, interaction) {
    const teamName = interaction.options.getString("team");
    const spielerName = interaction.options.getString("spieler");

    const team = await Team.findOne({ name: teamName });
    if (!team) {
      return interaction.reply({ content: "> `❌` Team wurde nicht gefunden.", ephemeral: true });
    }

    if (!team.players) {team.players = [];}
    if (team.players.includes(spielerName)) {
      return interaction.reply({ content: "> ⚠️ Dieser Spieler ist bereits im Team.", ephemeral: true });
    }

    team.players.push(spielerName);
    await team.save();

    await interaction.reply({ content: `> \`✅\` Spieler **${spielerName}** wurde dem Team **${teamName}** hinzugefügt.`, ephemeral: true });
  },
};
