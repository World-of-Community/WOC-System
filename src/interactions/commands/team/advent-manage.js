import { MessageFlags } from "discord.js";
import Advent from "#models/Advent.js";
import { settings } from "#core/settings.js";

// Belohnungen definieren
const rewards = {
  1: { type: "coins", value: 100 },
  2: { type: "coins", value: 200 },
  3: { type: "coins", value: 300 },
  4: { type: "coins", value: 400 },
  5: { type: "coins", value: 500 },
  6: { type: "role", value: settings.get("achievementRoles.advent2025") },
  7: { type: "coins", value: 700 },
  8: { type: "coins", value: 800 },
  9: { type: "coins", value: 900 },
  10: { type: "coins", value: 1000 },
  11: { type: "coins", value: 1100 },
  12: { type: "coins", value: 1200 },
  13: { type: "coins", value: 1300 },
  14: { type: "coins", value: 1400 },
  15: { type: "coins", value: 1500 },
  16: { type: "coins", value: 1600 },
  17: { type: "coins", value: 1700 },
  18: { type: "coins", value: 1800 },
  19: { type: "coins", value: 1900 },
  20: { type: "coins", value: 2000 },
  21: { type: "coins", value: 2100 },
  22: { type: "coins", value: 2200 },
  23: { type: "coins", value: 2300 },
  24: { type: "role", value: settings.get("achievementRoles.christmas2025") },
};

export default {
  name: "advent",
  description: "» Adventskalender Verwaltung 🎄",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      type: 1,
      name: "check",
      description: "Zeigt geöffnete Adventskalender-Tage an 📅",
      options: [
        {
          name: "user",
          description: "Benutzer auswählen (optional).",
          required: false,
          type: 6,
        },
      ],
    },
    {
      type: 1,
      name: "reset",
      description: "Setzt den Adventskalender für einen Benutzer zurück 🔄",
      options: [
        {
          name: "user",
          description: "Benutzer auswählen.",
          required: true,
          type: 6,
        },
      ],
    },
  ],

  async run(client, interaction) {
    const subcommand = interaction.options.getSubcommand();
    const target = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    const displayName = member?.displayName || target.username;

    const userData = await Advent.findOne({ userId: target.id });
    const openedDays = userData?.openedDays?.map(Number) || [];

    // ---------- CHECK ----------
    if (subcommand === "check") {
      if (!userData || openedDays.length === 0) {
        return interaction.reply({
          content: `> \`📭\` » **${displayName}** hat noch kein Türchen geöffnet.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const opened = openedDays.sort((a,b)=>a-b).join(", ");
      const currentDay = new Date().getDate();
      const nextDay = [...Array(25).keys()].slice(1).find(d => !openedDays.includes(d) && d <= currentDay);

      let nextRewardText = "";
      if (nextDay && rewards[nextDay]) {
        const nextReward = rewards[nextDay];
        if (Array.isArray(nextReward)) {
          nextRewardText = nextReward.map(r => r.type === "coins" ? `${r.value} Coins` : r.type).join(" + ");
        } else {
          nextRewardText = nextReward.type === "coins" ? `${nextReward.value} Coins` : nextReward.type;
        }
      }

      return interaction.reply({
        content: `> \`📅\` » Geöffnete Tage von **${displayName}**:\n> \`${opened}\`\n\n` +
                         (nextDay
                           ? `> \`🎁\` » Nächstes öffnbares Türchen: ${nextDay}. Dezember\n> Belohnung: ${nextRewardText}`
                           : "> `🎁` » Alle bisherigen Tage geöffnet!"),
        flags: MessageFlags.Ephemeral,
      });
    }

    // ---------- RESET ----------
    if (subcommand === "reset") {
      if (!userData) {
        return interaction.reply({
          content: `> \`ℹ️\` » Für **${displayName}** existiert kein Adventskalender-Eintrag.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      await Advent.deleteOne({ userId: target.id });
      return interaction.reply({
        content: `> \`🔄\` » Adventskalender für **${displayName}** wurde **zurückgesetzt**!`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
