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
            .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1241282049151860736/WOC_Banner_Bot_Hilfe_Community_Bot.jpg?ex=6649a17e&is=66484ffe&hm=a720ba4c6ae8e4bb457d7a2623ff369ee4e533dd76fdde1ee0dc5982f170053f&')
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
                    .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1241282049151860736/WOC_Banner_Bot_Hilfe_Community_Bot.jpg?ex=6649a17e&is=66484ffe&hm=a720ba4c6ae8e4bb457d7a2623ff369ee4e533dd76fdde1ee0dc5982f170053f&')
                    .setFooter({ text: `${interaction.client.user.displayName} - Bot`,  iconURL: `${interaction.guild.iconURL()}` })
                    .setTimestamp();
                    break;
                case "allgemeine_befehle":
                    updateEmbed = new EmbedBuilder()
                    .setTitle('`📖` » Allgemeine-Befehle (Kategorie) - Hilfe')
                    .setDescription('» Hier findest du alle **Allgemeine-Befehle**, welche dir **nützliche Stats** zeigen.\n\n`🚑` » Öffne bei Fragen oder Problemen ein Ticket im Support.\n\n> `⌛` - `/afk <Status>`\n» Zeige allen das du gerade abwesend (AFK) bist.\n\n> `💖` - `/emoji set <Emoji>`\n» Setze eine Reaktion fest, wenn dich jemand erwähnt.\n\n> `✨` - `/avatar <@User>`\n» Lass dir den Avatar eines Server-Mitglieds anzeigen.\n\n> `👤` - `/user-info <@User>`\n» Zeigt dir paar Informationen über ein User an.\n\n> `💰` - `/donate <@User>`\n» Zeigt dir an, wie viel jemand gespendet hat.\n\n> `🎂` - `/birthday-set`\n» Setze deinen Geburtstag fest und feiere ihn mit uns!\n\n> `⏰` - `/remindme <Zeit> <Erinnerung>`\n» Erinnert dich nach `Zeit` an `Erinnerung`.\n\n> `🧡` - `/serverinfo`\n» Erhalte ein paar Informationen über den Server.\n\n> `🧮` - `/uptime`\n» Zeigt dir an, wie lang dieser Bot schon online ist. inkl. der Latenz')
                    .setColor('Blurple')
                    .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1241282049151860736/WOC_Banner_Bot_Hilfe_Community_Bot.jpg?ex=6649a17e&is=66484ffe&hm=a720ba4c6ae8e4bb457d7a2623ff369ee4e533dd76fdde1ee0dc5982f170053f&')
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