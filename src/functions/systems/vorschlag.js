const { Events, EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
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
                console.log(tags)
        
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
                    .addFields({ name: `\`📊\` - **Nützlich?**`, value: `» Votes: \`0\` <a:upvote:1008781495055429672>`, inline: true })
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
        client.on(Events.MessageReactionAdd, async (reaction, user) => {
            if (user.bot) return;
            if (reaction.message.channel.type !== ChannelType.PublicThread) return;
            if (reaction.message.channel.parentId !== "1254340245772701747") return;
        
            const emojiId = reaction.emoji.id;
            if (reaction.emoji.id !== "1008781495055429672") return
        
            const message = reaction.message;
            const embed = message.embeds[0];
            if (!embed) return
        
            const reactionEmoji = message.reactions.cache.find(r => r.emoji.id === "1008781495055429672");
            if (!reactionEmoji) return
        
            const upvoteCount = reactionEmoji.count - 1;
        
            const existingEmbed = EmbedBuilder.from(embed);
            const existingFieldIndex = existingEmbed.data.fields.findIndex(field => field.name === '`📊` - **Nützlich?**');
            
            if (existingFieldIndex !== -1) {
                const fieldValue = existingEmbed.data.fields[existingFieldIndex].value;
                const updatedFieldValue = `» Votes: \`${upvoteCount}\` <a:upvote:1008781495055429672>`;
        
                existingEmbed.data.fields[existingFieldIndex].value = updatedFieldValue;

                const updatedEmbed = new EmbedBuilder()
                    .setTitle(existingEmbed.data.title || '')
                    .setDescription(existingEmbed.data.description || '') 
                    .addFields(existingEmbed.data.fields) 
                    .setThumbnail(existingEmbed.data.thumbnail?.url || '') 
                    .setImage(existingEmbed.data.image?.url || '') 
                    .setColor(existingEmbed.data.color || 'DEFAULT')
                    .setFooter({
                        text: existingEmbed.data.footer.text,
                        iconURL: existingEmbed.data.footer.icon_url
                    });
        
                try {
                    await message.edit({ embeds: [updatedEmbed] });
                } catch (error) {
                    console.error("Fehler beim Bearbeiten der Nachricht:", error);
                }
            } else {
            }
        });
        client.on(Events.MessageReactionRemove, async (reaction, user) => {
            if (user.bot) return;
            if (reaction.message.channel.type !== ChannelType.PublicThread) return;
            if (reaction.message.channel.parentId !== "1254340245772701747") return;
        
            const emojiId = reaction.emoji.id;
            if (reaction.emoji.id !== "1008781495055429672") return
        
            const message = reaction.message;
            const embed = message.embeds[0];
            if (!embed) return
        
            const reactionEmoji = message.reactions.cache.find(r => r.emoji.id === "1008781495055429672");
            if (!reactionEmoji) return
        
            const upvoteCount = reactionEmoji.count - 1;
        
            const existingEmbed = EmbedBuilder.from(embed);
            const existingFieldIndex = existingEmbed.data.fields.findIndex(field => field.name === '`📊` - **Nützlich?**');
            
            if (existingFieldIndex !== -1) {
                const fieldValue = existingEmbed.data.fields[existingFieldIndex].value;
                const updatedFieldValue = `» Votes: \`${upvoteCount}\` <a:upvote:1008781495055429672>`;
        
                existingEmbed.data.fields[existingFieldIndex].value = updatedFieldValue;

                const updatedEmbed = new EmbedBuilder()
                    .setTitle(existingEmbed.data.title)
                    .setDescription(existingEmbed.data.description) 
                    .addFields(existingEmbed.data.fields) 
                    .setThumbnail(existingEmbed.data.thumbnail?.url || '') 
                    .setImage(existingEmbed.data.image?.url || '') 
                    .setColor(existingEmbed.data.color)
                    .setFooter({
                        text: existingEmbed.data.footer.text,
                        iconURL: existingEmbed.data.footer.icon_url
                    });
        
                try {
                    await message.edit({ embeds: [updatedEmbed] });
                } catch (error) {
                    console.error("Fehler beim Bearbeiten der Nachricht:", error);
                }
            } else {
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

                                    const currentTags = channel.appliedTags || [];

                                    if (!currentTags.includes("1262860469836710018")) {
                                        currentTags.push("1262860469836710018");
                                    }
                        
                                    await channel.setAppliedTags(currentTags);
    
                                    const updatedFields = vorschlagsembed.fields.filter(field => field.name !== '`💡` - **Vorschläge**');
                                    
                                    const embed = new EmbedBuilder()
                                    .setAuthor({ name: `» Akzeptiert von ${inter.member.user.displayName}`, iconURL: inter.member.user.displayAvatarURL(), url: `https://discordapp.com/users/${inter.member.user.id}` })
                                    .setTitle(vorschlagsembed.title)
                                    .setDescription(vorschlagsembed.description)
                                    .addFields(
                                        ...updatedFields,
                                        { 
                                            name: "`✅` » **Status**", 
                                            value: `» Dieser Vorschlag wurde von unserem Server-Team akzeptiert.\nGrund: \`${grund}\`` 
                                        }
                                    )
                                    .setColor("Green")
                                    .setThumbnail('https://cdn.discordapp.com/attachments/815983648574275584/1266797786519834815/akzeptiert.png?ex=66a674e0&is=66a52360&hm=c3d4fbd4e80070d4a858eee6d938117126b1eb6a516e43de61921b11d5068c1b&')
                                    .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1231909598311616523/WOC_Banner_Server_Idee_Akzeptiert.jpg?ex=6698e9b8&is=66979838&hm=23974e4bb3171d7bd0367898d8c7bddfac270a1610395fd5ea9b524c223f1e06&')
                                    .setFooter(vorschlagsembed.footer);

                                    
                                    await message.edit({ embeds: [embed], components: [] });
                                
                                    message.reactions.removeAll();
                                    channel.setLocked(true)
                                    vorschlagEmitter.emit('accept', inter);
                                    const userIDMatch = vorschlagsembed.footer.text.match(/»\s+(\d{17,19})$/);
                                    const userID = userIDMatch ? userIDMatch[1] : null;
                                    if (!userID) {
                                      console.error("Fehler bei der Verarbeitung des UserIDs:", err);
                                      return;
                                    }
                                    const user = await inter.client.users.fetch(userID);
                                    if (user) {
                                      user.send(
                                        `Hey, ${user} » Dein Vorschlag auf **World Of Community** wurde gerade bearbeitet!\n> zum Vorschlag: ${message.url}`
                                      );
                                    }
                                    await inter.reply({ content: "`✅` » Der Vorschlag wurde als angenommen markiert.", ephemeral: true });
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
    
                                        const currentTags = channel.appliedTags || [];

                                        if (!currentTags.includes("1266798963076501585")) {
                                            currentTags.push("1266798963076501585");
                                        }

                     
                                        await channel.setAppliedTags(currentTags);

                                    const updatedFields = vorschlagsembed.fields.filter(field => field.name !== '`💡` - **Vorschläge**');



                                    const embed = new EmbedBuilder()
                                    .setAuthor({ name: `» Bearbeitet von ${inter.member.user.displayName}`, iconURL: inter.member.user.displayAvatarURL(), url: `https://discordapp.com/users/${inter.member.user.id}` })
                                    .setTitle(vorschlagsembed.title)
                                    .setDescription(vorschlagsembed.description)
                                    .addFields(
                                        ...updatedFields,
                                        { 
                                            name: "`🚧` » **Status**", 
                                            value: `» Dieser Vorschlag ist bereits in Planung und wird bald umgesetzt.\nGrund: \`${grund}\`` 
                                        }
                                    )
                                    .setColor("Orange")
                                    .setThumbnail('https://cdn.discordapp.com/attachments/815983648574275584/1266798100521947186/bearbeitung.png?ex=66a6752b&is=66a523ab&hm=82c961bae0798cdc88b878c80913c9ee536d882f2105df9dd7b613d7c8d20c4f&')
                                    .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1231909673905688618/WOC_Banner_Server_Idee_in_Planung.jpg?ex=6698e9ca&is=6697984a&hm=230bbba748a97a21eed858e66addea033043b4d3ad7beaeda06c19917f5e75c5&')
                                    .setFooter(vorschlagsembed.footer);
                                    await message.edit({ embeds: [embed], components: [] });
                                
                                    message.reactions.removeAll();
                                    channel.setLocked(true)
                                    const userIDMatch = vorschlagsembed.footer.text.match(/»\s+(\d{17,19})$/);
                                    const userID = userIDMatch ? userIDMatch[1] : null;
                                    if (!userID) {
                                      console.error("Fehler bei der Verarbeitung des UserIDs:", err);
                                      return;
                                    }
                                    const user = await inter.client.users.fetch(userID);
                                    if (user) {
                                      user.send(
                                        `Hey, ${user} » Dein Vorschlag auf **World Of Community** wurde gerade bearbeitet!\n> zum Vorschlag: ${message.url}`
                                      );
                                    }
                                    await inter.reply({ content: "`✅` » Der Vorschlag wurde als in Planung markiert.", ephemeral: true });
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
                    

                        const currentTags = channel.appliedTags || [];

                        if (!currentTags.includes("1262860469836710018")) {
                            currentTags.push("1262860469836710018");
                        }
            
                        await channel.setAppliedTags(currentTags);
                        await channel.setAppliedTags(["1262860945785622731"]); 

                        const updatedFields = vorschlagsembed.fields.filter(field => field.name !== '`💡` - **Vorschläge**');

                        const embed = new EmbedBuilder()
                        .setAuthor({ name: `» Abgelehnt von ${inter.member.user.displayName}`, iconURL: inter.member.user.displayAvatarURL(), url: `https://discordapp.com/users/${inter.member.user.id}`})
                        .setTitle(vorschlagsembed.title)
                        .setDescription(vorschlagsembed.description)
                        .addFields(
                            ...updatedFields,
                            { 
                                name: "`❌` » **Status**", 
                                value: `» Dieser Vorschlag wurde von unserem Server-Team abgelehnt.\nGrund: \`${grund}\`` 
                            }
                        )
                        .setColor("Red")
                        .setThumbnail('https://cdn.discordapp.com/attachments/815983648574275584/1266798151205916823/abgelehnt.png?ex=66a67537&is=66a523b7&hm=0865929b95ab2108a36a74b83941b319b9606da537cff4aa27caca412b986513&')
                        .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1231909574089641984/WOC_Banner_Server_Idee_Abgelehnt.jpg?ex=6698e9b2&is=66979832&hm=fa930b40b3a36a9bc40da453d0d5e7ad94ea977d95420e06d8b5ceddb222cf31&')
                        .setFooter(vorschlagsembed.footer);
                        await message.edit({ embeds: [embed], components: [] });
                    
                        message.reactions.removeAll();
                        channel.setLocked(true)

                        const userIDMatch = vorschlagsembed.footer.text.match(/»\s+(\d{17,19})$/);
                        const userID = userIDMatch ? userIDMatch[1] : null;
                        if (!userID) {
                          console.error("Fehler bei der Verarbeitung des UserIDs:", err);
                          return;
                        }
                        const user = await inter.client.users.fetch(userID);
                        if (user) {
                          user.send(
                            `Hey, ${user} » Dein Vorschlag auf **World Of Community** wurde gerade bearbeitet!\n> zum Vorschlag: ${message.url}`
                          );
                        }

                        await inter.reply({ content: "`✅` »  Der Vorschlag wurde als Abgelehnt markiert.", ephemeral: true });
                        }
                    })
                    })
                }
                if(interaction.customId === "vorschlag_duplicate") {
                    const channel = interaction.channel
                    const message = await interaction.channel.fetchStarterMessage();
                    const vorschlagsembed = message.embeds[0];

                    const currentTags = channel.appliedTags || [];

                    if (!currentTags.includes("1266798846256746721")) {
                        currentTags.push("1266798846256746721");
                    }
        
                    await channel.setAppliedTags(currentTags);


                    const updatedFields = vorschlagsembed.fields.filter(field => field.name !== '`💡` - **Vorschläge**');
                                    
                    const embed = new EmbedBuilder()
                    .setAuthor({ name: `» Bearbeitet von ${interaction.member.user.displayName}`, iconURL: interaction.member.user.displayAvatarURL(), url: `https://discordapp.com/users/${interaction.member.user.id}` })
                    .setTitle(vorschlagsembed.title)
                    .setDescription(vorschlagsembed.description)
                    .addFields(
                        ...updatedFields,
                        { 
                            name: "`🔗` » **Status**",
                            value: `» Dieser Vorschlag ist Doppelt und wurde bereits bearbeitet.\nGrund: \`Doppelter Vorschlag. Bitte nutze die Suche!\`` 
                        }
                    )
                    .setColor("Yellow")
                    .setThumbnail('https://cdn.discordapp.com/attachments/815983648574275584/1266798125348294850/link.png?ex=66a67531&is=66a523b1&hm=baf103511bbc0bdce38ad867f2e5788d71422302a427917a33ed43bca3c36dcc&')
                    .setImage('https://cdn.discordapp.com/attachments/967522063944392704/1266802824151564339/WOC_Banner_Server_Idee_Doppelt.jpg?ex=66a67991&is=66a52811&hm=df4bbf126d07e3ed0e6defcbaf650ccaad10aa4b6d9e7b6d282b0831c29be6ea&')
                    .setFooter(vorschlagsembed.footer);

                    
                    await message.edit({ embeds: [embed], components: [] });
                
                    message.reactions.removeAll();
                    channel.setLocked(true)
                    const userIDMatch = vorschlagsembed.footer.text.match(/»\s+(\d{17,19})$/);
                    const userID = userIDMatch ? userIDMatch[1] : null;
                    if (!userID) {
                      console.error("Fehler bei der Verarbeitung des UserIDs:", err);
                      return;
                    }
                    const user = await interaction.client.users.fetch(userID);
                    if (user) {
                      user.send(
                        `Hey, ${user} » Dein Vorschlag auf **World Of Community** wurde gerade bearbeitet!\n> zum Vorschlag: ${message.url}`
                      );
                    }
                    await interaction.reply({ content: "`✅` » Der Vorschlag wurde als Doppelt markiert.", ephemeral: true });

                }
            }
        })

    }
}


    /*const embed1 = new EmbedBuilder()
    .setTitle('`💕`-LICH WILLKOMMEN IM SERVER-IDEEN SYSTEM!')
    .setColor("Orange")
    .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1267143224351391834/WOC_Banner_Information_Server_Ideen.jpg?ex=66a85f57&is=66a70dd7&hm=cf7ada30ad821db52bcdacd6dd8db274c328ec9ea4a44002a7b7e8c66f9ebce0');

    const embed2 = new EmbedBuilder()
    .setTitle('<a:pin:1119708768326914100> - INFORMATIONEN (FAQ)')
    .setColor("Orange")
    .setDescription('» In diesem Kanal kannst du eigene **Posts (Threads)** für **deine kreative Idee** erstellen, um World Of Community zu unterstützen. Wir bedanken uns bei jeder Idee - ihr helft uns damit enorm! `❤️`\n\n> ❓ - **WIE REICHE ICH EINE SERVER-IDEE EIN?**\n» Wichtig ist es zu aller Erst, **nach deiner Idee zu suchen** - um zu überprüfen, ob jemand bereits diese Idee eingereicht hat. Tippe oben bei der Suche **deine Idee** ein. Wenn du nichts finden konntest, dann füge eine **Beschreibung** hinzu und drücke anschließend auf "Post".\n\n> ❓ - **WELCHE TAGS MUSS ICH WÄHLEN?**\n» Abhängig von deiner Idee oder deinem Vorschlag musst du **einen Tag wählen**. Wähle den Tag, der deine Idee am besten beschreibt. Hier sind ein paar Anwendungsbeispiele:\n\n𑁉 **Problem:** `Schreibfehler` | **Tag:** <a:discordbloblove:855482395325890570> `Discord-Server`\n𑁉 **Problem:** `DC-Link veraltet` | **Tag:** <a:wocbook:1178664700469317692> `Webseite`\n𑁉 **Problem:** `Bug gefunden` | **Tag:** <a:System:915211580805881876> `WOC-System Bot`\n\n> :pushpin: - **SONST NOCH FRAGEN?**\n» Solltest du noch **Fragen** haben, zögere nicht und Öffne ein Ticket \nin <#819555839362072606> und schreibe eine Nachricht mit deinem Anliegen.')
    .setFooter({ text: '» Wir danken jedem für seine einzigartige Idee!', iconURL: 'https://cdn.discordapp.com/attachments/815983648574275584/1202182432506523648/WOC_Orange.png?ex=66a8b123&is=66a75fa3&hm=c1153e75f4971748e8ff2acb4d7f4e86572a2c976bc4661723af16163c0984a6&' })
    .setThumbnail('https://cdn.discordapp.com/attachments/815983648574275584/1202182432506523648/WOC_Orange.png?ex=66a8b123&is=66a75fa3&hm=c1153e75f4971748e8ff2acb4d7f4e86572a2c976bc4661723af16163c0984a6&');

    const channel = client.channels.cache.get("1254340245772701747")
    await channel.threads.create({
      name: '👋 - Einführung & Informationen (FAQ)', message: {  embeds: [embed1, embed2] }, reason: 'Vorschlag System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);
    */