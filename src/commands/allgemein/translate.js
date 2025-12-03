const { ContextMenuCommandBuilder, ApplicationCommandType } = require("discord.js");
const translator = require("open-google-translator");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Nachricht übersetzen')
        .setType(ApplicationCommandType.Message),
    
    async execute(interaction) {
        translator.supportedLanguages();
        const translated = await translator.TranslateLanguageData({
          listOfWordsToTranslate: [interaction.targetMessage.content],
          fromLanguage: "de",
          toLanguage: interaction.locale,
        })

        interaction.reply({ ephemeral: true, content: translated[0].translation })
    }
}