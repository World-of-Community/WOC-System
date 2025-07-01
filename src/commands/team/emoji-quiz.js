const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ComponentType,
  PermissionFlagsBits,
} = require('discord.js');
const EmojiquizVorschlag = require('../../../Datenbank/emojiquizVorschlagdb');
// const EmojiquizSettings = require('../../../Datenbank/emojiquizSettingsdb');

const VORSCHLAG_CHANNEL_ID = '1389281179148226693';

const begriffe = [
  { begriff: "Atomkraftwerk", emojis: "🔯🏭", schwierigkeit: "einfach", tipp: "Stromerzeuger" },
  { begriff: "Wasserrutsche", emojis: "🌊🎢", schwierigkeit: "mittel", tipp: "Im Freibad zu finden" },
  { begriff: "Eiffelturm", emojis: "🇫🇷🗼", schwierigkeit: "einfach", tipp: "Wahrzeichen in Paris" },
  { begriff: "Fußballspieler", emojis: "⚽🧍‍♂️", schwierigkeit: "mittel", tipp: "Steht oft im Abseits" }
];

// Map für Quizzustand pro Guild
let quizState = new Map(); // guildId -> { aktuelleIndex, currentMessage, current, ersterBuchstabe, antwortCollector, buttonCollector, skipTracker }

