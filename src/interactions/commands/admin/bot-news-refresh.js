import { PermissionFlagsBits, EmbedBuilder, MessageFlags } from "discord.js";
import serverdb from "#models/Guild.js";

import { settings } from "#core/settings.js";

export default {
  name: "bot-news-refresh",
  description: "» Aktualisiere das Changelog. 🔁",
  type: 1,
  default_member_permissions: "8",
  options: [],

  async run(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {return;}

    if (await serverdb.findOne({ guildID: interaction.guildId, deactivated: { $in: ["changelog"] } })) {return channel.send({ content: "> `⛔` » Das Changelog System ist momentan deaktiviert." });}
    const serverData = await serverdb.findOne({ guildID: interaction.guildId });
    if (!serverData) {return;}
    const channel = await interaction.client.channels.cache.get(settings.get("channels.changelog"));
    await channel.messages.fetch(serverData.updateMessage).then(async msg => {
      await interaction.reply({ content: "> `⏰` » Die Daten werden verarbeitet das kann kurz dauern.", flags: MessageFlags.Ephemeral });
      setTimeout(async () => {

        // Week Date
        const today = new Date();
        const nextWeek = new Date(today);

        // Safely handle updateWeek
        const updateWeek = serverData.updateWeek || "Unbekannt";
        let footerText;

        if (updateWeek !== "Unbekannt") {
          footerText = `» Wir wünschen euch viel Spaß mit dem neuen Update! - ${updateWeek.split(" - ")[0]}.${new Date().getFullYear()}`;
        } else {
          footerText = "» Wir wünschen euch viel Spaß mit dem neuen Update!";
        }

        //» Wir wünschen euch viel Spaß mit dem neuen Update! - ${serverData.updateWeek.split(" - ")[0]}.${today.getFullYear()}

        nextWeek.setDate(today.getDate() + 6);

        const updateEmbed = new EmbedBuilder()
          .setTitle(`<a:Neuigkeiten:1018910061348798564> » UPDATE-WOCHENRÜCKBLICK [${serverData.updateWeek}]`)
          .setDescription("<:PointRed:1123612255800524940> = Bug behoben\n<:PointOrange:1123612277669630092> = Änderung\n<:PointGreen:1123612318694117477> = Neu hinzugefügt\n\n<:Pfeil:1119709908540076124> Diese Nachricht wird mit jeder **neuen Änderung** welche in dieser Woche passiert ist, bearbeitet. Der Ping zu allen Änderungen erfolgt **am Ende jeder Woche.**\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n")
          .setColor("#ff7b00")
          .setImage("https://cdn.discordapp.com/attachments/1539321113010765924/1539321721322999940/image.png?ex=6a8e7651&is=6a8d24d1&hm=792559fcdab06110df061689420a64cc56130f6d70f69be54d4c2f60298dce78&")
          .setFooter({ text: footerText, iconURL: client.user.displayAvatarURL() });

        if (serverData.support.length > 0) {
          updateEmbed.addFields(
            {
              name: "> <:Moderator:873823260507262996> - **WOC`👮`SUPPORT (BOT)** - UPDATE",
              value: `${serverData.support.join("\n")}`,
            },
          );
        }
        if (serverData.system.length > 0) {
          updateEmbed.addFields(
            {
              name: "> <a:System:915211580805881876> - **WOC`⚙️`SYSTEM (BOT)** - UPDATE",
              value: `${serverData.system.join("\n")}`,
            },
          );
        }
        if (serverData.gift.length > 0) {
          updateEmbed.addFields(
            {
              name: "> <a:Giveaway:968876442618306560> - **WOC`🎁`GIFT (BOT)** - UPDATE",
              value: `${serverData.gift.join("\n")}`,
            },
          );
        }
        if (serverData.verify.length > 0) {
          updateEmbed.addFields(
            {
              name: "> <a:yes_tick:1042831133303386122> - **SERVICE (BOT)** - UPDATE",
              value: `${serverData.service.join("\n")}`,
            },
          );
        }
        if (serverData.minecraft.length > 0) {
          updateEmbed.addFields(
            {
              name: "> <a:MinecraftGrassBlock:872034424181637171> - **MINECRAFT SERVER** - UPDATE",
              value: `${serverData.minecraft.join("\n")}`,
            },
          );
        }
        if (serverData.webseite.length > 0) {
          updateEmbed.addFields(
            {
              name: "> <a:wocbook:1178664700469317692> - **WEBSEITE** - UPDATE",
              value: `${serverData.webseite.join("\n")}`,
            },
          );
        }
        if (serverData.dc.length > 0) {
          updateEmbed.addFields(
            {
              name: "> <:Discord:912007935616516098> - **DISCORD SERVER** - UPDATE",
              value: `${serverData.dc.join("\n")}`,
            },
          );
        }

        await interaction.editReply({ content: "> `✅` » Ich habe das Changelog erfolgreich aktualisiert.", flags: MessageFlags.Ephemeral });
        await msg.edit({ embeds: [updateEmbed] });
      }, 5000);
    });
  },
};
