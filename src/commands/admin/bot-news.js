const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const serverdb = require("../../../Datenbank/serverdb");

//Nicht Bearbeiten + ausser wenn eine neue Kategorie hinzugefügt wird!!!
const kategorieMapping = {
    'support': 'support',
    'system': 'system',
    'gift': 'gift',
    'minecraft': 'minecraft',
    'webseite': 'webseite',
    'dc': 'dc'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-news')
        .setDescription('» Füge ein Update hinzu. 🔧')
        
        .addStringOption(option => option.setName('kategorie').setDescription('» Wähle eine Update-Kategorie').setRequired(true)
        .addChoices(
            { name: 'WOC SUPPORT', value: 'support' }, 
            { name: 'WOC SYSTEM', value: 'system' }, 
            { name: 'MINECRAFT', value: 'minecraft' },
            { name: 'WEBSEITE', value: 'webseite' },
            { name: 'DISCORD SERVER', value: 'dc' }
        ))
        
        .addStringOption(option => option.setName('emoji').setDescription('» Wähle ein Update-Emoji').setRequired(true)
        .addChoices({ name: '🔴 = Bug behoben', value: '<:PointRed:1123612255800524940>' }, { name: '🟠 = Änderung', value: '<:PointOrange:1123612277669630092>' }, { name: '🟢 = Neu hinzugefügt', value: '<:PointGreen:1123612318694117477>' }))
        
        .addStringOption(option => option.setName('update').setDescription('» Beschreibe was geändert wurde').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        console.log("Update wurde ins Changelog hinzugefügt")
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);

        if (await serverdb.findOne({ guildID: interaction.guildId, deactivated: { $in: ['changelog'] } })) return channel.send({ content: '> `⛔` » Das Changelog System ist momentan deaktiviert.' })
        const kategorie = await interaction.options.getString('kategorie')
        const emoji = await interaction.options.getString('emoji')
        const update = await interaction.options.getString('update')
        let serverData = await serverdb.findOne({ guildID: interaction.guildId })
        if (!serverData) return;
        const channel = await interaction.client.channels.cache.get(config.changelog)

        if (kategorieMapping[kategorie]) {
            const field = kategorieMapping[kategorie];
            await serverdb.findOneAndUpdate(
                { guildID: interaction.guildId },
                { $push: { [field]: `${emoji} » ${update}` } }
            );
        } else {
            console.log(`Kategorie '${kategorie}' nicht gefunden.`);
        }

        await channel.messages.fetch(serverData.updateMessage).then(async msg => {
            await interaction.reply({ content: '> `⏰` » Die Daten werden verarbeitet das kann kurz dauern.', ephemeral: true })
            setTimeout(async () => {
                serverData = await serverdb.findOne({ guildID: interaction.guildId })
                // Week Date
                const today = new Date();
                const nextWeek = new Date(today);

                nextWeek.setDate(today.getDate() + 6);

                const todayDate = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}`;
                const nextWeekDate = `${nextWeek.getDate().toString().padStart(2, '0')}.${(nextWeek.getMonth() + 1).toString().padStart(2, '0')}`;

                const updateEmbed = new EmbedBuilder()
                    .setTitle(`<a:Neuigkeiten:1018910061348798564> » UPDATE-WOCHENRÜCKBLICK [${serverData.updateWeek}]`)
                    .setDescription('<:PointRed:1123612255800524940> = Bug behoben\n<:PointOrange:1123612277669630092> = Änderung\n<:PointGreen:1123612318694117477> = Neu hinzugefügt\n\n<:Pfeil:1119709908540076124> Diese Nachricht wird mit jeder **neuen Änderung** welche in dieser Woche passiert ist, bearbeitet. Der Ping zu allen Änderungen erfolgt **am Ende jeder Woche.**\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n')
                    .setColor('#ff7b00')
                    .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269340524490260571/WOC_Banner_Update_Wochenruckblick.png?ex=6752863c&is=675134bc&hm=08c53f9fad9610b20a24419719a91b07cce2ff893a785430b0a0dbdd356c245d&')
                    .setFooter({ text: `» Wir wünschen euch viel Spaß mit dem neuen Update! - ${serverData?.updateWeek.split(" - ")[0]}.${today.getFullYear()}`, iconURL: 'https://cdn.discordapp.com/attachments/943859953318371359/1055943224092532846/WOC_Orange.png' })

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

                await serverData.save()
                await interaction.editReply({ content: '> `✅` » Ich habe das Update erfolgreich hinzugefügt.', ephemeral: true })
                const updateChannel = await interaction.guild.channels.cache.get("1051393854328279120")
                await msg.edit({ embeds: [updateEmbed] })
                const message = await updateChannel.send({content: `Neues Changelog Update`})
                setTimeout(() => {
                    message.delete().catch(console.error);
                }, 5000);
            }, 5000);
        })
    }
}