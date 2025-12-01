const fs = require("fs");
const path = require("path");
const { Logger, ErrorHandler } = require("../utils");

/**
 * Button Handler
 * Routet Button Interactions zu entsprechenden Handlern
 */
class ButtonHandler {
  constructor(client) {
    this.client = client;
    this.buttons = new Map();
  }

  /**
     * Lädt alle Button-Handler
     */
  load() {
    const buttonsPath = path.join(__dirname, "../buttons");

    if (!fs.existsSync(buttonsPath)) {
      Logger.warning("Buttons Ordner nicht gefunden");
      return;
    }

    const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith(".js"));

    for (const file of buttonFiles) {
      try {
        const filePath = path.join(buttonsPath, file);
        const button = require(filePath);

        if (!button.customId || !button.execute) {
          Logger.warning(`Button ${file} hat keine customId oder execute Funktion`);
          continue;
        }

        // Unterstützt sowohl String als auch Array für customId
        const customIds = Array.isArray(button.customId) ? button.customId : [button.customId];

        for (const customId of customIds) {
          this.buttons.set(customId, button);
        }

        Logger.debug(`Button-Handler geladen: ${file} (${customIds.length} IDs)`);
      } catch (error) {
        Logger.error(`Fehler beim Laden von Button ${file}`, error);
      }
    }

    Logger.success(`${this.buttons.size} Button-Handler geladen`);
  }

  /**
     * Behandelt Button Interaction
     */
  async handle(interaction) {
    try {
      const customId = interaction.customId;

      // Versuche exakten Match
      let button = this.buttons.get(customId);

      // Falls kein exakter Match, versuche Pattern-Matching (z.B. advent_1, advent_2, etc.)
      if (!button) {
        for (const [id, btn] of this.buttons.entries()) {
          // Unterstützt Wildcards wie "advent_*"
          if (id.includes("*")) {
            const pattern = new RegExp("^" + id.replace("*", ".*") + "$");
            if (pattern.test(customId)) {
              button = btn;
              break;
            }
          }
          // Unterstützt Prefix-Matching (customId startet mit id)
          else if (customId.startsWith(id)) {
            button = btn;
            break;
          }
        }
      }

      if (!button) {
        Logger.warning(`Kein Handler gefunden für Button: ${customId}`);
        await interaction.reply({
          content: "⚠️ Dieser Button konnte nicht verarbeitet werden.",
          ephemeral: true,
        }).catch(() => {});
        return;
      }

      // Führe Button-Handler aus
      await button.execute(interaction, this.client);

      Logger.command(`Button: ${customId}`, interaction.user.id, interaction.guildId);
    } catch (error) {
      Logger.error(`Fehler bei Button-Handler: ${interaction.customId}`, error);
      await ErrorHandler.handleButtonError(interaction, error);
    }
  }

  /**
     * Registriert einen Button-Handler dynamisch
     */
  register(customId, handler) {
    if (!handler.execute) {
      throw new Error("Handler muss eine execute Funktion haben");
    }

    this.buttons.set(customId, handler);
    Logger.debug(`Button-Handler registriert: ${customId}`);
  }

  /**
     * Entfernt einen Button-Handler
     */
  unregister(customId) {
    const result = this.buttons.delete(customId);
    if (result) {
      Logger.debug(`Button-Handler entfernt: ${customId}`);
    }
    return result;
  }

  /**
     * Gibt Button-Statistiken zurück
     */
  getStats() {
    return {
      total: this.buttons.size,
      handlers: Array.from(this.buttons.keys()),
    };
  }
}

module.exports = ButtonHandler;
