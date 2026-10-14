import { Events } from "discord.js";
import userdb from "#models/User.js";

export default {
  name: Events.MessageCreate,

  async execute(client, message) {
    if (message.author.bot || !message.guild) {return;}

    const uD = await userdb.findOne({ userID: message.author.id });
    if (!uD?.afk || !uD.afkStamp) {return;}

    const afkSeit = uD.afkStamp;

    const m = await message.reply(
      `<:grnAFK:1021087367261585439> | ${message.author} **ist wieder da!**\n` +
      `> *Dein AFK-Status wurde entfernt. (Dauer: <t:${afkSeit}:R>)*`,
    );

    uD.afk = false;
    uD.afkReason = "";
    uD.afkStamp = "";
    await uD.save();

    setTimeout(() => m.delete().catch(() => {}), 5000);

    await message.member?.setNickname(message.member.displayName.replace("AFK | ", "")).catch(() => {});
  },
};
