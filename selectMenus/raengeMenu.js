import { EmbedBuilder } from "discord.js";

export default {
  id: "ränge-menu",
  run: async (client, interaction) => {
    switch (interaction.values[0]) {
      case "server": {
        const year = await interaction.guild.roles.cache.get("972193356333604874");
        const roleCountY = year.members.size;

        const informant = await interaction.guild.roles.cache.get("1147250265641201724");
        const roleCountI = informant.members.size;

        const umfrage = await interaction.guild.roles.cache.get("1147250982967836823");
        const roleCountU = umfrage.members.size;

        const SDES = await interaction.guild.roles.cache.get("992008555987222548");
        const roleCountSDES = SDES.members.size;

        const christmas2021 = await interaction.guild.roles.cache.get("863034801036591114");
        const roleCountC2021 = christmas2021.members.size;

        const advent2024 = await interaction.guild.roles.cache.get("1312780135530889326");
        const roleCountadvent2024 = advent2024.members.size;

        const christmas2025 = await interaction.guild.roles.cache.get("1445064222894460970");
        const roleCountC2025 = christmas2025.members.size;

        const advent2025 = await interaction.guild.roles.cache.get("1442140220182106184");
        const roleCountadvent2025 = advent2025.members.size;

        const lucky = await interaction.guild.roles.cache.get("1124598019862573096");
        const roleCountlucky = lucky.members.size;

        const serverEST = await interaction.guild.roles.cache.get("882240367632744508");
        const roleCountSEST = serverEST.members.size;

        const serverEmbed = new EmbedBuilder()
          .setTitle("<a:trophe:1112823561992818859> 𑁉 UNSERE SERVER-ERFOLGE")
          .setDescription(
            "» Mit **Erfolgen** kannst du **vor deinen Freunden** angeben und hast die Chance, in unserem Server **einzigartige Erfolge freizuschalten!**\n\n" +
                        `\`🧡\` 𑁉 <@&972193356333604874> (\`${roleCountY}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> Mitglied seit **einem Jahr** auf dem Server.\n\n" +
                        `\`💡\` 𑁉 <@&1147250265641201724> (\`${roleCountI}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> Reiche **10 Server-Ideen** ein.\n\n" +
                        `\`📢\` 𑁉 <@&1147250982967836823> (\`${roleCountU}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> Nimm an **20 Server-Umfragen** teil.\n\n" +
                        `\`💚\` 𑁉 <@&992008555987222548> (\`${roleCountSDES}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> **Seit 2021** auf World Of Community\n\n" +
                        `\`🎄\` 𑁉 <@&863034801036591114> (\`${roleCountC2021}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> Exklusiv an **Weihnachten 2021** erhalten\n\n" +
                        `\`📆\` 𑁉 <@&1312780135530889326> (\`${roleCountadvent2024}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> Beim **Adventskalender 2024** erhalten\n\n" +
                        `\`🎄\` 𑁉 <@&1445064222894460970> (\`${roleCountC2025}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> Exklusiv an **Weihnachten 2025** erhalten\n\n" +
                        `\`📆\` 𑁉 <@&1442140220182106184> (\`${roleCountadvent2025}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> Beim **Adventskalender 2025** erhalten\n\n" +
                        `\`☘️\` 𑁉 <@&1124598019862573096> (\`${roleCountlucky}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> **Gewinne** bei einem Event auf WOC.\n\n" +
                        `\`🔓\` 𑁉 <@&882240367632744508> (\`${roleCountSEST}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> War bei der **Server-Eröffnung 2021** dabei.",
          )
          .setColor("Orange")
          .setImage("https://cdn.discordapp.com/attachments/1145779055644393592/1190736340531302450/WOC_Banner_Unsere_Server_Erfolge.jpg?ex=65ac1d22&is=6599a822&hm=48316e7dc0ac8328953f6fcb6685bc2f1fbf53f286de7f8f864258a6ca81af85&")
          .setFooter({ text: "Öffne ein Ticket im Support bei Fragen oder Problemen.", iconURL: "https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png" })
          .setTimestamp();
        await interaction.reply({ embeds: [serverEmbed], ephemeral: true });
      } break;

      case "minecraft": {
        const supreme = await interaction.guild.roles.cache.get("815921105407574056");
        const roleCountsupreme = supreme.members.size;

        const premium = await interaction.guild.roles.cache.get("917826787977871441");
        const roleCountpremium = premium.members.size;

        const legende = await interaction.guild.roles.cache.get("815920452337139733");
        const roleCountlegende = legende.members.size;

        const emerald = await interaction.guild.roles.cache.get("835775556611997697");
        const roleCountemerald = emerald.members.size;

        const diamond = await interaction.guild.roles.cache.get("835775627721179167");
        const roleCountdiamond = diamond.members.size;

        const episch = await interaction.guild.roles.cache.get("835775597446955048");
        const roleCountepisch = episch.members.size;

        const spielerEmbed = new EmbedBuilder()
          .setTitle("`🌍` 𑁉 UNSERE MINECRAFT-RÄNGE")
          .setDescription(
            "» Erhalte diese Ränge auf dem Discord-& Minecraft Server.\n\n" +
                        `> \`🌟\` 𑁉 <@&815921105407574056> (\`${roleCountsupreme}👥\`)\n` +
                        "<:PfeilBlau:1119711275014955080> Doppelsprung.\n\n" +
                        `> \`⭐\` 𑁉 <@&917826787977871441> (\`${roleCountpremium}👥\`)\n` +
                        "<:PfeilBlau:1119711275014955080> Doppelsprung\n\n" +
                        `> \`🔮\` 𑁉 <@&815920452337139733> (\`${roleCountlegende}👥\`)\n` +
                        "<:PfeilBlau:1119711275014955080> Doppelsprung\n\n" +
                        `> \`💎\` 𑁉 <@&835775627721179167> (\`${roleCountdiamond}👥\`)\n` +
                        "<:PfeilBlau:1119711275014955080> Doppelsprung\n\n" +
                        `> \`👻\` 𑁉 <@&835775556611997697> (\`${roleCountemerald}👥\`)\n` +
                        "<:PfeilBlau:1119711275014955080> Doppelsprung\n\n" +
                        `> \`🟣\` 𑁉 <@&835775597446955048> (\`${roleCountepisch}👥\`)\n` +
                        "<:PfeilBlau:1119711275014955080> Bald Verfügbar.",
          )
          .setColor("Green")
          .setImage("https://cdn.discordapp.com/attachments/1269339771420016722/1269340189336010757/WOC_Banner_Minecraft_Range.png?ex=66b4faac&is=66b3a92c&hm=dbde292175421ce18da1a067f1a5e164b65d5f23b12911bfc57b509f723c&")
          .setFooter({ text: "Öffne ein Ticket im Support bei Fragen oder Problemen.", iconURL: "https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png" })
          .setTimestamp();
        await interaction.reply({ embeds: [spielerEmbed], ephemeral: true });
      } break;

      case "level": {
        const hyperaktiv = await interaction.guild.roles.cache.get("1258825307239219371");
        const roleCounthyperaktiv = hyperaktiv.members.size;

        const ultraaktiv = await interaction.guild.roles.cache.get("1258794321533075526");
        const roleCountultraaktiv = ultraaktiv.members.size;

        const extremaktiv = await interaction.guild.roles.cache.get("1258825144697360485");
        const roleCountextremaktiv = extremaktiv.members.size;

        const megaaktiv = await interaction.guild.roles.cache.get("1258794405507240038");
        const roleCountmegaaktiv = megaaktiv.members.size;

        const starkaktiv = await interaction.guild.roles.cache.get("1258827956634128467");
        const roleCountstarkaktiv = starkaktiv.members.size;

        const sehraktiv = await interaction.guild.roles.cache.get("1258794479570124920");
        const roleCountsehraktiv = sehraktiv.members.size;

        const aktiv = await interaction.guild.roles.cache.get("1258794944953319534");
        const roleCountaktiv = aktiv.members.size;

        const inaktiv = await interaction.guild.roles.cache.get("1258827226846199808");
        const roleCountinaktiv = inaktiv.members.size;

        const levelEmbed = new EmbedBuilder()
          .setTitle("`👥` 𑁉 UNSERE LEVEL-ROLLEN")
          .setDescription(
            "» Chatte mit **anderen Server-Mitgliedern** oder **unterhalte dich** in unseren Sprachkanälen um **die folgenden Rollen** freizuschalten.\n\n" +
                        `> \`☢️\` 𑁉 <@&1258825307239219371> (\`${roleCounthyperaktiv}👥\`)\n` +
                        "<:PfeilBlau:1119711275014955080> Wir schenken dir einmal <a:basic:1186636165567229972> **DISCORD NITRO BASIC!** <a:basic:1186636165567229972>\n\n" +
                        `> \`🤩\` 𑁉 <@&1258794321533075526> (\`${roleCountultraaktiv}👥\`)\n` +
                        "<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich **jemand erwähnt!**\n\n" +
                        `> \`⚡️\` 𑁉 <@&1258825144697360485> (\`${roleCountextremaktiv}👥\`)\n` +
                        "<:PfeilBlau:1119711275014955080> **Eine eigene Rolle:** Name + Farbe selbst wählbar!\n\n" +
                        `> \`🥊\` 𑁉 <@&1258794405507240038> (\`${roleCountmegaaktiv}👥\`)\n` +
                        "<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n" +
                        `> \`💪\` 𑁉 <@&1258827956634128467> (\`${roleCountstarkaktiv}👥\`)\n` +
                        "<:PfeilBlau:1119711275014955080> **Schreibrechte** erhalten in den Kanal: <#1243964646449483788>\n\n" +
                        `> \`👀\` 𑁉 <@&1258794479570124920> (\`${roleCountsehraktiv}👥\`)\n` +
                        "<:PfeilBlau:1119711275014955080> **Umfragen** in **öffentliche** Chats posten\n\n" +
                        `> \`🏃\` 𑁉 <@&1258794944953319534> (\`${roleCountaktiv}👥\`)\n` +
                        "<:PfeilBlau:1119711275014955080> **Dateien** hochladen & **Nicknamen** verändern.\n\n" +
                        `> \`💤\` 𑁉 <@&1258827226846199808> (\`${roleCountinaktiv}👥\`)\n` +
                        "<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden",
          )
          .setColor("Orange")
          .setImage("https://cdn.discordapp.com/attachments/1269339771420016722/1269340226862452896/WOC_Banner_Levelsystem.png?ex=66b4fab5&is=66b3a935&hm=56c41f63e7f2cb41f0fbb42cd8423b6f03e05e310af8afba5e7eb7f7437d7a3f&")
          .setFooter({ text: "Öffne ein Ticket im Support bei Fragen oder Problemen.", iconURL: "https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png" })
          .setTimestamp();
        await interaction.reply({ embeds: [levelEmbed], ephemeral: true });
      } break;

      case "exklusiv": {
        const vip = await interaction.guild.roles.cache.get("862708375698538507");
        const roleCountvip = vip.members.size;

        const booster = await interaction.guild.roles.cache.get("843013551605284864");
        const roleCountbooster = booster.members.size;

        const creator = await interaction.guild.roles.cache.get("815920219247214644");
        const roleCountcreator = creator.members.size;

        //const twitchsub = await interaction.guild.roles.cache.get('1067899186542018571')
        //const roleCounttwitchsub = twitchsub.members.size

        const neuesmitglied = await interaction.guild.roles.cache.get("1222122625594294272");
        const roleCountneuesmitglied = neuesmitglied.members.size;

        const birthday = await interaction.guild.roles.cache.get("1244945910262399046");
        const roleCountbirthday = birthday.members.size;

        const unterstützer = await interaction.guild.roles.cache.get("1010105569866174574");
        const roleCountunterstützer = unterstützer.members.size;

        const exklusiveEmbed = new EmbedBuilder()
          .setTitle("<a:krone:1112823594649665607> 𑁉 EXKLUSIVE ROLLEN FREISCHALTEN")
          .setDescription(
            "» Alle **Rollen in dieser Liste** kannst du nur auf ganz **bestimmer Art und Weise** erhalten, dennoch haben sie **mächtige Vorteile.**\n\n" +
                        `> \`🔮\` 𑁉 <@&843013551605284864> (\`${roleCountbooster}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> **Rang freischalten:** Booste diesen Server!\n\n" +
                        "<:PfeilBlau:1119711275014955080> **Exklusive Community-Vorteile** für Booster.\n" +
                        "<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n" +
                        "<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n" +
                        "<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n" +
                        `> \`😎\` 𑁉 <@&862708375698538507> (\`${roleCountvip}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> **Rang freischalten:** Dieser Rang wird von uns individuell vergeben.\n\n" +
                        "<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n" +
                        "<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n" +
                        "<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n" +
                        `> \`🎥\` 𑁉 <@&815920219247214644> (\`${roleCountcreator}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> **Rang freischalten:** Dieser Rang wird von uns individuell vergeben.\n\n" +
                        "<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n" +
                        "<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n" +
                        "<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n" +
                        `> \`👋\` 𑁉 <@&1222122625594294272> (\`${roleCountneuesmitglied}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> **Rang freischalten:** Erhält jeder für 24 Stunden nach Beitritt!\n\n" +
                        "<:PfeilBlau:1119711275014955080> Eine **auffallende & besondere** Chat-Farbe & **höher gelistet!**\n\n" +
                        `> \`🎂\` 𑁉 <@&1244945910262399046> (\`${roleCountbirthday}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> **Rang freischalten:** Heute Geburtstag feiern!\n\n" +
                        "<:PfeilBlau:1119711275014955080> Eine **auffallende & besondere** Chat-Farbe & **höher gelistet!**\n" +
                        "<:PfeilBlau:1119711275014955080> **Zugriff** auf <#1243964646449483788>\n\n" +
                        `> \`💛\` 𑁉 <@&1010105569866174574> (\`${roleCountunterstützer}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> **Rang freischalten:** im Status `discord.gg/woc` schreiben!\n\n" +
                        "<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n" +
                        "<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!",
          )
          .setColor("DarkBlue")
          .setImage("https://cdn.discordapp.com/attachments/1145779055644393592/1181732753243381870/WOC_Banner_Exklusive_Rollen.jpg?ex=65949663&is=65822163&hm=72a1632efc783e7be7d34cfc055637a1e344e9b56fd0e6f051b89fd60da868d1&")
          .setFooter({ text: "Öffne ein Ticket im Support bei Fragen oder Problemen.", iconURL: "https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png" })
          .setTimestamp();
        await interaction.reply({ embeds: [exklusiveEmbed], ephemeral: true });
      } break;

      case "team": {
        async function getMemberList(roleID) {
          let liste = "";
          const role = interaction.guild.roles.cache.find((r) => r.id === roleID);
          const rolemember = role.members;
          rolemember.forEach(async element => {
            liste += `<@${element.user.id}> , `;
          });
          if (liste.length === 0) { return "Niemand"; }
          return liste.slice(0, -2);
        }
        const admin = await interaction.guild.roles.cache.get("959869691529154631");
        const roleCountadmin = admin.members.size;

        const developer = await interaction.guild.roles.cache.get("929349039433056276");
        const roleCountdeveloper = developer.members.size;

        const srmoderator = await interaction.guild.roles.cache.get("816985466230145044");
        const roleCountsrmoderator = srmoderator.members.size;

        const moderator = await interaction.guild.roles.cache.get("815920052385480754");
        const roleCountmoderator = moderator.members.size;

        const supporter = await interaction.guild.roles.cache.get("815920170371383366");
        const roleCountsupporter = supporter.members.size;

        const builder = await interaction.guild.roles.cache.get("1263645368441241700");
        const roleCountbuilder = builder.members.size;

        const teamEmbed = new EmbedBuilder()
          .setTitle("<a:security:1119708496670232646> 𑁉 UNSER SERVER-TEAM")
          .setDescription(
            "» Hier kannst du alle **unsere Team-Ränge** sehen und welche User **aktuell in unserem Server-Team** tätig sind.\n\n" +
                        `> \`🎯\` 𑁉 <@&959869691529154631> (\`${roleCountadmin}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> **Aufgabe:** Die Administration kümmert sich um die ganze Server-Verwaltung, die Organisation und um die Umsetzung neuer Ideen.\n" +
                        `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(admin.id)}\n\n` +
                        `> \`👨‍💻\` 𑁉 <@&929349039433056276> (\`${roleCountdeveloper}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> **Aufgabe:** Die Developer/Entwickler kümmern sich um die Entwicklung unserer Bots sowie Plugins und helfen der Administrator bei der technischen Umsetzung.\n" +
                        `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(developer.id)}\n\n` +
                        `> \`🕵\` 𑁉 <@&816985466230145044> (\`${roleCountsrmoderator}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> **Aufgabe:** Die Senior-Mod's sind erfahrene Moderatoren und kümmern sich um die Pflege des Support-Teams. Sie agieren als eine Art von \"Mentor\" und führen neue Teammitglieder ein.\n" +
                        `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(srmoderator.id)}\n\n` +
                        `> \`👮\` 𑁉 <@&815920052385480754> (\`${roleCountmoderator}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> **Aufgabe:** Die Mod's sind wichtige Bestandteile des Teams. Sie kümmern sich um Tickets, Moderation und administrieren kleinere Elemente (wie das Bann-System & Geburtstag ändern).\n" +
                        `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(moderator.id)}\n\n` +
                        `> \`🧩\` 𑁉 <@&815920170371383366> (\`${roleCountsupporter}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> **Aufgabe:** Die Supporter sind neu in unserem Team. Sie kümmern sich um Support-Tickets, moderieren den Chat und gewöhnen sich ein.\n" +
                        `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(supporter.id)}\n\n` +
                        `> \`🪓\` 𑁉 <@&1263645368441241700> (\`${roleCountbuilder}👥\`)\n` +
                        "<:Pfeil:1119709908540076124> **Aufgabe:** Neue Maps für die jeweiligen Spielmodi Bauen sowie Lobby & bei den anderen Builder unter die Arme greifen\n" +
                        `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(builder.id)}`,
          )
          .setColor("Red")
          .setImage("https://cdn.discordapp.com/attachments/1145779055644393592/1181732690458837083/WOC_Banner_Unser_Server-Team.jpg?ex=65949654&is=65822154&hm=4a077c7d4e3975ee38617cb9b3de6aa8fe7861c9e45c8c3665b2f9b50e045786&")
          .setFooter({ text: "Öffne ein Ticket im Support bei Fragen oder Problemen.", iconURL: "https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png" })
          .setTimestamp();
        await interaction.reply({ embeds: [teamEmbed], ephemeral: true });
      } break;

      case "bot": {
        const botEmbed = new EmbedBuilder()
          .setTitle("<a:pin:1119708768326914100> 𑁉 UNSERE WICHTIGSTEN BOTS")
          .setDescription(
            "» Hier könnt ihr sehen **welche Aufgaben** unsere **wichtigsten Bots** haben, die speziell **von uns entwickelt** wurden.\n\n" +
                        "> `⚙️` 𑁉 <@1020023299448786955> (Eingeführt am `15.09.2022📝`)\n" +
                        "<:Pfeil:1119709908540076124> **Aufgabe:** Die Aufgaben dieses Bots sind sehr vielfältig. Wir listen euch einmal die größten Dinge auf.\n\n" +
                        "<:PfeilBlau:1119711275014955080> **Info-& Stats-Kanäle aktuell halten**\n" +
                        "<:PfeilBlau:1119711275014955080> **Ideen-, Spielersuche-& Changelog-System**\n" +
                        "<:PfeilBlau:1119711275014955080> **Bewerbungs-& Rollen-Verwaltung**\n" +
                        "<:PfeilBlau:1119711275014955080> **Verwaltung der Gewinnspiele**\n\n" +
                        "> `🚑` 𑁉 <@1031487336783028274> (Tickets bearbeitet: `10.000+🎫`)\n" +
                        "<:Pfeil:1119709908540076124> **Aufgabe:** Erstellung, Verwaltung und Organisierung von Tickets.\n\n" +
                        "> <a:pin:1119708768326914100> 𑁉 **DIE RESTLICHEN BOTS...**\n" +
                        "<:Pfeil:1119709908540076124> **Aufgaben:** Die restlichen Bots erfüllen nur noch kleine Aufgaben oder werden bald durch einen eigenen Bot von uns ersetzt.",
          )
          .setColor("Aqua")
          .setImage("https://cdn.discordapp.com/attachments/1145779055644393592/1181732786554540183/WOC_Banner_Discord_Bots.jpg?ex=6594966b&is=6582216b&hm=e036aa4455500313ff188c610bdbc1981f0190d78f5e6cde9490b91ad56ecec1&")
          .setFooter({ text: "Öffne ein Ticket im Support bei Fragen oder Problemen.", iconURL: "https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png" })
          .setTimestamp();
        await interaction.reply({ embeds: [botEmbed], ephemeral: true });
      } break;
    }
  },
};
