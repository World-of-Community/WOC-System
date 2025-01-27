const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, InteractionCollector, ActionRowBuilder } = require('discord.js');
const userDB = require("../../../Datenbank/userdb")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('Geburstag System')
        .addSubcommand((command) => command.setName('set').setDescription('» Setze deinen Geburtstag. 🎂')
                .addIntegerOption(option => option.setName('tag').setDescription('» An welchen Tag wurdest du geboren?').setRequired(true))
                .addIntegerOption(option => option.setName('monat').setDescription('» In welchen Monat wurdest du geboren?').setRequired(true))
                .addIntegerOption(option => option.setName('jahr').setDescription('» In welchen Jahr wurdest du geboren?').setRequired(false))
        )
        .addSubcommand((command) => command.setName('delete').setDescription('» Lösche den Geburtstag eines Nutzers. 🎂')
                .addUserOption(option => option.setName('user').setDescription('» Welchen Nutzer möchtest du löschen?').setRequired(true))
        )
        .addSubcommand((command) => command.setName('change').setDescription('» Ändere den Geburtstag eines Nutzers. 🎂')
                .addUserOption(option => option.setName('user').setDescription('» Welchen Nutzer möchtest du ändern?').setRequired(true))
                .addIntegerOption(option => option.setName('tag').setDescription('» An welchem Tag wurde der Nutzer geboren?').setRequired(true))
                .addIntegerOption(option => option.setName('monat').setDescription('» In welchem Monat wurde der Nutzer geboren?').setRequired(true))
                .addIntegerOption(option => option.setName('jahr').setDescription('» In welchem Jahr wurde der Nutzer geboren?').setRequired(false)),
        )
        .addSubcommand((command) => command.setName('next').setDescription('» Zeigt dir die nächsten Geburtstage an. 🎂')),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        let tag, monat, jahr, user;

        switch (sub) {
            case 'set':
                tag = interaction.options.getInteger('tag');
                monat = interaction.options.getInteger('monat');
                jahr = interaction.options.getInteger('jahr');
                
                
                if (!isValidDate(tag, monat, jahr)) {
                    return interaction.reply({ content: '> `❌` » Bitte gib ein gültiges Datum ein.', ephemeral: true });
                }

                try {
                    if(jahr) {
                        await userDB.findOneAndUpdate(
                            { userID: interaction.user.id },
                            { 
                                'birthday.tag': tag, 
                                'birthday.monat': monat, 
                                'birthday.jahr': jahr 
                            },
                            { upsert: true, new: true }
                        );
                    } else {
                        await userDB.findOneAndUpdate(
                            { userID: interaction.user.id },
                            { 
                                'birthday.tag': tag, 
                                'birthday.monat': monat, 
                            },
                            { upsert: true, new: true }
                        );
                    }
                    await interaction.reply({ content: '> `✅` » Dein Geburtstag wurde gespeichert!', ephemeral: true });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: '> `❌` » Es gab einen Fehler beim Speichern deines Geburtstags. Bitte melde dich beim Ticket Support.', ephemeral: true });
                }
                break;

            case 'delete':
                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                    return interaction.reply({ content: '> `❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.', ephemeral: true });
                }

                user = interaction.options.getUser('user');
                if (!user) {
                    return interaction.reply({ content: '> `❌` » User wurde nicht gefunden.', ephemeral: true });
                }

                try {
                    await userDB.findOneAndUpdate(
                        { userID: user.id },
                        { $unset: { birthday: '' } }
                    );
                    await interaction.reply({ content: '> `✅` » Der Geburtstag wurde gelöscht.', ephemeral: true });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: '> `❌` » Es gab einen Fehler beim Löschen des Geburtstags. Bitte melde dich beim Ticket Support.', ephemeral: true });
                }
                break;

            case 'change':
                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                    return interaction.reply({ content: '> `❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.', ephemeral: true });
                }

                user = interaction.options.getUser('user');
                tag = interaction.options.getInteger('tag');
                monat = interaction.options.getInteger('monat');
                jahr = interaction.options.getInteger('jahr');

                if (!user) {
                    return interaction.reply({ content: '> `❌` » User wurde nicht gefunden.', ephemeral: true });
                }

                if (!isValidDate(tag, monat, jahr)) {
                    return interaction.reply({ content: '> `❌` » Bitte gib ein gültiges Datum ein.', ephemeral: true });
                }

                try {
                    if(jahr) {
                        await userDB.findOneAndUpdate(
                            { userID: interaction.user.id },
                            { 
                                'birthday.tag': tag, 
                                'birthday.monat': monat, 
                                'birthday.jahr': jahr 
                            },
                            { upsert: true, new: true }
                        );
                    } else {
                        await userDB.findOneAndUpdate(
                            { userID: interaction.user.id },
                            { 
                                'birthday.tag': tag, 
                                'birthday.monat': monat, 
                            },
                            { upsert: true, new: true }
                        );
                    }
                    await interaction.reply({ content: '> `✅` » Der Geburtstag wurde geändert.', ephemeral: true });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: '> `❌` » Es gab einen Fehler beim Ändern des Geburtstags. Bitte melde dich beim Ticket Support.', ephemeral: true });
                }
                break;

            case 'next':
                const pageSize = 10; // Anzahl der Einträge pro Seite

                let upcomingBirthdays = await userDB.find({
                    'birthday.tag': { $exists: true, $ne: null },
                    'birthday.monat': { $exists: true, $ne: null },
                }).sort({
                    'birthday.tag': 1,   // Dann nach Tag
                    'birthday.monat': 1, // Zuerst nach Monat
                    'birthday.jahr': 1   // Und nach Jahr (falls vorhanden)
                 });

                upcomingBirthdays = upcomingBirthdays.filter(birthday => birthday.birthday.tag !== 0)

                if (upcomingBirthdays.length === 0) {
                    return interaction.reply({ content: '> `❌` » Keine Geburtstage gefunden.', ephemeral: true });
                }
            
                let currentPage = 1;
                const totalPages = Math.ceil(upcomingBirthdays.length / pageSize);

                // Nächsten Geburtstag ermitteln
                const today = new Date();
                const currentYear = today.getFullYear();
                const nextBirthdayIndex = upcomingBirthdays.findIndex(birthday => {
                    const { tag, monat, jahr } = birthday.birthday;
                    const birthdayDate = new Date(currentYear, monat - 1, tag); // Monat wird hier 0-basiert übergeben
                    return birthdayDate >= today; // Nächster Geburtstag
                });

                const nextBirthday = upcomingBirthdays.splice(nextBirthdayIndex, 1)[0]; // Entfernt den nächsten Geburtstag und speichert ihn
                upcomingBirthdays.unshift(nextBirthday); // Fügt den nächsten Geburtstag an den Anfang

                function createBirthdayEmbed (birthdays, page) {
                    const startIndex = (page - 1) * pageSize;
                    const endIndex = Math.min(page * pageSize, birthdays.length);
                    const pageBirthdays = birthdays.slice(startIndex, endIndex);

                    let description = 'Hier sind die nächsten Geburtstage:\n\n';

                    //for(const birthday of pageBirthdays) {
                    //    const { userID, birthday: { tag, monat, jahr } } = birthday;
                    //    const member = interaction.guild.members.cache.get(userID);
                    //    if(!member) continue;

                        // Füge führende Nullen hinzu
                    //    const formattedTag = tag.toString().padStart(2, '0');
                    //    const formattedMonat = monat.toString().padStart(2, '0');
                    //    const formattedDate = jahr ? `${formattedTag}.${formattedMonat}.${jahr}` : `${formattedTag}.${formattedMonat}.`;

                    //    description += `**Nächster Geburtstag:** ${member} - ${formattedDate}\n\n${member} - ${formattedDate}\n`;
                    //}
                    
                    // Der nächste Geburtstag wird hervorgehoben
                    const { userID, birthday: { tag, monat, jahr } } = nextBirthday;
                    const member = interaction.guild.members.cache.get(userID);
                    if (member) {
                        const formattedTag = tag.toString().padStart(2, '0');
                        const formattedMonat = monat.toString().padStart(2, '0');
                        const formattedDate = jahr ? `${formattedTag}.${formattedMonat}.${jahr}` : `${formattedTag}.${formattedMonat}.`;
                        description += `**Nächster Geburtstag:** ${member} - ${formattedDate}\n\n`;
                    }

                    // Alle anderen Geburtstagsdaten
                    //for (const birthday of pageBirthdays) {
                    //    const { userID, birthday: { tag, monat, jahr } } = birthday;
                    //    const member = interaction.guild.members.cache.get(userID);
                    //    if (!member) continue;

                    //    const formattedTag = tag.toString().padStart(2, '0');
                    //    const formattedMonat = monat.toString().padStart(2, '0');
                    //    const formattedDate = jahr ? `${formattedTag}.${formattedMonat}.${jahr}` : `${formattedTag}.${formattedMonat}.`;

                    //    description += `${member} - ${formattedDate}\n`;
                    //}

                    // test

                    // Nächsten Geburtstag ermitteln anhand von Tag und Monat
                    const today = new Date();
                    const currentMonth = today.getMonth() + 1; // Monat ist 0-basiert, daher +1
                    const currentDay = today.getDate();

                    // Nächsten Geburtstag ermitteln
                    const today = new Date();
                    const currentYear = today.getFullYear();
                    const nextBirthdayIndex = upcomingBirthdays.findIndex(birthday => {
                        const { tag, monat, jahr } = birthday.birthday;
                        const birthdayDate = new Date(currentYear, monat - 1, tag); // Monat wird hier 0-basiert übergeben
                        return birthdayDate >= today; // Nächster Geburtstag
                    });

                    const nextBirthday = upcomingBirthdays.splice(nextBirthdayIndex, 1)[0]; // Entfernt den nächsten Geburtstag und speichert ihn
                    upcomingBirthdays.unshift(nextBirthday); // Fügt den nächsten Geburtstag an den Anfang der Liste

                    function createBirthdayEmbed(birthdays, page) {
                        const startIndex = (page - 1) * pageSize;
                        const endIndex = Math.min(page * pageSize, birthdays.length);
                        const pageBirthdays = birthdays.slice(startIndex, endIndex);
                
                        let description = 'Hier sind die nächsten Geburtstage:\n\n';
                
                        // Den nächsten Geburtstag oben anzeigen
                        const nextBirthday = pageBirthdays[0]; // Der erste Geburtstag in der Liste
                        if (nextBirthday) {
                            const { userID, birthday: { tag, monat } } = nextBirthday;
                            const member = interaction.guild.members.cache.get(userID);
                            if (member) {
                                const formattedTag = tag.toString().padStart(2, '0');
                                const formattedMonat = monat.toString().padStart(2, '0');
                                const formattedDate = `${formattedTag}.${formattedMonat}.`;
                                description += `**Nächster Geburtstag:** ${member} - ${formattedDate}\n\n`;
                            }
                        }
                    }

                    // Die restlichen Geburtstagsmitglieder anzeigen
        for (const birthday of pageBirthdays.slice(1)) {  // Startet bei 1, um den nächsten Geburtstag nicht doppelt anzuzeigen
            const { userID, birthday: { tag, monat } } = birthday;
            const member = interaction.guild.members.cache.get(userID);
            if (!member) continue;

            const formattedTag = tag.toString().padStart(2, '0');
            const formattedMonat = monat.toString().padStart(2, '0');
            const formattedDate = `${formattedTag}.${formattedMonat}.`;

            description += `${member} - ${formattedDate}\n`;
        }

                    const embed = new EmbedBuilder()
                        .setTitle('`🎂` × Geburtstage der Community')
                        .setDescription(description)
                        .setColor('Blurple')
                        .setFooter({ text: `» ${interaction.guild.name} - Seite ${page} von ${totalPages}`, iconURL: `${interaction.guild.iconURL()}` })
                        .setTimestamp();

                    return embed;
                };

                // Function to create pagination buttons
                const createPaginationButtons = (page, totalPages) => {
                    return new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('prev')
                                .setLabel('⬅️ Vorherige Seite')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(page === 1), // Disable button if on first page

                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('➡️ Nächste Seite')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(page === totalPages), // Disable button if on last page
                        );
                };

                // Send the first page
                const embed = createBirthdayEmbed(upcomingBirthdays, currentPage);
                const buttons = createPaginationButtons(currentPage, totalPages);

                const message = await interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });

                // Create interaction collector for button clicks
                const filter = i => ['prev', 'next'].includes(i.customId) && i.user.id === interaction.user.id;
                const collector = message.createMessageComponentCollector({ filter }); //time: 60000

                collector.on('collect', async i => {
                    if (i.customId === 'prev') {
                        currentPage = Math.max(currentPage - 1, 1);
                    } else if (i.customId === 'next') {
                        currentPage = Math.min(currentPage + 1, totalPages);
                    }

                    const updatedEmbed = createBirthdayEmbed(upcomingBirthdays, currentPage);
                    const updatedButtons = createPaginationButtons(currentPage, totalPages);

                    await i.update({ embeds: [updatedEmbed], components: [updatedButtons] });
                });

                collector.on('end', () => {
                    message.edit({ components: [] });
                });

                break;
        }
    },
};

function isValidDate(day, month, year) {
    if (!year) {
        year = 2000; // Ein Schaltjahr, um Datumsprobleme zu vermeiden
    }
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
