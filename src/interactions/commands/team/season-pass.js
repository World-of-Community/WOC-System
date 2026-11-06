import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";

export default {
  name: "season-pass",
  description: "» Zeigt den Seasonpass mit allen Vorteilen und der Kaufoption. 🎫",
  type: 1,
  default_member_permissions: "268435456",
  options: [],

  async run(client, interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎟️ SeasonPass")
      .setColor("Blurple")
      .setDescription(
        "Schreibe jeden Tag mindestens 1x - erhalte jeden Monat bis zu 20 Belohnungen!\n\n" +
        "**Auf einen Blick**:\n" +
        "» Alle 30 Tage ein Pass mit 20 Belohnungen\n" +
        "» Davon 7 free, 13 Premium\n" +
        "» Schreibe aktiv, um deine Belohnungen freizuschalten\n\n" +
        "**So Geht's**:\n" +
        "» Schreibe jeden Tag mindestens 1x\n" +
        "» Du erhältst XP, mit denen du Belohnungen freischaltest\n" +
        "» 150 XP wenn du am vorherigen Tag auch geschrieben hast\n" +
        "» Ansonsten nur 100 XP - aktives Schreiben wird belohnt!\n\n" +
        "`📌` » **Premium Pass**: Alle Belohnungen inkl. **5000 Coins**!\n",
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("seasonpass:show:1")
        .setLabel("SeasonPass anzeigen")
        .setEmoji("🎟️")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("seasonpass:shop:open")
        .setLabel("Alle Rewards freischalten")
        .setEmoji("💎")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("shoppass_creator_code")
        .setLabel("Creator Code")
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: "> `🎟️` » SeasonPass Embed gesendet.", flags: MessageFlags.Ephemeral });
  },
};
