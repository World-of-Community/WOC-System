const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db'); // Datenbank für die Speicherung
const emojiquizdb = new QuickDB();

//Todo: Wenn man es überspringt folgende nachricht: Das Emojiquiz wurde von ${member} übersprungen
//Soll dann nach 5 sekunden gelöscht werden und dann ein neues embed mit einem neuen Begriff
//Todo: Datenbank einrichten
//Todo: Befehl hinzufügen für neue begriffe

// Beispiel für Quiz-Begriffe
const quizTerms = [
    { term: '🍎', answer: 'Apfel', difficulty: 'Leicht', reward: 1, hint: 'Eine Frucht, die man oft in rot oder grün sieht.' },
    { term: '🚗', answer: 'Auto', difficulty: 'Mittel', reward: 2, hint: 'Ein Fahrzeug, das auf der Straße fährt.' },
    { term: '🏰', answer: 'Schloss', difficulty: 'Schwer', reward: 3, hint: 'Ein großes, historisches Gebäude.' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojiquiz')
        .setDescription('Emojiquiz System')
        .addSubcommand((command) =>
            command
            .setName('setchannel')
            .setDescription('» Setze den Kanal fest, in dem das Emojiquiz gespielt werden soll. 📌')
            .addChannelOption(option => option.setName('kanal').setDescription('» In welchen Kanal soll es gespielt werden?').setRequired(true))
        .addSubcommand((command) =>
            command
                .setName('help')
                .setDescription('» Erklärt das Emojiquiz. 📌'),
        )
        .addSubcommand((command) =>
            command
                .setName('settings')
                .setDescription('» Zeigt die aktuellen Einstellungen. 📌')
        )
        .addSubcommand((command) => 
            command
                .setName('new word')
                .setDescription('» Füge einen neuen Begriff hinzu. ➕')
                .addStringOption(option =>
                    option.setName('begriff')
                        .setDescription('Der Begriff, der erraten werden soll. (Emojis)')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('schwierigkeit')
                        .setDescription('Schwierigkeitsgrad des Begriffs')
                        .addChoices(
                            { name: 'schwer', value: 'schwer' },     
                            { name: 'mittel', value: 'mittel' },
                            { name: 'leicht', value: 'leicht' })
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('belohnung')
                        .setDescription('Belohnung für das Erraten (Punkte 1-3)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('tipp')
                        .setDescription('Ein Hinweis, der den Usern gegeben wird.')
                        .setRequired(true)),
        ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const subcommand = interaction.options.getSubcommand();

        switch (sub) {
            case 'setchannel':
                const quizchannel = interaction.options.getChannel('kanal');

                // Starte automatisch das Emojiquiz in dem festgelegten Kanal
                const currentQuiz = quizTerms[Math.floor(Math.random() * quizTerms.length)];

                // Speichere den Kanal in der Datenbank
                await emojiquizdb.set(`emojiquiz_channel_${interaction.guild.id}`, channel.id);

                // Antwort für den Benutzer
                return interaction.reply({ content: `> \`📌\` » Alles klar, ich starte meine Emojiquiz-Runden ab sofort in ${quizchannel}`, ephemeral: true });

                // Embed für das Emojiquiz
                const emojiQuizEmbed = new EmbedBuilder()
                    .setDescription(`Gesuchter Begriff • ${currentQuiz.term}\n\nSchwierigkeit • **${currentQuiz.difficulty}**\nBelohnung • **${currentQuiz.reward}** Punkte\n\nTipp • **${currentQuiz.hint}**`)
                    .setColor('Blurple')
                    .setFooter({ text: `» Dir fällt der Begriff nicht ein? Nutze den Überspringen-Button, um das Emojiquiz zu überspringen.`, iconURL: `${interaction.guild.iconURL()}` })
                    .setTimestamp();

                // Action-Buttons
                const actionRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('skip')
                            .setLabel('➡️ Überspringen')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('first_letter')
                            .setLabel('#️⃣ Erster Buchstabe')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('new_term')
                            .setLabel('➕ Neuen Begriff vorschlagen')
                            .setStyle(ButtonStyle.Secondary)
                    );

                // Sende das Embed und die Buttons direkt nach dem Setzen des Kanals
                await quizchannel.send({ embeds: [emojiQuizEmbed], components: [actionRow] });

                // Button Collector für Aktionen
                const filter = (i) => i.customId === 'skip' || i.customId === 'first_letter' || i.customId === 'new_term';
                const collector = quizchannel.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async i => {
                    if (i.customId === 'skip') {
                        // Neuen Begriff anzeigen
                        const newQuiz = quizTerms[Math.floor(Math.random() * quizTerms.length)];
                        const newEmbed = new EmbedBuilder()
                            .setTitle('🎉 Emojiquiz (Neuer Begriff) 🎉')
                            .setDescription(`Gesuchter Begriff • ${currentQuiz.term}\n\nSchwierigkeit • **${currentQuiz.difficulty}**\nBelohnung • **${currentQuiz.reward}** Punkte\n\nTipp • **${currentQuiz.hint}**`)
                            .addFields(
                                { name: 'Gesuchter Begriff', value: `${newQuiz.term}`, inline: true },
                                { name: 'Schwierigkeit', value: `${newQuiz.difficulty}`, inline: true },
                                { name: 'Belohnung', value: `${newQuiz.reward} Punkte`, inline: true },
                                { name: 'Tipp', value: `${newQuiz.hint}`, inline: false }
                            )
                            .setColor('Blurple')
                            .setFooter({ text: `${interaction.guild.name} - Emojiquiz`, iconURL: `${interaction.guild.iconURL()}` })
                            .setTimestamp();

                        await i.update({ embeds: [newEmbed], components: [actionRow] });
                    }

                    if (i.customId === 'first_letter') {
                        const firstLetter = currentQuiz.answer.charAt(0).toUpperCase();
                        await i.reply({ content: `In Ordnung, mehr Tipps werde ich dir auch nicht mehr geben: **${firstLetter}**`, ephemeral: true });
                    }

                    if (i.customId === 'new_term') {
                        const newQuiz = quizTerms[Math.floor(Math.random() * quizTerms.length)];
                        const newEmbed = new EmbedBuilder()
                            .setTitle('🎉 Emojiquiz (Neuer Begriff vorgeschlagen) 🎉')
                            .setDescription('Versuche den gesuchten Begriff anhand des Emojis zu erraten!')
                            .addFields(
                                { name: 'Gesuchter Begriff', value: `${newQuiz.term}`, inline: true },
                                { name: 'Schwierigkeit', value: `${newQuiz.difficulty}`, inline: true },
                                { name: 'Belohnung', value: `${newQuiz.reward} Punkte`, inline: true },
                                { name: 'Tipp', value: `${newQuiz.hint}`, inline: false }
                            )
                            .setColor('Blurple')
                            .setFooter({ text: `${interaction.guild.name} - Emojiquiz`, iconURL: `${interaction.guild.iconURL()}` })
                            .setTimestamp();

                        await i.update({ embeds: [newEmbed], components: [actionRow] });
                    }
                });

                break;

            case 'help':
                const EmojiquizHelpEmbed = new EmbedBuilder()
                .setTitle('» Emojiquiz-Hilfe')
                .setDescription('» Das Emojiquiz ist, wie der Name bereits verrät, ist ein Minispiel wo man anhand von Emojis den gesuchten Begriff erraten muss. Für jeden erratenen Begriff gibt es je nach Schwierigkeit und einen Punkt für die Rangliste.')
                .setColor('Blurple')
                .setFooter({ text: `${interaction.guild.name} - Emojiquiz`, iconURL: `${interaction.guild.iconURL()}` })
                .setTimestamp()

                await interaction.reply({ embeds: [EmojiquizHelpEmbed], ephemeral: true })

            case 'settings':
                const channelID = await emojiquizdb.get(`emojiquiz_channel_${interaction.guild.id}`);
                const quizChannel = interaction.guild.channels.cache.get(channelID) || 'Kein Kanal gesetzt.';

                const EmojiquizSettingsEmbed = new EmbedBuilder()
                .setTitle('» Emojiquiz-Einstellungen')
                .setDescription(`» Konfigurierter Kanal:\n- ${quizChannel}`)
                .setColor('Blurple')
                .setFooter({ text: `${interaction.guild.name} - Emojiquiz`, iconURL: `${interaction.guild.iconURL()}` })
                .setTimestamp()

                const SettingsButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('Settings')
                        .setLabel('🗑️ » Einstellungen zurücksetzen')
                        .setStyle(ButtonStyle.Danger)
                )

                await interaction.reply({ embeds: [EmojiquizSettingsEmbed], components: [SettingsButton], ephemeral: true })
        }
    }
}