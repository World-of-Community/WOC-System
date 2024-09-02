const { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder  } = require("discord.js");
const fs = require('fs');
const giveawaydb = require("../../Datenbank/giveawaydb");
const userdb = require("../../Datenbank/userdb");
const serverdb = require("../../Datenbank/serverdb");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        const client = interaction.client;
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        
        if (interaction.customId === 'giveaway-enter') {
            const giveawayData = await giveawaydb.findOne({ msgID: interaction.message.id });
            if (!giveawayData) return await interaction.reply({ content: '> \`❌\` » Das Gewinnspiel existiert nicht.', ephemeral: true });
            if (giveawayData.endTime !== null) return await interaction.reply({ content: '> \`❌\` » Das Gewinnspiel wurde schon beendet!', ephemeral: true });

            const userData = await userdb.findOne({ userID: interaction.user.id });
            const statsData = userData ? userData.stats : null;
            let serverData = await serverdb.findOne({ guildID: interaction.guild.id });

            if (!serverData) {
                const data = new serverdb({
                    guildID: interaction.guild.id,
                    roleBypass: []
                });
                await data.save();
                serverData = await serverdb.findOne({ guildID: interaction.guild.id });
            }

            if (serverData.roleBypass.length > 0) {
                if (serverData.roleBypass.some(roleId => interaction.member.roles.cache.has(roleId))) {
                    if (giveawayData.teilnehmer.includes(interaction.user.id)) {

                        
                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                            .setCustomId('giveaway-leave')
                            .setLabel('» Teilnahme zurückziehen')
                            .setStyle(ButtonStyle.Danger)
                        );
                        return await interaction.reply({ content: '> `❌` » Du nimmst bereits am Gewinnspiel teil!', components: [row], ephemeral: true });
                    }

                    const channel = await interaction.client.channels.fetch(giveawayData.channelID);
                    const giveawayMessage = await channel.messages.fetch(giveawayData.msgID);
                    if (!giveawayMessage) return;

                    await giveawaydb.findOneAndUpdate({ msgID: interaction.message.id }, { $push: { teilnehmer: interaction.user.id } });

                    const updatedGiveawayData = await giveawaydb.findOne({ msgID: interaction.message.id });
                    const embed = interaction.message.embeds[0];
                    const updatedEmbed = new EmbedBuilder()
                        .setColor(embed.color)
                        .setTitle(embed.title)
                        .setDescription(embed.description.includes("** Teilnehmer") ? embed.description.replace(`**${(updatedGiveawayData.teilnehmer.length) - 1}** Teilnehmer`, `**${(updatedGiveawayData.teilnehmer.length)}** Teilnehmer`) : (embed.description.replace("** Gewinner", `** Gewinner\n<:PfeilBlau:1147248395837247613> **${(updatedGiveawayData.teilnehmer.length) - 1}** Teilnehmer`)).replace(`**${(updatedGiveawayData.teilnehmer.length) - 1}** Teilnehmer`, `**${(updatedGiveawayData.teilnehmer.length)}** Teilnehmer`))
                        .setThumbnail('https://cdn.discordapp.com/attachments/1269341729493094400/1271147368787480621/Gift.gif?ex=66ca0e3d&is=66c8bcbd&hm=e34c924d9ee5947c75b485bed384536467c3b974d1bebdcbb602ded06df21b13&');

                    await interaction.message.edit({ embeds: [updatedEmbed] });
                    await interaction.reply({ content: '> `✅` » **Teilnahme erfolgreich**: Ich habe dich erfolgreich als Teilnehmer des Gewinnspiels eingetragen! <a:Gewinnspiel:1148705932231057598>', ephemeral: true });
                    return;
                }
            }

            // Bedingung prüfen
            if (giveawayData.bedingung === 'messages') {
                const msgs = parseInt(giveawayData.bedingungString);
                if (!statsData || msgs > statsData.messages) return await interaction.reply({ content: '> `❌` » Du erfüllst nicht die Bedingungen.', ephemeral: true });
            }

            if (giveawayData.bedingung === 'voiceTime') {
                const voiceTime = parseInt(giveawayData.bedingungString);
                if (!statsData || voiceTime > statsData.voiceTime) return await interaction.reply({ content: '> `❌` » Du erfüllst nicht die Bedingungen.', ephemeral: true });
            }

            if (giveawayData.bedingung === 'role') {
                const role = await interaction.guild.roles.fetch(giveawayData.bedingungString);
                if (!interaction.member.roles.cache.has(role.id)) return await interaction.reply({ content: '> `❌` » Du erfüllst nicht die Bedingungen.', ephemeral: true });
            }

            if (giveawayData.bedingung === 'membersince') {
                const membersince = parseInt(giveawayData.bedingungString);
                const member = await interaction.guild.members.fetch(interaction.user.id);
                const memberJoinTimestamp = member.joinedTimestamp;
                const currentTime = new Date().getTime();

                if (currentTime - memberJoinTimestamp < membersince) {
                    return await interaction.reply({ content: '> `❌` » Du erfüllst nicht die Bedingungen.', ephemeral: true });
                }
            }

            if (giveawayData.teilnehmer.includes(interaction.user.id)) {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                    .setCustomId('giveaway-leave')
                    .setLabel('» Teilnahme zurückziehen')
                    .setStyle(ButtonStyle.Danger)
                );
                return await interaction.reply({ content: '> `❌` » Du nimmst bereits am Gewinnspiel teil!', components: [row], ephemeral: true });
            }

            const channel = await interaction.client.channels.cache.get(giveawayData.channelID);
            const giveawayMessage = await channel.messages.fetch(giveawayData.msgID);
            if (!giveawayMessage) return;

            await giveawaydb.findOneAndUpdate({ msgID: interaction.message.id }, { $push: { teilnehmer: interaction.user.id } });

            const updatedGiveawayData = await giveawaydb.findOne({ msgID: interaction.message.id });
            const embed = interaction.message.embeds[0];
            const updatedEmbed = new EmbedBuilder()
                .setColor(embed.color)
                .setTitle(embed.title)
                .setDescription(embed.description.includes("** Teilnehmer") ? embed.description.replace(`**${(updatedGiveawayData.teilnehmer.length) - 1}** Teilnehmer`, `**${(updatedGiveawayData.teilnehmer.length)}** Teilnehmer`) : (embed.description.replace("** Gewinner", `** Gewinner\n<:PfeilBlau:1147248395837247613> **${(updatedGiveawayData.teilnehmer.length) - 1}** Teilnehmer`)).replace(`**${(updatedGiveawayData.teilnehmer.length) - 1}** Teilnehmer`, `**${(updatedGiveawayData.teilnehmer.length)}** Teilnehmer`))
                .setThumbnail('https://cdn.discordapp.com/attachments/1269341729493094400/1271147368787480621/Gift.gif?ex=66ca0e3d&is=66c8bcbd&hm=e34c924d9ee5947c75b485bed384536467c3b974d1bebdcbb602ded06df21b13&');

            await interaction.message.edit({ content: '<a:Giveaway:968876442618306560><a:Giveaway:968876442618306560> **NEUES EVENT!** <a:Giveaway:968876442618306560><a:Giveaway:968876442618306560>', embeds: [updatedEmbed] });
            await interaction.reply({ content: '> `✅` » **Teilnahme erfolgreich**: Ich habe dich erfolgreich als Teilnehmer des Gewinnspiels eingetragen! <a:Gewinnspiel:1148705932231057598>', ephemeral: true });
        } 

        if(interaction.customId === 'giveaway-leave') {

            const giveawayData = await giveawaydb.findOne({ msgID: message.id });
            if (!giveawayData) return await interaction.editReply({ content: '> `❌` » Das Gewinnspiel existiert nicht.', ephemeral: true });
            
            if (!giveawayData.teilnehmer.includes(user.id)) {
                return await interaction.editReply({ content: '> `❌` » Du nimmst nicht an diesem Gewinnspiel teil!', ephemeral: true });
            }

            await giveawaydb.findOneAndUpdate({ msgID: message.id }, { $pull: { teilnehmer: user.id } });

            const updatedGiveawayData = await giveawaydb.findOne({ msgID: message.id });
            const embed = message.embeds[0];
            const updatedEmbed = new EmbedBuilder()
                .setColor(embed.color)
                .setTitle(embed.title)
                .setDescription(embed.description.includes("** Teilnehmer") ? embed.description.replace(`**${(updatedGiveawayData.teilnehmer.length) + 1}** Teilnehmer`, `**${(updatedGiveawayData.teilnehmer.length)}** Teilnehmer`) : (embed.description.replace("** Gewinner", `** Gewinner\n<:PfeilBlau:1147248395837247613> **${(updatedGiveawayData.teilnehmer.length) + 1}** Teilnehmer`)).replace(`**${(updatedGiveawayData.teilnehmer.length) + 1}** Teilnehmer`, `**${(updatedGiveawayData.teilnehmer.length)}** Teilnehmer`))
                .setThumbnail('https://cdn.discordapp.com/attachments/1269341729493094400/1271147368787480621/Gift.gif?ex=66ca0e3d&is=66c8bcbd&hm=e34c924d9ee5947c75b485bed384536467c3b974d1bebdcbb602ded06df21b13&');

            await message.edit({ embeds: [updatedEmbed] });

            await interaction.editReply({ content: '> `✅` » Du hast erfolgreich das Gewinnspiel verlassen!', ephemeral: true });

        }
    }
};
