import { PermissionFlagsBits, ChannelType } from "discord.js";
import EventDropAndUser from "#models/EventDrop.js";

export default {
  name: "eventdrop",
  description: "Verwalte Event-Drops",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      "type": 1,
      "name": "start",
      "description": "» Startet die Gewinn-Drops für das Event. ✅",
      "options": [
        {
          "channel_types": [
            0,
          ],
          "name": "kanal",
          "description": "Wähle einen Textkanal für die Event-Drops",
          "required": true,
          "type": 7,
        },
      ],
    },
    {
      "type": 1,
      "name": "stop",
      "description": "» Stoppt die Gewinn-Drops für das Event. ❌",
      "options": [
        {
          "channel_types": [
            0,
          ],
          "name": "kanal",
          "description": "Wähle einen Textkanal für die Event-Drops",
          "required": true,
          "type": 7,
        },
      ],
    },
    {
      "type": 1,
      "name": "check",
      "description": "» Zeigt die gesammelten Gewinne eines Benutzers an",
      "options": [],
    },
    {
      "type": 1,
      "name": "reset",
      "description": "» Setzt die Gewinne eines Benutzers zurück",
      "options": [
        {
          "name": "user",
          "description": "Benutzer, dessen Gewinne zurückgesetzt werden",
          "required": true,
          "type": 6,
        },
      ],
    },
  ],

  async run(client, interaction) {
    // Berechtigungsprüfung: Nur Admins oder bestimmte Rollen dürfen ausführen
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: "> `❌` » Du hast keine Berechtigung, diesen Befehl auszuführen.", ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const selectedChannel = interaction.options.getChannel("kanal");

    if (selectedChannel && selectedChannel.type !== ChannelType.GuildText) {
      return interaction.reply({ content: "> `❗` » Bitte wähle einen Textkanal aus.", ephemeral: true });
    }

    if (subcommand === "start") {
      // Aktivieren der Event-Drops im ausgewählten Kanal
      await EventDropAndUser.findOneAndUpdate({ event: "active" }, { status: "active", channelId: selectedChannel.id }, { upsert: true });
      return interaction.reply({ content: `> \`✅\` » Die Gewinn-Drops wurden **gestartet** im Kanal ${selectedChannel.name}!`, ephemeral: true });
    }

    if (subcommand === "stop") {
      // Deaktivieren der Event-Drops im ausgewählten Kanal
      await EventDropAndUser.findOneAndUpdate({ event: "active" }, { status: "inactive", channelId: selectedChannel.id });
      return interaction.reply({ content: `> \`✅\` » Die Gewinn-Drops wurden **gestoppt** im Kanal ${selectedChannel.name}!`, ephemeral: true });
    }

    if (subcommand === "check") {
      // Zeige die gesammelten Gewinne des Benutzers an
      const user = await EventDropAndUser.findOne({ userId: interaction.user.id });
      if (!user || !user.eventDrops || user.eventDrops.length === 0) {
        return interaction.reply({ content: "> `❌` » Du hast noch keine Gewinne gesammelt.", ephemeral: true });
      }
      return interaction.reply({ content: `> \`📌\` » Deine gesammelten Gewinne: ${user.eventDrops.join(", ")}`, ephemeral: true });
    }

    if (subcommand === "reset") {
      // Gewinne des Benutzers zurücksetzen
      const targetUser = interaction.options.getUser("user");
      const userToReset = await EventDropAndUser.findOne({ userId: targetUser.id });

      if (!userToReset || !userToReset.eventDrops || userToReset.eventDrops.length === 0) {
        return interaction.reply({ content: "> `❌` » Dieser Benutzer hat keine Gewinne zu resetten.", ephemeral: true });
      }

      userToReset.eventDrops = [];
      await userToReset.save();
      return interaction.reply({ content: `> \`✅\` » Die gesammelten Gewinne von ${targetUser.tag} wurden erfolgreich zurückgesetzt.`, ephemeral: true });
    }

    // Preis zufällig aus den Levels 1 bis 5 auswählen
    if (subcommand === "event") {
      const levels = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"];
      const gibLevel = Math.random() < 0.5; // 50 % Chance auf Level, 50 % auf Coins

      const nutzer = await EventDropAndUser.findOne({ userId: interaction.user.id });

      if (!nutzer) {
        const neuerNutzer = new EventDropAndUser({
          userId: interaction.user.id,
          eventDrops: [],
          coins: 0,
        });

        if (gibLevel) {
          const zufälligesLevel = levels[Math.floor(Math.random() * levels.length)];
          neuerNutzer.eventDrops.push(zufälligesLevel);
          await neuerNutzer.save();
          return interaction.reply({
            content: `> \`🏆\` » Du hast **${zufälligesLevel}** gewonnen!`,
            ephemeral: true,
          });
        } else {
          const zufälligeCoins = Math.floor(Math.random() * (5000 - 10 + 1)) + 10;
          neuerNutzer.coins = zufälligeCoins;
          await neuerNutzer.save();
          return interaction.reply({
            content: `> \`🪙\` » Du hast **${zufälligeCoins.toLocaleString("de-DE")} Coins** gewonnen!`,
            ephemeral: true,
          });
        }
      } else {
        if (gibLevel) {
          const zufälligesLevel = levels[Math.floor(Math.random() * levels.length)];
          nutzer.eventDrops.push(zufälligesLevel);
          await nutzer.save();
          return interaction.reply({
            content: `> \`🏆\` » Du hast **${zufälligesLevel}** gewonnen!`,
            ephemeral: true,
          });
        } else {
          const zufälligeCoins = Math.floor(Math.random() * (5000 - 10 + 1)) + 10;
          nutzer.coins = (nutzer.coins || 0) + zufälligeCoins;
          await nutzer.save();
          return interaction.reply({
            content: `> \`🪙\` » Du hast **${zufälligeCoins.toLocaleString("de-DE")} Coins** gewonnen!`,
            ephemeral: true,
          });
        }
      }
    }
  },
};
