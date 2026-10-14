import { Events } from "discord.js";
import { settings } from "#core/settings.js";

const RANK_LEVELS = [5, 10, 20, 30, 40, 50, 75, 100];

export default {
  name: Events.MessageCreate,

  async execute(client, message) {
    if (!message.guild) {return;}
    if (message.author.id !== settings.get("bots.level") || message.channelId !== settings.get("channels.levelLog")) {return;}

    const channel = message.guild.channels.cache.get(settings.get("channels.mainChat"));
    const mention = message.mentions.users.first();
    const description = message.embeds[0]?.description;
    if (!channel || !mention || !description) {return;}

    // the level is the last bold number in the level bot's embed
    const matches = [...description.matchAll(/\*\*([\d]+)\*\*/g)];
    if (matches.length < 1) {return;}

    const level = parseInt(matches[matches.length - 1][1], 10);

    if (RANK_LEVELS.includes(level)) {
      await channel.send(`<a:trophy:1375557481434189934> **LEVEL-UP!** ${mention} hat das Level **${level}.** erreicht - und einen **neuen Rang** erhalten! <a:Cool:1033461188299858001>`);
      return;
    }

    const nextRank = RANK_LEVELS.find((l) => level < l);
    if (nextRank) {
      await channel.send(`<a:cheers:1375558102098776214> **LEVEL-UP!** ${mention} hat das Level **${level}.** erreicht - noch **${nextRank - level}** Level bis zu einem **neuen Rang** - Weiter so! <a:Chat1:976129450112593990>`);
      return;
    }

    if (level >= 100) {
      await channel.send(`<a:trophy:1375557481434189934> **LEVEL-UP!** ${mention} hat das Level **${level}.** erreicht - danke für deine weitere Treue für die Community! <a:2herzen:1196502635465932984>`);
    }
  },
};
