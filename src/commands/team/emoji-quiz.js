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
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      const random = begriffe[Math.floor(Math.random() * begriffe.length)];
      const ersterBuchstabe = random.begriff[0];

      const embed = new EmbedBuilder()
        .setDescription(`Gesuchter Begriff • ${random.emojis}\n\nSchwierigkeit: **${random.schwierigkeit}**\nBelohnung • 1 🪙\n\nTipp • **${random.tipp}**`)
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

      const message = await interaction.reply({
        embeds: [embed],
        components: [buttons],
        fetchReply: true
      });

      const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button });

      collector.on('collect', async i => {
        if (i.customId === 'ueberspringen') {
          await i.reply({ content: `> \`➡️\` » Das Quiz wurde übersprungen.`, ephemeral: true });
          collector.stop();
        }

        if (i.customId === 'erster_buchstabe') {
          await i.reply({ content: `> \`🅰️\` » In Ordnung, mehr Tipps werde ich dir auch nicht mehr geben: **${ersterBuchstabe}**`, ephemeral: true });
        }

        if (i.customId === 'neuer_begriff') {
          const modal = new ModalBuilder()
            .setCustomId('vorschlag_modal')
            .setTitle('🔤 Neuen Begriff vorschlagen')
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

    } else if (sub === 'edit') {
      // Edit-Vorschlag
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

    // Modal-Handler nur 1x registrieren
    if (!interaction.client.emojiquizModalHandlerRegistered) {
      interaction.client.on(Events.InteractionCreate, async (modalInteraction) => {
        if (!modalInteraction.isModalSubmit()) return;

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

            await channel.send({ embeds: [embed] });
          }

          await modalInteraction.reply({ content: '> `✅` Dein Vorschlag wurde gespeichert.', ephemeral: true });
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
            return modalInteraction.reply({ content: '❌ Fehler beim Speichern!', ephemeral: true });
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
        }
      });

      interaction.client.emojiquizModalHandlerRegistered = true;
    }
  }
};
