const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editing')
        .setDescription('» Setze einen Vorschlag in Planung. 🚧')
        .addStringOption(option => option.setName('nachrichtenid').setDescription('Welche Nachricht ist es?').setRequired(true))
        .addStringOption(option => option.setName('grund').setDescription('Gebe einen Grund an').setRequired(true)),
    async execute(interaction) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const msgId = await interaction.options.getString('nachrichtenid');
        const grund = await interaction.options.getString('grund');
        const channel = await interaction.client.channels.cache.get(config.vorschläge);

        if (!channel) return;

        await channel.messages.fetch(`${msgId}`).then(async (msg) => {
            if (!msg) return interaction.reply({ content: '> `❌` » Die Nachricht konnte nicht gefunden werden.', ephemeral: true })
            if (!msg.embeds || msg.embeds.length === 0) return interaction.reply({ content: '> `❌` » Die Nachricht konnte nicht gefunden werden.', ephemeral: true })
            const vorschlagEmbed = msg.embeds[0];
            if (!vorschlagEmbed.fields) return interaction.reply({ content: '> `❌` » Die Nachricht konnte nicht gefunden werden.', ephemeral: true })

            const thumbsUpReactions = await msg.reactions.cache.find(reaction => reaction.emoji.name === 'upvote');
            const thumbsUpCount = thumbsUpReactions ? thumbsUpReactions.users.cache.size : 0;

            const thumbsDownReactions = await msg.reactions.cache.find(reaction => reaction.emoji.name === 'downvote');
            const thumbsDownCount = thumbsDownReactions ? thumbsDownReactions.users.cache.size : 0;

            const editEmbed = new EmbedBuilder()
                .setAuthor({ name: `in Planung von ${interaction.user.displayName}` })
                .setTitle('VORSCHLAG IN PLANUNG!')
                .setDescription(`${vorschlagEmbed.description}`)
                .setColor('#ff6600')
                .addFields(
                    { name: '`📊` - **Community-Voting**', value: `» IHR habt abgestimmt: \`${thumbsUpCount - 1}\` <a:upvote:1033452503309758525> | <a:downvote:1033452526340673596> \`${thumbsDownCount - 1}\`` },
                    { name: '`🚧` - **Status**', value: `» Dieser Vorschlag ist bereits in Planung und wird bald umgesetzt.\n**Grund:** \`${grund}\` ` }
                )
                .setThumbnail('https://cdn.discordapp.com/attachments/1145779055644393592/1146793359231430676/bearbeitung.png')
                .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1165934478028447764/WOC_Banner_Server_Idee_in_Planung.jpg?ex=6548a819&is=65363319&hm=0ecdc4384b7247f1bc07d5b0414690a530da1370739d2e6d1ec3351c1f6f71f0&')

            await msg.edit({ embeds: [editEmbed] });
            await msg.reactions.removeAll()
            await interaction.reply({ content: '> `🚧` » Du hast diesen Vorschlag in Planung genommen.', ephemeral: true });
        });

    }
}