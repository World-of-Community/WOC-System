import { EmbedBuilder } from "discord.js";
import { GUILD_ID } from "#config";
import { settings } from "#core/settings.js";

export default {
  name: "werbung",
  interval: 6 * 60 * 60 * 1000,

  async execute(client) {
    const channel = client.guilds.cache.get(GUILD_ID)?.channels.cache.get(settings.get("channels.advertising"));
    if (!channel) {return;}

    const embed = new EmbedBuilder()
      .setTitle("`🌍` WORLD OF COMMUNITY")
      .setDescription(
        "__Du suchst ein Minecraft-& Discord Server?__\n\n" +
        "> __Dann bist du bei uns genau richtig!__\n\n" +
        "**__Wir bieten dir:__**\n\n" +
        "> `🎭` » **Server-Rollen** um dein **Server-Profil** anzupassen\n" +
        "> `🔔` » **Server-Events** auf dem Discord-Server\n" +
        "> `✨` » **Selbst** Programmierte Bots mit **einzigartigen Features!**\n" +
        "> `👥` » **Freundliche & Hilfsbereite** Community!\n" +
        "> `📄` » **Täglich neue Nachrichten** sowie **Gaming- & Film-News**\n" +
        "> `🎮` » **Spielersuche** wo ihr euren **Spielpartner finden** könnt\n" +
        "> `🎥` » Eine **exklusive Live-Streamer** Rolle wenn du **Live** bist!\n" +
        "> `🚑` » **Support** bei Problemen rund um Discord & Minecraft\n" +
        "> `🏆` » **Levelsystem** mit **vielen Belohnungen**\n" +
        "> `💡` » **Vorschlags-System** um den Server mitzugestalten\n\n" +
        "`🔍` - **Wir suchen Verstärkung für unser Team:**\n\n" +
        "> `🔧` - Developer\n" +
        "> `🧩` - Supporter\n" +
        "> `👷` - Builder\n" +
        "> `🎥` - Creator\n\n" +
        "> `📌` **| Wir freuen uns auf dich!**\n\n" +
        "» Link: https://discord.gg/686M8Cxsaa",
      )
      .setColor("Blurple")
      .setImage("https://cdn.discordapp.com/attachments/1269339771420016722/1269341310989369384/World_Of_Community.png?ex=66b30177&is=66b1aff7&hm=0397fdb8031ef7316a8668df5cad914f61dc6d25fa7ff396bb3107d9463f6bc0&")
      .setFooter({ text: "» World Of Community - Werbung", iconURL: "https://cdn.discordapp.com/attachments/1269339586568388670/1269341245730459749/WOC_Orange.png?ex=66f4ec68&is=66f39ae8&hm=ab3c1d2943afe003b938fa850ae5e5c643ed69225e1980d73573fef78234ad83&" });

    const msg = await channel.send({ embeds: [embed] });
    await msg.crosspost().catch(() => {});
  },
};
