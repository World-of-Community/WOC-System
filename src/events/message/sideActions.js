import { Events } from "discord.js";
import userdb from "#models/User.js";
import { settings } from "#core/settings.js";

const channelReactions = () => ({
  [settings.get("channels.playerSearch")]: ["🔍"],
  [settings.get("channels.ads")]: ["<a:link:1369954893380718672>"],
  [settings.get("channels.birthdays")]: ["<a:herzen:1394561549602914386>", "<a:Cool:915211628755169301>"],
  [settings.get("channels.introductions")]: ["<:wocheartbeat:1376452184748855338>"],
});

export default {
  name: Events.MessageCreate,

  async execute(client, message) {
    if (!message.guild) {return;}

    if (message.channelId === settings.get("channels.botCommands")) {
      setTimeout(() => message.delete().catch(() => {}), 30000);
    }

    if (message.mentions.users.size > 0 && !message.author.bot) {
      for (const mentionedUser of message.mentions.users.values()) {
        const mentionData = await userdb.findOne({ userID: mentionedUser.id });
        if (!mentionData) {continue;}

        if (mentionData.reactions?.length > 0) {
          await Promise.all(mentionData.reactions.map((reaction) => message.react(reaction).catch(() => {})));
        }

        if (mentionData.afk && mentionedUser.id !== message.author.id) {
          const m = await message.reply(
            `<:AFK:1021086267557023775> | ${mentionedUser} **ist aktuell abwesend!**\n` +
            `${mentionData.afkReason.replace("*", "")}`,
          );
          setTimeout(() => m.delete().catch(() => {}), 5000);
        }
      }
    }

    const reactions = channelReactions()[message.channel.id];
    if (!reactions) {return;}
    if (message.channel.id === settings.get("channels.introductions") && message.author.id === client.user.id) {return;}

    for (const emoji of reactions) {
      await message.react(emoji);
    }
  },
};
