const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emojiquiz-help')
    .setDescription('» Zeigt dir eine Anleitung zum Emojiquiz. 😎'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('`😎` Emojiquiz Hilfe')
      .setDescription(
        '> \`📌\` **Spielablauf:**\n' +
        '- Du bekommst ein Emoji-Rätsel. Schreibe die Lösung in den Chat.\n' +
        '- Du kannst den Begriff überspringen oder dir den ersten Buchstaben anzeigen lassen.\n' +
        '- Neue Begriffe kannst du direkt im Quiz über den Button vorschlagen.\n\n' +
        '> \`❓\` **Wo finde ich das Spiel?**\n' +
        '- \`1.\` Gehe zu <id:customize>\n' +
        '- \`2.\` Wähle die <@&1269567512916262944>-Rolle aus.\n' +
        '- \`3.\` Dann findest das Spiel bei <#1269568327127269466>\n' +
        '- Viel Spaß beim Emoji Quiz! \`😎\`'
      )
      .setColor('Blurple');

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
