const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deny')
        .setDescription('» Lehne einen Vorschlag ab. ❌')
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
                .setAuthor({ name: `Abgelehnt von ${interaction.user.displayName}` })
                .setTitle('» `❌` - VORSCHLAG ABGELEHNT!')
                .setDescription(`${vorschlagEmbed.description}`)
                .setColor('#ff2600')
                .addFields(
                    { name: '`📊` - **Community-Voting**', value: `» IHR habt abgestimmt: \`${thumbsUpCount - 1}\` <a:upvote:1033452503309758525> | <a:downvote:1033452526340673596> \`${thumbsDownCount - 1}\`` },
                    { name: '`❌` - **Status**', value: `» Dieser Vorschlag wurde vom Team abgelehnt.\n**Grund:** \`${grund}\` ` }
                )
                .setThumbnail('https://cdn.discordapp.com/attachments/1145779055644393592/1146793380085518407/abgelehnt.png')
                .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1145779340601213069/WOC_Server_Idee_Abgelehnt.png')

            await msg.edit({ embeds: [editEmbed] });
            await msg.reactions.removeAll()
            await interaction.reply({ content: '> `❌` » Du hast diesen Vorschlag abgelehnt.', ephemeral: true });
        });

    }
}