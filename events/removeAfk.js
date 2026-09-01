import client from "../index.js";
import { Events, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ComponentType } from "discord.js";
import fs from "fs";
import serverdb from "../models/serverdb.js";
import userdb from "../models/userdb.js";
import messagedb from "../models/messagedb.js";
import teamdb from "../models/teamdb.js";
import logger from "../functions/logger.js";

client.on(Events.MessageCreate, async (message) => {

      // AFK System
      if (!message.author.bot) {
       
        const uD = await userdb.findOne({ userID: message.author.id });
        if (uD && uD.afk && uD.afkStamp) {
          const afkSeit = uD.afkStamp;
    
          // Nachricht senden
          const m = await message.reply(
            `<:grnAFK:1021087367261585439> | ${message.author} **ist wieder da!**\n` +
                        `> *Dein AFK-Status wurde entfernt. (Dauer: <t:${afkSeit}:R>)*`,
          );
    
          // AFK-Status entfernen
          uD.afk = false;
          uD.afkReason = "";
          uD.afkStamp = "";
          await uD.save();
    
          setTimeout(async () => {
            try {
              await m.delete();
            } catch {
              // Nachricht wurde bereits gelöscht
            }
          }, 5000);
    
          await message.member.setNickname(
            message.member.displayName.replace("AFK | ", ""),
          ).catch(() => {});
        }
      }
    

})