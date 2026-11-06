import { EmbedBuilder, MessageFlags } from "discord.js";
import { settings } from "#core/settings.js";
import { getSeasonPassRole } from "#systems/seasonPass.js";

export default {
  id: "ränge-menu",
  async run(client, interaction) {
    switch (interaction.values[0]) {
      case "server": {
        const year = await interaction.guild.roles.cache.get(settings.get("achievementRoles.oneYear"));
        const roleCountY = year.members.size;

        const informant = await interaction.guild.roles.cache.get(settings.get("achievementRoles.informant"));
        const roleCountI = informant.members.size;

        const umfrage = await interaction.guild.roles.cache.get(settings.get("achievementRoles.surveys"));
        const roleCountU = umfrage.members.size;

        const SDES = await interaction.guild.roles.cache.get(settings.get("achievementRoles.since2021"));
        const roleCountSDES = SDES.members.size;

        const christmas2021 = await interaction.guild.roles.cache.get(settings.get("achievementRoles.christmas2021"));
        const roleCountC2021 = christmas2021.members.size;

        const advent2024 = await interaction.guild.roles.cache.get(settings.get("achievementRoles.advent2024"));
        const roleCountadvent2024 = advent2024.members.size;

        const christmas2025 = await interaction.guild.roles.cache.get(settings.get("achievementRoles.christmas2025"));
        const roleCountC2025 = christmas2025.members.size;

        const advent2025 = await interaction.guild.roles.cache.get(settings.get("achievementRoles.advent2025"));
        const roleCountadvent2025 = advent2025.members.size;

        const lucky = await interaction.guild.roles.cache.get(settings.get("achievementRoles.lucky"));
        const roleCountlucky = lucky.members.size;

        const serverEST = await interaction.guild.roles.cache.get(settings.get("achievementRoles.opening2021"));
        const roleCountSEST = serverEST.members.size;

        const serverEmbed = new EmbedBuilder()
          .setTitle("<a:trophe:1112823561992818859> 𑁉 UNSERE SERVER-ERFOLGE")
          .setDescription(
            "» Mit **Erfolgen** kannst du **vor deinen Freunden** angeben und hast die Chance, in unserem Server **einzigartige Erfolge freizuschalten!**\n\n" +
            `\`🧡\` 𑁉 <@&${settings.get("achievementRoles.oneYear")}> (\`${roleCountY}👥\`)\n` +
            "<:Pfeil:1119709908540076124> Mitglied seit **einem Jahr** auf dem Server.\n\n" +
            `\`💡\` 𑁉 <@&${settings.get("achievementRoles.informant")}> (\`${roleCountI}👥\`)\n` +
            "<:Pfeil:1119709908540076124> Reiche **10 Server-Ideen** ein.\n\n" +
            `\`📢\` 𑁉 <@&${settings.get("achievementRoles.surveys")}> (\`${roleCountU}👥\`)\n` +
            "<:Pfeil:1119709908540076124> Nimm an **20 Server-Umfragen** teil.\n\n" +
            `\`💚\` 𑁉 <@&${settings.get("achievementRoles.since2021")}> (\`${roleCountSDES}👥\`)\n` +
            "<:Pfeil:1119709908540076124> **Seit 2021** auf World Of Community\n\n" +
            `\`🎄\` 𑁉 <@&${settings.get("achievementRoles.christmas2021")}> (\`${roleCountC2021}👥\`)\n` +
            "<:Pfeil:1119709908540076124> Exklusiv an **Weihnachten 2021** erhalten\n\n" +
            `\`📆\` 𑁉 <@&${settings.get("achievementRoles.advent2024")}> (\`${roleCountadvent2024}👥\`)\n` +
            "<:Pfeil:1119709908540076124> Beim **Adventskalender 2024** erhalten\n\n" +
            `\`🎄\` 𑁉 <@&${settings.get("achievementRoles.christmas2025")}> (\`${roleCountC2025}👥\`)\n` +
            "<:Pfeil:1119709908540076124> Exklusiv an **Weihnachten 2025** erhalten\n\n" +
            `\`📆\` 𑁉 <@&${settings.get("achievementRoles.advent2025")}> (\`${roleCountadvent2025}👥\`)\n` +
            "<:Pfeil:1119709908540076124> Beim **Adventskalender 2025** erhalten\n\n" +
            `\`☘️\` 𑁉 <@&${settings.get("achievementRoles.lucky")}> (\`${roleCountlucky}👥\`)\n` +
            "<:Pfeil:1119709908540076124> **Gewinne** bei einem Event auf WOC.\n\n" +
            `\`🔓\` 𑁉 <@&${settings.get("achievementRoles.opening2021")}> (\`${roleCountSEST}👥\`)\n` +
            "<:Pfeil:1119709908540076124> War bei der **Server-Eröffnung 2021** dabei.",
          )
          .setColor("Orange")
          .setImage("https://cdn.discordapp.com/attachments/1539321113010765924/1539322429581688884/image.png?ex=6a8e76fa&is=6a8d257a&hm=4c39c912ab0faeaeb9df82e0a15ca6dd095a19d1b6dda1abbe2cfbc4b93acdb6&")
          .setFooter({ text: "Öffne ein Ticket im Support bei Fragen oder Problemen.", iconURL: "https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png" })
          .setTimestamp();
        await interaction.reply({ embeds: [serverEmbed], flags: MessageFlags.Ephemeral });
      } break;

      case "minecraft": {
        const supreme = await interaction.guild.roles.cache.get(settings.get("minecraftRoles.supreme"));
        const roleCountsupreme = supreme.members.size;

        const premium = await interaction.guild.roles.cache.get(settings.get("minecraftRoles.premium"));
        const roleCountpremium = premium.members.size;

        const legende = await interaction.guild.roles.cache.get(settings.get("minecraftRoles.legende"));
        const roleCountlegende = legende.members.size;

        const emerald = await interaction.guild.roles.cache.get(settings.get("minecraftRoles.emerald"));
        const roleCountemerald = emerald.members.size;

        const diamond = await interaction.guild.roles.cache.get(settings.get("minecraftRoles.diamond"));
        const roleCountdiamond = diamond.members.size;

        const episch = await interaction.guild.roles.cache.get(settings.get("minecraftRoles.episch"));
        const roleCountepisch = episch.members.size;

        const spielerEmbed = new EmbedBuilder()
          .setTitle("`🌍` 𑁉 UNSERE MINECRAFT-RÄNGE")
          .setDescription(
            "» Erhalte diese Ränge auf dem Discord- und Minecraft-Server.\n\n" +
            `> \`🌟\` 𑁉 <@&${settings.get("minecraftRoles.supreme")}> (\`${roleCountsupreme}👥\`)\n` +
            "<:PfeilBlau:1119711275014955080> Doppelsprung.\n\n" +
            `> \`⭐\` 𑁉 <@&${settings.get("minecraftRoles.premium")}> (\`${roleCountpremium}👥\`)\n` +
            "<:PfeilBlau:1119711275014955080> Doppelsprung\n\n" +
            `> \`🔮\` 𑁉 <@&${settings.get("minecraftRoles.legende")}> (\`${roleCountlegende}👥\`)\n` +
            "<:PfeilBlau:1119711275014955080> Doppelsprung\n\n" +
            `> \`💎\` 𑁉 <@&${settings.get("minecraftRoles.diamond")}> (\`${roleCountdiamond}👥\`)\n` +
            "<:PfeilBlau:1119711275014955080> Doppelsprung\n\n" +
            `> \`👻\` 𑁉 <@&${settings.get("minecraftRoles.emerald")}> (\`${roleCountemerald}👥\`)\n` +
            "<:PfeilBlau:1119711275014955080> Doppelsprung\n\n" +
            `> \`🟣\` 𑁉 <@&${settings.get("minecraftRoles.episch")}> (\`${roleCountepisch}👥\`)\n` +
            "<:PfeilBlau:1119711275014955080> Bald Verfügbar.",
          )
          .setColor("Green")
          .setImage("https://cdn.discordapp.com/attachments/1539321113010765924/1541857396941393962/WOC_Banner_Minecraft_Range.png?ex=6a8f1e19&is=6a8dcc99&hm=38022366bfbdbdc181f9319347589e03346fd8662a177fcec308090647704fe1&")
          .setFooter({ text: "Öffne ein Ticket im Support bei Fragen oder Problemen.", iconURL: "https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png" })
          .setTimestamp();
        await interaction.reply({ embeds: [spielerEmbed], flags: MessageFlags.Ephemeral });
      } break;

      case "level": {
        const hyperaktiv = await interaction.guild.roles.cache.get(settings.get("levelRoles.level100"));
        const roleCounthyperaktiv = hyperaktiv.members.size;

        const ultraaktiv = await interaction.guild.roles.cache.get(settings.get("levelRoles.level75"));
        const roleCountultraaktiv = ultraaktiv.members.size;

        const extremaktiv = await interaction.guild.roles.cache.get(settings.get("levelRoles.level50"));
        const roleCountextremaktiv = extremaktiv.members.size;

        const megaaktiv = await interaction.guild.roles.cache.get(settings.get("levelRoles.level40"));
        const roleCountmegaaktiv = megaaktiv.members.size;

        const starkaktiv = await interaction.guild.roles.cache.get(settings.get("levelRoles.level30"));
        const roleCountstarkaktiv = starkaktiv.members.size;

        const sehraktiv = await interaction.guild.roles.cache.get(settings.get("levelRoles.level20"));
        const roleCountsehraktiv = sehraktiv.members.size;

        const aktiv = await interaction.guild.roles.cache.get(settings.get("levelRoles.level10"));
        const roleCountaktiv = aktiv.members.size;

        const inaktiv = await interaction.guild.roles.cache.get(settings.get("levelRoles.level5"));
        const roleCountinaktiv = inaktiv.members.size;

        const levelEmbed = new EmbedBuilder()
          .setTitle("`👥` 𑁉 UNSERE LEVEL-ROLLEN")
          .setDescription(
            "» Chatte mit **anderen Server-Mitgliedern** oder **unterhalte dich** in unseren Sprachkanälen, um **die folgenden Rollen** freizuschalten.\n\n" +
            `> \`☢️\` 𑁉 <@&${settings.get("levelRoles.level100")}> (\`${roleCounthyperaktiv}👥\`)\n` +
            "<:PfeilBlau:1119711275014955080> Wir schenken dir einmal `🪙` **100.000 Coins** `🪙`\n\n" +
            `> \`🤩\` 𑁉 <@&${settings.get("levelRoles.level75")}> (\`${roleCountultraaktiv}👥\`)\n` +
            "<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich **jemand erwähnt!**\n\n" +
            `> \`⚡️\` 𑁉 <@&${settings.get("levelRoles.level50")}> (\`${roleCountextremaktiv}👥\`)\n` +
            "<:PfeilBlau:1119711275014955080> **Eine eigene Rolle:** Name + Farbe selbst wählbar!\n\n" +
            `> \`🥊\` 𑁉 <@&${settings.get("levelRoles.level40")}> (\`${roleCountmegaaktiv}👥\`)\n` +
            "<:PfeilBlau:1119711275014955080> **Keine Voraussetzungen** erfüllen für **ALLE** Gewinnspiele!\n\n" +
            `> \`💪\` 𑁉 <@&${settings.get("levelRoles.level30")}> (\`${roleCountstarkaktiv}👥\`)\n` +
            `<:PfeilBlau:1119711275014955080> **Schreibrechte** erhalten in den Kanal: <#${settings.get("channels.birthdays")}>\n\n` +
            `> \`👀\` 𑁉 <@&${settings.get("levelRoles.level20")}> (\`${roleCountsehraktiv}👥\`)\n` +
            "<:PfeilBlau:1119711275014955080> **Umfragen** in **öffentliche** Chats posten\n\n" +
            `> \`🏃\` 𑁉 <@&${settings.get("levelRoles.level10")}> (\`${roleCountaktiv}👥\`)\n` +
            "<:PfeilBlau:1119711275014955080> **Dateien** hochladen & **Nicknamen** verändern.\n\n" +
            `> \`💤\` 𑁉 <@&${settings.get("levelRoles.level5")}> (\`${roleCountinaktiv}👥\`)\n` +
            "<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden",
          )
          .setColor("Orange")
          .setImage("https://cdn.discordapp.com/attachments/1539321113010765924/1541857231832612945/WOC_Banner_Levelsystem.jpg?ex=6a8f1df2&is=6a8dcc72&hm=d3167878dc7bbabd8213537948c4984d9026ddb84105c329608afd599e67656d&")
          .setFooter({ text: "Öffne ein Ticket im Support bei Fragen oder Problemen.", iconURL: "https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png" })
          .setTimestamp();
        await interaction.reply({ embeds: [levelEmbed], flags: MessageFlags.Ephemeral });
      } break;

      case "exklusiv": {
        const vip = await interaction.guild.roles.cache.get(settings.get("exclusiveRoles.vip"));
        const roleCountvip = vip.members.size;

        const booster = await interaction.guild.roles.cache.get(settings.get("exclusiveRoles.booster"));
        const roleCountbooster = booster.members.size;

        const creator = await interaction.guild.roles.cache.get(settings.get("exclusiveRoles.creator"));
        const roleCountcreator = creator.members.size;

        //const twitchsub = await interaction.guild.roles.cache.get('1067899186542018571')
        //const roleCounttwitchsub = twitchsub.members.size

        const neuesmitglied = await interaction.guild.roles.cache.get(settings.get("roles.newMember"));
        const roleCountneuesmitglied = neuesmitglied.members.size;

        const birthday = await interaction.guild.roles.cache.get(settings.get("roles.birthday"));
        const roleCountbirthday = birthday.members.size;

        const seasonpass = getSeasonPassRole(interaction.guild);
        const roleCountSeasonpass = seasonpass.members.size;

        const unterstützer = await interaction.guild.roles.cache.get(settings.get("exclusiveRoles.vanity"));
        const roleCountunterstützer = unterstützer.members.size;

        const exklusiveEmbed = new EmbedBuilder()
          .setTitle("<a:krone:1112823594649665607> 𑁉 EXKLUSIVE ROLLEN FREISCHALTEN")
          .setDescription(
            "» Alle **Rollen in dieser Liste** kannst du nur auf ganz **bestimme Art und Weise** erhalten, dennoch haben sie **mächtige Vorteile.**\n\n" +
            `> \`🔮\` 𑁉 <@&${settings.get("exclusiveRoles.booster")}> (\`${roleCountbooster}👥\`)\n` +
            "<:Pfeil:1119709908540076124> **Rang freischalten:** Booste diesen Server!\n\n" +
            "<:PfeilBlau:1119711275014955080> **Exklusive Community-Vorteile** für Booster.\n" +
            "<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n" +
            "<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n" +
            "<:PfeilBlau:1119711275014955080> **Keine Voraussetzungen** erfüllen für **ALLE** Gewinnspiele!\n\n" +
            `> \`😎\` 𑁉 <@&${settings.get("exclusiveRoles.vip")}> (\`${roleCountvip}👥\`)\n` +
            "<:Pfeil:1119709908540076124> **Rang freischalten:** Dieser Rang wird von uns individuell vergeben.\n\n" +
            "<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n" +
            "<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n" +
            "<:PfeilBlau:1119711275014955080> **Keine Voraussetzungen** erfüllen für **ALLE** Gewinnspiele!\n\n" +
            `> \`🎥\` 𑁉 <@&${settings.get("exclusiveRoles.creator")}> (\`${roleCountcreator}👥\`)\n` +
            "<:Pfeil:1119709908540076124> **Rang freischalten:** Dieser Rang wird von uns individuell vergeben.\n\n" +
            "<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n" +
            "<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n" +
            "<:PfeilBlau:1119711275014955080> **Keine Voraussetzungen** erfüllen für **ALLE** Gewinnspiele!\n\n" +
            `> \`👋\` 𑁉 <@&${settings.get("roles.newMember")}> (\`${roleCountneuesmitglied}👥\`)\n` +
            "<:Pfeil:1119709908540076124> **Rang freischalten:** Erhält jeder für 24 Stunden nach Beitritt!\n\n" +
            "<:PfeilBlau:1119711275014955080> Eine **auffällige & besondere** Chat-Farbe & **höher gelistet!**\n\n" +
            `> \`🎂\` 𑁉 <@&${settings.get("roles.birthday")}> (\`${roleCountbirthday}👥\`)\n` +
            "<:Pfeil:1119709908540076124> **Rang freischalten:** Heute Geburtstag feiern!\n\n" +
            "<:PfeilBlau:1119711275014955080> Eine **auffallende & besondere** Chat-Farbe & **höher gelistet!**\n" +
            `<:PfeilBlau:1119711275014955080> **Zugriff** auf <#${settings.get("channels.birthdays")}>\n\n` +
            `> \`🎟️\` 𑁉 <@&${seasonpass.id}> (\`${roleCountSeasonpass}\`)\n` +
            "<:Pfeil:1119709908540076124> **Rang freischalten:** Kauf dir den **Season-Pass** im Shop!\n\n" +
            "<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n" +
            "<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n" +
            `> \`💛\` 𑁉 <@&${settings.get("exclusiveRoles.vanity")}> (\`${roleCountunterstützer}👥\`)\n` +
            "<:Pfeil:1119709908540076124> **Rang freischalten:** im Status `discord.gg/woc` schreiben!\n\n" +
            "<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n" +
            "<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!",
          )
          .setColor("DarkBlue")
          .setImage("https://cdn.discordapp.com/attachments/1539321113010765924/1539321628972818522/image.png?ex=6a8e763b&is=6a8d24bb&hm=9417739db302b8bfe278815640f691a8de617dce0b241945685962f0ca9ea327&")
          .setFooter({ text: "Öffne ein Ticket im Support bei Fragen oder Problemen.", iconURL: "https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png" })
          .setTimestamp();
        await interaction.reply({ embeds: [exklusiveEmbed], flags: MessageFlags.Ephemeral });
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
        const admin = await interaction.guild.roles.cache.get(settings.get("teamRoles.admin"));
        const roleCountadmin = admin.members.size;

        const developer = await interaction.guild.roles.cache.get(settings.get("teamRoles.developer"));
        const roleCountdeveloper = developer.members.size;

        const srmoderator = await interaction.guild.roles.cache.get(settings.get("teamRoles.srModerator"));
        const roleCountsrmoderator = srmoderator.members.size;

        const moderator = await interaction.guild.roles.cache.get(settings.get("teamRoles.moderator"));
        const roleCountmoderator = moderator.members.size;

        const supporter = await interaction.guild.roles.cache.get(settings.get("teamRoles.supporter"));
        const roleCountsupporter = supporter.members.size;

        const builder = await interaction.guild.roles.cache.get(settings.get("teamRoles.builder"));
        const roleCountbuilder = builder.members.size;

        const teamEmbed = new EmbedBuilder()
          .setTitle("<a:security:1119708496670232646> 𑁉 UNSER SERVER-TEAM")
          .setDescription(
            "» Hier kannst du alle **unsere Team-Ränge** sehen und welche User **aktuell in unserem Server-Team** tätig sind.\n\n" +
            `> \`🎯\` 𑁉 <@&${settings.get("teamRoles.admin")}> (\`${roleCountadmin}👥\`)\n` +
            "<:Pfeil:1119709908540076124> **Aufgabe:** Die Administration kümmert sich um die ganze Server-Verwaltung, die Organisation und um die Umsetzung neuer Ideen.\n" +
            `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(admin.id)}\n\n` +
            `> \`👨‍💻\` 𑁉 <@&${settings.get("teamRoles.developer")}> (\`${roleCountdeveloper}👥\`)\n` +
            "<:Pfeil:1119709908540076124> **Aufgabe:** Die Developer/Entwickler kümmern sich um die Entwicklung unserer Bots sowie Plugins und helfen dem Administrator bei der technischen Umsetzung.\n" +
            `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(developer.id)}\n\n` +
            `> \`🕵\` 𑁉 <@&${settings.get("teamRoles.srModerator")}> (\`${roleCountsrmoderator}👥\`)\n` +
            "<:Pfeil:1119709908540076124> **Aufgabe:** Die Senior-Mods sind erfahrene Moderatoren und kümmern sich um die Pflege des Support-Teams. Sie agieren als eine Art von \"Mentor\" und führen neue Teammitglieder ein.\n" +
            `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(srmoderator.id)}\n\n` +
            `> \`👮\` 𑁉 <@&${settings.get("teamRoles.moderator")}> (\`${roleCountmoderator}👥\`)\n` +
            "<:Pfeil:1119709908540076124> **Aufgabe:** Die Mods sind wichtige Bestandteile des Teams. Sie kümmern sich um Tickets, Moderation und administrieren kleinere Elemente (wie das Bann-System & Geburtstag ändern).\n" +
            `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(moderator.id)}\n\n` +
            `> \`🧩\` 𑁉 <@&${settings.get("teamRoles.supporter")}> (\`${roleCountsupporter}👥\`)\n` +
            "<:Pfeil:1119709908540076124> **Aufgabe:** Die Supporter sind neu in unserem Team. Sie kümmern sich um Support-Tickets, moderieren den Chat und arbeiten sich ein.\n" +
            `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(supporter.id)}\n\n` +
            `> \`🪓\` 𑁉 <@&${settings.get("teamRoles.builder")}> (\`${roleCountbuilder}👥\`)\n` +
            "<:Pfeil:1119709908540076124> **Aufgabe:** Neue Maps für die jeweiligen Spielmodi bauen sowie Lobby & bei den anderen Buildern unter die Arme greifen\n" +
            `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(builder.id)}`,
          )
          .setColor("Red")
          .setImage("https://cdn.discordapp.com/attachments/1539321113010765924/1539321535632900188/image.png?ex=6a8e7625&is=6a8d24a5&hm=69b32dabe1c3dcb7a4c8706d613ff9ad776c527cd6563fafdf6aa760c6d6eebe&")
          .setFooter({ text: "Öffne ein Ticket im Support bei Fragen oder Problemen.", iconURL: "https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png" })
          .setTimestamp();
        await interaction.reply({ embeds: [teamEmbed], flags: MessageFlags.Ephemeral });
      } break;

      case "bot": {
        const botEmbed = new EmbedBuilder()
          .setTitle("<a:pin:1119708768326914100> 𑁉 UNSERE WICHTIGSTEN BOTS")
          .setDescription(
            "» Hier könnt ihr sehen, **welche Aufgaben** unsere **wichtigsten Bots** haben, die speziell **von uns entwickelt** wurden.\n\n" +
            `> \`⚙️\` 𑁉 <@${settings.get("bots.system")}> (Eingeführt am \`15.09.2022📝\`)\n` +
            "<:Pfeil:1119709908540076124> **Aufgabe:** Die Aufgaben dieses Bots sind sehr vielfältig. Wir listen euch einmal die größten Dinge auf.\n\n" +
            "<:PfeilBlau:1119711275014955080> **Info- und Stats-Kanäle aktuell halten**\n" +
            "<:PfeilBlau:1119711275014955080> **Ideen-, Spielersuche- und Changelog-System**\n" +
            "<:PfeilBlau:1119711275014955080> **Bewerbungs- und Rollen-Verwaltung**\n" +
            "<:PfeilBlau:1119711275014955080> **Verwaltung der Gewinnspiele**\n\n" +
            `> \`🚑\` 𑁉 <@${settings.get("bots.support")}> (Tickets bearbeitet: \`10.000+🎫\`)\n` +
            "<:Pfeil:1119709908540076124> **Aufgabe:** Erstellung, Verwaltung und Organisation von Tickets.\n\n" +
            "> <a:pin:1119708768326914100> 𑁉 **DIE RESTLICHEN BOTS...**\n" +
            "<:Pfeil:1119709908540076124> **Aufgaben:** Die restlichen Bots erfüllen nur noch kleine Aufgaben oder werden bald durch einen eigenen Bot von uns ersetzt.",
          )
          .setColor("Aqua")
          .setImage("https://cdn.discordapp.com/attachments/1539321113010765924/1539321673927622676/image.png?ex=6a8e7646&is=6a8d24c6&hm=de2cc77ff112df59355a1c55bebe0ee330fc63724cbc9ea9305a1ad18f2cb392&")
          .setFooter({ text: "Öffne ein Ticket im Support bei Fragen oder Problemen.", iconURL: "https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png" })
          .setTimestamp();
        await interaction.reply({ embeds: [botEmbed], flags: MessageFlags.Ephemeral });
      } break;
    }
  },
};
