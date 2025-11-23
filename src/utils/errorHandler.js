const Logger = require('./logger');
const EmbedHelper = require('./embedBuilder');

/**
 * Zentrales Error-Handling System
 * Behandelt Fehler konsistent und loggt sie
 */
class ErrorHandler {
    /**
     * Behandelt Fehler bei Interaction-Antworten
     */
    static async handleInteractionError(interaction, error, customMessage = null) {
        Logger.error(`Fehler bei Interaction ${interaction.commandName || interaction.customId}`, error);

        const errorEmbed = EmbedHelper.error(
            'Ein Fehler ist aufgetreten',
            customMessage || 'Es ist ein unerwarteter Fehler aufgetreten. Bitte versuche es später erneut.'
        );

        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        } catch (replyError) {
            Logger.error('Konnte Fehler-Nachricht nicht senden', replyError);
        }
    }

    /**
     * Behandelt Command-Fehler
     */
    static async handleCommandError(interaction, error) {
        const commandName = interaction.commandName || 'unknown';
        Logger.error(`Fehler bei Command /${commandName}`, error);

        let errorMessage = 'Es ist ein unerwarteter Fehler aufgetreten.';

        // Spezifische Fehlerbehandlung basierend auf Error-Type
        if (error.code === 10062) {
            errorMessage = 'Diese Interaktion ist abgelaufen.';
        } else if (error.code === 50013) {
            errorMessage = 'Der Bot hat nicht die erforderlichen Berechtigungen.';
        } else if (error.code === 50035) {
            errorMessage = 'Ungültige Eingabe. Bitte überprüfe deine Eingaben.';
        } else if (error.name === 'ValidationError') {
            errorMessage = 'Validierungsfehler: Bitte überprüfe deine Eingaben.';
        }

        await this.handleInteractionError(interaction, error, errorMessage);
    }

    /**
     * Behandelt Datenbank-Fehler
     */
    static handleDatabaseError(operation, error) {
        Logger.error(`Datenbankfehler bei ${operation}`, error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return { success: false, error: 'Validierungsfehler', details: errors };
        }

        if (error.code === 11000) {
            return { success: false, error: 'Eintrag existiert bereits' };
        }

        return { success: false, error: 'Datenbankfehler aufgetreten' };
    }

    /**
     * Behandelt Button-Interaction Fehler
     */
    static async handleButtonError(interaction, error) {
        Logger.error(`Fehler bei Button ${interaction.customId}`, error);

        const errorEmbed = EmbedHelper.error(
            'Button-Fehler',
            'Dieser Button konnte nicht verarbeitet werden.'
        );

        try {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        } catch (replyError) {
            Logger.error('Konnte Button-Fehler nicht senden', replyError);
        }
    }

    /**
     * Behandelt Modal-Fehler
     */
    static async handleModalError(interaction, error) {
        Logger.error(`Fehler bei Modal ${interaction.customId}`, error);

        const errorEmbed = EmbedHelper.error(
            'Modal-Fehler',
            'Deine Eingabe konnte nicht verarbeitet werden.'
        );

        try {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        } catch (replyError) {
            Logger.error('Konnte Modal-Fehler nicht senden', replyError);
        }
    }

    /**
     * Behandelt API-Fehler
     */
    static handleApiError(apiName, error) {
        Logger.error(`API-Fehler (${apiName})`, error);

        if (error.response) {
            return {
                success: false,
                error: `${apiName} API Fehler`,
                status: error.response.status,
                data: error.response.data
            };
        }

        return {
            success: false,
            error: `${apiName} nicht erreichbar`
        };
    }

    /**
     * Wrapper für async Funktionen mit Error-Handling
     */
    static async safeExecute(fn, errorHandler) {
        try {
            return await fn();
        } catch (error) {
            if (errorHandler) {
                return await errorHandler(error);
            }
            Logger.error('Unbehandelter Fehler in safeExecute', error);
            throw error;
        }
    }

    /**
     * Validiert erforderliche Parameter
     */
    static validateRequired(params, required) {
        const missing = required.filter(key => !params[key]);

        if (missing.length > 0) {
            throw new Error(`Fehlende erforderliche Parameter: ${missing.join(', ')}`);
        }

        return true;
    }
}

module.exports = ErrorHandler;
