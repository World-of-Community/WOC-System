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

async function startEmojiQuiz(channel, interaction = null) {
  let aktuelleIndex = Math.floor(Math.random() * begriffe.length);
  let currentMessage;
  let antwortCollector;

  async function sendCurrentQuiz() {
    const current = begriffe[aktuelleIndex];
    const ersterBuchstabe = current.begriff[0];

    const embed = new EmbedBuilder()
      .setDescription(`Gesuchter Begriff • ${current.emojis}\n\nSchwierigkeit: **${current.schwierigkeit}**\nBelohnung • 1 🪙\n\nTipp • **${current.tipp}**`)
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

  // Quiz initial senden
  let { current, ersterBuchstabe } = await sendCurrentQuiz();

  // MessageCollector für Antworten im Channel
  antwortCollector = channel.createMessageCollector({
    filter: m => !m.author.bot
  });

  antwortCollector.on('collect', async (m) => {
    if (m.content.trim().toLowerCase() === current.begriff.toLowerCase()) {
      await m.reply(`🎉 Richtig, ${m.author}! Das Emojiquiz wurde gelöst.`);
      antwortCollector.stop('gelöst');
    } else {
      await m.reply('❌ Falsch, versuch es nochmal!');
    }
  });

  antwortCollector.on('end', async (collected, reason) => {
    if (reason === 'gelöst') {
      await channel.send('✅ Emojiquiz wurde beendet. Danke fürs Mitspielen!');
    }
  });

  // ButtonCollector für Interaktionen am Embed
  const buttonCollector = currentMessage.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 30 * 60 * 1000 // optional Timeout
  });

  buttonCollector.on('collect', async (i) => {
    if (i.user.bot) return;

    if (i.customId === 'ueberspringen') {
      await i.deferUpdate();

      // Zum nächsten Begriff wechseln (oder zurück zum ersten)
      aktuelleIndex++;
      if (aktuelleIndex >= begriffe.length) aktuelleIndex = 0;

      // Quiz mit neuem Begriff aktualisieren
      const res = await sendCurrentQuiz();
      current = res.current;
      ersterBuchstabe = res.ersterBuchstabe;
    }

    if (i.customId === 'erster_buchstabe') {
      await i.reply({ content: `🅰️ Erster Buchstabe: **${ersterBuchstabe}**`, ephemeral: true });
    }

    if (i.customId === 'neuer_begriff') {
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
    .setDescription('Emojiquiz starten oder bearbeiten')
    .addSubcommand(sub =>
      sub.setName('start')
        .setDescription('Starte ein Emojiquiz')
    )
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('Bearbeite einen Vorschlag (Admin)')
        .addStringOption(opt =>
          opt.setName('id')
            .setDescription('Die ID des Vorschlags aus der Datenbank')
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

    // Modal-Handler und Button-Handler nur einmal registrieren
    if (!interaction.client.emojiquizModalHandlerRegistered) {
      interaction.client.on(Events.InteractionCreate, async (modalInteraction) => {
        if (modalInteraction.isModalSubmit()) {
          // Vorschlag erstellen
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
              tipp
            });

            const channel = modalInteraction.client.channels.cache.get(VORSCHLAG_CHANNEL_ID);
            if (channel?.isTextBased()) {
              const embed = new EmbedBuilder()
                .setTitle('`📨` Neuer Emojiquiz-Vorschlag')
                .setDescription(`**Begriff:** ${begriff}\n**Emojis:** ${emojis}\n**Schwierigkeit:** ${schwierigkeit}\n**Tipp:** ${tipp}`)
                .setFooter({ text: `Von ${modalInteraction.user.tag} (ID: ${eintrag._id})` })
                .setColor('Green')
                .setTimestamp();

              const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(`vorschlag_accept:${eintrag._id}`)
                  .setLabel('✅ Annehmen')
                  .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                  .setCustomId(`vorschlag_reject:${eintrag._id}`)
                  .setLabel('❌ Ablehnen')
                  .setStyle(ButtonStyle.Danger)
              );

              await channel.send({ embeds: [embed], components: [row] });
            }

            await modalInteraction.reply({ content: '> `✅` Dein Vorschlag wurde gespeichert.', ephemeral: true });
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

        // Button Interaktionen: Annehmen / Ablehnen
        if (modalInteraction.isButton()) {
          const user = modalInteraction.user;

          // Nur mit ManageRoles Rechte
          if (!modalInteraction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return modalInteraction.reply({ content: '❌ Du hast keine Berechtigung, Vorschläge zu akzeptieren oder abzulehnen.', ephemeral: true });
          }

          const [action, id] = modalInteraction.customId.split(':');

          if (action === 'vorschlag_accept' || action === 'vorschlag_reject') {
            const vorschlag = await EmojiquizVorschlag.findById(id);
            if (!vorschlag) {
              return modalInteraction.reply({ content: '❌ Vorschlag nicht gefunden.', ephemeral: true });
            }

            // DM an den User senden
            try {
              const dmUser = await modalInteraction.client.users.fetch(vorschlag.userId);
              if (action === 'vorschlag_accept') {
                await dmUser.send(`✅ Dein Emojiquiz-Vorschlag "**${vorschlag.begriff}**" wurde angenommen. Danke für deine Unterstützung!`);
              } else {
                await dmUser.send(`❌ Dein Emojiquiz-Vorschlag "**${vorschlag.begriff}**" wurde leider abgelehnt. `);
              }
            } catch {
              // DM blockiert? Ignorieren
            }

            // Embed anpassen
            const message = modalInteraction.message;
            const embed = EmbedBuilder.from(message.embeds[0])
              .setFooter({ text: `Status: ${action === 'vorschlag_accept' ? 'Angenommen' : 'Abgelehnt'}` })
              .setColor(action === 'vorschlag_accept' ? 'Green' : 'Red');

            // Buttons deaktivieren
            const disabledRow = new ActionRowBuilder().addComponents(
              ...message.components[0].components.map(b => b.setDisabled(true))
            );

            await modalInteraction.update({ embeds: [embed], components: [disabledRow] });
          }
        }
      });

      interaction.client.emojiquizModalHandlerRegistered = true;
    }
  }
};
