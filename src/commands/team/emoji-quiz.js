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
const { Coin } = require("../../../Datenbank/coindb");

const VORSCHLAG_CHANNEL_ID = '1389281179148226693';

const begriffe = [
  { begriff: "Atomkraftwerk", emojis: "🔯🏭", schwierigkeit: "einfach", tipp: "Stromerzeuger" },
  { begriff: "Wasserrutsche", emojis: "🌊🎢", schwierigkeit: "mittel", tipp: "Im Freibad zu finden" },
  { begriff: "Eiffelturm", emojis: "🇫🇷🗼", schwierigkeit: "einfach", tipp: "Wahrzeichen in Paris" },
  { begriff: "Fußballspieler", emojis: "⚽🧍‍♂️", schwierigkeit: "mittel", tipp: "Steht oft im Abseits" }
];

let quizState = new Map(); // guildId -> state

async function startEmojiQuiz(channel) {
  const guildId = channel.guild.id;

  if (quizState.has(guildId)) {
    const old = quizState.get(guildId);
    old.antwortCollector?.stop();
    old.buttonCollector?.stop();
    try { await old.currentMessage?.delete().catch(() => {}); } catch {}
  }

  let aktuelleIndex = Math.floor(Math.random() * begriffe.length);
  let currentMessage;
  let skipTracker = new Map(); // userId -> skipCount

  async function sendCurrentQuiz() {
    const current = begriffe[aktuelleIndex];
    const ersterBuchstabe = current.begriff[0];

    const embed = new EmbedBuilder()
      .setDescription(
        `Gesuchter Begriff • ${current.emojis}\n\n` +
        `Schwierigkeit: **${current.schwierigkeit}**\n` +
        `Belohnung • 1 \`🪙\`\n\n` +
        `Tipp • **${current.tipp}**`
      )
      .setFooter({ text: 'Dir fällt der Begriff nicht ein? Nutze den Überspringen-Button.' })
      .setColor('Blurple');

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ueberspringen').setLabel('➡️ Überspringen').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('erster_buchstabe').setLabel('🅰️ Erster Buchstabe').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('neuer_begriff').setLabel('❓ Neuen Begriff vorschlagen').setStyle(ButtonStyle.Primary),
    );

    currentMessage = await channel.send({ embeds: [embed], components: [buttons] });
    return { current, ersterBuchstabe };
  }

  let { current, ersterBuchstabe } = await sendCurrentQuiz();

  const antwortCollector = channel.createMessageCollector({
    filter: (m) => !m.author.bot,
  });

  antwortCollector.on('collect', async (m) => {
    if (m.content.trim().toLowerCase() === current.begriff.toLowerCase()) {
      try { await m.delete(); } catch {}

      // Coins hinzufügen
      try {
        let userCoins = await Coin.findOne({ userId: m.author.id });
        if (!userCoins) {
          userCoins = new Coin({ userId: m.author.id, coins: 0 });
        }
        userCoins.coins += 1;
        await userCoins.save();
      } catch (error) {
        console.error('Fehler beim Coins aktualisieren:', error);
      }

      const countdownSek = 2;
      const startNextRoundTimestamp = Math.floor(Date.now() / 1000) + countdownSek;
      try { await currentMessage.delete(); } catch {}
      const successMessage = await m.channel.send(
        `<@${m.author.id}> hat den gesuchten Begriff erraten! Die nächste Runde beginnt **<t:${startNextRoundTimestamp}:R>**.`
      );
      setTimeout(async () => {
        aktuelleIndex = (aktuelleIndex + 1) % begriffe.length;
        const result = await sendCurrentQuiz();
        current = result.current;
        ersterBuchstabe = result.ersterBuchstabe;
        skipTracker.clear();
        setTimeout(() => successMessage.delete().catch(() => {}), 2000);
      }, countdownSek * 1000);
    } else {
      try { await m.react('❌'); } catch {}
    }
  });

  const buttonCollector = channel.createMessageComponentCollector({ componentType: ComponentType.Button });

  buttonCollector.on('collect', async (i) => {
    if (i.user.bot) return;

    if (i.customId === 'ueberspringen') {
      await i.deferUpdate();

      const userSkips = skipTracker.get(i.user.id) ?? 0;

      if (current.schwierigkeit === 'einfach') {
        if (userSkips === 0) {
          skipTracker.set(i.user.id, 1);
          await i.followUp({ content: '> `🤨` » Jetzt streng dich an, so schwer ist das nicht.', ephemeral: true });
          return;
        } else {
          try { await currentMessage.delete(); } catch {}
          aktuelleIndex = (aktuelleIndex + 1) % begriffe.length;

          const msg = await i.channel.send(`Das Emojiquiz wurde von ${i.user} übersprungen.`);
          setTimeout(() => { msg.delete().catch(() => {}); }, 3000);

          await new Promise(r => setTimeout(r, 5000));

          const result = await sendCurrentQuiz();
          current = result.current;
          ersterBuchstabe = result.ersterBuchstabe;
          skipTracker.clear();

          return;
        }
      } else {
        try { await currentMessage.delete(); } catch {}
        aktuelleIndex = (aktuelleIndex + 1) % begriffe.length;

        const msg = await i.channel.send(`Das Emojiquiz wurde von ${i.user} übersprungen.`);
        setTimeout(() => { msg.delete().catch(() => {}); }, 3000);

        await new Promise(r => setTimeout(r, 5000));

        const result = await sendCurrentQuiz();
        current = result.current;
        ersterBuchstabe = result.ersterBuchstabe;
        skipTracker.clear();

        return;
      }
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

      await interaction.reply({ content: `> \`❓\` » Alles klar, ich starte meine Emojiquiz-Runden ab sofort in ${channel}.`, ephemeral: false });
      await startEmojiQuiz(channel);
      return;
    }

    const quizChannel = interaction.channel;

    if (sub === 'repair') {
      await startEmojiQuiz(quizChannel);
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
        username: interaction.user.username,
        userTag: interaction.user.tag,
        begriff,
        emojis,
        schwierigkeit,
        tipp,
        status: 'offen',
        createdAt: new Date(),
      });

      await neuerVorschlag.save();

      const channel = interaction.client.channels.cache.get(VORSCHLAG_CHANNEL_ID);
      if (channel?.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle('`📨` Neuer Emojiquiz-Vorschlag')
          .setDescription(
            `Begriff: ${begriff}\n` +
            `**Emojis: ${emojis}\n` +
            `Schwierigkeit: ${schwierigkeit}\n` +
            `Tipp: ${tipp}\n\n` +
            `Eingereicht von ${interaction.user.tag} (ID: ${neuerVorschlag._id})`
          )
          .setColor('Green')
          .setTimestamp()

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`vorschlag_accept:${neuerVorschlag._id}`)
            .setLabel('✅ Annehmen')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`vorschlag_reject:${neuerVorschlag._id}`)
            .setLabel('❌ Ablehnen')
            .setStyle(ButtonStyle.Secondary)
        );

        await channel.send({ embeds: [embed], components: [row] });
      }

      await interaction.reply({ content: '> `✅` Dein Vorschlag wurde eingereicht. Vielen Dank!', ephemeral: true });
      return true;
    }

    if (interaction.customId.startsWith('edit_vorschlag_')) {
    // Vorschlag bearbeiten
    const id = interaction.customId.replace('edit_vorschlag_', '');
    const begriff = interaction.fields.getTextInputValue('begriff');
    const emojis = interaction.fields.getTextInputValue('emojis');
    const schwierigkeit = interaction.fields.getTextInputValue('schwierigkeit');
    const tipp = interaction.fields.getTextInputValue('tipp');

    const update = await EmojiquizVorschlag.findByIdAndUpdate(id, {
      begriff,
      emojis,
      schwierigkeit,
      tipp,
    }, { new: true });

    if (!update) {
      await interaction.reply({ content: '`❌` Fehler beim Speichern!', ephemeral: true });
      return true;
    }

    // Hier das neue Embed je nach Status:
    const embedAngenommen = new EmbedBuilder()
      .setTitle('`✅` Vorschlag bearbeitet')
      .setDescription(
        `Begriff: ${update.begriff}\n` +
        `Emojis: ${update.emojis}\n` +
        `Schwierigkeit: ${update.schwierigkeit}\n` +
        `Tipp: ${update.tipp}\n\n`
      )
      .setColor('Green')
      .setTimestamp();

    const embedAbgelehnt = new EmbedBuilder()
      .setTitle('`❌` Vorschlag abgelehnt')
      .setDescription(
        `Begriff: ${update.begriff}\n` +
        `Emojis: ${update.emojis}\n` +
        `Schwierigkeit: ${update.schwierigkeit}\n` +
        `Tipp: ${update.tipp}\n\n`
      )
      .setColor('Red')
      .setTimestamp();

    if (update.status === 'abgelehnt') {
      await interaction.reply({ embeds: [embedAbgelehnt], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embedAngenommen], ephemeral: true });
    }

    return true;
  }

  return false;
},

  async handleButton(interaction) {
    if (!interaction.isButton()) return false;

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({ content: '> `❌` Du hast keine Berechtigung, Vorschläge zu akzeptieren oder abzulehnen.', ephemeral: true });
      return true;
    }

    const [action, id] = interaction.customId.split(':');

    if (action !== 'vorschlag_accept' && action !== 'vorschlag_reject') return false;

    const vorschlag = await EmojiquizVorschlag.findById(id);
    if (!vorschlag) {
      await interaction.reply({ content: '> `❌` Vorschlag nicht gefunden.', ephemeral: true });
      return true;
    }

    const neuerStatus = action === 'vorschlag_accept' ? 'angenommen' : 'abgelehnt';
    vorschlag.status = neuerStatus;
    await vorschlag.save();

    try {
      const dmUser = await interaction.client.users.fetch(vorschlag.userId);
      const dmEmbed = new EmbedBuilder()
        .setTitle(neuerStatus === 'angenommen' ? '`✅` Vorschlag angenommen' : '`❌` Vorschlag abgelehnt')
        .setDescription(neuerStatus === 'angenommen'
          ? `Dein Emojiquiz-Vorschlag **${vorschlag.begriff}** wurde angenommen! Danke für deinen Beitrag.`
          : `Dein Emojiquiz-Vorschlag **${vorschlag.begriff}** wurde abgelehnt.`)
        .setColor(neuerStatus === 'angenommen' ? 'Green' : 'Red')
        .setTimestamp();

      dmUser.send({ embeds: [dmEmbed] }).catch(() => {});
    } catch {}

    const message = await interaction.channel.messages.fetch(interaction.message.id).catch(() => null);
    if (message) {
      const embed = EmbedBuilder.from(message.embeds[0])
        .setColor(neuerStatus === 'angenommen' ? 'Green' : 'Red')
        .setFooter({ text: `Status: ${neuerStatus.charAt(0).toUpperCase() + neuerStatus.slice(1)} - Bearbeitet von ${interaction.user.displayName}` });

      await message.edit({
        embeds: [embed],
        components: [],
      });
    }

    await interaction.reply({ content: `> \`${neuerStatus === 'angenommen' ? '✅' : '❌'}\` Vorschlag wurde ${neuerStatus}.`, ephemeral: true });
    return true;
  }
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
              )
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