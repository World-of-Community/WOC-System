import { EmbedBuilder, Events } from "discord.js";
import { sendLog } from "#core/discordLog.js";
import { settings } from "#core/settings.js";

export default [
  {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
      const embed = new EmbedBuilder()
        .setTitle("Bot Status - Update")
        .setDescription(`> \`🟢\` » **\`${client.user.username}\`** ist jetzt online.\n\n> \`🕒\` » <t:${Math.floor(client.readyTimestamp / 1000)}:F>`)
        .setColor("Green")
        .setTimestamp();

      await sendLog(settings.get("logThreads.botStatus"), embed);
    },
  },
  {
    name: Events.ShardDisconnect,
    async execute(client) {
      const embed = new EmbedBuilder()
        .setTitle("Bot Status - Update")
        .setDescription(`> \`🔴\` » **\`${client.user?.username ?? "Bot"}\`** ist offline.`)
        .setColor("Red")
        .setTimestamp();

      await sendLog(settings.get("logThreads.botStatus"), embed);
    },
  },
];
