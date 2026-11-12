import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} from "discord.js";

const COLORS = {
  primary: 0x5865F2,
  success: 0x57F287,
  warning: 0xFEE75C
};

const INFO_THUMBNAIL =
  "https://cdn.discordapp.com/attachments/1269339944766144574/1401611554750730360/info-icon-png.jpg?ex=6af69a3b&is=6af548bb&hm=5498e0dfab45e6302b88a1b68183f227b491ec57ad036775af401ead86f6d41a&";

// ==========================================
// DASHBOARD EMBED
// ==========================================

function createDashboardEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.primary)
    .setTitle("Shop Dashboard")
    .setThumbnail(INFO_THUMBNAIL)
    .setDescription(
      [
        "**Pro gesendeter Nachricht erhältst du ShopCoins**, mit welchen du nach Belieben neue Vorteile freischalten kannst. (Mehr Infos unter \"Hilfe\")",
        "**Tipp:** Schreibst du regelmäßig, erhältst du automatisch genug ShopCoins, um nach und nach alle Vorteile permanent freizuschalten!",
        "",
        "*Folgendes kannst du von hier aus tun:*",
        "",
        "> `🛍️` - **Vorteile kaufen**",
        "» Erwerb Zugriff auf verschiedene Vorteile, oder wie wär's mit einem ganz eigenem? Von exklusiven Schreibvorteilen bis Premium Rang ist hier alles mit dabei!",
        "",
        "> `📜` - **Quests**",
        "» Erledige tägliche und wöchentliche Aufgaben und sammle zusätzliche Belohnungen für deinen SeasonPass!",
        "",
        "> `🪙` - **Konto**",
        "» Sieh dein Guthaben ein und verwalte dein Konto.",
        "",
        "> `❓` - **Hilfe**",
        "» Erfahre Näheres zu Shop, Vorteilen, ShopCoins, wie man diese verdienen kann und vielem mehr.",
        "",
        "> `🏪` - **Shop**",
        "» Erhalte im Gegenzug zur Unterstützung des Servers zu kleinem Preis ShopCoins und weitere Bonusinhalte!"
      ].join("\n")
    );
}

// ==========================================
// BUTTONS
// ==========================================

function createDashboardButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("shoppass_buy")
      .setLabel("Vorteile kaufen")
      .setEmoji("🎁")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("shoppass_quests")
      .setLabel("Quests")
      .setEmoji("📜")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("shoppass_account")
      .setLabel("Konto")
      .setEmoji("🪙")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("shoppass_help")
      .setLabel("Hilfe")
      .setEmoji("❓")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("shoppass_shop")
      .setLabel("Shop")
      .setEmoji("🛒")
      .setStyle(ButtonStyle.Secondary)
  );
}

// ==========================================
// QUESTS EMBED
// ==========================================

function createQuestsEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle("📜 Deine Quests")
    .setThumbnail(INFO_THUMBNAIL)
    .setDescription(
      [
        "Erledige verschiedene Aufgaben und sammle zusätzliche Belohnungen!",
        "",
        "**🌞 Tägliche Quests**",
        "💬 Schreibe 3 Nachrichten am Tag.",
        "💬 Schreibe 10 Nachrichten am Tag.",
        "💬 Schreibe 25 Nachrichten am Tag.",
        "👋 Begrüße einen neuen User.",
        "🎮 Spiele gemeinsam mit anderen Mitgliedern.",
        "",
        "**📅 Wöchentliche Quests**",
        "💬 Schreibe 100 Nachrichten.",
        "💬 Schreibe an 5 verschiedenen Tagen.",
        "🤝 Hilf einem anderen Community-Mitglied.",
        "🎉 Nimm an einem Community-Event teil.",
        "",
        "*Weitere Quests und Belohnungen können jederzeit hinzugefügt werden.*"
      ].join("\n")
    )
    .setFooter({ text: "WOC • SeasonPass Quests" });
}

// ==========================================
// HELP EMBED
// ==========================================

function createHelpEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.primary)
    .setTitle("❓ Shop-Hilfe")
    .setThumbnail(INFO_THUMBNAIL)
    .setDescription(
      [
        "**Was sind ShopCoins?**",
        "ShopCoins sind die Währung unseres Shops.",
        "",
        "**Wie bekomme ich ShopCoins?**",
        "Durch Aktivität und das Schreiben von Nachrichten kannst du ShopCoins verdienen.",
        "",
        "**Was kann ich damit kaufen?**",
        "Du kannst damit verschiedene Vorteile und weitere Belohnungen freischalten.",
        "",
        "**Wie funktionieren Quests?**",
        "Erledige tägliche und wöchentliche Aufgaben und sammle zusätzliche Belohnungen."
      ].join("\n")
    );
}

// ==========================================
// ACCOUNT EMBED
// ==========================================

function createAccountEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.warning)
    .setTitle("🪙 Dein ShopCoin-Konto")
    .setThumbnail(INFO_THUMBNAIL)
    .setDescription(
      [
        "Hier kannst du dein ShopCoin-Guthaben und deine bisherigen Transaktionen einsehen.",
        "",
        "💰 **Dein Guthaben:**",
        "`Wird mit deinem ShopCoin-System verbunden.`"
      ].join("\n")
    )
    .setFooter({ text: "WOC • Shop-System" });
}

// ==========================================
// COMMAND
// ==========================================

export default {
  name: "shop",
  description: "» Öffne das Shop-Dashboard. 🛒",
  type: 1,
  default_member_permissions: "268435456",
  options: [],

  async run(client, interaction) {
    try {
      // EMBED ÖFFENTLICH SENDEN
      const message = await interaction.channel.send({
        embeds: [createDashboardEmbed()],
        components: [createDashboardButtons()]
      });

      // PRIVATE BESTÄTIGUNG
      await interaction.reply({
        content: "> `🛒` » Shop-Dashboard-Embed wurde gesendet.",
        flags: MessageFlags.Ephemeral
      });

      // BUTTON COLLECTOR
      const collector = message.createMessageComponentCollector({
        time: 15 * 60 * 1000,
        filter: (i) =>
          i.customId.startsWith("shoppass_") &&
          i.user.id === interaction.user.id
      });

      collector.on("collect", async (i) => {
        try {
          switch (i.customId) {
            case "shoppass_buy": {
              await i.reply({
                content: "> `🎁` » Das Vorteils-Menü muss noch mit deinem bestehenden Kaufsystem verbunden werden.",
                flags: MessageFlags.Ephemeral
              });
              break;
            }

            case "shoppass_quests": {
              await i.reply({
                embeds: [createQuestsEmbed()],
                flags: MessageFlags.Ephemeral
              });
              break;
            }

            case "shoppass_account": {
              await i.reply({
                embeds: [createAccountEmbed()],
                flags: MessageFlags.Ephemeral
              });
              break;
            }

            case "shoppass_help": {
              await i.reply({
                embeds: [createHelpEmbed()],
                flags: MessageFlags.Ephemeral
              });
              break;
            }

            case "shoppass_shop": {
              await i.reply({
                content: "🛒 Der externe Shop-Link muss noch hinterlegt werden.",
                flags: MessageFlags.Ephemeral
              });
              break;
            }
          }
        } catch (error) {
          console.error("[Shop Dashboard] Fehler:", error);

          if (!i.replied && !i.deferred) {
            await i.reply({
              content: "❌ Es ist ein Fehler aufgetreten.",
              flags: MessageFlags.Ephemeral
            }).catch(() => {});
          }
        }
      });

      // BUTTONS NACH 15 MINUTEN DEAKTIVIEREN
      collector.on("end", async () => {
        const disabledRow = createDashboardButtons();

        disabledRow.components.forEach(button => {
          button.setDisabled(true);
        });

        await message.edit({
          components: [disabledRow]
        }).catch(() => {});
      });

    } catch (error) {
      console.error("[Shop Command] Fehler:", error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "❌ Das Shop-Dashboard konnte nicht gesendet werden.",
          flags: MessageFlags.Ephemeral
        }).catch(() => {});
      }
    }
  }
};