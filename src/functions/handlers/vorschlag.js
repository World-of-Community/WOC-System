const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const vorschlagEmitter = require('../../custom_events/vorschlag');

module.exports = (client) => {
    client.vorschlag = async () => {

        client.on("threadCreate", async (thread) => {
            if (thread.ownerId === "1020023299448786955") return;
        
            const guild = client.guilds.cache.get("815919809379172354");
        
            const channel = await guild.channels.cache.get("1254340245772701747");
            if (channel && channel.id === thread.parentId) {
                const ownerid = thread.ownerId
                const member = await guild.members.fetch(ownerid);
                const message = await thread.fetchStarterMessage();
        
                const tagMap = {
                    '1262860849673142367': '<a:discordbloblove:855482395325890570> `DC-Server`',
                    '1262860327440089158': '<a:wocbook:1178664700469317692> `Website`',
                    '1262758801119907920': '<:Supporter:953359782847332362> `Support-Bot`',
                    '1262758617279369246': '<a:System:915211580805881876> `System-Bot`',
                    '1262759071937859705': '<a:Gift:1263043283555319941> `Gift-Bot`',
                    '1266724906930929709': '<a:MinecraftGrassBlock:872034424181637171> `MC-Server`'
                };
                const tags = thread.appliedTags;
        
                const tagIDMap = tags.map(id => tagMap[id]);
        
                       let matchedTagText = '`❌` - **Tag wurde nicht gefunden**'; 
                       for (const id of tags) {
                           if (tagMap[id]) {
                               matchedTagText = tagMap[id];
                               break; 
                           }
                       }
        
                const thread2 = await channel.threads.create({ name: thread.name, message: { content: `\`⚙️\` - Bitte warten, Ich erfasse die Daten.` }, appliedTags: thread.appliedTags });
        
                const embed = new EmbedBuilder()
                    .setTitle(`\`🔎\` **- ${thread.name}**`)
                    .setDescription(`⠀\n> ${message}\n⠀\n**────────────────────────────**`)
                    .addFields({ name: `\`📚\` - **Kategorie**`, value: `» ${matchedTagText}`, inline: true })
                    .addFields({ name: `\`📊\` - **Nützlich?**`, value: `» Votes: 0 <a:upvote:1008781495055429672>`, inline: true })
                    .addFields({ name: `\`💡\` - **Vorschläge**`, value: `> Erstelle einen Post um deine eigenen Vorschlag einzureichen` })
                    .setThumbnail('https://cdn.discordapp.com/attachments/815983648574275584/1261416102228004944/Idee.png?ex=6692e0ca&is=66918f4a&hm=253aca5718a07aba974d34a6430b06fcff86ecc43932cb449cf59700258482dc&')
                    .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1231909633417936947/WOC_Banner_Server_Idee_Eingereicht.jpg?ex=66925240&is=669100c0&hm=7dcfdfba7b0dffef2fcced49cee11a8c924a5754870a84d8e4ea6438b1fd3550&')
                    .setColor("Orange")
                    .setFooter({ text: "» Eingereicht von " + member.user.username + " » " + member.id, iconURL: member.displayAvatarURL({ dynamic: true })});
        
                const message2 = await thread2.fetchStarterMessage();
                await message2.react("1008781495055429672");
                await message2.react("1008781575644782622");
                await message2.edit({ content: `\`👋\` » Hey ${member}, Ich habe die Idee (**${thread.name}**) für dich eingereicht.`, embeds: [embed] })
                await thread.delete()
            }
        });

        client.on("interactionCreate", async (interaction) => {
            if(interaction.isButton()) {
                if(interaction.customId === "vorschlag_accept") {
                    const modal = new ModalBuilder()
                    .setCustomId("acceptreason")
                    .setTitle("✅ | Akzeptieren");
              
                  const textInputAccept = new TextInputBuilder()
                    .setCustomId("grund")
                    .setLabel("» Grund")
                    .setPlaceholder("Beispiel: Wir haben uns dein Vorschlag...")
                    .setMaxLength(60)
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);
              
              
                  modal.addComponents(new ActionRowBuilder().addComponents(textInputAccept));
              
                  await interaction.showModal(modal).then(async msg => {
                    await interaction.client.once('interactionCreate', async (inter) => {
                        if (inter.customId === 'acceptreason') {
                            const channel = inter.channel
                                    const message = await inter.channel.fetchStarterMessage();
                                    const grund = inter.fields.getTextInputValue("grund")
                                    const vorschlagsembed = message.embeds[0];
    
                                    const embed = new EmbedBuilder()
                                    embed.setAuthor({ name: `» Aktzeptiert von ${inter.member.user.displayName}`, iconURL: inter.member.user.displayAvatarURL(), url: `https://discordapp.com/users/${inter.member.user.id}` })
                                    embed.setTitle(vorschlagsembed.title)
                                    embed.setDescription(vorschlagsembed.description)
                                    embed.addFields({ name: `\`📚\` - **Kategorie**`, value: `» \`${tags}\``, inline: true })
                                    embed.addFields({ name: `\`📊\` - **Nützlich?**`, value: `» Votes: \`${thread.react}\` <a:upvote:1008781495055429672>`, inline: true })
                                    embed.addFields({ name: "`✅` » **Status**", value: `» Dieser Vorschlag wurde vom Team akzeptiert.\nGrund: \`${grund}\`` })
                                    embed.setColor("Green")
                                    embed.setImage('https://cdn.discordapp.com/attachments/815983648574275584/1231909598311616523/WOC_Banner_Server_Idee_Akzeptiert.jpg?ex=6698e9b8&is=66979838&hm=23974e4bb3171d7bd0367898d8c7bddfac270a1610395fd5ea9b524c223f1e06&')
                                    embed.setFooter(vorschlagsembed.footer);
                                    await message.edit({ embeds: [embed], components: [] });
                                
                                    channel.setLocked(true)
                                    vorschlagEmitter.emit('accept', inter);
                                    await inter.reply({ content: "`✅` » Der Vorschlag wurde angenommen", ephemeral: true });
                                }
                            })
                    })
                }
                if(interaction.customId === "vorschlag_edit") {
                    const modal = new ModalBuilder()
                    .setCustomId("editreason")
                    .setTitle("⚙️ | In Planung");
              
                  const textInputAccept = new TextInputBuilder()
                    .setCustomId("grund")
                    .setLabel("» Grund")
                    .setMaxLength(60)
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);
              
              
                  modal.addComponents(new ActionRowBuilder().addComponents(textInputAccept));
        
                  await interaction.showModal(modal).then(async msg => {
                    await interaction.client.once('interactionCreate', async (inter) => {
                        if (inter.customId === 'editreason') {
                            const channel = inter.channel
                                    const message = await inter.channel.fetchStarterMessage();
                                    const grund = inter.fields.getTextInputValue("grund")
                                    const vorschlagsembed = message.embeds[0];
    
                                    const embed = new EmbedBuilder()
                                    embed.setAuthor({ name: `» Bearbeitet von ${inter.member.user.displayName}`, iconURL: inter.member.user.displayAvatarURL(), url: `https://discordapp.com/users/${inter.member.user.id}` })
                                    embed.setTitle(vorschlagsembed.title)
                                    embed.setDescription(vorschlagsembed.description)
                                    embed.addFields({ name: `\`📚\` - **Kategorie**`, value: `» \`${tags}\``, inline: true })
                                    embed.addFields({ name: `\`📊\` - **Nützlich?**`, value: `» Votes: \`${thread.react}\` <a:upvote:1008781495055429672>`, inline: true })
                                    embed.addFields({ name: "`🚧` » **Status**", value: `» Dieser Vorschlag ist bereits in Planung und wird bald umgesetzt.\nGrund: \`${grund}\``})
                                    embed.setColor("Orange")
                                    embed.setImage('https://cdn.discordapp.com/attachments/815983648574275584/1231909673905688618/WOC_Banner_Server_Idee_in_Planung.jpg?ex=6698e9ca&is=6697984a&hm=230bbba748a97a21eed858e66addea033043b4d3ad7beaeda06c19917f5e75c5&')
                                    embed.setFooter(vorschlagsembed.footer);
                                    await message.edit({ embeds: [embed], components: [] });
                                
                                    channel.setLocked(true)
    
                                    await inter.reply({ content: "`✅` » Der Vorschlag wurde in Planung gesetzt.", ephemeral: true });
                                }
                            })
                    })
                }
                if(interaction.customId === "vorschlag_delice") {
                    const modal = new ModalBuilder()
                    .setCustomId("delicereason")
                    .setTitle("❌ | Ablehnen");
              
                  const textInputAccept = new TextInputBuilder()
                    .setCustomId("grund")
                    .setLabel("» Grund")
                    .setPlaceholder("Beispiel: Existiert schon")
                    .setMaxLength(60)
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);
              
              
                  modal.addComponents(new ActionRowBuilder().addComponents(textInputAccept));
              
                  await interaction.showModal(modal).then(async msg => {
                    await interaction.client.once('interactionCreate', async (inter) => {
                        if (inter.customId === 'delicereason') {
                        const channel = inter.channel
                        const message = await inter.channel.fetchStarterMessage();
                        const grund = inter.fields.getTextInputValue("grund")
                        const vorschlagsembed = message.embeds[0];
                    
                        const embed = new EmbedBuilder()
                        .setAuthor({ name: `» Abgelehnt von ${inter.member.user.displayName}`, iconURL: inter.member.user.displayAvatarURL(), url: `https://discordapp.com/users/${inter.member.user.id}`})
                        .setTitle(vorschlagsembed.title)
                        .setDescription(vorschlagsembed.description)
                        .addFields({ name: `\`📚\` - **Kategorie**`, value: `» \`${tags}\``, inline: true })
                        .addFields({ name: `\`📊\` - **Nützlich?**`, value: `» Votes: \`${thread.react}\` <a:upvote:1008781495055429672>`, inline: true })
                        .addFields({ name: "`❌` » **Status**", value: `» Dieser Vorschlag wurde vom Team abgelehnt.\nGrund: \`${grund}\`` })
                        .setColor("Red")
                        .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1231909574089641984/WOC_Banner_Server_Idee_Abgelehnt.jpg?ex=6698e9b2&is=66979832&hm=fa930b40b3a36a9bc40da453d0d5e7ad94ea977d95420e06d8b5ceddb222cf31&')
                        embed.setFooter(vorschlagsembed.footer);
                        await message.edit({ embeds: [embed], components: [] });
                    
                        channel.setLocked(true)
                
                        await inter.reply({ content: "`✅` »  Der Vorschlag wurde abgelehnt", ephemeral: true });
                        }
                    })
                    })
                }
            }
        })

    }
}