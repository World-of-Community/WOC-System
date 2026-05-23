import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";

import { DateTime } from "luxon";
import Server from "../../../Datenbank/usercounterdb.js";

function formatBoostDuration(boostTimestamp) {
    const boostStart = DateTime.fromJSDate(boostTimestamp);
    const now = DateTime.now();

    const totalDays = Math.ceil(now.diff(boostStart, "days").days);
    const years = Math.floor(totalDays / 365);
    const days = totalDays % 365;

    if (years === 0 && days < 1) return null;

    let parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? "Jahr" : "Jahren"}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? "Tag" : "Tagen"}`);

    if (parts.length > 1) {
        const last = parts.pop();
        return parts.join(" und ") + " " + last;
    }

    return parts[0];
}

export default {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('» Erhalte paar Informationen über den Server. ❓'),

    async execute(interaction) {
        const guild = interaction.guild;
        const members = await guild.members.fetch();

        const botCount = members.filter(m => m.user.bot).size;
        const userCount = members.filter(m => !m.user.bot).size;

        const onlineMembers = members.filter(m =>
            ['online', 'idle', 'dnd'].includes(m.presence?.status)
        ).filter(m => !m.user.bot).size.toLocaleString("de-DE") || 0;

        let serverData = await Server.findOne({ guildId: guild.id });
        if (!serverData) {
            serverData = new Server({
                guildId: guild.id,
                highestUserCount: userCount,
            });
        }

        if (userCount > serverData.highestUserCount) {
            serverData.highestUserCount = userCount;
            await serverData.save();
        }

        const createdAt = `<t:${Math.round(guild.createdTimestamp / 1000)}:D>`;
        const emojiCount = guild.emojis.cache.size;

        // 🔥 Booster vorbereiten
        const boosterRole = guild.roles.cache.find(role => role.tags?.premiumSubscriberRole);

        let boosters = [];
        let boosterPages = [];

        if (boosterRole) {
            boosters = boosterRole.members.map(member => {
                const boostSince = member.premiumSince;
                let durationText = "";

                if (boostSince) {
                    const formatted = formatBoostDuration(boostSince);
                    if (formatted) {
                        durationText = ` – **seit ${formatted}**`;
                    }
                }

                return `${member.toString()}${durationText}`;
            });
        }

        for (let i = 0; i < boosters.length; i += 20) {
            boosterPages.push(boosters.slice(i, i + 20));
        }

        let currentPage = 0;
        let view = "main"; // main | boosters

        // 📄 MAIN EMBED
        function mainEmbed() {
            return new EmbedBuilder()
                .setTitle(`${guild.name} - Server Information`)
                .setDescription(
                    `> \`⏰\` » **Server Erstellt:** ${createdAt}\n` +
                    `> \`👥\` » **Mitglieder:** \`${guild.memberCount.toLocaleString("de-DE")}\`\n` +
                    `> \`👤\` » **User:** \`${userCount.toLocaleString("de-DE")}\`\n` +
                    `> \`⚙️\` » **Bots:** \`${botCount}\`\n` +
                    `> \`🟢\` » **Online:** \`${onlineMembers}\`\n` +
                    `> \`📈\` » **Erreichte Useranzahl:** \`${serverData.highestUserCount.toLocaleString("de-DE")}\`\n\n` +

                    `> <a:nitro:1186636151335944283> » Boost Level: **${guild.premiumTier}** (**${guild.premiumSubscriptionCount}** Boosts)\n` +
                    `> \`💖\` » Booster: **${boosters.length}**`
                )
                .setColor("Blurple")
                .setThumbnail(guild.iconURL({ dynamic: true }));
        }

        // 📄 BOOSTER EMBED
        function boosterEmbed(page) {
            return new EmbedBuilder()
                .setTitle(`💖 Server Booster`)
                .setDescription(
                    `> Seite ${boosterPages.length ? page + 1 : 1}/${boosterPages.length || 1}\n\n` +
                    `> ${boosterPages[page]?.join('\n> ') || 'Keine Booster'}`
                )
                .setColor("Pink");
        }

        function getButtons() {
            if (view === "main") {
                return [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("show_boosters")
                            .setLabel("💖 Booster anzeigen")
                            .setStyle(ButtonStyle.Primary)
                    )
                ];
            }

            return [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("prev")
                        .setLabel("⬅️")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("next")
                        .setLabel("➡️")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("back")
                        .setLabel("🔙 Zurück")
                        .setStyle(ButtonStyle.Danger)
                )
            ];
        }

        const msg = await interaction.reply({
            embeds: [mainEmbed()],
            components: getButtons(),
            ephemeral: true
        });

        const collector = msg.createMessageComponentCollector({ time: 60000 });

        collector.on("collect", async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: "Nicht dein Menü!", ephemeral: true });
            }

            if (i.customId === "show_boosters") {
                view = "boosters";
                currentPage = 0;
            }

            if (i.customId === "back") {
                view = "main";
            }

            if (i.customId === "next") {
                currentPage = (currentPage + 1) % boosterPages.length;
            }

            if (i.customId === "prev") {
                currentPage = (currentPage - 1 + boosterPages.length) % boosterPages.length;
            }

            await i.update({
                embeds: [view === "main" ? mainEmbed() : boosterEmbed(currentPage)],
                components: getButtons()
            });
        });

        collector.on("end", async () => {
            await interaction.editReply({ components: [] });
        });
    }
};
