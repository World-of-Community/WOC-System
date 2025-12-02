const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { DateTime } = require("luxon");
const Server = require("../../../Datenbank/usercounterdb");

function formatBoostDuration(boostTimestamp) {
  const boostStart = DateTime.fromJSDate(boostTimestamp);
  const now = DateTime.now();

  // Gesamte Tage seit Boost, aufgerundet
  const totalDays = Math.ceil(now.diff(boostStart, "days").days);
  const years = Math.floor(totalDays / 365);
  const days = totalDays % 365;

  if (years === 0 && days < 1) {return null;}

  const parts = [];
  if (years > 0) {parts.push(`${years} ${years === 1 ? "Jahr" : "Jahren"}`);}
  if (days > 0) {parts.push(`${days} ${days === 1 ? "Tag" : "Tagen"}`);}

  if (parts.length > 1) {
    const last = parts.pop();
    return parts.join(" und ") + " " + last;
  }

  return parts[0];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("» Erhalte paar Informationen über den Server. ❓"),

  async execute(interaction) {
    const guild = interaction.guild;
    const members = await guild.members.fetch();
    const botCount = members.filter(member => member.user.bot).size;
    const userCount = members.filter(member => !member.user.bot).size;

    const onlineMembers = members.filter(m =>
      m.presence?.status === "online" ||
            m.presence?.status === "idle" ||
            m.presence?.status === "dnd",
    ).filter(member => !member.user.bot).size.toLocaleString("de-DE") || 0;

    let serverData = await Server.findOne({ guildId: guild.id });
    if (!serverData) {
      serverData = new Server({
        guildId: guild.id,
        highestUserCount: userCount,
      });
    }

    if (userCount > serverData.highestUserCount) {
      serverData.highestUserCount = userCount;
      await serverData.save();
    }

    const createdAt = `<t:${Math.round(guild.createdTimestamp / 1000)}:D>`;
    const joinedAt = `<t:${Math.round(interaction.member.joinedTimestamp / 1000)}:R>`;

    const emojiCount = guild.emojis.cache.size;

    const boosterRole = guild.roles.cache.find(role => role.tags?.premiumSubscriberRole);

    let boosterMentions = "Kein Booster";
    if (boosterRole) {
      const boosters = boosterRole.members;
      if (boosters.size > 0) {
        boosterMentions = boosters.map(member => {
          const boostSince = member.premiumSince;
          let durationText = "";
          if (boostSince) {
            const formatted = formatBoostDuration(boostSince);
            if (formatted) {
              durationText = ` – **seit ${formatted}**`;
            }
          }
          return `${member.toString()}${durationText}`;
        }).join("\n> ");
      }
    }

    const serverEmbed = new EmbedBuilder()
      .setTitle(`${guild.name} - Server Information`)
      .setDescription(
        `> \`⏰\` » **Server Erstellt:** ${createdAt} (${joinedAt})\n` +
                `> \`👥\` » **Mitglieder:** \`${guild.memberCount.toLocaleString("de-DE")}\`\n` +
                `> \`👤\` » **User:** \`${userCount.toLocaleString("de-DE")}\`\n` +
                `> \`⚙️\` » **Bots:** \`${botCount}\`\n` +
                `> \`🟢\` » **Online:** \`${onlineMembers.toLocaleString("de-DE")}\`\n` +
                `> \`📈\` » **Erreichte Useranzahl:** \`${serverData.highestUserCount.toLocaleString("de-DE")}\`\n\n` +
                `> <a:nitro:1186636151335944283> » Boost Level: **${guild.premiumTier}** (**${guild.premiumSubscriptionCount}** Boosts)\n` +
                `> \`💖\` » **Server Booster:**\n> ${boosterMentions}\n\n` +
                `> \`🎭\` » Wir haben aktuell **${emojiCount}** Emotes.`,
      )
      .setColor("Blurple")
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setFooter({ text: `${guild.name} | Server Information`, iconURL: `${guild.iconURL()}` });

    interaction.reply({ embeds: [serverEmbed], ephemeral: true });
  },
};
