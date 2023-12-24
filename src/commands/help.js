const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('» Listet dir alle Befehle vom System-Bot auf. 🧡'),
    async execute(interaction) {

        const helpEmbed = new EmbedBuilder()
            .setTitle('`📡` × Community - Hilfe')
            .setDescription('» Hier findest du alle Befehle, welche dir **nützliche Stats** zeigen.\n`🚑` » Öffne bei Fragen oder Problemen ein Ticket im Support.\n\n> `📚` - `/help`\n» Öffnet dieses Hilfe-Menü\n\n> `⌛` - `/afk <Status>`\n» Zeige allen das du gerade abwesend (AFK) bist.\n\n> `💖` - `/emoji set <Emoji>`\n» Setze eine Reaktion fest, wenn dich jemand erwähnt.\n\n> `👤` - `/avatar <@User>`\n» Lass dir den Avatar eines Server-Mitglieds anzeigen.\n\n> `🧡` - `/server`\n» Erhalte ein paar Informationen über den Server\n\n> `🧮` - `/uptime`\n» Zeigt dir an, wie lang dieser Bot schon online ist. inkl. der Latenz\n\n> `✅` - `/verify` (nicht verfügbar)\n» Verifiziere dich mit Discord & Twitch.\n\n> `🤔` - `/ask FRAGE`\n» Frage den magischen Bot etwas.\n\n> `👋` - `/pat`\n» Streichelt ein braves Mitglied des Servers.\n\n> `😑` - `/cringe`\n» Zeig jemanden, das er sich peinlich verhält.\n\n> `🤗` - `/hug`\n» Umarme einen Freund von dir.\n\n> `👊` - `/brofist`\n» Verbünde dich mit deinem Bro.\n\n> `😂` - `/laugh`\n» Lache einen Freund aus. Autsch.')
            .setColor('Blurple')
            .setFooter({ text: 'WOC System - Bot', iconURL: 'https://cdn.discordapp.com/attachments/1145779055644393592/1151073428099575858/WOC_Orange.png' })
            .setTimestamp()
        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    }
}