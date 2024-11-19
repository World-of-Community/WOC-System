const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const translate = require('@vitalets/google-translate-api'); // Externe Übersetzungsbibliothek

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Nachricht übersetzen') // Name des Menüs
        .setType(ApplicationCommandType.Message), // Typ: Nachrichtenkontext

    async execute(interaction) {
        const message = interaction.targetMessage;

        // Prüfen, ob die Nachricht vorhanden ist und Text enthält
        if (!message || !message.content) {
            return interaction.reply({ content: 'Diese Nachricht kann nicht übersetzt werden.', ephemeral: true });
        }

        try {
            // Nachricht in Englisch übersetzen
            const englishTranslation = await translate(message.content, { to: 'en' });

            // Nachricht in Deutsch übersetzen
            const germanTranslation = await translate(message.content, { to: 'de' });

            // Antwort mit beiden Übersetzungen
            await interaction.reply({
                content: `**Original:** ${message.content}\n\n**Englisch:** ${englishTranslation.text}\n\n**Deutsch:** ${germanTranslation.text}`,
                ephemeral: true, // Nur für den Benutzer sichtbar
            });
        } catch (error) {
            console.error('Fehler beim Übersetzen:', error);
            await interaction.reply({
                content: 'Es gab ein Problem beim Übersetzen der Nachricht.',
                ephemeral: true,
            });
        }
    },
};
