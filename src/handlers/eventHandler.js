const fs = require("fs");
const path = require("path");
const { Logger } = require("../utils");

/**
 * Event Handler
 * Lädt alle Events aus dem events Ordner
 */
class EventHandler {
  constructor(client) {
    this.client = client;
    this.events = new Map();
  }

  /**
     * Lädt alle Events
     */
  load() {
    const eventsPath = path.join(__dirname, "../events");
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

    let loadedCount = 0;

    for (const file of eventFiles) {
      try {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (!event.name) {
          Logger.warning(`Event ${file} hat keine name Property`);
          continue;
        }

        // Registriere Event
        if (event.once) {
          this.client.once(event.name, (...args) => event.execute(...args));
        } else {
          this.client.on(event.name, (...args) => event.execute(...args));
        }

        this.events.set(event.name, {
          file,
          once: event.once || false,
        });

        loadedCount++;
        Logger.debug(`Event geladen: ${event.name} (${event.once ? "once" : "on"})`);
      } catch (error) {
        Logger.error(`Fehler beim Laden von Event ${file}`, error);
      }
    }

    Logger.success(`${loadedCount} Events geladen`);
  }

  /**
     * Lädt ein einzelnes Event neu
     */
  reload(eventName) {
    try {
      const eventData = this.events.get(eventName);
      if (!eventData) {
        return { success: false, error: "Event nicht gefunden" };
      }

      // Entferne alle Listener für dieses Event
      this.client.removeAllListeners(eventName);

      // Lösche aus require cache
      const eventPath = path.join(__dirname, "../events", eventData.file);
      delete require.cache[require.resolve(eventPath)];

      // Lade Event neu
      const event = require(eventPath);

      if (event.once) {
        this.client.once(event.name, (...args) => event.execute(...args));
      } else {
        this.client.on(event.name, (...args) => event.execute(...args));
      }

      Logger.success(`Event ${eventName} neu geladen`);
      return { success: true };
    } catch (error) {
      Logger.error(`Fehler beim Neuladen von Event ${eventName}`, error);
      return { success: false, error: error.message };
    }
  }

  /**
     * Gibt Event-Statistiken zurück
     */
  getStats() {
    const stats = {
      total: this.events.size,
      once: 0,
      on: 0,
    };

    for (const event of this.events.values()) {
      if (event.once) {
        stats.once++;
      } else {
        stats.on++;
      }
    }

    return stats;
  }

  /**
     * Listet alle geladenen Events auf
     */
  list() {
    return Array.from(this.events.entries()).map(([name, data]) => ({
      name,
      file: data.file,
      type: data.once ? "once" : "on",
    }));
  }
}

module.exports = EventHandler;
