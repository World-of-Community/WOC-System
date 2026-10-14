import { EmbedBuilder } from "discord.js";
import bandb from "#models/bandb.js";
import logger from "#core/logger.js";

const BANLISTE_MESSAGE_ID = "1298680434347081730"; // Falls du es automatisch speichern willst, sag Bescheid!

export default {
  name: "banliste",
  description: "» Zeigt dir die Bannliste an. 📋",
  type: 1,
  default_member_permissions: "268435456",
  options: [],

  async run(client, interaction) {
    const gebannt = interaction.guild.roles.cache.get("886989738244964362");
    if (!gebannt) {
      return interaction.reply({
        content: "> `❌` » Die Rolle für gebannte Nutzer wurde nicht gefunden.",
        ephemeral: true,
      });
    }

    // Schnelle Antwort senden
    await interaction.reply({ content: "> `🔄` » Lade Bannliste...", ephemeral: true });

    const bans = await Promise.all(
      gebannt.members.map(async (member) => {
        try {
          const banData = await bandb.findOne({ user: member.id });
          return `${member} - ${member.user.username} (\`${banData?.reason || "Kein Grund angegeben"}\`)`;
        } catch (error) {
          logger.error(`Fehler beim Abrufen der Bann-Daten für ${member.user.tag}: ${error.message}`);
          return `${member} - ${member.user.username} (Fehler beim Laden)`;
        }
      }),
    );

    const currentTime = new Date().toLocaleDateString("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const bannembed = new EmbedBuilder()
      .setTitle("Information zu den Gebannten Nutzern")
      .setDescription(`Hier ist eine Liste der gebannten Nutzer\n> \`⛔\` 𑁉 <@&886989738244964362> (\`${bans.length}👥\`):\n\n${bans.length > 0 ? bans.join("\n") : "Keine Bans vorhanden!"}`)
      .setColor("Red")
      .setFooter({ text: `» Bann System - Aktualisiert am: ${currentTime}`, iconURL: interaction.guild.iconURL() });

    try {
      const message = await interaction.channel.messages.fetch(BANLISTE_MESSAGE_ID);
      if (message) {
        await message.edit({ embeds: [bannembed] });
        await interaction.editReply({ content: "> `✅` » Die Bannliste wurde aktualisiert." });
      }
    } catch {
      logger.info("Banliste-Nachricht nicht gefunden oder gelöscht. Erstelle eine neue...");
      const newMessage = await interaction.channel.send({ embeds: [bannembed] });
      await interaction.editReply({ content: "> `✅` » Die Bannliste wurde erstellt." });

      logger.info(`Neue Banliste-ID: ${newMessage.id}`);
    }
  },
};
