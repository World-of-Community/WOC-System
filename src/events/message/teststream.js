import { Events, ActivityType, PermissionFlagsBits } from "discord.js";
import { syncStreamerRoleForMember } from "#systems/streamerRole.js";

// "!teststream" simulates a streaming presence and really assigns the live role
export default {
  name: Events.MessageCreate,

  async execute(client, message) {
    if (message.author.bot || !message.guild) {return;}
    if (message.content.trim().toLowerCase() !== "!teststream") {return;}

    const member = message.member;
    if (!member) {
      await message.reply("❌ Kein Guild-Member für den Test gefunden.");
      return;
    }

    if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await message.reply("❌ Du brauchst die Berechtigung `Rollen verwalten` für `!teststream`.");
      return;
    }

    const result = await syncStreamerRoleForMember(
      member,
      [{
        type: ActivityType.Streaming,
        name: "WOC Teststream",
        url: "https://twitch.tv/worldofcommunity",
        details: "Simulierter Stream via !teststream",
      }],
      "teststream",
    );

    if (result.status === "added_role") {
      await message.reply("✅ Test erfolgreich: Streaming-Rolle wurde real vergeben.");
    } else if (result.status === "already_had_role") {
      await message.reply("ℹ️ Test erfolgreich: Streaming erkannt, Rolle war bereits vorhanden.");
    } else {
      await message.reply(`❌ Test fehlgeschlagen: ${result.status}.`);
    }
  },
};
