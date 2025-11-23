const cron = require('node-cron');
const { Logger } = require('../utils');
const userdb = require('../../Datenbank/userdb');

/**
 * Cron Service
 * Verwaltet alle wiederkehrenden geplanten Aufgaben
 */
class CronService {
    constructor(client) {
        this.client = client;
        this.guildId = '815919809379172354';
        this.jobs = [];
    }

    /**
     * Startet alle Cron-Jobs
     */
    start() {
        this.startServerEventBanner();
        this.startDailyReminder();
        this.startOnlineTimeTracking();

        Logger.success(`Cron Service gestartet (${this.jobs.length} Jobs)`);
    }

    /**
     * Stoppt alle Cron-Jobs
     */
    stop() {
        this.jobs.forEach(job => job.stop());
        this.jobs = [];
        Logger.info('Alle Cron-Jobs gestoppt');
    }

    /**
     * Server Event Banner - jeden ersten Freitag im Monat
     */
    startServerEventBanner() {
        const job = cron.schedule('0 15 * * 5', async () => {
            await this.sendServerEventBanner();
        });

        this.jobs.push(job);
    }

    async sendServerEventBanner() {
        try {
            const today = new Date();
            const day = today.getDate();

            // Nur am ersten Freitag (Tag ≤ 7)
            if (day > 7) return;

            const channelId = '1008696596000677998';
            const bannerUrl = 'https://cdn.discordapp.com/attachments/1008696596000677998/1337428177487794207/WOC_Banner_Neues_Server_Event.png?ex=690f520d&is=690e008d&hm=62bf01da44ab6d8946820799d984314daee0227eb2ec44c52335b458ba43ac93&';

            const channel = await this.client.channels.fetch(channelId);
            if (!channel) {
                Logger.warning('Server Event Channel nicht gefunden');
                return;
            }

            // Banner senden
            await channel.send({ files: [bannerUrl] });

            // Ankündigung senden
            await channel.send(
                '<a:pin:1119708768326914100>  » | **2-FACH XP-EVENT** - <a:Chat1:976129450112593990>\n\n' +
                'Liebe Community, <@&870683971846041650>\n\n' +
                'Wir starten ein **XP-Event** welches **von Freitag bis Sonntag läuft**. In dieser Zeit habt ihr die Möglichkeit, durch Chat & Voice Aktivität, mehr XP als normalerweise zu bekommen, die XP werden mit **3 multipliziert**. Also lohnt es sich besonders in dieser Zeit aktiv zu sein um schneller Leveln zu können.\n\n' +
                'Mit freundlichen Grüßen\nEuer **World Of Community**-Team <a:pepeheart:974642478055555082>'
            );

            Logger.success('Server Event Banner gesendet');
        } catch (error) {
            Logger.error('Fehler beim Senden des Server Event Banners', error);
        }
    }

    /**
     * Tägliche Belohnung Erinnerung - alle 6 Stunden
     */
    startDailyReminder() {
        let lastMessageId = null;

        const job = cron.schedule('0 */6 * * *', async () => {
            await this.sendDailyReminder(lastMessageId);
        });

        this.jobs.push(job);
    }

    async sendDailyReminder(lastMessageId) {
        try {
            const channelId = '815922756918181898';
            const channel = await this.client.channels.fetch(channelId);

            if (!channel || !channel.isTextBased()) {
                Logger.warning('Daily Reminder Channel nicht gefunden');
                return null;
            }

            // Letzte Nachricht löschen
            if (lastMessageId) {
                try {
                    const oldMsg = await channel.messages.fetch(lastMessageId);
                    if (oldMsg) await oldMsg.delete();
                } catch (err) {
                    Logger.debug('Konnte alte Daily Reminder Nachricht nicht löschen');
                }
            }

            // Neue Nachricht senden
            const newMsg = await channel.send(
                '**Hast du schon deine tägliche Belohnung abgeholt?**\n➥ `/daily`'
            );

            Logger.info('Daily Reminder gesendet');
            return newMsg.id;
        } catch (error) {
            Logger.error('Fehler beim Senden des Daily Reminders', error);
            return null;
        }
    }

    /**
     * Online-Zeit Tracking - jede Stunde
     */
    startOnlineTimeTracking() {
        const job = setInterval(async () => {
            await this.trackOnlineTime();
        }, 1000 * 60 * 60); // Jede Stunde

        this.jobs.push({ stop: () => clearInterval(job) });
    }

    async trackOnlineTime() {
        try {
            const guild = this.client.guilds.cache.get(this.guildId);
            if (!guild) {
                Logger.warning('Guild nicht gefunden für Online-Zeit Tracking');
                return;
            }

            const members = await guild.members.fetch();
            let trackedCount = 0;

            for (const member of members.values()) {
                if (member.user.bot) continue;
                if (!member.presence || member.presence.status !== 'online') continue;

                await userdb.updateOne(
                    { userID: member.id },
                    { $inc: { onlineTime: 1 } },
                    { upsert: true }
                );

                trackedCount++;
            }

            Logger.debug(`Online-Zeit getrackt für ${trackedCount} User`);
        } catch (error) {
            Logger.error('Fehler beim Tracken der Online-Zeit', error);
        }
    }
}

module.exports = CronService;
