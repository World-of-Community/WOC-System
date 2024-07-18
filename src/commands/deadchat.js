const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deadchat')
        .setDescription('» Nennt ein zufälliges Thema worüber ihr im Chat schreiben könnt. 💬'),
        
    async execute(interaction) {
        const fragen = [
            "Was ist dein lieblings fast food Restaurant?",
            "Was ist dein Lieblingsfilm?",
            "Wenn du überall auf der Welt reisen könntest, wohin würdest du gehen?",
            "Was ist dein Lieblingsbuch oder deine Lieblingsfernsehsendung?",
        ];

        const randomfragen = fragen[Math.floor(Math.random() * fragen.length)];

        const fragenEmbed = new EmbedBuilder()
            .setTitle('💬 | __ZUFÄLLIGES THEMA__')
            .setDescription(`Beantworte doch gerne dieses Thema, damit ihr ein Gesprächsthema habt.\n\n> ${randomfragen}\n⠀ ⠀⠀`)
            .setColor('Blurple')
            .setFooter({ text: `» Thema gestartet von ${interaction.user.displayName}`, iconURL: `${interaction.user.displayAvatarURL()}`})
            .setTimestamp();

        await interaction.reply({ content: `<@&1246190426646642698>, der Chat ist inaktiv, kommt doch her und schreibt bisschen!`, embeds: [fragenEmbed] });
    }
}