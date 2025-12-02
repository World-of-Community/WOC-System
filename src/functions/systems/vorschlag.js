const { Events, EmbedBuilder, ChannelType, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const vorschlagEmitter = require("../../custom_events/vorschlag");

module.exports = (client) => {
  client.vorschlag = async () => {

    client.on("threadCreate", async (thread) => {
      if (thread.ownerId === "1020023299448786955") {return;}

      const guild = client.guilds.cache.get("815919809379172354");

      const channel = await guild.channels.cache.get("1254340245772701747");
      if (channel && channel.id === thread.parentId) {
        const ownerid = thread.ownerId;
        const member = await guild.members.fetch(ownerid);
        const message = await thread.fetchStarterMessage();

        const tagMap = {
          "1262860849673142367": "<a:discordbloblove:855482395325890570> `DC-Server`",
          "1262860327440089158": "<a:wocbook:1178664700469317692> `Website`",
          "1262758801119907920": "<:Supporter:953359782847332362> `Support-Bot`",
          "1262758617279369246": "<a:System:915211580805881876> `System-Bot`",
          "1262759071937859705": "<a:Gift:1263043283555319941> `Gift-Bot`",
          "1266724906930929709": "<a:MinecraftGrassBlock:872034424181637171> `MC-Server`",
        };
        const tags = thread.appliedTags;
        console.log(tags);

        let matchedTagText = "`❌` - **Tag wurde nicht gefunden**";
        for (const id of tags) {
          if (tagMap[id]) {
            matchedTagText = tagMap[id];
            break;
          }
        }

        const thread2 = await channel.threads.create({ name: thread.name, message: { content: "`⚙️` - Bitte warten, Ich erfasse die Daten." }, appliedTags: thread.appliedTags });

        const embed = new EmbedBuilder()
          .setTitle(`\`🔎\` **- ${thread.name}**`)
          .setDescription(`⠀\n> ${message}\n⠀\n**────────────────────────────**`)
          .addFields({ name: "`📚` - **Kategorie**", value: `» ${matchedTagText}`, inline: true })
          .addFields({ name: "`📊` - **Nützlich?**", value: "» Votes: `0` <a:upvote:1008781495055429672>", inline: true })
          .addFields({ name: "`💡` - **Vorschläge**", value: "> Erstelle einen Post um deine eigenen Vorschlag einzureichen" })
          .setThumbnail("https://cdn.discordapp.com/attachments/1269339944766144574/1269340269246025872/Idee.png?ex=66b4fabf&is=66b3a93f&hm=962b53d930a743aee4a4836af336ae3aa912520db34bf6d1467d73a43fe3b3c0&")
          .setImage("https://cdn.discordapp.com/attachments/1269339771420016722/1269340833887424552/WOC_Banner_Server_Idee_Eingereicht.png?ex=66b4fb46&is=66b3a9c6&hm=ba66896d82bb10487f8e52a294cf2b259de2bfc54bf08bc25a68054496933959&")
          .setColor("Orange")
          .setFooter({ text: "» Eingereicht von " + member.user.username + " » " + member.id, iconURL: member.displayAvatarURL({ dynamic: true })});

        const message2 = await thread2.fetchStarterMessage();
        await message2.react("1008781495055429672");
        await message2.react("1008781575644782622");
        await message2.edit({ content: `\`👋\` » Hey ${member}, Ich habe die Idee (**${thread.name}**) für dich eingereicht.`, embeds: [embed] });
        await thread.delete();
      }
    });
    client.on(Events.MessageReactionAdd, async (reaction, user) => {
      if (user.bot) {return;}
      if (reaction.message.channel.type !== ChannelType.PublicThread) {return;}
      if (reaction.message.channel.parentId !== "1254340245772701747") {return;}
      if (reaction.emoji.id !== "1008781495055429672") {return;}

      const message = reaction.message;
      const embed = message.embeds[0];
      if (!embed) {return;}

      const reactionEmoji = message.reactions.cache.find(r => r.emoji.id === "1008781495055429672");
      if (!reactionEmoji) {return;}

      const upvoteCount = reactionEmoji.count - 1;

      const existingEmbed = EmbedBuilder.from(embed);
      const existingFieldIndex = existingEmbed.data.fields.findIndex(field => field.name === "`📊` - **Nützlich?**");

      if (existingFieldIndex !== -1) {
        const updatedFieldValue = `» Votes: \`${upvoteCount}\` <a:upvote:1008781495055429672>`;

        existingEmbed.data.fields[existingFieldIndex].value = updatedFieldValue;

        const updatedEmbed = new EmbedBuilder()
          .setTitle(existingEmbed.data.title || "")
          .setDescription(existingEmbed.data.description || "")
          .addFields(existingEmbed.data.fields)
          .setThumbnail(existingEmbed.data.thumbnail?.url || "")
          .setImage(existingEmbed.data.image?.url || "")
          .setColor(existingEmbed.data.color || "DEFAULT")
          .setFooter({
            text: existingEmbed.data.footer.text,
            iconURL: existingEmbed.data.footer.icon_url,
          });

        try {
          await message.edit({ embeds: [updatedEmbed] });
        } catch (error) {
          console.error("Fehler beim Bearbeiten der Nachricht:", error);
        }
      }
    });
    client.on(Events.MessageReactionRemove, async (reaction, user) => {
      if (user.bot) {return;}
      if (reaction.message.channel.type !== ChannelType.PublicThread) {return;}
      if (reaction.message.channel.parentId !== "1254340245772701747") {return;}

      if (reaction.emoji.id !== "1008781495055429672") {return;}

      const message = reaction.message;
      const embed = message.embeds[0];
      if (!embed) {return;}

      const reactionEmoji = message.reactions.cache.find(r => r.emoji.id === "1008781495055429672");
      if (!reactionEmoji) {return;}

      const upvoteCount = reactionEmoji.count - 1;

      const existingEmbed = EmbedBuilder.from(embed);
      const existingFieldIndex = existingEmbed.data.fields.findIndex(field => field.name === "`📊` - **Nützlich?**");

      if (existingFieldIndex !== -1) {
        const updatedFieldValue = `» Votes: \`${upvoteCount}\` <a:upvote:1008781495055429672>`;

        existingEmbed.data.fields[existingFieldIndex].value = updatedFieldValue;

        const updatedEmbed = new EmbedBuilder()
          .setTitle(existingEmbed.data.title)
          .setDescription(existingEmbed.data.description)
          .addFields(existingEmbed.data.fields)
          .setThumbnail(existingEmbed.data.thumbnail?.url || "")
          .setImage(existingEmbed.data.image?.url || "")
          .setColor(existingEmbed.data.color)
          .setFooter({
            text: existingEmbed.data.footer.text,
            iconURL: existingEmbed.data.footer.icon_url,
          });

        try {
          await message.edit({ embeds: [updatedEmbed] });
        } catch (error) {
          console.error("Fehler beim Bearbeiten der Nachricht:", error);
        }
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

          await interaction.showModal(modal).then(async () => {
            await interaction.client.once("interactionCreate", async (inter) => {
              if (inter.customId === "acceptreason") {
                const channel = inter.channel;
                const message = await inter.channel.fetchStarterMessage();
                const grund = inter.fields.getTextInputValue("grund");
                const vorschlagsembed = message.embeds[0];

                const currentTags = channel.appliedTags || [];

                if (!currentTags.includes("1262860469836710018")) {
                  currentTags.push("1262860469836710018");
                }

                await channel.setAppliedTags(currentTags);

                const updatedFields = vorschlagsembed.fields.filter(field => field.name !== "`💡` - **Vorschläge**");

                const embed = new EmbedBuilder()
                  .setAuthor({ name: `» Akzeptiert von ${inter.member.user.displayName}`, iconURL: inter.member.user.displayAvatarURL(), url: `https://discordapp.com/users/${inter.member.user.id}` })
                  .setTitle(vorschlagsembed.title)
                  .setDescription(vorschlagsembed.description)
                  .addFields(
                    ...updatedFields,
                    {
                      name: "`✅` » **Status**",
                      value: `» Dieser Vorschlag wurde von unserem Server-Team akzeptiert.\nGrund: \`${grund}\``,
                    },
                  )
                  .setColor("Green")
                  .setThumbnail("https://cdn.discordapp.com/attachments/1269339944766144574/1269340142326513705/akzeptiert.png?ex=66b4faa1&is=66b3a921&hm=de05f1242d66e1bb6aba76b120f69f5fe4afa81def74bc60f3a741d294c4d688&")
                  .setImage("https://cdn.discordapp.com/attachments/1269339771420016722/1269340862265950219/WOC_Banner_Server_Idee_Akzeptiert.png?ex=66b4fb4c&is=66b3a9cc&hm=7ed09aa66a49748f9ae9708fa5750baefcdbdd087545792428ce5095c0c17353&")
                  .setFooter(vorschlagsembed.footer);


                await message.edit({ embeds: [embed], components: [] });

                message.reactions.removeAll();
                channel.setLocked(true);
                vorschlagEmitter.emit("accept", inter);
                const userIDMatch = vorschlagsembed.footer.text.match(/»\s+(\d{17,19})$/);
                const userID = userIDMatch ? userIDMatch[1] : null;
                if (!userID) {
                  console.error("Fehler bei der Verarbeitung des UserIDs: UserID nicht gefunden");
                  return;
                }
                const user = await inter.client.users.fetch(userID);
                if (user) {
                  user.send(
                    `Hey, ${user} » Dein Vorschlag auf **World Of Community** wurde gerade bearbeitet!\n> zum Vorschlag: ${message.url}`,
                  );
                }
                await inter.reply({ content: "`✅` » Der Vorschlag wurde als **angenommen** markiert.", ephemeral: true });
              }
            });
          });
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

          await interaction.showModal(modal).then(async () => {
            await interaction.client.once("interactionCreate", async (inter) => {
              if (inter.customId === "editreason") {
                const channel = inter.channel;
                const message = await inter.channel.fetchStarterMessage();
                const grund = inter.fields.getTextInputValue("grund");
                const vorschlagsembed = message.embeds[0];

                const currentTags = channel.appliedTags || [];

                if (!currentTags.includes("1266798963076501585")) {
                  currentTags.push("1266798963076501585");
                }


                await channel.setAppliedTags(currentTags);

                const updatedFields = vorschlagsembed.fields.filter(field => field.name !== "`💡` - **Vorschläge**");



                const embed = new EmbedBuilder()
                  .setAuthor({ name: `» Bearbeitet von ${inter.member.user.displayName}`, iconURL: inter.member.user.displayAvatarURL(), url: `https://discordapp.com/users/${inter.member.user.id}` })
                  .setTitle(vorschlagsembed.title)
                  .setDescription(vorschlagsembed.description)
                  .addFields(
                    ...updatedFields,
                    {
                      name: "`🚧` » **Status**",
                      value: `» Dieser Vorschlag ist bereits in Planung und wird bald umgesetzt.\nGrund: \`${grund}\``,
                    },
                  )
                  .setColor("Orange")
                  .setThumbnail("https://cdn.discordapp.com/attachments/1269339944766144574/1269340099875835975/bearbeitung.png?ex=66b4fa97&is=66b3a917&hm=d6fa6354b16fa6bc5aa0293d461635fb4fb46cc535e4393d67e506730be358fd&")
                  .setImage("https://cdn.discordapp.com/attachments/1269339771420016722/1269340799674351796/WOC_Banner_Server_Idee_in_Planung.png?ex=66b4fb3d&is=66b3a9bd&hm=42c46c93749ec918420bdfe758b8f8409b86836645671fadbeeb562fb2540a32&")
                  .setFooter(vorschlagsembed.footer);
                await message.edit({ embeds: [embed], components: [] });

                message.reactions.removeAll();
                channel.setLocked(true);
                const userIDMatch = vorschlagsembed.footer.text.match(/»\s+(\d{17,19})$/);
                const userID = userIDMatch ? userIDMatch[1] : null;
                if (!userID) {
                  console.error("Fehler bei der Verarbeitung des UserIDs: UserID nicht gefunden");
                  return;
                }
                const user = await inter.client.users.fetch(userID);
                if (user) {
                  user.send(
                    `Hey, ${user} » Dein Vorschlag auf **World Of Community** wurde gerade bearbeitet!\n> zum Vorschlag: ${message.url}`,
                  );
                }
                await inter.reply({ content: "`✅` » Der Vorschlag wurde als **in Planung** markiert.", ephemeral: true });
              }
            });
          });
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

          await interaction.showModal(modal).then(async () => {
            await interaction.client.once("interactionCreate", async (inter) => {
              if (inter.customId === "delicereason") {
                const channel = inter.channel;
                const message = await inter.channel.fetchStarterMessage();
                const grund = inter.fields.getTextInputValue("grund");
                const vorschlagsembed = message.embeds[0];


                const currentTags = channel.appliedTags || [];

                if (!currentTags.includes("1262860469836710018")) {
                  currentTags.push("1262860469836710018");
                }

                await channel.setAppliedTags(currentTags);
                await channel.setAppliedTags(["1262860945785622731"]);

                const updatedFields = vorschlagsembed.fields.filter(field => field.name !== "`💡` - **Vorschläge**");

                const embed = new EmbedBuilder()
                  .setAuthor({ name: `» Abgelehnt von ${inter.member.user.displayName}`, iconURL: inter.member.user.displayAvatarURL(), url: `https://discordapp.com/users/${inter.member.user.id}`})
                  .setTitle(vorschlagsembed.title)
                  .setDescription(vorschlagsembed.description)
                  .addFields(
                    ...updatedFields,
                    {
                      name: "`❌` » **Status**",
                      value: `» Dieser Vorschlag wurde von unserem Server-Team abgelehnt.\nGrund: \`${grund}\``,
                    },
                  )
                  .setColor("Red")
                  .setThumbnail("https://cdn.discordapp.com/attachments/1269339944766144574/1269339986394878125/abgelehnt.png?ex=66b4fa7b&is=66b3a8fb&hm=59207d85f9b5317312d6d2bd6eba5f79af2f2f62fc9b96babb944cc8d293acc5&")
                  .setImage("https://cdn.discordapp.com/attachments/1269339771420016722/1269340888048341003/WOC_Banner_Server_Idee_Abgelehnt.png?ex=66b4fb52&is=66b3a9d2&hm=443627b29e194bba0081e2443646fb757573a435b40af224b44bf5f6956caccf&")
                  .setFooter(vorschlagsembed.footer);
                await message.edit({ embeds: [embed], components: [] });

                message.reactions.removeAll();
                channel.setLocked(true);

                const userIDMatch = vorschlagsembed.footer.text.match(/»\s+(\d{17,19})$/);
                const userID = userIDMatch ? userIDMatch[1] : null;
                if (!userID) {
                  console.error("Fehler bei der Verarbeitung des UserIDs: UserID nicht gefunden");
                  return;
                }
                const user = await inter.client.users.fetch(userID);
                if (user) {
                  user.send(
                    `Hey, ${user} » Dein Vorschlag auf **World Of Community** wurde gerade bearbeitet!\n> zum Vorschlag: ${message.url}`,
                  );
                }

                await inter.reply({ content: "`✅` »  Der Vorschlag wurde als **Abgelehnt** markiert.", ephemeral: true });
              }
            });
          });
        }
        if(interaction.customId === "vorschlag_duplicate") {
          const channel = interaction.channel;
          const message = await interaction.channel.fetchStarterMessage();
          const vorschlagsembed = message.embeds[0];

          const currentTags = channel.appliedTags || [];

          if (!currentTags.includes("1266798846256746721")) {
            currentTags.push("1266798846256746721");
          }

          await channel.setAppliedTags(currentTags);


          const updatedFields = vorschlagsembed.fields.filter(field => field.name !== "`💡` - **Vorschläge**");

          const embed = new EmbedBuilder()
            .setAuthor({ name: `» Bearbeitet von ${interaction.member.user.displayName}`, iconURL: interaction.member.user.displayAvatarURL(), url: `https://discordapp.com/users/${interaction.member.user.id}` })
            .setTitle(vorschlagsembed.title)
            .setDescription(vorschlagsembed.description)
            .addFields(
              ...updatedFields,
              {
                name: "`🔗` » **Status**",
                value: "» Dieser Vorschlag ist Doppelt und wurde bereits bearbeitet.\nGrund: `Doppelter Vorschlag. Bitte nutze die Suche!`",
              },
            )
            .setColor("Yellow")
            .setThumbnail("https://cdn.discordapp.com/attachments/1269339944766144574/1269340060579270756/link.png?ex=66b4fa8d&is=66b3a90d&hm=e7c7a2b53b0bde6ae01f01d3732cc59132059c8a025286c1f892cbfb7139449c&")
            .setImage("https://cdn.discordapp.com/attachments/1269339771420016722/1269340319288393800/WOC_Banner_Server_Idee_Doppelt.png?ex=66b4facb&is=66b3a94b&hm=8ab1aff62cd7b7ffe20845e056bd3fa6c08b2ed92383d58d98204e2d9ff424c7&")
            .setFooter(vorschlagsembed.footer);


          await message.edit({ embeds: [embed], components: [] });

          message.reactions.removeAll();
          channel.setLocked(true);
          const userIDMatch = vorschlagsembed.footer.text.match(/»\s+(\d{17,19})$/);
          const userID = userIDMatch ? userIDMatch[1] : null;
          if (!userID) {
            console.error("Fehler bei der Verarbeitung des UserIDs: UserID nicht gefunden");
            return;
          }
          const user = await interaction.client.users.fetch(userID);
          if (user) {
            user.send(
              `Hey, ${user} » Dein Vorschlag auf **World Of Community** wurde gerade bearbeitet!\n> zum Vorschlag: ${message.url}`,
            );
          }
          await interaction.reply({ content: "`✅` » Der Vorschlag wurde als **Doppelt** markiert.", ephemeral: true });

        }
      }
    });

  };
};
/*
    const embed1 = new EmbedBuilder()
    .setTitle('`💕`-LICH WILLKOMMEN IM SERVER-IDEEN SYSTEM!')
    .setColor("Orange")
    .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269339874029473825/WOC_Banner_Information_Server_Ideen.png?ex=66b5a321&is=66b451a1&hm=a8a489e834b752151e3221131bef1c4dbaba90ff632902892310d34fc8c5858e&');

    const embed2 = new EmbedBuilder()
    .setTitle('<a:pin:1119708768326914100> - INFORMATIONEN (FAQ)')
    .setColor("Orange")
    .setDescription('» In diesem Kanal kannst du **eigene Posts** für **deine kreative Idee** erstellen, um World Of Community zu unterstützen. Wir bedanken uns bei jeder Idee - ihr helft uns damit enorm! `💕`\n\n> `❓` - **__WIE REICHE ICH EINE SERVER-IDEE EIN?__**\n» Du kannst **zuerst nach deiner Idee suchen**, um zu überprüfen ob Sie jemand schon mal Eingereicht hat. Tippe oben bei der Suche **deine Idee** ein. Wenn du nichts dazu finden kannst, dann füge eine **Beschreibung** hinzu und klicke anschließend auf \"Post\".\n\n> `❓` - **__WELCHEN TAG MUSS ICH WÄHLEN?__**\n» Du musst von deiner Idee oder deinem Vorschlag **einen Tag wählen**. Wähle den Tag, der **deine Idee am besten beschreibt**. Hier sind ein paar Beispiele dazu:\n\n𑁉 **Problem:** `Schreibfehler` | **Tag:** <a:discordbloblove:855482395325890570> `Discord-Server`\n𑁉 **Problem:** `Systemfehler` | **Tag:** <a:MinecraftGrassBlock:872034424181637171> `Minecraft-Server`\n𑁉 **Problem:** `DC-Link abgelaufen` | **Tag:** <a:wocbook:1178664700469317692> `Webseite`\n𑁉 **Problem:** `Bug gefunden` | **Tag:** <a:System:915211580805881876> `WOC-System Bot`\n\n> `📌` - **__SONST NOCH FRAGEN?__**\n» Solltest du noch **Fragen** haben, zögere nicht und Öffne ein Ticket in ⁠<#819555839362072606> und schreibe eine Nachricht mit deinem Anliegen.')
    .setFooter({ text: '» Wir danken jedem für seine einzigartige Idee!', iconURL: 'https://cdn.discordapp.com/attachments/815983648574275584/1202182432506523648/WOC_Orange.png?ex=66a8b123&is=66a75fa3&hm=c1153e75f4971748e8ff2acb4d7f4e86572a2c976bc4661723af16163c0984a6&' })
    .setThumbnail('https://cdn.discordapp.com/attachments/1269339586568388670/1269341245730459749/WOC_Orange.png?ex=66b5a468&is=66b452e8&hm=6849696a3f0e4fe5c35349cbe5d38f6a17c4d83ab03eeabe704f274ede9c7220&');

    const channel = client.channels.cache.get("1254340245772701747")
    channel.threads.create({
      name: 'Einführung & Informationen (FAQ)', message: {  embeds: [embed1, embed2] }, reason: 'Vorschlag System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);
    */
