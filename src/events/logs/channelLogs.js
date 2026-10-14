import { AuditLogEvent, ChannelType, EmbedBuilder, Events } from "discord.js";
import { sendLog, ThreadIDs } from "#core/discordLog.js";

const TYPE_NAMES = {
  [ChannelType.GuildText]: "TEXT",
  [ChannelType.GuildVoice]: "VOICE",
  [ChannelType.GuildAnnouncement]: "NEWS",
  [ChannelType.GuildStageVoice]: "STAGE",
  [ChannelType.GuildForum]: "FORUM",
};

export default [
  {
    name: Events.ChannelCreate,
    async execute(client, channel) {
      if (channel.type === ChannelType.GuildCategory) {return;}

      const embed = new EmbedBuilder()
        .setTitle("`➕` | KANAL ERSTELLT")
        .setDescription(`> Name: \`${channel.name}\` (<#${channel.id}>)\n> ID: \`${channel.id}\``)
        .setColor("Green")
        .setTimestamp();

      await sendLog(ThreadIDs.CHANNEL, embed);
    },
  },
  {
    name: Events.ChannelUpdate,
    async execute(client, oldChannel, newChannel) {
      if (newChannel.type === ChannelType.GuildCategory) {return;}

      const type = TYPE_NAMES[newChannel.type] || newChannel.type;
      let description = `\`📂\` » **Informationen:**\n<:text3:1228332174911213638>**Name:** \`${newChannel.name}\` (<#${newChannel.id}>)\n<:text2:1228330539941888011>**Kanaltyp:** \`${type}\`\n`;
      let changed = false;

      if (oldChannel.name !== newChannel.name) {
        description += `\n\`✒️\` » **Namensänderung:**\n<:text3:1228332174911213638>**Alt:** \`${oldChannel.name}\`\n<:text2:1228330539941888011>**Neu:** \`${newChannel.name}\``;
        changed = true;
      }
      if (oldChannel.nsfw !== newChannel.nsfw) {
        description += `\n\`🔞\` » **Altersbegrenzung:**\n<:text2:1228330539941888011>${newChannel.nsfw ? "<:on:1228350947898687508>" : "<:off:1228350962205200475>"}`;
        changed = true;
      }
      if (oldChannel.topic !== newChannel.topic) {
        description += `\n\`🏝️\` » **Beschreibungsänderung:**\n<:text3:1228332174911213638>**Alt:** \`${oldChannel.topic || "❌"}\`\n<:text2:1228330539941888011>**Neu:** \`${newChannel.topic || "❌"}\``;
        changed = true;
      }
      if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
        description += `\n\`🦥\` » **Slowmode:**\n<:text3:1228332174911213638>**Alt:** ${oldChannel.rateLimitPerUser || "<:off:1228350962205200475>"}\n<:text2:1228330539941888011>**Neu:** ${newChannel.rateLimitPerUser || "<:off:1228350962205200475>"}`;
        changed = true;
      }
      if (!changed) {return;}

      const audit = await newChannel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelUpdate, limit: 1 }).catch(() => null);
      const executor = audit?.entries.first()?.executor;

      const embed = new EmbedBuilder()
        .setTitle("`🔁` | KANAL BEARBEITET")
        .setDescription(description)
        .setColor("Orange")
        .setTimestamp();

      if (executor) {
        embed.setAuthor({ name: `${executor.username} » ${executor.id}`, iconURL: executor.displayAvatarURL({ size: 2048 }) });
      }

      await sendLog(ThreadIDs.CHANNEL, embed);
    },
  },
  {
    name: Events.ChannelDelete,
    async execute(client, channel) {
      if (channel.type === ChannelType.GuildCategory) {return;}

      const embed = new EmbedBuilder()
        .setTitle("`🗑️` | KANAL GELÖSCHT")
        .setDescription(`> Name: ${channel.name}\nID: \`${channel.id}\``)
        .setColor("Red")
        .setTimestamp();

      await sendLog(ThreadIDs.CHANNEL, embed);
    },
  },
];
