import { Events } from "discord.js";
import userdb from "#models/userdb.js";
import { config } from "#config";

const CHANNEL_REACTIONS = {
  "896743941813207081": ["🔍"], // Spielersuche
  "1172920281526960238": ["<a:link:1369954893380718672>"], // Werbung für alle
  "1243964646449483788": ["<a:herzen:1394561549602914386>", "<a:Cool:915211628755169301>"], // Geburtstage
  "1250047970116636756": ["<:wocheartbeat:1376452184748855338>"], // Vorstellung
};
const VORSTELLUNG_CHANNEL_ID = "1250047970116636756";

export default {
  name: Events.MessageCreate,

  async execute(client, message) {
    if (!message.guild) {return;}

    if (message.channelId === config.autoDelete) {
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

    const reactions = CHANNEL_REACTIONS[message.channel.id];
    if (!reactions) {return;}
    if (message.channel.id === VORSTELLUNG_CHANNEL_ID && message.author.id === client.user.id) {return;}

    for (const emoji of reactions) {
      await message.react(emoji);
    }
  },
};
