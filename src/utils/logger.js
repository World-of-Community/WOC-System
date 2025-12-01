const { EMOJIS } = require("../config/constants");

/**
 * Zentrales Logging-System
 * Bietet strukturiertes Logging mit verschiedenen Log-Levels
 */
class Logger {
  static formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : "";
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  static info(message, data = null) {
    console.log(`${EMOJIS.INFO} ${this.formatMessage("INFO", message, data)}`);
  }

  static success(message, data = null) {
    console.log(`${EMOJIS.SUCCESS} ${this.formatMessage("SUCCESS", message, data)}`);
  }

  static warning(message, data = null) {
    console.warn(`${EMOJIS.WARNING} ${this.formatMessage("WARNING", message, data)}`);
  }

  static error(message, error = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      ...(error.code && { code: error.code }),
    } : null;
    console.error(`${EMOJIS.ERROR} ${this.formatMessage("ERROR", message, errorData)}`);
  }

  static debug(message, data = null) {
    if (process.env.NODE_ENV === "development") {
      console.log(`🔍 ${this.formatMessage("DEBUG", message, data)}`);
    }
  }

  static command(commandName, userId, guildId) {
    this.info(`Command ausgeführt: /${commandName}`, { userId, guildId });
  }

  static event(eventName, data = null) {
    this.info(`Event: ${eventName}`, data);
  }

  static database(operation, collection, data = null) {
    this.debug(`DB ${operation}: ${collection}`, data);
  }
}

module.exports = Logger;
