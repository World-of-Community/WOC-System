import { MessageFlags } from "discord.js";
import { settings } from "#core/settings.js";

import { Creator } from "../../models/Creator.js";

export default {
  name: "creator-admin",
  description: "» Verwaltung des Creator-Code-Systems.",
  type: 1,
  default_member_permissions: "8",

  options: [
    {
      type: 1,
      name: "erstellen",
      description: "Erstellt einen neuen Creator-Code.",
      options: [
        {
          type: 6,
          name: "creator",
          description: "Discord-Mitglied",
          required: true
        },
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
      name: "bearbeiten",
      description: "Bearbeitet einen Creator-Code.",
      options: [
        {
          type: 3,
          name: "code",
          description: "Creator-Code",
          required: true
        },
        {
          type: 10,
          name: "provision",
          description: "Provision in Prozent",
          required: false,
          min_value: 0,
          max_value: 100
        },
        {
          type: 10,
          name: "bonus",
          description: "Spielerbonus in Coins",
          required: false,
          min_value: 0
        }
      ]
    },
    {
      type: 1,
      name: "loeschen",
      description: "Deaktiviert einen Creator-Code.",
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
      description: "Zeigt die Statistiken aller Creator."
    },
    {
      type: 1,
      name: "auszahlung",
      description: "Verbucht eine Creator-Auszahlung.",
      options: [
        {
          type: 3,
          name: "code",
          description: "Creator-Code",
          required: true
        },
        {
          type: 4,
          name: "betrag",
          description: "Auszahlungsbetrag in Coins",
          required: true,
          min_value: 1
        }
      ]
    }
  ],

  async run(client, interaction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ Du hast keine Berechtigung dafür.",
        flags: MessageFlags.Ephemeral
      });
    }

    const action = interaction.options.getSubcommand();

    try {
      // CREATOR ERSTELLEN
      if (action === "erstellen") {
        const user = interaction.options.getUser("creator");
        const code = interaction.options
          .getString("code")
          .trim()
          .toUpperCase();

        if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
          return interaction.reply({
            content: "❌ Der Code muss 3–20 Zeichen lang sein und darf nur Buchstaben, Zahlen, _ und - enthalten.",
            flags: MessageFlags.Ephemeral
          });
        }

        const existingCode = await Creator.findOne({ code });
        const existingCreator = await Creator.findOne({
          userId: user.id
        });

        if (existingCode) {
          return interaction.reply({
            content: "❌ Dieser Creator-Code existiert bereits.",
            flags: MessageFlags.Ephemeral
          });
        }

        if (existingCreator) {
          return interaction.reply({
            content: "❌ Dieses Mitglied besitzt bereits einen Creator-Code.",
            flags: MessageFlags.Ephemeral
          });
        }

        await Creator.create({
          _id: user.id,
          userId: user.id,
          code,
          active: true,
          bonus: 500,
          commission: 10,
          uses: 0,
          sales: 0,
          earned: 0,
          paid: 0
        });

        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("🎉 Creator erstellt")
          .addFields(
            {
              name: "Creator",
              value: `${user}`,
              inline: true
            },
            {
              name: "Code",
              value: `\`${code}\``,
              inline: true
            },
            {
              name: "Spielerbonus",
              value: "500 Coins",
              inline: true
            },
            {
              name: "Provision",
              value: "10 %",
              inline: true
            }
          )
          .setTimestamp();

        return interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral
        });
      }

      // CREATOR BEARBEITEN
      if (action === "bearbeiten") {
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
            content: "❌ Creator-Code nicht gefunden oder deaktiviert.",
            flags: MessageFlags.Ephemeral
          });
        }

        const bonus = interaction.options.getNumber("bonus");
        const commission = interaction.options.getNumber("provision");

        if (bonus !== null) {
          if (!Number.isInteger(bonus) || bonus < 0) {
            return interaction.reply({
              content: "❌ Der Bonus muss eine positive ganze Zahl oder 0 sein.",
              flags: MessageFlags.Ephemeral
            });
          }

          creator.bonus = bonus;
        }

        if (commission !== null) {
          if (commission < 0 || commission > 100) {
            return interaction.reply({
              content: "❌ Die Provision muss zwischen 0 und 100 liegen.",
              flags: MessageFlags.Ephemeral
            });
          }

          creator.commission = commission;
        }

        if (bonus === null && commission === null) {
          return interaction.reply({
            content: "❌ Du musst mindestens einen Wert zum Bearbeiten angeben.",
            flags: MessageFlags.Ephemeral
          });
        }

        await creator.save();

        return interaction.reply({
          content:
            `✅ Creator-Code \`${code}\` wurde aktualisiert.\n\n` +
            `**Spielerbonus:** ${creator.bonus} Coins\n` +
            `**Provision:** ${creator.commission} %`,
          flags: MessageFlags.Ephemeral
        });
      }

      // CREATOR DEAKTIVIEREN
      if (action === "loeschen") {
        const code = interaction.options
          .getString("code")
          .trim()
          .toUpperCase();

        const creator = await Creator.findOneAndUpdate(
          {
            code,
            active: true
          },
          {
            $set: {
              active: false
            }
          },
          {
            new: true
          }
        );

        if (!creator) {
          return interaction.reply({
            content: "❌ Creator-Code nicht gefunden oder bereits deaktiviert.",
            flags: MessageFlags.Ephemeral
          });
        }

        return interaction.reply({
          content: `✅ Der Creator-Code \`${code}\` wurde deaktiviert.`,
          flags: MessageFlags.Ephemeral
        });
      }

      // ALLE CREATOR-STATISTIKEN
      if (action === "stats") {
        const creators = await Creator.find().sort({
          sales: -1
        });

        const total = creators.reduce(
          (acc, creator) => {
            acc.uses += creator.uses || 0;
            acc.sales += creator.sales || 0;
            acc.earned += creator.earned || 0;
            acc.paid += creator.paid || 0;

            return acc;
          },
          {
            uses: 0,
            sales: 0,
            earned: 0,
            paid: 0
          }
        );

        const open = total.earned - total.paid;

        const embed = new EmbedBuilder()
          .setColor("Blurple")
          .setTitle("📊 Creator-Gesamtstatistik")
          .setDescription(
            `**Creator:** ${creators.length}\n` +
            `**Einlösungen:** ${total.uses}\n` +
            `**SeasonPass-Verkäufe:** ${total.sales}\n\n` +
            `**Verdient:** ${total.earned.toLocaleString("de-DE")} Coins\n` +
            `**Ausgezahlt:** ${total.paid.toLocaleString("de-DE")} Coins\n` +
            `**Offen:** ${open.toLocaleString("de-DE")} Coins`
          )
          .setTimestamp();

        for (const creator of creators.slice(0, 20)) {
          embed.addFields({
            name: `${creator.code} ${creator.active ? "🟢" : "🔴"}`,
            value:
              `Creator: <@${creator.userId}>\n` +
              `Einlösungen: ${creator.uses}\n` +
              `Verkäufe: ${creator.sales}\n` +
              `Provision: ${creator.commission} %\n` +
              `Verdient: ${creator.earned} Coins\n` +
              `Ausgezahlt: ${creator.paid} Coins`,
            inline: true
          });
        }

        if (creators.length > 20) {
          embed.setFooter({
            text: `Es werden die ersten 20 von ${creators.length} Creatorn angezeigt.`
          });
        }

        return interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral
        });
      }

      // CREATOR-AUSZAHLUNG VERBUCHEN
      if (action === "auszahlung") {
        const code = interaction.options
          .getString("code")
          .trim()
          .toUpperCase();

        const amount = interaction.options.getInteger("betrag");

        const creator = await Creator.findOne({ code });

        if (!creator) {
          return interaction.reply({
            content: "❌ Creator nicht gefunden.",
            flags: MessageFlags.Ephemeral
          });
        }

        const open = creator.earned - creator.paid;

        if (amount <= 0 || amount > open) {
          return interaction.reply({
            content:
              `❌ Ungültiger Betrag oder nicht genügend offene Provision.\n` +
              `**Offen:** ${open.toLocaleString("de-DE")} Coins`,
            flags: MessageFlags.Ephemeral
          });
        }

        creator.paid += amount;
        await creator.save();

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setTitle("💰 Auszahlung verbucht")
              .setDescription(
                `**Creator:** <@${creator.userId}>\n` +
                `**Code:** \`${creator.code}\`\n` +
                `**Auszahlung:** ${amount.toLocaleString("de-DE")} Coins\n\n` +
                `**Bereits ausgezahlt:** ${creator.paid.toLocaleString("de-DE")} Coins\n` +
                `**Noch offen:** ${(creator.earned - creator.paid).toLocaleString("de-DE")} Coins`
              )
              .setTimestamp()
          ],
          flags: MessageFlags.Ephemeral
        });
      }
    } catch (error) {
      console.error("[Creator-Admin]", error);

      if (interaction.replied || interaction.deferred) {
        return interaction.followUp({
          content: "❌ Beim Verarbeiten ist ein Fehler aufgetreten.",
          flags: MessageFlags.Ephemeral
        });
      }

      return interaction.reply({
        content: "❌ Beim Verarbeiten ist ein Fehler aufgetreten.",
        flags: MessageFlags.Ephemeral
      });
    }
  }
};