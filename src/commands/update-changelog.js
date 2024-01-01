const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const serverdb = require("../../Datenbank/serverdb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-news-refresh')
        .setDescription('» Aktualisiere das Changelog.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    async execute(interaction) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        if (await serverdb.findOne({ guildID: interaction.guildId, deactivated: { $in: ['changelog'] } })) return channel.send({ content: '> `⛔` » Das Changelog System ist momentan deaktiviert.' })
        var serverData = await serverdb.findOne({ guildID: interaction.guildId })
        if (!serverData) return;
        const channel = await interaction.client.channels.cache.get(config.changelog)
        await channel.messages.fetch(serverData.updateMessage).then(async msg => {
            await interaction.reply({ content: '> `⏰` » Die Daten werden verarbeitet das kann kurz dauern.', ephemeral: true })
            setTimeout(async () => {
                // Week Date
                const today = new Date();
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 6);

                const todayDate = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}`;
                const nextWeekDate = `${nextWeek.getDate().toString().padStart(2, '0')}.${(nextWeek.getMonth() + 1).toString().padStart(2, '0')}`;

                const updateEmbed = new EmbedBuilder()
                    .setTitle(`<a:Neuigkeiten:1018910061348798564> » UPDATE-WOCHENRÜCKBLICK [${serverData.updateWeek}]`)
                    .setDescription(`<:PointRed:1123612255800524940> = Bug behoben\n<:PointOrange:1123612277669630092> = Änderung\n<:PointGreen:1123612318694117477> = Neu hinzugefügt\n\n<:Pfeil:1119709908540076124> Diese Nachricht wird mit jeder **neuen Änderung** welche in dieser Woche passiert ist, bearbeitet. Der Ping zu allen Änderungen erfolgt **am Ende jeder Woche.**\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n`)
                    .setColor('#ff7b00')
                    .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1186716971883049102/WOC_Banner_Update_Wochenruckblick.jpg?ex=6594434e&is=6581ce4e&hm=f324b57bfaa32b34f5f6606623d575e2028f477f730279e99df12d8d601d3273&')
                    .setFooter({ text: `Wir wünschen euch viel Spaß mit dem neuen Update! - ${serverData.updateWeek.split(" - ")[0]}.${today.getFullYear()}`, iconURL: 'https://cdn.discordapp.com/attachments/943859953318371359/1055943224092532846/WOC_Orange.png' })
                    .setTimestamp()

                if (serverData.support.length > 0) {
                    updateEmbed.addFields(
                        {
                            name: '> <:Moderator:873823260507262996> - **WOC`👮`SUPPORT (BOT)** - UPDATE',
                            value: `${serverData.support.join('\n')}`
                        }
                    )
                }
                if (serverData.system.length > 0) {
                    updateEmbed.addFields(
                        {
                            name: '> <a:System:915211580805881876> - **WOC`⚙️`SYSTEM (BOT)** - UPDATE',
                            value: `${serverData.system.join('\n')}`
                        }
                    )
                }
                if (serverData.gift.length > 0) {
                    updateEmbed.addFields(
                        {
                            name: '> <a:Giveaway:968876442618306560> - **WOC`🎁`GIFT (BOT)** - UPDATE',
                            value: `${serverData.gift.join('\n')}\n${emoji} » ${update}\n** **`
                        }
                    )
                }
                if (serverData.verify.length > 0) {
                    updateEmbed.addFields(
                        {
                            name: '> <a:yes_tick:1042831133303386122> - **WOC`✅`VERIFY (BOT)** - UPDATE',
                            value: `${serverData.verify.join('\n')}`
                        }
                    )
                }
                if (serverData.minecraft.length > 0) {
                    updateEmbed.addFields(
                        {
                            name: '> <a:MinecraftGrassBlock:872034424181637171> - **MINECRAFT SERVER** - UPDATE',
                            value: `${serverData.minecraft.join('\n')}`
                        }
                    )
                }
                if (serverData.webseite.length > 0) {
                    updateEmbed.addFields(
                        {
                            name: '> <a:wocbook:1178664700469317692> - **WEBSEITE** - UPDATE',
                            value: `${serverData.webseite.join('\n')}`
                        }
                    )
                }
                if (serverData.dc.length > 0) {
                    updateEmbed.addFields(
                        {
                            name: '> <:Discord:912007935616516098> - **DISCORD SERVER** - UPDATE',
                            value: `${serverData.dc.join('\n')}`
                        }
                    )
                }

                await interaction.editReply({ content: '> `✅` » Ich habe das Changelog erfolgreich aktualisiert.', ephemeral: true })
                await msg.edit({ embeds: [updateEmbed] })
            }, 5000);
        })

    }
}