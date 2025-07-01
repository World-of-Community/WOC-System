const { Client, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('» Listet dir alle Befehle vom System-Bot auf. 🧡'),
        
    async execute(interaction) {

        const helpEmbed = new EmbedBuilder()
            .setTitle('`📡` × Community - Hilfe')
            .setDescription('» Hier findest du alle **Befehle**, erfahre mehr über\nWorld Of Community oder schau dir **nützliche Stats** an.\n\n`🚑` » Öffne bei Fragen oder Problemen ein Ticket im Support.')
            .setColor('Orange')
            .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269340406043381937/WOC_Banner_Bot_Hilfe_Community_Bot.png?ex=66b4fae0&is=66b3a960&hm=087cd6850d21387d5b583343abefc277ba95bcd6b058f0fe34bde5c7491432e5&')
            .setFooter({ text: `${interaction.client.user.displayName} - Bot`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp()

        const helpSelectMenü = new StringSelectMenuBuilder()
            .setCustomId('befehl_kategorie')
            .setPlaceholder('📚 » Wähle eine Kategorie.')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                  .setLabel("× Fun-Befehle")
                  .setDescription(`» Hier siehst du alle Fun-Befehle. 😎`)
                  .setEmoji("😎")
                  .setValue("fun_befehle"),
                new StringSelectMenuOptionBuilder()
                  .setLabel("× Allgemeine-Befehle")
                  .setDescription(`» Hier siehst du alle Allgemeine-Befehle. 📖`)
                  .setEmoji("📖")
                  .setValue("allgemeine_befehle"),
            )

        const row = new ActionRowBuilder().addComponents(helpSelectMenü);
        await interaction.reply({ embeds: [helpEmbed], components: [row], ephemeral: true });


            const filter = i => i.customId === 'befehl_kategorie' && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            const selectedValue = i.values[0];
            let updateEmbed;
            switch (selectedValue) {
                case "fun_befehle":
                    updateEmbed = new EmbedBuilder()
                    .setTitle("`😎` » Fun-Befehle (Kategorie) - Hilfe")
                    .setDescription('» Hier findest du alle unterhaltsamen **Fun-Befehle**, welche jederzeit verwendet werden können zum Spaß.\n\n`🚑` » Öffne bei Fragen oder Problemen ein Ticket im Support.\n`📌` » Du musst bei jedem Befehl einen User **erwähnen!**\n\n> `🤔` - `/ask FRAGE`\n» Frage den magischen Bot etwas.\n\n> `👋` - `/pat`\n» Streichelt ein braves Mitglied des Servers.\n\n> `😑` - `/cringe`\n» Zeig jemanden, das er sich peinlich verhält.\n\n> `🤗` - `/hug`\n» Umarme einen Freund von dir.\n\n> `👊` - `/brofist`\n» Verbünde dich mit deinem Bro.\n\n> `😂` - `/laugh`\n» Lache einen Freund aus. Autsch.')
                    .setColor("Orange")
                    .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269340406043381937/WOC_Banner_Bot_Hilfe_Community_Bot.png?ex=66b4fae0&is=66b3a960&hm=087cd6850d21387d5b583343abefc277ba95bcd6b058f0fe34bde5c7491432e5&')
                    .setFooter({ text: `${interaction.client.user.displayName} - Bot`,  iconURL: `${interaction.guild.iconURL()}` })
                    .setTimestamp();
                    break;
                case "allgemeine_befehle":
                    updateEmbed = new EmbedBuilder()
                    .setTitle('`📖` » Allgemeine-Befehle (Kategorie) - Hilfe')
                    .setDescription('» Hier findest du alle **Allgemeine-Befehle**, welche dir **nützliche Stats** zeigen.\n\n`🚑` » Öffne bei Fragen oder Problemen ein Ticket im Support.\n\n> `⌛` - `/afk <Status>`\n» Zeige allen das du gerade abwesend (AFK) bist.\n\n> `💖` - `/emoji set <Emoji>`\n» Setze eine Reaktion fest, wenn dich jemand erwähnt.\n\n> `✨` - `/avatar <@User>`\n» Lass dir den Avatar eines Server-Mitglieds anzeigen.\n\n> `🎮` - `/game <Rolle>`\n» Finde deinen Spielpartner mit einer bestimmten Rolle.\n\n> `⚽` - `/club-profil`\n» Zeigt Informationen zu einem Fußballclub.\n\n> `🪙` - `/daily`\n» Hole dir deine tägliche Belohnung.\n\n> `🪙` - `/daily-leaderboard`\n» Zeigt das Coins-Top 10 Leaderboard an.\n\n> `😎` - `/emojiquiz help`\n» Zeigt dir eine Anleitung zum Emojiquiz.\n\n> `❗` - `/report <@User>`\n» Melde einen User der sich nicht an die Server-Regeln hält.\n\n> `👤` - `/profil <@User>`\n» Zeigt dir nützliche Stats über einen Account.\n\n> `💰` - `/donated <@User>`\n» Zeigt dir an, wie viel jemand gespendet hat.\n\n> `🪙` - `/coins <@User>`\n» Zeigt die aktuellen Coins eines Benutzers an.\n\n> `🎂` - `/birthday-set`\n» Setze deinen Geburtstag fest und feiere ihn mit uns!\n\n> `👑` - `/erfolginfo`\n» Zeigt dir deinen Fortschritt bei den Server-Erfolgen an.\n\n> `⏰` - `/remindme <Zeit> <Erinnerung>`\n» Erinnert dich nach `Zeit` an `Erinnerung`.\n\n> `🧡` - `/serverinfo`\n» Erhalte ein paar Informationen über den Server.\n\n> `💬` - `/deadchat`\n» Nennt ein zufälliges Thema worüber ihr im Chat schreiben könnt.\n\n> `🧮` - `/uptime`\n» Zeigt dir an, wie lang dieser Bot schon online ist. inkl. der Latenz')
                    .setColor('Blurple')
                    .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269340406043381937/WOC_Banner_Bot_Hilfe_Community_Bot.png?ex=66b4fae0&is=66b3a960&hm=087cd6850d21387d5b583343abefc277ba95bcd6b058f0fe34bde5c7491432e5&')
                    .setFooter({ text: `${interaction.client.user.displayName} - Bot`, iconURL: `${interaction.guild.iconURL()}` })
                    .setTimestamp();
                    break;
                default:
                    break;
            }
            i.update({ embeds: [updateEmbed], components: [row] });
        });
    }
}