const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const userDB = require("../../Datenbank/userdb")


module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('description')
        .addSubcommand((command) =>
            command
                .setName('set')
                .setDescription('» Setze deinen Geburtstag. 🎂')
                .addIntegerOption(option => option.setName('tag').setDescription('» An welchen Tag wurdest du geboren?').setRequired(true))
                .addIntegerOption(option => option.setName('monat').setDescription('» In welchen Monat wurdest du geboren?').setRequired(true))
                .addIntegerOption(option => option.setName('jahr').setDescription('» In welchen Jahr wurdest du geboren?').setRequired(false)),
        )
        .addSubcommand((command) =>
            command
                .setName('delete')
                .setDescription('» Lösche den Geburtstag eines Nutzers. 🎂')
                .addUserOption(option => option.setName('user').setDescription('» Welchen Nutzer möchtest du löschen?').setRequired(true)),
        )
        .addSubcommand((command) =>
            command
                .setName('change')
                .setDescription('» Ändere den Geburtstag eines Nutzers. 🎂')
                .addUserOption(option => option.setName('user').setDescription('» Welchen Nutzer möchtest du ändern?').setRequired(true))
                .addIntegerOption(option => option.setName('tag').setDescription('» An welchem Tag wurde der Nutzer geboren?').setRequired(true))
                .addIntegerOption(option => option.setName('monat').setDescription('» In welchem Monat wurde der Nutzer geboren?').setRequired(true))
                .addIntegerOption(option => option.setName('jahr').setDescription('» In welchem Jahr wurde der Nutzer geboren?').setRequired(false)),
        ),

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
                    await interaction.reply({ content: '> `❌` » Es gab einen Fehler beim Speichern deines Geburtstags.', ephemeral: true });
                }
                break;

            case 'delete':
                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                    return interaction.reply({ content: '`❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.', ephemeral: true });
                }

                user = interaction.options.getUser('user');
                if (!user) {
                    return interaction.reply({ content: '`❌` » User wurde nicht gefunden.', ephemeral: true });
                }

                try {
                    await userDB.findOneAndUpdate(
                        { userID: user.id },
                        { $unset: { birthday: '' } }
                    );
                    await interaction.reply({ content: '`✅` » Der Geburtstag wurde gelöscht.', ephemeral: true });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: '`❌` » Es gab einen Fehler beim Löschen des Geburtstags.', ephemeral: true });
                }
                break;

            case 'change':
                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                    return interaction.reply({ content: '`❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.', ephemeral: true });
                }

                user = interaction.options.getUser('user');
                tag = interaction.options.getInteger('tag');
                monat = interaction.options.getInteger('monat');
                jahr = interaction.options.getInteger('jahr');

                if (!user) {
                    return interaction.reply({ content: '`❌` » User wurde nicht gefunden.', ephemeral: true });
                }

                if (!isValidDate(tag, monat, jahr)) {
                    return interaction.reply({ content: '`❌` » Bitte gib ein gültiges Datum ein.', ephemeral: true });
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
                    await interaction.reply({ content: '`✅` » Der Geburtstag wurde geändert.', ephemeral: true });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: '`❌` » Es gab einen Fehler beim Ändern des Geburtstags.', ephemeral: true });
                }
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
