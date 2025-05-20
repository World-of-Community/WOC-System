const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

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
          { name: 'Wichtiger Hinweis', value: 'hinweis' },
          { name: 'vorerst abgelehnt', value: 'vorerst_abgelehnt' }
        )
    )
    .addIntegerOption(option =>
      option.setName('dauer')
        .setDescription('Wie viele Tage soll der Antrag gültig sein? (Standard 2 Tage)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(30)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const typ = interaction.options.getString('typ');
    const dauer = interaction.options.getInteger('dauer') ?? 2; // Standard 2 Tage
    const jetzt = new Date();

    let embed;

    // Für Statusupdate & Hinweis: Standarddauer verwenden
    const futureDate = new Date(jetzt.getTime() + dauer * 24 * 60 * 60 * 1000);
    const timestamp = Math.floor(futureDate.getTime() / 1000);

    // Für vorerst_abgelehnt: 3 Monate & 2 Tage Berechnung
    const dreiMonateSpäter = new Date(jetzt);
    dreiMonateSpäter.setMonth(dreiMonateSpäter.getMonth() + 3);
    const dreiMonateTimestamp = Math.floor(dreiMonateSpäter.getTime() / 1000);

    const zweiTageSpäter = new Date(jetzt.getTime() + 2 * 24 * 60 * 60 * 1000);
    const zweiTageTimestamp = Math.floor(zweiTageSpäter.getTime() / 1000);

    if (typ === 'statusupdate') {
      embed = new EmbedBuilder()
        .setTitle('`🟠` Statusupdate – Entbannung')
        .setDescription(
          `Lieber Nutzer,\n\n` +
          `du hast jetzt die Möglichkeit, einen Antrag auf Entbannung zu stellen.\n` +
          `Bitte beachte dabei unbedingt unsere inhaltlichen Kriterien, welche du vor der Ticketerstellung in <#819555839362072606> bestätigt hast.\n\n` +
          `Bitte sende uns bis zum <t:${timestamp}:F> (<t:${timestamp}:R>) einen Antrag auf Entbannung zu. Ansonsten wird dieser automatisch abgelehnt.`
        )
        .setColor('Orange')
        .setFooter({ text: interaction.guild.name, iconURL: interaction.client.user.displayAvatarURL() });
    }

    if (typ === 'hinweis') {
      embed = new EmbedBuilder()
        .setTitle('`❗` Wichtiger Hinweis')
        .setDescription(
          `Lieber Nutzer,\n\n` +
          `wir haben deinen Antrag geprüft und festgestellt, dass dieser **nicht** unseren inhaltlichen Kriterien entspricht.\n` +
          `Du findest im Kanal <#819555839362072606> entsprechende Informationen und Vorgaben.\n\n` +
          `Wir geben dir nun noch einmal die Gelegenheit, deinen Antrag bis zum <t:${timestamp}:F> (<t:${timestamp}:R>) ` +
          `entsprechend überarbeitet erneut zu senden.`
        )
        .setColor('Red')
        .setFooter({ text: interaction.guild.name, iconURL: interaction.client.user.displayAvatarURL() });
    }

    if (typ === 'vorerst_abgelehnt') {
      embed = new EmbedBuilder()
        .setTitle('`🔴` Statusupdate - Entbannung')
        .setDescription(
          `Lieber Nutzer,\n\n` +
          `**vielen Dank für deinen Antrag.**\n` +
          `Wir haben diesen geprüft und müssen dir mitteilen, dass er vorerst **abgelehnt** wurde.\n\n` +
          `Du hast die Möglichkeit, am <t:${dreiMonateTimestamp}:F> (<t:${dreiMonateTimestamp}:R>) erneut einen Antrag einzureichen.\n` +
          `Bis zum <t:${zweiTageTimestamp}:F> (<t:${zweiTageTimestamp}:R>) kannst du uns außerdem Fragen zu dem weiteren Verfahren stellen. ` +
          `Bitte beachte, dass dies jedoch nichts an unserer Entscheidung ändert.`
        )
        .setColor('Red')
        .setFooter({ text: interaction.guild.name, iconURL: interaction.client.user.displayAvatarURL() });
    }

    await interaction.channel.send({ content: `${interaction.user}`, embeds: [embed] });

    await interaction.reply({
      content: `> Die Nachricht wurde erfolgreich im Kanal gesendet.` +
        (typ !== 'vorerst_abgelehnt' ? ` (**Gültigkeit: ${dauer} Tage**)` : ''),
      ephemeral: true
    });
  }
};
