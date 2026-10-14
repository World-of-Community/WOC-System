import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default {
  name: "event-system",
  description: "Schickt das Event System",
  type: 1,
  default_member_permissions: "8192",
  options: [],

  async run(client, interaction) {

    const eventEmbed = new EmbedBuilder()
      .setTitle("🧡 Season-Events 🧡")
      .setDescription('> **__Aktuelles Event__**\n# ```Aktuell findet kein "Season-Event" statt!```')
      .setColor("Blurple")
      .setImage("https://cdn.discordapp.com/attachments/1269339771420016722/1269341310989369384/World_Of_Community.png?ex=671884f7&is=67173377&hm=f32ce42648668f4434a7055d6269bc439d88f088226cfde13b52a38b0f2457e2&")
      .setFooter({ text: `${interaction.guild.name} | 🧡 Bleibt Gesund 🧡` });

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("easter_event")
          .setLabel("🐇 » Ostern")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("halloween_event")
          .setLabel("🎃 » Halloween")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("christmas_event")
          .setLabel("🎄 » Weihnachten")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("newyear_event")
          .setLabel("🎆 » Silvester")
          .setStyle(ButtonStyle.Primary),
      );

    const buttons2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("collect_event")
          .setLabel("Eventitem einsammeln")
          .setStyle(ButtonStyle.Success),
      );

    await interaction.channel.send({ embeds: [eventEmbed], components: [buttons, buttons2] });
    await interaction.reply({ content: "> `✅` » Das `Event-Embed` wurde erfolgreich gesendet", ephemeral: true });
  },
};
