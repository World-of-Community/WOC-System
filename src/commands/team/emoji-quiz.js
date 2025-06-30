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
    componentType: ComponentType.Button,
    time: 30 * 60 * 1000
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
      await i.reply({ content: `🅰️ Erster Buchstabe: **${ersterBuchstabe}**`, ephemeral: true });
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
                  `**Tipp:** ${tipp}\n\n` +
                  `Status: **Offen**`
                )
                .setColor('Green')
                .setTimestamp()
                .setFooter({ text: `Von ${modalInteraction.user.tag} (ID: ${eintrag._id})` });

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
