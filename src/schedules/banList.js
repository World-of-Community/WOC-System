import { EmbedBuilder } from "discord.js";
import bandb from "#models/bandb.js";
import logger from "#core/logger.js";
import { GUILD_ID, config } from "#config";

const BAN_LIST_CHANNEL_ID = "1217020305671983205";

export default {
  name: "banList",
  cron: "* * * * *",

  async execute(client) {
    const guild = await client.guilds.fetch(GUILD_ID);
    const role = guild.roles.cache.get(config.banRolle);
    if (!role) {
      logger.warn("Ban role not found");
      return;
    }

    const lines = [];
    for (const member of role.members.values()) {
      const banData = await bandb.findOne({ userId: member.id });
      lines.push(`${member} - ${member.user.username} (\`${banData?.reason ?? "Kein Grund angegeben"}\`)`);
    }

    const channel = await guild.channels.fetch(BAN_LIST_CHANNEL_ID).catch(() => null);
    const message = (await channel?.messages.fetch({ limit: 1 }))?.first();
    if (!message) {
      logger.warn("Ban list message not found");
      return;
    }

    const date = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

    const embed = new EmbedBuilder()
      .setTitle("Information zu den Gebannten Nutzern")
      .setDescription(
        `Hier ist eine Liste der gebannten Nutzer\n> \`⛔\` 𑁉 <@&${config.banRolle}> (\`${lines.length}👥\`)\n\n` +
        (lines.length > 0 ? lines.join("\n") : "> Aktuell sind keine Bann-Einträge vorhanden."),
      )
      .setColor("Red")
      .setFooter({ text: `» Bann System - Aktualisiert am: ${date}`, iconURL: guild.iconURL() })
      .setTimestamp();

    await message.edit({ embeds: [embed] });
  },
};
