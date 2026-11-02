import { MessageFlags } from "discord.js";
import { settings } from "#core/settings.js";

import Creator from "../../../database/models/Creator.js";
import CreatorRedemption from "../../models/CreatorRedemption.js";

import { randomUUID } from "node:crypto";

export default {
  name: "creator",
  description: "» Creator-Codes einlösen und Statistiken ansehen.",
  type: 1,
  options: [
    {
      type: 1,
      name: "einloesen",
      description: "Löst einen Creator-Code ein.",
      options: [
        {
          type: 3,
          name: "code",
          description: "Creator-Code",
          required: true
        }
      ]
    },
    {
      type: 1,
      name: "stats",
      description: "Zeigt deine Creator-Statistiken."
    }
  ],

  async run(client, interaction) {
    const action = interaction.options.getSubcommand();

    try {
      // CREATOR-CODE EINLÖSEN
      if (action === "einloesen") {
        const code = interaction.options
          .getString("code")
          .trim()
          .toUpperCase();

        const creator = await Creator.findOne({
          code,
          active: true
        });

        if (!creator) {
          return interaction.reply({
            content: "> `❌` » Dieser Creator-Code ist ungültig.",
            flags: MessageFlags.Ephemeral
          });
        }

        if (creator.userId === interaction.user.id) {
          return interaction.reply({
            content: "> `❌` » Du kannst deinen eigenen Creator-Code nicht einlösen.",
            flags: MessageFlags.Ephemeral
          });
        }

        const alreadyUsed = await CreatorRedemption.findOne({
          userId: interaction.user.id
        });

        if (alreadyUsed) {
          return interaction.reply({
            content: "> `❌` » Du hast bereits einen Creator-Code eingelöst.",
            flags: MessageFlags.Ephemeral
          });
        }

        await CreatorRedemption.create({
          _id: randomUUID(),
          userId: interaction.user.id,
          code,
          creatorId: creator._id
        });

        creator.uses += 1;
        await creator.save();

        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("🎉 Creator-Code aktiviert!")
          .setDescription(
            `Du hast den Creator-Code **${code}** erfolgreich aktiviert!\n\n` +
            `\`💰\` **Dein Bonus:** ${creator.bonus.toLocaleString("de-DE")} Coins\n` +
            `\`💎\` **Creator:** <@${creator.userId}>\n\n` +
            "Vielen Dank für deine Unterstützung!"
          )
          .setFooter({
            text: "World Of Community • Creator-System"
          })
          .setTimestamp();

        return interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral
        });
      }

      // EIGENE CREATOR-STATISTIK
      if (action === "stats") {
        const creator = await Creator.findOne({
          userId: interaction.user.id
        });

        if (!creator) {
          return interaction.reply({
            content: "> `❌` » Du bist kein registrierter Creator.",
            flags: MessageFlags.Ephemeral
          });
        }

        const open = creator.earned - creator.paid;

        const embed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle("📊 Creator-Statistik")
          .setThumbnail(interaction.user.displayAvatarURL())
          .setDescription(
            `Willkommen in deiner Creator-Übersicht!\n\n` +
            `**Creator-Code:** \`${creator.code}\`\n` +
            `**Status:** ${creator.active ? "`🟢` Aktiv" : "`🔴` Inaktiv"}\n\n` +
            `**Statistiken**\n` +
            `» Code-Einlösungen: **${creator.uses}**\n` +
            `» SeasonPass-Verkäufe: **${creator.sales}**\n` +
            `» Provision: **${creator.commission} %**\n\n` +
            `**Coins-Übersicht**\n` +
            `» Insgesamt verdient: **${creator.earned.toLocaleString("de-DE")} Coins**\n` +
            `» Bereits ausgezahlt: **${creator.paid.toLocaleString("de-DE")} Coins**\n` +
            `» Noch offen: **${open.toLocaleString("de-DE")} Coins**`
          )
          .setFooter({
            text: "World Of Community • Creator-System"
          })
          .setTimestamp();

        return interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral
        });
      }

    } catch (error) {
      console.error("[Creator-System]", error);

      const response = {
        content: "> `❌` » Beim Creator-System ist ein Fehler aufgetreten.",
        flags: MessageFlags.Ephemeral
      };

      if (interaction.replied || interaction.deferred) {
        return interaction.followUp(response);
      }

      return interaction.reply(response);
    }
  }
};