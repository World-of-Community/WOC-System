/**
 * Services Index
 * Zentrale Export-Datei für alle Services
 */

const AdventService = require('./adventService');
const BirthdayService = require('./birthdayService');
const GiveawayService = require('./giveawayService');
const LoggingService = require('./loggingService');
const VoiceService = require('./voiceService');
const CronService = require('./cronService');

module.exports = {
    AdventService,
    BirthdayService,
    GiveawayService,
    LoggingService,
    VoiceService,
    CronService
};
