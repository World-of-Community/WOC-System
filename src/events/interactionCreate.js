const { Events, EmbedBuilder, WebhookClient, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits } = require("discord.js");
const userdb = require("../../Datenbank/userdb");
const config = require("../json/config.json")
const vorschlagEmitter = require('../custom_events/vorschlag');
const Advent = require("../../Datenbank/adventdb");
const NewsStatus = require("../../Datenbank/newsdb");
const Timeout = require('../../Datenbank/timeoutdb');
const Warn = require('../../Datenbank/warndb');
const bandb = require('../../Datenbank/bandb');
const Meeting = require('../../Datenbank/meetingdb');
const { Coin } = require("../../Datenbank/coindb");

// Beta Features (Buttons & Modals)
//const editBanReason = require("./interactions/buttons/editBanReason");
//const banReasonModal = require("./interactions/modals/banReasonModal");
const feedbackButton = require("../buttons/feedbackButton");
//const feedbackModal = require("./interactions/modals/feedbackModal");
//const ticketButton = require("./interactions/buttons/ticketButton");
//const unbanModal = require("./interactions/modals/unbanModal");
//const partnerButton = require("./interactions/partnerButton");
//const partnerModal = require("./interactions/partnerModal");


// Belohnungen definieren
const rewards = {
    1: { type: 'coins', value: 100 },
    2: { type: 'coins', value: 200 },
    3: { type: 'coins', value: 300 },
    4: { type: 'coins', value: 400 },
    5: { type: 'coins', value: 500 },
    6: { type: 'role', value: '1442140220182106184' }, // Adventskalender 2025
    7: { type: 'coins', value: 700 },
    8: { type: 'coins', value: 800 },
    9: { type: 'coins', value: 900 },
    10: { type: 'coins', value: 1000 },
    11: { type: 'coins', value: 1100 },
    12: { type: 'coins', value: 1200 },
    13: { type: 'coins', value: 1300 },
    14: { type: 'coins', value: 1400 },
    15: { type: 'coins', value: 1500 },
    16: { type: 'coins', value: 1600 },
    17: { type: 'coins', value: 1700 },
    18: { type: 'coins', value: 1800 },
    19: { type: 'coins', value: 1900 },
    20: { type: 'coins', value: 2000 },
    21: { type: 'coins', value: 2100 },
    22: { type: 'coins', value: 2200 },
    23: { type: 'coins', value: 2300 },
    24: { type: 'coins', value: 2400 },
};

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
      Logger.error("Unbehandelter Fehler in InteractionCreate", error);
    }
  },
};

/**
 * Behandelt Slash Commands
 */
async function handleCommand(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    Logger.warning(`Command nicht gefunden: ${interaction.commandName}`);
    await interaction.reply({
      content: "⚠️ Dieser Command existiert nicht mehr.",
      ephemeral: true,
    }).catch(() => {});
    return;
  }

        // Adventskalender
        // Aktuelles Datum holen
        const currentDay = new Date().getDate(); // Gibt den aktuellen Tag des Monats zurück

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
    Logger.error("ButtonHandler nicht initialisiert");
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
    Logger.error("ModalHandler nicht initialisiert");
    return;
  }

        switch (reward?.type) {
            case 'coins':
                // Coins automatisch gutschreiben
            
                // Coin-Daten des Users holen oder erstellen
                let coinData = await Coin.findOne({ userId: interaction.user.id });
                if (!coinData) {
                    coinData = await Coin.create({ userId: interaction.user.id, coins: 0 });
                }
            
                // Coins hinzufügen
                coinData.coins += reward.value;
                await coinData.save();
            
                rewardMessage = `> \`🎉\` » Du hast **${reward.value} Coins** erhalten!\n> \`💰\` » Die Coins wurden **automatisch deinem Konto gutgeschrieben**.`;
            break;            

            //case 'coins':
            //    rewardMessage = `> \`🎉\` » Du hast **${reward.value} Coins** erhalten!\n> \`🎫\` » Öffne ein Ticket im Support, um deine Belohnung abzuholen.`;
            //break;

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
    if (customId === "raenge") {
      // Lade separaten Handler
      const rangeHandler = require("../selectMenus/rangeHandler");
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
