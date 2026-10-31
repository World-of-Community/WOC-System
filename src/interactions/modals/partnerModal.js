import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags } from "discord.js";
import { settings } from "#core/settings.js";
import { UserError } from "#core/errors.js";

export default {
  id: "partner-modal",

  async run(client, interaction) {
    const field = (name) => interaction.fields.getTextInputValue(name);

    const channel = await client.channels.fetch(settings.get("channels.partnerApplications")).catch(() => null);
    if (!channel?.isTextBased()) {throw new UserError("> `❌` » Der Bewerbungs-Kanal ist nicht konfiguriert.");}

    const embed = new EmbedBuilder()
      .setTitle("🤝 » NEUE SERVER PARTNER ANFRAGE")
      .setDescription(
        `${interaction.user} (${interaction.user.username}) möchte sich als **Server-Partner** bewerben!\n\n` +
        `> \`🔗\` **Server-Link**\n${field("partner-name")}\n\n` +
        `> \`👥\` **Mitgliederanzahl**\n${field("partner-mitglieder")}\n\n` +
        `> \`🎮\` **Thema**\n${field("partner-thema")}\n\n` +
        `> \`📁\` **Kategorie**\n${field("partner-kategorie")}\n\n` +
        `> \`💬\` **Server-Beschreibung**\n${field("partner-beschreibung")}`,
      )
      .setColor("Orange")
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("partner_accept").setLabel("Akzeptieren").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("partner_deny").setLabel("Ablehnen").setStyle(ButtonStyle.Danger),
    );

    await channel.send({ embeds: [embed], components: [buttons] });
    await interaction.reply({ content: "> `✅` » Deine Anfrage wurde abgesendet. Bitte habe etwas Geduld.", flags: MessageFlags.Ephemeral });
  },
};