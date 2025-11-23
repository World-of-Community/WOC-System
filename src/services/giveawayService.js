const { EmbedBuilder } = require('discord.js');
const giveawaydb = require('../../Datenbank/giveawaydb');
const userdb = require('../../Datenbank/userdb');
const { Logger, EmbedHelper } = require('../utils');

/**
 * Giveaway Service
 * Verwaltet aktive Giveaways und deren Abschluss
 */
class GiveawayService {
    constructor(client) {
        this.client = client;
        this.checkInterval = null;
    }

    /**
     * Startet den Giveaway Service
     */
    start() {
        // Prüfe alle 30 Sekunden nach abgelaufenen Giveaways
        this.checkInterval = setInterval(async () => {
            await this.checkActiveGiveaways();
        }, 30000);

        Logger.success('Giveaway Service gestartet');
    }

    /**
     * Stoppt den Giveaway Service
     */
    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * Prüft aktive Giveaways auf Ablauf
     */
    async checkActiveGiveaways() {
        try {
            const currentTime = new Date();
            const activeGiveaways = await giveawaydb.find({ endTime: null });

            if (!activeGiveaways || activeGiveaways.length === 0) return;

            for (const giveaway of activeGiveaways) {
                const startTime = new Date(giveaway.startTime);
                const hasExpired = startTime.getTime() + giveaway.duration <= currentTime.getTime();

                if (hasExpired && !giveaway.endTime) {
                    await this.endGiveaway(giveaway);
                }
            }
        } catch (error) {
            Logger.error('Fehler beim Prüfen aktiver Giveaways', error);
        }
    }

    /**
     * Beendet ein Giveaway und wählt Gewinner
     */
    async endGiveaway(giveaway) {
        try {
            // Markiere Giveaway als beendet
            giveaway.endTime = new Date();
            await giveaway.save();

            // Prüfe ob genug Teilnehmer vorhanden
            if (giveaway.teilnehmer.length < giveaway.gewinnerAnzahl) {
                await this.handleInsufficientParticipants(giveaway);
                return;
            }

            // Wähle Gewinner
            const winnerIds = this.selectWinners(giveaway.teilnehmer, giveaway.gewinnerAnzahl);

            // Verkünde Gewinner
            await this.announceWinners(giveaway, winnerIds);

            // Benachrichtige Gewinner
            await this.notifyWinners(giveaway, winnerIds);

            // Benachrichtige Ersteller
            await this.notifyCreator(giveaway, winnerIds);

            Logger.success(`Giveaway beendet: ${giveaway.price}`, {
                winners: winnerIds.length,
                participants: giveaway.teilnehmer.length
            });
        } catch (error) {
            Logger.error('Fehler beim Beenden des Giveaways', error);
        }
    }

    /**
     * Behandelt Fall mit zu wenigen Teilnehmern
     */
    async handleInsufficientParticipants(giveaway) {
        try {
            const channel = await this.client.channels.fetch(giveaway.channelID);
            const message = await channel.messages.fetch(giveaway.msgID);

            const missing = giveaway.gewinnerAnzahl - giveaway.teilnehmer.length;
            await message.reply({
                content: `\`⛔\` » **Zu wenig Teilnehmer:** Es fehlen \`${missing}👥\` Teilnehmer um genug Gewinner auszulosen!`
            });

            Logger.warning(`Giveaway mit zu wenigen Teilnehmern: ${giveaway.price}`);
        } catch (error) {
            Logger.error('Fehler bei Insufficient Participants Handler', error);
        }
    }

    /**
     * Wählt zufällige Gewinner aus Teilnehmern
     */
    selectWinners(participants, count) {
        const winnerIds = [];
        const participantsCopy = [...participants];

        while (winnerIds.length < count && participantsCopy.length > 0) {
            const randomIndex = Math.floor(Math.random() * participantsCopy.length);
            const winnerId = participantsCopy[randomIndex];

            if (!winnerIds.includes(winnerId)) {
                winnerIds.push(winnerId);
                participantsCopy.splice(randomIndex, 1);
            }
        }

        return winnerIds;
    }