async function startEmojiQuiz(channel, interaction = null) {
  const guildId = channel.guild.id;

  // Alte Collector stoppen & alte Nachricht löschen
  if (quizState.has(guildId)) {
    const old = quizState.get(guildId);
    old.antwortCollector?.stop();
    old.buttonCollector?.stop();
    try { await old.currentMessage?.delete().catch(() => {}); } catch {}
  }

  let aktuelleIndex = Math.floor(Math.random() * begriffe.length);
  let currentMessage;
  let skipTracker = new Map(); // userId -> überspringen count

  async function sendCurrentQuiz() {
    const current = begriffe[aktuelleIndex];
    const ersterBuchstabe = current.begriff[0];

    const embed = new EmbedBuilder()
      .setDescription(
        `Gesuchter Begriff • ${current.emojis}\n\n` +
        `Schwierigkeit: **${current.schwierigkeit}**\n` +
        `Belohnung • 1 🪙\n\n` +
        `Tipp • **${current.tipp}**`
      )
      .setFooter({ text: 'Dir fällt der Begriff nicht ein? Nutze den Überspringen-Button.' })
      .setColor('Blurple');

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ueberspringen').setLabel('➡️ Überspringen').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('erster_buchstabe').setLabel('🅰️ Erster Buchstabe').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('neuer_begriff').setLabel('❓ Neuen Begriff vorschlagen').setStyle(ButtonStyle.Primary),
    );

    // Neue Nachricht senden (kein Edit!)
    currentMessage = await channel.send({ embeds: [embed], components: [buttons] });

    return { current, ersterBuchstabe };
  }

  // Starte erste Quiz-Nachricht
  let { current, ersterBuchstabe } = await sendCurrentQuiz();

  // Message Collector für Antworten
  const antwortCollector = channel.createMessageCollector({
    filter: (m) => !m.author.bot,
  });

  antwortCollector.on('collect', async (m) => {
    if (m.content.trim().toLowerCase() === current.begriff.toLowerCase()) {
      // Antwort vom User löschen
      try {
        await m.delete();
      } catch {}

      const countdownSek = 2; // Wartezeit bis nächste Runde
      const startNextRoundTimestamp = Math.floor(Date.now() / 1000) + countdownSek;

      // Alte Quiz-Nachricht löschen
      try {
        await currentMessage.delete();
      } catch {}

      // Erfolgsmeldung senden
      const successMessage = await m.channel.send(
        `${m.author} hat den gesuchten Begriff erraten! Die nächste Runde beginnt <t:${startNextRoundTimestamp}:R>.`
      );

      // Nach Countdown neue Quiz-Nachricht senden
      setTimeout(async () => {
        aktuelleIndex = (aktuelleIndex + 1) % begriffe.length;
        const result = await sendCurrentQuiz();
        current = result.current;
        ersterBuchstabe = result.ersterBuchstabe;
        skipTracker.clear();

        // Erfolgsmeldung nach 10 Sekunden löschen (optional)
        setTimeout(() => successMessage.delete().catch(() => {}), 10000);
      }, countdownSek * 1000);
    } else {
      try {
        await m.react('❌');
      } catch {}
    }
  });

  // Button Collector
  const buttonCollector = channel.createMessageComponentCollector({ componentType: ComponentType.Button });

  buttonCollector.on('collect', async (i) => {
    if (i.user.bot) return;

    if (i.customId === 'ueberspringen') {
      await i.deferUpdate();

      // Skip-Logik bei "einfach"
      if (current.schwierigkeit === 'einfach') {
        const userSkips = skipTracker.get(i.user.id) ?? 0;

        if (userSkips === 0) {
          skipTracker.set(i.user.id, 1);
          await i.followUp({ content: '> `🤨` » Jetzt streng dich an, so schwer ist das nicht.', ephemeral: true });
          return;
        } else {
          // Zweites Mal skippen erlaubt
          try {
            await currentMessage.delete();
          } catch {}

          aktuelleIndex = (aktuelleIndex + 1) % begriffe.length;
          const result = await sendCurrentQuiz();
          current = result.current;
          ersterBuchstabe = result.ersterBuchstabe;
          skipTracker.clear();
          return;
        }
      }

      // Für mittel und schwer sofort überspringen
      try {
        await currentMessage.delete();
      } catch {}

      aktuelleIndex = (aktuelleIndex + 1) % begriffe.length;
      const result = await sendCurrentQuiz();
      current = result.current;
      ersterBuchstabe = result.ersterBuchstabe;
      skipTracker.clear();

    } else if (i.customId === 'erster_buchstabe') {
      await i.reply({ content: `🅰️ Erster Buchstabe: **${ersterBuchstabe}**`, ephemeral: true });
    } else if (i.customId === 'neuer_begriff') {
      const modal = new ModalBuilder()
        .setCustomId('vorschlag_modal')
        .setTitle('Neuen Begriff vorschlagen')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('begriff')
              .setLabel('Begriff')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('emojis')
              .setLabel('Emojis')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('schwierigkeit')
              .setLabel('Schwierigkeit (einfach, mittel, schwer)')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('tipp')
              .setLabel('Tipp')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
      await i.showModal(modal);
    }
  });

  quizState.set(guildId, {
    aktuelleIndex,
    currentMessage,
    current,
    ersterBuchstabe,
    antwortCollector,
    buttonCollector,
    skipTracker,
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emojiquiz')
    .setDescription('Emojiquiz Verwaltung')
    .addSubcommand((sub) =>
      sub
        .setName('setchannel')
        .setDescription('Setze den Emojiquiz-Kanal')
        .addChannelOption((o) =>
          o.setName('channel').setDescription('Zielkanal').setRequired(true)
        )
    )
    .addSubcommand((sub) => sub.setName('repair').setDescription('Startet das Emojiquiz neu'))
    .addSubcommand((sub) => sub.setName('help').setDescription('Zeigt Hilfe zum Emojiquiz'))
    .addSubcommand((sub) => sub.setName('leaderboard').setDescription('Emojiquiz Bestenliste anzeigen'))
    .addSubcommand((sub) => sub.setName('settings').setDescription('Aktuelle Emojiquiz-Einstellungen anzeigen'))
    .addSubcommand((sub) =>
      sub
        .setName('edit')
        .setDescription('Einen Vorschlag bearbeiten')
        .addStringOption((o) => o.setName('id').setDescription('ID des Vorschlags').setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'setchannel') {
      const channel = interaction.options.getChannel('channel');

      // Erst Bestätigung senden
      await interaction.reply({ content: `> \`❓\` » Alles klar, ich starte meine Emojiquiz-Runden ab sofort in ${channel}.`, ephemeral: false });

      // Dann Quiz starten, ohne interaction (damit nicht nochmal interaction.reply genutzt wird)
      await startEmojiQuiz(channel, null);

      return;
    }

    const quizChannel = interaction.channel; // Demo: aktuellen Channel nehmen

    if (sub === 'repair') {
      await startEmojiQuiz(quizChannel, interaction);
      return interaction.reply({ content: 'Emojiquiz wurde neu gestartet!', ephemeral: true });
    }

    if (sub === 'help') {
      const embed = new EmbedBuilder()
        .setTitle('Emojiquiz Hilfe')
        .setDescription(
          `**Spielablauf:**\n` +
          `Du bekommst ein Emoji-Rätsel. Schreibe die Lösung in den Chat.\n` +
          `Du kannst den Begriff überspringen oder dir den ersten Buchstaben anzeigen lassen.\n` +
          `Neuen Begriff vorschlagen kannst du über den Button im Quiz.\n`
        )
        .setColor('Blurple');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'leaderboard') {
      return interaction.reply({ content: 'Bestenliste-Funktion ist noch nicht verfügbar.', ephemeral: true });
    }

    if (sub === 'settings') {
      const embed = new EmbedBuilder()
        .setTitle('Emojiquiz Einstellungen')
        .setDescription(
          '/emojiquiz setchannel [channel] - Setzt den Quiz-Kanal\n' +
          '/emojiquiz repair - Startet das Quiz neu\n' +
          '/emojiquiz leaderboard - Zeigt die Bestenliste\n' +
          '/emojiquiz settings - Zeigt aktuelle Einstellungen\n' +
          '/emojiquiz edit [id] - Bearbeite einen Vorschlag\n'
        )
        .addFields(
          { name: 'Anzahl Begriffe', value: begriffe.length.toString(), inline: true }
        )
        .setColor('Green');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'edit') {
      const id = interaction.options.getString('id');
      const vorschlag = await EmojiquizVorschlag.findById(id);
      if (!vorschlag) {
        return interaction.reply({ content: '> ❌ » Kein Vorschlag mit dieser ID gefunden.', ephemeral: true });
      }

      const modal = new ModalBuilder()
        .setCustomId(`edit_vorschlag_${id}`)
        .setTitle('Vorschlag bearbeiten')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('begriff')
              .setLabel('Begriff')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setValue(vorschlag.begriff)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('emojis')
              .setLabel('Emojis')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setValue(vorschlag.emojis)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('schwierigkeit')
              .setLabel('Schwierigkeit')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setValue(vorschlag.schwierigkeit)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('tipp')
              .setLabel('Tipp')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setValue(vorschlag.tipp)
          )
        );
      await interaction.showModal(modal);
    }
  },

  async handleModalSubmit(interaction) {
    if (!interaction.isModalSubmit()) return false;

    if (interaction.customId === 'vorschlag_modal') {
      const begriff = interaction.fields.getTextInputValue('begriff');
      const emojis = interaction.fields.getTextInputValue('emojis');
      const schwierigkeit = interaction.fields.getTextInputValue('schwierigkeit');
      const tipp = interaction.fields.getTextInputValue('tipp');

      const neuerVorschlag = new EmojiquizVorschlag({
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        begriff,
        emojis,
        schwierigkeit,
        tipp,
        createdAt: new Date(),
      });

      await neuerVorschlag.save();

      const channel = await interaction.client.channels.fetch(VORSCHLAG_CHANNEL_ID).catch(() => null);
      if (channel) {
        const embed = new EmbedBuilder()
          .setTitle('Neuer Emojiquiz-Vorschlag')
          .addFields(
            { name: 'Begriff', value: begriff, inline: true },
            { name: 'Emojis', value: emojis, inline: true },
            { name: 'Schwierigkeit', value: schwierigkeit, inline: true },
            { name: 'Tipp', value: tipp, inline: false },
            { name: 'Von', value: interaction.user.tag, inline: true },
            { name: 'ID', value: neuerVorschlag._id.toString(), inline: true }
          )
          .setColor('Yellow')
          .setTimestamp();

        channel.send({ embeds: [embed] });
      }

      await interaction.reply({ content: 'Dein Vorschlag wurde eingereicht. Vielen Dank!', ephemeral: true });
      return true;
    } else if (interaction.customId.startsWith('edit_vorschlag_')) {
      const id = interaction.customId.replace('edit_vorschlag_', '');
      const vorschlag = await EmojiquizVorschlag.findById(id);
      if (!vorschlag) {
        await interaction.reply({ content: 'Vorschlag nicht gefunden.', ephemeral: true });
        return true;
      }

      const begriff = interaction.fields.getTextInputValue('begriff');
      const emojis = interaction.fields.getTextInputValue('emojis');
      const schwierigkeit = interaction.fields.getTextInputValue('schwierigkeit');
      const tipp = interaction.fields.getTextInputValue('tipp');

      vorschlag.begriff = begriff;
      vorschlag.emojis = emojis;
      vorschlag.schwierigkeit = schwierigkeit;
      vorschlag.tipp = tipp;
      await vorschlag.save();

      await interaction.reply({ content: 'Vorschlag wurde aktualisiert!', ephemeral: true });
      return true;
    }

    return false;
  },
};

