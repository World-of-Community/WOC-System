import { Team, Match, ProLeagueEmbed } from '../../models/fussballdb.js';

export default {
  name: "fussball-manage",
    description: "Verwalte Fußballteams",
    type: 1,
    default_member_permissions: "8",
    options: [
        {
            "type": 1,
            "name": "add",
            "description": "Füge ein Fußballteam hinzu",
            "options": [
                {
                    "type": 3,
                    "name": "teamname",
                    "description": "Name des Teams",
                    "required": true
                },
                {
                    "type": 3,
                    "name": "emoji",
                    "description": "Emoji/Icon für das Team",
                    "required": true
                }
            ]
        },
        {
            "type": 1,
            "name": "remove",
            "description": "Entferne ein Fußballteam",
            "options": [
                {
                    "type": 3,
                    "name": "teamname",
                    "description": "Name des Teams",
                    "required": true
                }
            ]
        },
        {
            "type": 1,
            "name": "add-player",
            "description": "Füge einen Spieler zu einem Team hinzu",
            "options": [
                {
                    "type": 3,
                    "name": "teamname",
                    "description": "Name des Teams",
                    "required": true
                },
                {
                    "type": 3,
                    "name": "spieler",
                    "description": "Name des Spielers",
                    "required": true
                }
            ]
        }
    ],

  async run(client, interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      // ... existierender Code ...
    }
    else if (sub === 'remove') {
      // ... existierender Code ...
    }
    else if (sub === 'add-player') {
      const teamName = interaction.options.getString('teamname');
      const spielerName = interaction.options.getString('spieler');

      const team = await Team.findOne({ name: teamName });
      if (!team) {
        return interaction.reply({
          content: `❌ Team **${teamName}** wurde nicht gefunden.`,
          ephemeral: true,
        });
      }

      if (!team.players) team.players = [];

      if (team.players.includes(spielerName)) {
        return interaction.reply({
          content: `> ⚠️ Spieler **${spielerName}** ist bereits im Team **${teamName}**.`,
          ephemeral: true,
        });
      }

      team.players.push(spielerName);
      await team.save();

      return interaction.reply({
        content: `> \`✅\` Spieler **${spielerName}** wurde zum Team **${teamName}** hinzugefügt.`,
        ephemeral: true,
      });
    }
  }
};
