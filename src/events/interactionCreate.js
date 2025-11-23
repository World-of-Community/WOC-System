const { Events } = require('discord.js');
const { Logger, ErrorHandler } = require('../utils');

/**
 * Interaction Create Event
 * Routet alle Interactions (Commands, Buttons, Modals) zu entsprechenden Handlern
 */
module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {
        try {
            // Slash Command
            if (interaction.isChatInputCommand()) {
                await handleCommand(interaction);
            }
            // Button Interaction
            else if (interaction.isButton()) {
                await handleButton(interaction);
            }
            // Modal Submission
            else if (interaction.isModalSubmit()) {
                await handleModal(interaction);
            }
            // Select Menu
            else if (interaction.isStringSelectMenu()) {
                await handleSelectMenu(interaction);
            }
            // Context Menu
            else if (interaction.isContextMenuCommand()) {
                await handleContextMenu(interaction);
            }
            // Autocomplete
            else if (interaction.isAutocomplete()) {
                await handleAutocomplete(interaction);
            }
        } catch (error) {
            Logger.error('Unbehandelter Fehler in InteractionCreate', error);
        }
    }
};

/**
 * Behandelt Slash Commands
 */
async function handleCommand(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        Logger.warning(`Command nicht gefunden: ${interaction.commandName}`);
        await interaction.reply({
            content: '⚠️ Dieser Command existiert nicht mehr.',
            ephemeral: true
        }).catch(() => {});
        return;
    }

    try {
        // Optional: Cooldown Check
        // Optional: Permission Check

        await command.execute(interaction);

        Logger.command(interaction.commandName, interaction.user.id, interaction.guildId);
    } catch (error) {
        Logger.error(`Fehler bei Command ${interaction.commandName}`, error);
        await ErrorHandler.handleCommandError(interaction, error);
    }
}

/**
 * Behandelt Button Interactions
 */
async function handleButton(interaction) {
    const buttonHandler = interaction.client.buttonHandler;

    if (!buttonHandler) {
        Logger.error('ButtonHandler nicht initialisiert');
        return;
    }

    await buttonHandler.handle(interaction);
}

/**
 * Behandelt Modal Submissions
 */
async function handleModal(interaction) {
    const modalHandler = interaction.client.modalHandler;

    if (!modalHandler) {
        Logger.error('ModalHandler nicht initialisiert');
        return;
    }

    await modalHandler.handle(interaction);
}

/**
 * Behandelt Select Menu Interactions
 */
async function handleSelectMenu(interaction) {
    try {
        const customId = interaction.customId;

        // Für jetzt: Logge Select Menu Interactions
        Logger.debug(`Select Menu: ${customId}`);

        // Hier könnten spezifische Select Menu Handler implementiert werden
        // Ähnlich wie ButtonHandler/ModalHandler

        // Beispiel: Ränge Menu aus der alten interactionCreate.js
        if (customId === 'raenge') {
            // Lade separaten Handler
            const rangeHandler = require('../selectMenus/rangeHandler');
            if (rangeHandler && rangeHandler.execute) {
                await rangeHandler.execute(interaction);
            }
        }

    } catch (error) {
        Logger.error(`Fehler bei Select Menu ${interaction.customId}`, error);
        await ErrorHandler.handleInteractionError(interaction, error);
    }
}

/**
 * Behandelt Context Menu Commands
 */
async function handleContextMenu(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        Logger.warning(`Context Menu Command nicht gefunden: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
        Logger.command(`ContextMenu: ${interaction.commandName}`, interaction.user.id, interaction.guildId);
    } catch (error) {
        Logger.error(`Fehler bei Context Menu Command ${interaction.commandName}`, error);
        await ErrorHandler.handleCommandError(interaction, error);
    }
}

/**
 * Behandelt Autocomplete Interactions
 */
async function handleAutocomplete(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command || !command.autocomplete) {
        return;
    }

    try {
        await command.autocomplete(interaction);
    } catch (error) {
        Logger.error(`Fehler bei Autocomplete ${interaction.commandName}`, error);
    }
}