//
/*
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ComponentType,
  Events,
  PermissionFlagsBits
} = require('discord.js');
const EmojiquizVorschlag = require('../../../Datenbank/emojiquizVorschlagdb');

const VORSCHLAG_CHANNEL_ID = '1389281179148226693';

const begriffe = [
  {
    begriff: "Atomkraftwerk",
    emojis: "🔯🏭",
    schwierigkeit: "einfach",
    tipp: "Stromerzeuger"
  },
  {
    begriff: "Wasserrutsche",
    emojis: "🌊🎢",
    schwierigkeit: "mittel",
    tipp: "Im Freibad zu finden"
  },
  {
    begriff: "Eiffelturm",
    emojis: "🇫🇷🗼",
    schwierigkeit: "einfach",
    tipp: "Wahrzeichen in Paris"
  },
  {
    begriff: "Fußballspieler",
    emojis: "⚽🧍‍♂️",
    schwierigkeit: "mittel",
    tipp: "Steht oft im Abseits"
  }
];

// Quiz-Funktion, die immer weiter läuft
async function startEmojiQuiz(channel, interaction = null) {
  let aktuelleIndex = Math.floor(Math.random() * begriffe.length);
  let currentMessage;

  async function sendCurrentQuiz() {
    const current = begriffe[aktuelleIndex];
    const ersterBuchstabe = current.begriff[0];

    const embed = new EmbedBuilder()
      .setDescription(
        `Gesuchter Begriff • ${current.emojis}\n\n` +
        `Schwierigkeit: **${current.schwierigkeit}**\n` +
        `Belohnung • 1 🪙\n\n` +
        `Tipp • **${current.tipp}**`
      )
      .setFooter({ text: 'Dir fällt der Begriff nicht ein? Nutze den Überspringen-Button, um das Emojiquiz zu überspringen.' })
      .setColor('Blurple');

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ueberspringen')
        .setLabel('➡️ Überspringen')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('erster_buchstabe')
        .setLabel('🅰️ Erster Buchstabe')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('neuer_begriff')
        .setLabel('❓ Neuen Begriff vorschlagen')
        .setStyle(ButtonStyle.Primary)
    );

    if (currentMessage) {
      await currentMessage.edit({ embeds: [embed], components: [buttons] });
    } else {
      if (interaction) {
        await interaction.reply({ embeds: [embed], components: [buttons] });
        currentMessage = await interaction.fetchReply();
      } else {
        currentMessage = await channel.send({ embeds: [embed], components: [buttons] });
      }
    }

    return { current, ersterBuchstabe };
  }

  // Erste Anzeige
  let { current, ersterBuchstabe } = await sendCurrentQuiz();

  // Antwort-Collector
  const antwortCollector = channel.createMessageCollector({
    filter: m => !m.author.bot
  });

  antwortCollector.on('collect', async (m) => {
    if (m.content.trim().toLowerCase() === current.begriff.toLowerCase()) {
      await m.reply(`🎉 Richtig, ${m.author}! Das Emojiquiz wurde gelöst.`);
      aktuelleIndex++;
      if (aktuelleIndex >= begriffe.length) aktuelleIndex = 0;

      // Nächster Begriff
      const res = await sendCurrentQuiz();
      current = res.current;
      ersterBuchstabe = res.ersterBuchstabe;
    } else {
      await m.reply('❌ Falsch, versuch es nochmal!');
    }
  });

  // Button-Collector für das Quiz
  const buttonCollector = currentMessage.createMessageComponentCollector({
    componentType: ComponentType.Button
  });

  buttonCollector.on('collect', async i => {
    if (i.user.bot) return;

    if (i.customId === 'ueberspringen') {
      await i.deferUpdate();

      aktuelleIndex++;
      if (aktuelleIndex >= begriffe.length) aktuelleIndex = 0;

      const res = await sendCurrentQuiz();
      current = res.current;
      ersterBuchstabe = res.ersterBuchstabe;
    } else if (i.customId === 'erster_buchstabe') {
      await i.reply({ content: `> \`🅰️\` » In Ordnung, mehr Tipps werde ich dir auch nicht mehr geben: **${ersterBuchstabe}**`, ephemeral: true });
    } else if (i.customId === 'neuer_begriff') {
      const modal = new ModalBuilder()
        .setCustomId('vorschlag_modal')
        .setTitle('Neuen Begriff vorschlagen')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('begriff')
              .setLabel('Der Begriff')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('emojis')
              .setLabel('Die Emojis')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('schwierigkeit')
              .setLabel('Schwierigkeit (Einfach, Mittel, Schwer)')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('tipp')
              .setLabel('Tipp')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );

      await i.showModal(modal);
    }
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emojiquiz')
    .setDescription('Emojiquiz starten oder Vorschläge verwalten')
    .addSubcommand(sub =>
      sub.setName('start')
        .setDescription('Starte ein Emojiquiz')
    )
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('Bearbeite einen Vorschlag (Admin)')
        .addStringOption(opt =>
          opt.setName('id')
            .setDescription('ID des Vorschlags')
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      await startEmojiQuiz(interaction.channel, interaction);
    } else if (sub === 'edit') {
      const id = interaction.options.getString('id');
      const vorschlag = await EmojiquizVorschlag.findById(id);

      if (!vorschlag) {
        return interaction.reply({ content: '❌ Kein Vorschlag mit dieser ID gefunden.', ephemeral: true });
      }

      const modal = new ModalBuilder()
        .setCustomId(`edit_vorschlag:${id}`)
        .setTitle('✏️ Vorschlag bearbeiten')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('begriff')
              .setLabel('Begriff')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setValue(vorschlag.begriff)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('emojis')
              .setLabel('Emojis')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setValue(vorschlag.emojis)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('schwierigkeit')
              .setLabel('Schwierigkeit')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setValue(vorschlag.schwierigkeit)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('tipp')
              .setLabel('Tipp')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setValue(vorschlag.tipp)
          )
        );

      await interaction.showModal(modal);
    }

    // Nur einmalige Registrierung des Modal- und Button-Handlers
    if (!interaction.client.emojiquizModalHandlerRegistered) {
      interaction.client.on(Events.InteractionCreate, async (modalInteraction) => {
        if (modalInteraction.isModalSubmit()) {
          // Neuer Vorschlag
          if (modalInteraction.customId === 'vorschlag_modal') {
            const begriff = modalInteraction.fields.getTextInputValue('begriff');
            const emojis = modalInteraction.fields.getTextInputValue('emojis');
            const schwierigkeit = modalInteraction.fields.getTextInputValue('schwierigkeit');
            const tipp = modalInteraction.fields.getTextInputValue('tipp');

            const eintrag = await EmojiquizVorschlag.create({
              userId: modalInteraction.user.id,
              username: modalInteraction.user.tag,
              begriff,
              emojis,
              schwierigkeit,
              tipp,
              status: 'offen'
            });

            const channel = modalInteraction.client.channels.cache.get(VORSCHLAG_CHANNEL_ID);
            if (channel?.isTextBased()) {
              const embed = new EmbedBuilder()
                .setTitle('`📨` Neuer Emojiquiz-Vorschlag')
                .setDescription(
                  `**Begriff:** ${begriff}\n` +
                  `**Emojis:** ${emojis}\n` +
                  `**Schwierigkeit:** ${schwierigkeit}\n` +
                  `**Tipp:** ${tipp}`
                )
                .setColor('Green')
                .setTimestamp()
                .setFooter({ text: `von ${modalInteraction.user.tag} (ID: ${eintrag._id})` });

              const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(`vorschlag_accept:${eintrag._id}`)
                  .setLabel('✅ Annehmen')
                  .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                  .setCustomId(`vorschlag_reject:${eintrag._id}`)
                  .setLabel('❌ Ablehnen')
                  .setStyle(ButtonStyle.Secondary)
              );

              await channel.send({ embeds: [embed], components: [row] });
            }

            await modalInteraction.reply({ content: '> `✅` Dein Vorschlag wurde eingereicht. Vielen Dank!', ephemeral: true });
            return;
          }

          // Vorschlag bearbeiten
          if (modalInteraction.customId.startsWith('edit_vorschlag:')) {
            const id = modalInteraction.customId.split(':')[1];
            const begriff = modalInteraction.fields.getTextInputValue('begriff');
            const emojis = modalInteraction.fields.getTextInputValue('emojis');
            const schwierigkeit = modalInteraction.fields.getTextInputValue('schwierigkeit');
            const tipp = modalInteraction.fields.getTextInputValue('tipp');

            const update = await EmojiquizVorschlag.findByIdAndUpdate(id, {
              begriff, emojis, schwierigkeit, tipp
            }, { new: true });

            if (!update) {
              return modalInteraction.reply({ content: '`❌` Fehler beim Speichern!', ephemeral: true });
            }

            const embed = new EmbedBuilder()
              .setTitle('`✅` Vorschlag bearbeitet')
              .addFields(
                { name: 'Begriff', value: update.begriff, inline: true },
                { name: 'Emojis', value: update.emojis, inline: true },
                { name: 'Schwierigkeit', value: update.schwierigkeit, inline: true },
                { name: 'Tipp', value: update.tipp, inline: false }
              )
              .setColor('Green')
              .setFooter({ text: `Bearbeitet von ${modalInteraction.user.tag}` })
              .setTimestamp();

            await modalInteraction.reply({ embeds: [embed], ephemeral: true });
            return;
          }
        }

        // Button Interaktionen für Vorschläge (Annehmen / Ablehnen)
        if (modalInteraction.isButton()) {
          if (!modalInteraction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return modalInteraction.reply({ content: '> `❌` Du hast keine Berechtigung, Vorschläge zu akzeptieren oder abzulehnen.', ephemeral: true });
          }

          const [action, id] = modalInteraction.customId.split(':');

          if (action === 'vorschlag_accept' || action === 'vorschlag_reject') {
            const vorschlag = await EmojiquizVorschlag.findById(id);
            if (!vorschlag) {
              return modalInteraction.reply({ content: '> `❌` Vorschlag nicht gefunden.', ephemeral: true });
            }

            const neuerStatus = action === 'vorschlag_accept' ? 'Angenommen' : 'Abgelehnt';
            vorschlag.status = neuerStatus.toLowerCase();
            await vorschlag.save();

            // DM an User senden (optional)
            try {
              const dmUser = await modalInteraction.client.users.fetch(vorschlag.userId);
              const dmEmbed = new EmbedBuilder()
                .setTitle(neuerStatus === 'Angenommen' ? '`✅` Vorschlag angenommen' : '`❌` Vorschlag abgelehnt')
                .setDescription(neuerStatus === 'Angenommen'
                  ? `Dein Emojiquiz-Vorschlag **"${vorschlag.begriff}"** wurde angenommen. Danke für deine Unterstützung!`
                  : `Dein Emojiquiz-Vorschlag **"${vorschlag.begriff}"** wurde leider abgelehnt.\n\nSei kreativ und reiche gerne weitere Vorschläge ein.`)
                .setColor(neuerStatus === 'Angenommen' ? 'Green' : 'Red')
                .setTimestamp();
              await dmUser.send({ embeds: [dmEmbed] });
            } catch {
              // DM blockiert? Ignorieren
            }

            // Embed im Channel anpassen: Status + Bearbeiter
            const message = modalInteraction.message;
            const embed = EmbedBuilder.from(message.embeds[0])
              .setDescription(
                `**Begriff:** ${vorschlag.begriff}\n` +
                `**Emojis:** ${vorschlag.emojis}\n` +
                `**Schwierigkeit:** ${vorschlag.schwierigkeit}\n` +
                `**Tipp:** ${vorschlag.tipp}\n\n` +
                `Status: **${neuerStatus}** (Bearbeitet von ${modalInteraction.user.displayName})`
              )
              .setColor(neuerStatus === 'Angenommen' ? 'Green' : 'Red')
              .setTimestamp();

            // Buttons deaktivieren
            const disabledRow = new ActionRowBuilder().addComponents(
              ...message.components[0].components.map(button => button.setDisabled(true))
            );

            await modalInteraction.update({ embeds: [embed], components: [disabledRow] });
          }
        }
      });

      interaction.client.emojiquizModalHandlerRegistered = true;
    }
  }
};
*/