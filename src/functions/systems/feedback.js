const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    client.feedback = async () => {

        client.on("threadCreate", async (thread) => {
            if (thread.ownerId === "1020023299448786955") return; // Exclude specific thread owner ID

            const guild = client.guilds.cache.get("815919809379172354");
            const channel = await guild.channels.cache.get("1254340245772701747");

            if (channel && channel.id === thread.parentId) {
                const ownerId = thread.ownerId;
                const member = await guild.members.fetch(ownerId);
                const message = await thread.fetchStarterMessage();

                // Define tag map
                const tagMap = {
                    '1262860849673142367': '<a:discordbloblove:855482395325890570> `DC-Server`',
                    '1262860327440089158': '<a:wocbook:1178664700469317692> `Website`',
                    '1262758801119907920': '<:Supporter:953359782847332362> `Support-Bot`',
                    '1262758617279369246': '<a:System:915211580805881876> `System-Bot`',
                    '1262759071937859705': '<a:Gift:1263043283555319941> `Gift-Bot`',
                    '1266724906930929709': '<a:MinecraftGrassBlock:872034424181637171> `MC-Server`'
                };

                // Match tags
                const tags = thread.appliedTags;
                let matchedTagText = '`❌` - **Tag wurde nicht gefunden**';

                for (const id of tags) {
                    if (tagMap[id]) {
                        matchedTagText = tagMap[id];
                        break;
                    }
                }

                // Create a new thread in the channel
                const thread2 = await channel.threads.create({
                    name: thread.name,
                    message: { content: `\`⚙️\` - Bitte warten, Ich erfasse die Daten.` },
                    appliedTags: thread.appliedTags
                });

                // Create the feedback embed
                const embed = new EmbedBuilder()
                    .setTitle(`\`🔎\` **- ${thread.name}**`)
                    .setDescription(`⠀\n> ${message}\n⠀\n**────────────────────────────**`)
                    .addFields({ name: `\`📚\` - **Kategorie**`, value: `» ${matchedTagText}`, inline: true })
                    .addFields({ name: `\`📊\` - **Nützlich?**`, value: `» Votes: \`0\` <a:upvote:1008781495055429672>`, inline: true })
                    .addFields({ name: `\`💡\` - **Feedback**`, value: `> Erstelle einen Post, um dein Feedback abzugeben` })
                    .setThumbnail('https://cdn.discordapp.com/attachments/1269339944766144574/1269340269246025872/Idee.png?ex=66b4fabf&is=66b3a93f&hm=962b53d930a743aee4a4836af336ae3aa912520db34bf6d1467d73a43fe3b3c0&')
                    .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269340833887424552/WOC_Banner_Server_Idee_Eingereicht.png?ex=66b4fb46&is=66b3a9c6&hm=ba66896d82bb10487f8e52a294cf2b259de2bfc54bf08bc25a68054496933959&')
                    .setColor("Orange")
                    .setFooter({ text: `» Eingereicht von ${member.user.username} » ${member.id}`, iconURL: member.displayAvatarURL({ dynamic: true }) });

                // Edit the starter message and add reactions
                const message2 = await thread2.fetchStarterMessage();
                await message2.react("1008781495055429672");
                await message2.react("1008781575644782622");
                await message2.edit({ content: `\`👋\` » Hey ${member}, Ich habe die Idee (**${thread.name}**) für dich eingereicht.`, embeds: [embed] });

                // Delete the original thread
                await thread.delete();
            }
        });
        const { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = (client) => {
    client.feedback = async () => {

        // Event, wenn ein neuer Thread erstellt wird
        client.on("threadCreate", async (thread) => {
            // Überprüfen, ob der Thread von einem bestimmten Benutzer kommt, um bestimmte Threads zu ignorieren
            if (thread.ownerId === "1020023299448786955") return;

            const guild = client.guilds.cache.get("815919809379172354");
            const channel = await guild.channels.cache.get("1254340245772701747");
            
            // Sicherstellen, dass der Thread im richtigen Channel erstellt wurde
            if (channel && channel.id === thread.parentId) {
                const ownerid = thread.ownerId;
                const member = await guild.members.fetch(ownerid);
                const message = await thread.fetchStarterMessage();

                // Kategorisierungen von Feedbacks
                const categoryMap = {
                    '1262860849673142367': '<a:discordbloblove:855482395325890570> `DC-Server`',
                    '1262860327440089158': '<a:wocbook:1178664700469317692> `Website`',
                    '1262758801119907920': '<:Supporter:953359782847332362> `Support-Bot`',
                    '1262758617279369246': '<a:System:915211580805881876> `System-Bot`',
                    '1262759071937859705': '<a:Gift:1263043283555319941> `Gift-Bot`',
                    '1266724906930929709': '<a:MinecraftGrassBlock:872034424181637171> `MC-Server`'
                };

                // Holen der Tags des Threads
                const tags = thread.appliedTags;
                let matchedTagText = '`❌` - **Tag wurde nicht gefunden**';

                // Überprüfen, welches Tag angewendet wurde
                for (const id of tags) {
                    if (categoryMap[id]) {
                        matchedTagText = categoryMap[id];
                        break;
                    }
                }

                // Neuen Thread im Feedback-Channel erstellen
                const thread2 = await channel.threads.create({ 
                    name: thread.name, 
                    message: { content: `\`⚙️\` - Bitte warten, Ich erfasse die Daten.` }, 
                    appliedTags: thread.appliedTags 
                });

                // Erstellen des Embed für das Feedback
                const embed = new EmbedBuilder()
                    .setTitle(`\`🔎\` **- ${thread.name}**`)
                    .setDescription(`⠀\n> ${message}\n⠀\n**────────────────────────────**`)
                    .addFields({ name: `\`📚\` - **Kategorie**`, value: `» ${matchedTagText}`, inline: true })
                    .addFields({ name: `\`📊\` - **Nützlich?**`, value: `» Votes: \`0\` <a:upvote:1008781495055429672>`, inline: true })
                    .addFields({ name: `\`💡\` - **Feedback einreichen**`, value: `> Erstelle einen Post, um dein eigenes Feedback einzureichen` })
                    .setThumbnail('https://cdn.discordapp.com/attachments/1269339944766144574/1269340269246025872/Idee.png')
                    .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269340833887424552/WOC_Banner_Server_Idee_Eingereicht.png')
                    .setColor("Orange")
                    .setFooter({ text: "» Eingereicht von " + member.user.username + " » " + member.id, iconURL: member.displayAvatarURL({ dynamic: true }) });

                // Feedback-Message bearbeiten und Button für Upvote/Downvote hinzufügen
                const message2 = await thread2.fetchStarterMessage();
                await message2.react("1008781495055429672");
                await message2.react("1008781575644782622");
                await message2.edit({ content: `\`👋\` » Hey ${member}, Ich habe dein Feedback (**${thread.name}**) für dich eingereicht.`, embeds: [embed] });

                // Thread löschen, da das Feedback jetzt verarbeitet wurde
                await thread.delete();
            }
        });

        // Event, um das Feedback zu verwalten und interaktiv zu machen (z.B. Upvote/Downvote)
        client.on('messageReactionAdd', async (reaction, user) => {
            if (reaction.emoji.name === '✅' || reaction.emoji.name === '❌') {
                const thread = await reaction.message.fetchThread();
                if (!thread) return;

                // Zähler für das Feedback aktualisieren
                const embed = reaction.message.embeds[0];
                let votes = embed.fields.find(f => f.name === '`📊` - **Nützlich?**').value;
                const currentVotes = parseInt(votes.split('`')[1]);
                
                // Je nach Reaktion die Anzahl der Stimmen aktualisieren
                if (reaction.emoji.name === '✅') {
                    votes = `» Votes: \`${currentVotes + 1}\` <a:upvote:1008781495055429672>`;
                } else if (reaction.emoji.name === '❌') {
                    votes = `» Votes: \`${currentVotes - 1}\` <a:downvote:1008781575644782622>`;
                }

                // Das Embed mit der neuen Stimmenanzahl bearbeiten
                await reaction.message.edit({
                    embeds: [embed.setFields({ name: '`📊` - **Nützlich?**', value: votes, inline: true })]
                });
            }
        });
    };
}
    };
};


    const embed1 = new EmbedBuilder()
    .setTitle('`💕`-LICH WILLKOMMEN IM FEEDBACK SYSTEM!')
    .setColor("Aqua")
    .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1280172685694996572/WOC_Banner_Information_Feedback.jpg?ex=6793a3b8&is=67925238&hm=ca17eef329f5fb72c4fb315aa57f96fdb84e4776d7288ed39c2476af4b8934e2&');

    const embed2 = new EmbedBuilder()
    .setTitle('<a:pin:1119708768326914100> - INFORMATIONEN (FAQ)')
    .setColor("Aqua")
    .setDescription('» In diesem Kanal kannst du **eigene Posts** für **dein Feedback** erstellen, um World Of Community zu unterstützen. Wir bedanken uns bei jedem Feedback - ihr helft uns damit enorm! `💕`\n\n> `❓` - **__WIE REICHE ICH EIN FEEDBACK EIN?__**\n» Tippe oben auf "Neuer Post" ein. Füge dann eine **Beschreibung** hinzu und klicke anschließend auf \"Post\".\n\n> `❓` - **__WELCHEN TAG MUSS ICH WÄHLEN?__**\n» Du musst von deiner Idee oder deinem Vorschlag **einen Tag wählen**. Wähle den Tag, der **deine Idee am besten beschreibt**. Hier sind ein paar Beispiele dazu:\n\n𑁉 **Info:** `Team-Info` | **Tag:** <:Team:915212337860968481> `Feedback zum Team`\n𑁉 **Info:** `Server` | **Tag:** <:WOC_Orange:1019565644041166869> `Feedback zum Server`\n𑁉 **Info:** `Support-Team` | **Tag:** <:Supporter:953359782847332362> `Feedback zum Support`\n\n> `📌` - **__SONST NOCH FRAGEN?__**\n» Solltest du noch **Fragen** haben, zögere nicht und Öffne ein Ticket in ⁠<#819555839362072606> und schreibe eine Nachricht mit deinem Anliegen.')
    .setFooter({ text: '» Wir danken jedem für sein Feedback!', iconURL: 'https://cdn.discordapp.com/attachments/815983648574275584/1202182432506523648/WOC_Orange.png?ex=66a8b123&is=66a75fa3&hm=c1153e75f4971748e8ff2acb4d7f4e86572a2c976bc4661723af16163c0984a6&' })
    .setThumbnail('https://cdn.discordapp.com/attachments/1269339586568388670/1269341245730459749/WOC_Orange.png?ex=66b5a468&is=66b452e8&hm=6849696a3f0e4fe5c35349cbe5d38f6a17c4d83ab03eeabe704f274ede9c7220&');

    const channel = client.channels.cache.get("1275350879054200943")
    channel.threads.create({
      name: 'Einführung & Informationen (FAQ)', message: {  embeds: [embed1, embed2] }, reason: 'Feedback System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);
    
