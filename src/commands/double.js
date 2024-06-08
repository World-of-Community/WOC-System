const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('double')
        .setDescription('» Setzt ein Vorschlag doppelt. 🔗')
        .addStringOption(option => option.setName('nachrichtenid').setDescription('» Welche Nachricht ist es?').setRequired(true))
        .addStringOption(option => option.setName('grund').setDescription('» Gebe einen Grund an').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);

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
                .setAuthor({ name: `Bearbeitet von ${interaction.user.displayName}` })
                .setTitle('» `🔗` - VORSCHLAG DOPPELT!')
                .setDescription(`${vorschlagEmbed.description}`)
                .setColor('Grey')
                .addFields(
                    { name: '`📊` - **Community-Voting**', value: `» IHR habt abgestimmt: \`${thumbsUpCount - 1}\` <a:upvote:1033452503309758525> | <a:downvote:1033452526340673596> \`${thumbsDownCount - 1}\`` },
                    { name: '`📌` - **Status**', value: `» Dieser Vorschlag ist Doppelt und wurde bereits bearbeitet.\n**Grund:** \`${grund}\` ` }
                )
                .setThumbnail('https://cdn.discordapp.com/attachments/815983648574275584/1232290821575933992/link.png?ex=6628ebc2&is=66279a42&hm=f16a5b3c6340c7e5e6bc96a2edf640e044917be461769be1786a4f3230d2f3d2&')
                .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1248917052270575647/WOC_Banner_Server_Idee_Doppelt.jpg?ex=66656825&is=666416a5&hm=6617e6f1923270b547c84cb9cd2f7be0c99275184e821eca96954f26d7624ebe&')
                .setFooter(vorschlagEmbed.footer)

            await msg.edit({ embeds: [editEmbed] });
            await msg.reactions.removeAll()
            await interaction.reply({ content: '> `❌` » Du hast diesen Vorschlag Abgelehnt, da er schon mal Vorgeschlagen wurde.', ephemeral: true });
        });
    }
}