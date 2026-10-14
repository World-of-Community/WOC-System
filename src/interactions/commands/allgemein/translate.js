import translator from "open-google-translator";

export default {
  name: "Nachricht übersetzen",
  type: 3,
  options: [],

  async run(client, interaction) {
    translator.supportedLanguages();
    const translated = await translator.TranslateLanguageData({
      listOfWordsToTranslate: [interaction.targetMessage.content],
      fromLanguage: "de",
      toLanguage: interaction.locale,
    });

    interaction.reply({ ephemeral: true, content: translated[0].translation });
  },
};
