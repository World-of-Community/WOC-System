import { MessageFlags } from "discord.js";
import Advent from "#models/Advent.js";
import { settings } from "#core/settings.js";

const rewards = {
  6: { type: "role", value: settings.get("achievementRoles.advent2025") }, // Adventskalender 2025
  24: { type: "role", value: settings.get("achievementRoles.christmas2025") }, // Weihnachten 2025
};

export default {
  id: "advent_",
  prefix: true,
  async run(client, interaction) {
    const currentDay = new Date().getDate();
    const [, day] = interaction.customId.split("_");
    const dayNumber = parseInt(day);

    let userData = await Advent.findOne({ userId: interaction.user.id });
    if (!userData) {
      userData = await Advent.create({ userId: interaction.user.id, openedDays: [] });
    }

    if (userData.openedDays.includes(dayNumber)) {
      return interaction.reply({ content: `> \`❗\` » Du hast diesen Tag (${dayNumber}. Dezember) bereits geöffnet!`, flags: MessageFlags.Ephemeral });
    }

    if (dayNumber > currentDay) {
      return interaction.reply({ content: "> `❌` » Du kannst zukünftige Tage nicht öffnen!", flags: MessageFlags.Ephemeral });
    }

    userData.openedDays.push(dayNumber);
    await userData.save();

    let rewardMessage;

    const reward = rewards[dayNumber];

    switch (reward?.type) {
      case "role": {
        const role = interaction.guild.roles.cache.find(r => r.id === reward.value);
        if (role) {
          await interaction.member.roles.add(role);
          rewardMessage = "> `🎄` **Frohe Weihnachten!** `🎁`\n\n" +
                                    `> \`🎉\` » Du hast die Rolle **${role}** erhalten!`;
        } else {
          rewardMessage = "> `❗` » Rolle wurde nicht gefunden. Bitte melde dich im Support.";
        }
        break;
      }

      case "custom":
        rewardMessage = reward.value || "> `🎁` » Keine spezifische Belohnung verfügbar.";
        break;

      default:
        rewardMessage = `> \`❗\` » Du hast den **${dayNumber}. Dezember** bereits geöffnet.`;
    }

    return interaction.reply({ content: rewardMessage, flags: MessageFlags.Ephemeral });
  },
};
