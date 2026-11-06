import { EmbedBuilder, MessageFlags } from "discord.js";
import Coin from "../../../database/models/Coin.js";

// ==========================================
// CODESYSTEM – WORLD OF COMMUNITY
// ==========================================

const codes = {
    hacker: {
        reward: 50000,
        expiresAt: null,
    },

    welcome: {
        reward: 10000,
        expiresAt: null,
    },

    community: {
        reward: 15000,
        expiresAt: null,
    },

    woc2026: {
        reward: 100000,
        expiresAt: new Date("2026-12-31T23:59:59+01:00"),
    },
};

// ==========================================
// SLASH COMMAND
// ==========================================

export default {
    name: "promocode",
    description: "» Löse einen Aktionscode ein. 🎁",
    type: 1,

    options: [
        {
            name: "code",
            description: "» Gib deinen Aktionscode ein.",
            type: 3,
            required: true,
        },
    ],

    async run(_client, interaction) {
        const code = interaction.options
            .getString("code")
            .trim()
            .toLowerCase();

        const userId = interaction.user.id;

        // Code überprüfen
        const selectedCode = codes[code];

        if (!selectedCode) {
            return interaction.reply({
                content: "> `❌` » Dieser Code ist ungültig.",
                flags: MessageFlags.Ephemeral,
            });
        }

        // Ablaufdatum überprüfen
        if (
            selectedCode.expiresAt &&
            Date.now() > selectedCode.expiresAt.getTime()
        ) {
            return interaction.reply({
                content: "> `⏰` » Dieser Code ist leider abgelaufen.",
                flags: MessageFlags.Ephemeral,
            });
        }

        // Coin-Konto laden oder erstellen
        let user = await Coin.findOne({ userId });

        if (!user) {
            user = new Coin({ userId });
        }

        // Bereits eingelöste Codes überprüfen
        if (user.usedCodes?.includes(code)) {
            return interaction.reply({
                content: "> `❌` » Du hast diesen Code bereits eingelöst!",
                flags: MessageFlags.Ephemeral,
            });
        }

        // Belohnung hinzufügen
        const reward = selectedCode.reward;

        user.coins = (user.coins || 0) + reward;

        user.usedCodes.push(code);

        await user.save();

        // Erfolgs-Embed
        const embed = new EmbedBuilder()
            .setColor("#2ECC71")
            .setTitle("🎁 Code erfolgreich eingelöst!")
            .setDescription(
                `Du hast den Aktionscode **${code.toUpperCase()}** erfolgreich eingelöst!\n\n` +
                `\`🪙\` » **Belohnung:** ${reward.toLocaleString("de-DE")} Coins\n` +
                `\`💰\` » **Kontostand:** ${user.coins.toLocaleString("de-DE")} Coins`
            )
            .setFooter({
                text: "World Of Community",
            })
            .setTimestamp();

        return interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    },
};