    /**
     * Verkündet Gewinner im Channel
     */
    async announceWinners(giveaway, winnerIds) {
        try {
            const channel = await this.client.channels.fetch(giveaway.channelID);
            const message = await channel.messages.fetch(giveaway.msgID);

            const emoji = this.determineEmoji(giveaway.price);
            const winnersMentions = winnerIds.map(id => `<@${id}>`).join(', ');

            // Gewinner-Announcement
            await message.reply({
                content: `<a:bier:1196502621427601498> **Herzlichen Glückwunsch**, ${winnersMentions} ${winnerIds.length === 1 ? 'hat' : 'haben'} ${emoji} **${giveaway.price}** ${emoji} gewonnen! <a:2herzen:1196502635465932984>`
            });

            // Update Original-Message
            const embed = message.embeds[0];
            const endEmbed = new EmbedBuilder()
                .setTitle(embed.title)
                .setDescription(
                    `<a:Neuigkeiten:1018910061348798564> » **__Gewinnspiel - Gewinner__**\n` +
                    `<:PfeilBlau:1147248395837247613> Teilnehmer: **${giveaway.teilnehmer.length}**\n` +
                    `<:PfeilBlau:1147248395837247613> Gewinner: ${winnersMentions}\n` +
                    `<:PfeilBlau:1147248395837247613> Erstellt von <@${giveaway.creator}>`
                )
                .setColor('Red')
                .setThumbnail('https://cdn.discordapp.com/attachments/1269341729493094400/1271147368787480621/Gift.gif?ex=66b647bd&is=66b4f63d&hm=53e18bea4e53fcfa6bef3450c65670ac3d7d1d57e3dd66a18e23d9660dfdfc6d&')
                .setFooter({ text: `${this.client.user.displayName} - Bot`, iconURL: this.client.user.displayAvatarURL() })
                .setTimestamp();

            await message.edit({
                content: '⛔ **GEWINNSPIEL VORBEI!** ⛔',
                embeds: [endEmbed],
                components: []
            });
        } catch (error) {
            Logger.error('Fehler beim Verkünden der Gewinner', error);
        }
    }

    /**
     * Benachrichtigt Gewinner per DM
     */
    async notifyWinners(giveaway, winnerIds) {
        for (const winnerId of winnerIds) {
            try {
                // Update User Stats
                const userData = await userdb.findOne({ userID: winnerId });
                if (userData) {
                    userData.giveaway.eventWins += 1;
                    await userData.save();
                }

                // Send DM
                const winner = await this.client.users.fetch(winnerId);
                if (winner) {
                    const embed = new EmbedBuilder()
                        .setTitle('<a:Cool:915211628755169301> » GEWINNSPIEL GEWONNEN! <a:Cool:915211628755169301>')
                        .setDescription(
                            `» Du hast bei dem Gewinnspiel auf **[World Of Community](https://discord.gg/dHzbdsqST8)** gewonnen!\n` +
                            `» Ein Teammitglied wird sich **demnächst** bei dir melden.`
                        )
                        .setColor('Blurple');

                    await winner.send({
                        content: 'Du hast bei einem Gewinnspiel **GEWONNEN!!!**',
                        embeds: [embed]
                    });
                }
            } catch (error) {
                Logger.warning(`Konnte Gewinner ${winnerId} nicht benachrichtigen`, error);
            }
        }
    }

    /**
     * Benachrichtigt Giveaway-Ersteller
     */
    async notifyCreator(giveaway, winnerIds) {
        try {
            const creator = await this.client.users.fetch(giveaway.creator);
            if (!creator) return;

            const embed = new EmbedBuilder()
                .setTitle('<a:Information:1007267420316106903> » GEWINNSPIEL VORBEI!')
                .setDescription(
                    `\`✅\` » Das Gewinnspiel auf **[World Of Community](https://discord.gg/dHzbdsqST8)** ist vorbei!\n` +
                    `\`📌\` » Da du das Event gestartet hast, habe ich **dich informiert.**\n\n` +
                    `\`💸\` » **Zahle das Gewinnspiel** selbst aus, oder kümmere dich\n` +
                    `\`💸\` » darum, dass es die zuständige Person erledigt.`
                )
                .setColor('Orange');

            await creator.send({ embeds: [embed] });
        } catch (error) {
            Logger.warning('Konnte Giveaway-Ersteller nicht benachrichtigen', error);
        }
    }

    /**
     * Bestimmt Emoji basierend auf Preis
     */
    determineEmoji(price) {
        const lowerPrice = price.toLowerCase();

        if (lowerPrice.includes('nitro') && !lowerPrice.includes('basic')) {
            return '<a:nitro:1186636151335944283>';
        } else if (lowerPrice.includes('nitro') && lowerPrice.includes('basic')) {
            return '<a:basic:1186636165567229972>';
        } else if (lowerPrice.includes('coins')) {
            return '`🪙`';
        } else if (lowerPrice.includes('guthaben')) {
            return '<a:guthaben:1186636139281530970>';
        } else {
            return '<a:Diamond:1018911546430210128>';
        }
    }
}

module.exports = GiveawayService;
