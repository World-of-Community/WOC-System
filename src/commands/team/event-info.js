import {
    SlashCommandBuilder,
    PermissionFlagsBits
} from 'discord.js';

import ms from 'ms';

// Temporärer Speicher
// Nach Bot-Restart leer
const sentMessages = new Map();

export default {

    data: new SlashCommandBuilder()

        .setName('event-info')
        .setDescription('» Event Nachrichten senden und bearbeiten. 💬')

        // =========================
        // SEND
        // =========================
        .addSubcommand(sub =>
            sub
                .setName('send')
                .setDescription('Sende eine Nachricht.')

                .addChannelOption(option =>
                    option
                        .setName('kanal')
                        .setDescription('Der Kanal')
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('nachricht')
                        .setDescription('Die Nachricht')
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('starten')
                        .setDescription('z.B. 10s, 5m, 1h')
                        .setRequired(false)
                )
        )

        // =========================
        // EDIT
        // =========================
        .addSubcommand(sub =>
            sub
                .setName('edit')
                .setDescription('Bearbeite eine Nachricht.')

                .addStringOption(option =>
                    option
                        .setName('messageid')
                        .setDescription('Die Message ID')
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('nachricht')
                        .setDescription('Neue Nachricht')
                        .setRequired(true)
                )
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageRoles
        ),

    async execute(interaction) {

        const subcommand =
            interaction.options.getSubcommand();

        // ==================================================
        // SEND
        // ==================================================
        if (subcommand === 'send') {

            const channel =
                interaction.options.getChannel('kanal');

            const rawMessage =
                interaction.options.getString('nachricht');

            const time =
                interaction.options.getString('starten');

            // \n Support
            const message =
                rawMessage.replace(/\\n/g, '\n');

            // =============================================
            // MIT TIMER
            // =============================================
            if (time) {

                const timeMs = ms(time);

                // Ungültige Zeit
                if (!timeMs) {

                    return await interaction.reply({
                        content:
                            '> `❌` » Bitte gib eine gültige Zeit an. Beispiel: `10s`, `5m`, `1h`',
                        ephemeral: true
                    });

                }

                const endDate =
                    new Date(Date.now() + timeMs);

                const timestamp =
                    Math.floor(endDate.getTime() / 1000);

                await interaction.reply({
                    content:
                        `> \`⏳\` » Die Nachricht wird <t:${timestamp}:R> gesendet.`,
                    ephemeral: true
                });

                setTimeout(async () => {

                    try {

                        const sentMessage =
                            await channel.send({
                                content: message
                            });

                        // Speichern
                        sentMessages.set(
                            sentMessage.id,
                            {
                                channelId: channel.id
                            }
                        );

                        await interaction.editReply({
                            content:
                                `> \`✅\` » Nachricht erfolgreich gesendet.\n> Message ID: \`${sentMessage.id}\``,
                            ephemeral: true
                        });

                    } catch (error) {

                        console.error(
                            'Fehler beim Senden:',
                            error
                        );

                        await interaction.editReply({
                            content:
                                '> `❌` » Fehler beim Senden der Nachricht.',
                            ephemeral: true
                        });
                    }
                }, timeMs);
            }

            // =============================================
            // OHNE TIMER
            // =============================================
            else {

                try {

                    const sentMessage =
                        await channel.send({
                            content: message
                        });

                    // Speichern
                    sentMessages.set(
                        sentMessage.id,
                        {
                            channelId: channel.id
                        }
                    );

                    await interaction.reply({
                        content:
                            `> \`✅\` » Nachricht erfolgreich gesendet.\n> Message ID: \`${sentMessage.id}\``,
                        ephemeral: true
                    });

                } catch (error) {

                    console.error(
                        'Fehler beim Senden:',
                        error
                    );

                    await interaction.reply({
                        content:
                            '> `❌` » Fehler beim Senden der Nachricht.',
                        ephemeral: true
                    });

                }
            }
        }
        // ==================================================
        // EDIT
        // ==================================================
        else if (subcommand === 'edit') {

            const messageId =
                interaction.options.getString('messageid');

            const rawMessage =
                interaction.options.getString('nachricht');

            // \n Support
            const newMessage =
                rawMessage.replace(/\\n/g, '\n');

            // Gespeicherte Daten holen
            const data =
                sentMessages.get(messageId);

            if (!data) {

                return await interaction.reply({
                    content:
                        '> `❌` » Nachricht wurde nicht gefunden oder Bot wurde neugestartet.',
                    ephemeral: true
                });
            }
            try {

                // Kanal holen
                const channel =
                    await interaction.client.channels.fetch(
                        data.channelId
                    );

                // Nachricht holen
                const message =
                    await channel.messages.fetch(
                        messageId
                    );

                // Nachricht bearbeiten
                await message.edit({
                    content: newMessage
                });

                await interaction.reply({
                    content:
                        '> `✅` » Nachricht erfolgreich bearbeitet.',
                    ephemeral: true
                });

            } catch (error) {

                console.error(
                    'Fehler beim Bearbeiten:',
                    error
                );

                await interaction.reply({
                    content:
                        '> `❌` » Fehler beim Bearbeiten der Nachricht.',
                    ephemeral: true
                });
            }
        }
    },
};