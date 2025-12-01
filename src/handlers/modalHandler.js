const fs = require("fs");
const path = require("path");
const { Logger, ErrorHandler } = require("../utils");

/**
 * Modal Handler
 * Routet Modal Submissions zu entsprechenden Handlern
 */
class ModalHandler {
  constructor(client) {
    this.client = client;
    this.modals = new Map();
  }

  /**
     * Lädt alle Modal-Handler
     */
  load() {
    const modalsPath = path.join(__dirname, "../modals");

    if (!fs.existsSync(modalsPath)) {
      Logger.warning("Modals Ordner nicht gefunden");
      return;
    }

    const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith(".js"));

    for (const file of modalFiles) {
      try {
        const filePath = path.join(modalsPath, file);
        const modal = require(filePath);

        if (!modal.customId || !modal.execute) {
          Logger.warning(`Modal ${file} hat keine customId oder execute Funktion`);
          continue;
        }

        // Unterstützt sowohl String als auch Array für customId
        const customIds = Array.isArray(modal.customId) ? modal.customId : [modal.customId];

        for (const customId of customIds) {
          this.modals.set(customId, modal);
        }

        Logger.debug(`Modal-Handler geladen: ${file} (${customIds.length} IDs)`);
      } catch (error) {
        Logger.error(`Fehler beim Laden von Modal ${file}`, error);
      }
    }

    Logger.success(`${this.modals.size} Modal-Handler geladen`);
  }

  /**
     * Behandelt Modal Submission
     */
  async handle(interaction) {
    try {
      const customId = interaction.customId;

      // Versuche exakten Match
      let modal = this.modals.get(customId);

      // Falls kein exakter Match, versuche Pattern-Matching
      if (!modal) {
        for (const [id, mdl] of this.modals.entries()) {
          // Unterstützt Wildcards
          if (id.includes("*")) {
            const pattern = new RegExp("^" + id.replace("*", ".*") + "$");
            if (pattern.test(customId)) {
              modal = mdl;
              break;
            }
          }
          // Unterstützt Prefix-Matching
          else if (customId.startsWith(id)) {
            modal = mdl;
            break;
          }
        }
      }

      if (!modal) {
        Logger.warning(`Kein Handler gefunden für Modal: ${customId}`);
        await interaction.reply({
          content: "⚠️ Dieses Modal konnte nicht verarbeitet werden.",
          ephemeral: true,
        }).catch(() => {});
        return;
      }

      // Führe Modal-Handler aus
      await modal.execute(interaction, this.client);

      Logger.command(`Modal: ${customId}`, interaction.user.id, interaction.guildId);
    } catch (error) {
      Logger.error(`Fehler bei Modal-Handler: ${interaction.customId}`, error);
      await ErrorHandler.handleModalError(interaction, error);
    }
  }

  /**
     * Registriert einen Modal-Handler dynamisch
     */
  register(customId, handler) {
    if (!handler.execute) {
      throw new Error("Handler muss eine execute Funktion haben");
    }

    this.modals.set(customId, handler);
    Logger.debug(`Modal-Handler registriert: ${customId}`);
  }

  /**
     * Entfernt einen Modal-Handler
     */
  unregister(customId) {
    const result = this.modals.delete(customId);
    if (result) {
      Logger.debug(`Modal-Handler entfernt: ${customId}`);
    }
    return result;
  }

  /**
     * Gibt Modal-Statistiken zurück
     */
  getStats() {
    return {
      total: this.modals.size,
      handlers: Array.from(this.modals.keys()),
    };
  }
}

module.exports = ModalHandler;
