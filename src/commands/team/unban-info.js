const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban-info')
    .setDescription('» Sendet Informationen zur Entbannung.')
    .addStringOption(option =>
      option.setName('typ')
        .setDescription('Welche Nachricht soll gesendet werden?')
        .setRequired(true)
        .addChoices(
          { name: 'Statusupdate', value: 'statusupdate' },
          { name: 'Wichtiger Hinweis', value: 'hinweis' }
        )
    )
    .addIntegerOption(option =>
      option.setName('dauer')
        .setDescription('Wie viele Tage soll der Antrag gültig sein? (Standard 2 Tage)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(30)
    ),

  async execute(interaction) {
    const typ = interaction.options.getString('typ');
    const dauer = interaction.options.getInteger('dauer') ?? 2; // Default 2 Tage

    // Berechnung Timestamp: Jetzt + dauer Tage
    const jetzt = new Date();
    const futureDate = new Date(jetzt.getTime() + dauer * 24 * 60 * 60 * 1000);
    const timestamp = Math.floor(futureDate.getTime() / 1000);

    let embed;

    if (typ === 'statusupdate') {
      embed = new EmbedBuilder()
        .setTitle('`🟠` Statusupdate – Entbannung')
        .setDescription(
          `**Lieber Nutzer,**\n\n` +
          `du hast jetzt die Möglichkeit einen Antrag auf **Entbannung** zu stellen.\n` +
          `Bitte beachte dabei unbedingt unsere **inhaltlichen Kriterien**, welche du vor der Ticketerstellung in ⁠<#819555839362072606> bestätigt hast.\n\n` +
          `Bitte sende uns bis zum <t:${timestamp}:F> (<t:${timestamp}:R>) einen Antrag auf Entbannung zu,\n` +
          `ansonsten werden wir diesen **automatisch ablehnen**.`
        )
        .setColor('Orange')
        .setFooter({ text: interaction.guild.name, iconURL: interaction.client.user.displayAvatarURL() })
    }

    if (typ === 'hinweis') {
      embed = new EmbedBuilder()
        .setTitle('`❗` Wichtiger Hinweis')
        .setDescription(
          `**Lieber Nutzer,**\n\n` +
          `wir haben deinen Antrag geprüft und festgestellt, dass dieser **nicht unseren inhaltlichen Kriterien entspricht**.\n` +
          `Du findest im Kanal ⁠<#819555839362072606> entsprechende Informationen und Vorgaben.\n\n` +
          `Wir geben dir nun noch einmal die Gelegenheit, deinen Antrag bis zum <t:${timestamp}:F> (<t:${timestamp}:R>) ` +
          `entsprechend überarbeitet erneut zu senden.`
        )
        .setColor('Red')
        .setFooter({ text: interaction.guild.name, iconURL: interaction.client.user.displayAvatarURL() })
    }

    await interaction.channel.send({ embeds: [embed] });

    await interaction.reply({
      content: `> Die Nachricht wurde erfolgreich im Kanal gesendet (Gültigkeit: ${dauer} Tage).`,
      ephemeral: true
    });
  }
};
