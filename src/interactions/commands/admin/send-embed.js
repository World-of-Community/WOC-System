import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } from "discord.js";
import { settings } from "#core/settings.js";

export default {
  name: "send-embed",
  description: "» Hier können die verschienden Embeds gesendet werden. 📋",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      type: 3,
      choices: [
        {
          name: "Ränge Info (Rollen Info)",
          value: "ränge-info",
        },
        {
          name: "Regelwerk (Server-regeln)",
          value: "regelwerk",
        },
        {
          name: "Partner (Partner werden)",
          value: "partner",
        },
        {
          name: "Bann-Bereich Embed (Gebannt)",
          value: "gebannt",
        },
      ],
      name: "embed",
      description: "Welches Embed?",
      required: true,
    },
  ],

  async run(client, interaction) {
    const embedType = interaction.options.getString("embed");

    if (embedType === "ränge-info") {
      const channel = interaction.guild.channels.cache.get(settings.get("channels.rankInfo")); // Channel ID
      const msg = await channel.messages.fetch(settings.get("messages.rankInfo")); // Nachricht ID

      const rängeEmbed = new EmbedBuilder()
        .setTitle("`🏆` 𑁉 ERHALTE NEUE RÄNGE & VORTEILE!")
        .setDescription("<:Pfeil:1119709908540076124> Jeder Rang hat seine eigenen Vorteile und seine eigene Art und Weise wie man diesen erhalten kann.\n\n`🏆` - **WELCHE VORTEILE GIBT ES?**\n<:Pfeil:1119709908540076124> Sie sind sehr **zahlreich:** von Discord-Nitro Basic, bis hin zu einem **Ping-Emoji für Nachrichten** auf unserem Discord-Server!\n\n- `⭐` **Server-Erfolge:** Diese sind nur für das Sammeln gedacht und bieten keine direkten Vorteile\n- `🏆` **Level-Rollen:** Sei ein aktives Mitglied und steige dadurch **neue Level auf** - dadurch erhältst du viele Vorteile!\n- `💎` **Exklusive Rollen:** Jeder Rang aus dieser Liste hat einen eigenen Weg um freigeschaltet zu werden!\n\n`❓` - **WELCHE ROLLEN BESITZT IHR?**\n<:Pfeil:1119709908540076124> `📌` » Klicke auf das **untere Menü** um alle Rollen zu sehen!\n<:Pfeil:1119709908540076124> `🚑` » Öffne ein Ticket im Support bei Fragen oder Problemen.")
        .setColor("Orange")
        .setImage("https://cdn.discordapp.com/attachments/1269339771420016722/1269340917991473162/WOC_Banner_Rollen_Information.png?ex=6aca70da&is=6ac91f5a&hm=395c2a7a33b4ad4de4ddd749021b9adf4842111742112cf9be693b52cf4d7191&")
        .setFooter({ text: "Klicke auf eine Kategorie, um dir die Rollen anzusehen!", iconURL: client.user.displayAvatarURL() });

      const rängeMenu = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("ränge-menu")
            .setPlaceholder("📚 » ROLLEN - INFORMATIONEN")
            .addOptions(
              {
                label: "× SERVER - ERFOLGE",
                description: "» Erhalte einzigartige Erfolge. ⭐",
                emoji: "<a:wocstar:1260236276758478950>",
                value: "server",
              },
              {
                label: "× MINECRAFT - RÄNGE",
                description: "» Erhalte einzigartige Ränge. 🌍",
                emoji: "<a:MinecraftGrassBlock:872034424181637171>",
                value: "minecraft",
              },
              {
                label: "× LEVEL - ROLLEN",
                description: "» Hier sind Alle Level-Rollen aufgelistet. 🏆",
                emoji: "<a:trophe:1112823561992818859>",
                value: "level",
              },
              {
                label: "× EXKLUSIVE - ROLLEN",
                description: "» Besondere Rollen mit besonderen Vorteilen. 👑",
                emoji: "<a:krone:1112823594649665607>",
                value: "exklusiv",
              },
              {
                label: "× TEAM - ROLLEN",
                description: "» Schau dir unser Server-Team an. 🚨",
                emoji: "<:StaffAbzeichen:1056602972789948466>",
                value: "team",
              },
              {
                label: "× BOT - ROLLEN",
                description: "» Sieh dir die Aufgaben unserer Bots an. 🤖",
                emoji: "<a:pin:1112823671363473468>",
                value: "bot",
              },
            ),
        );
      await msg.edit({ embeds: [rängeEmbed], components: [rängeMenu] });

    } else if (embedType === "regelwerk") {
      const channel = interaction.guild.channels.cache.get(settings.get("channels.rules")); // Channel ID
      const msg = await channel.messages.fetch(settings.get("messages.rules")); // Nachricht ID

      const regelwerkEmbed = new EmbedBuilder()
        .setTitle("`🚨` » World Of Community - Server-Regeln")
        .setDescription(
          "» An diesen Regeln musst du dich jederzeit halten, damit wir eine friedliche Atmosphäre wahren können. Solltest du dies nicht tun, können Sanktionen gegen deinem Account folgen.\n\n" +
                    "<:Pfeil:1119709908540076124> **Bei der Nutzung dieses Discord Servers bist du automatisch mit den Regeln einverstanden.**\n\n" +
                    "─────────────────────────\n\n" +
                    "1️⃣ 𑁉 Behandle alle Mitglieder stets respektvoll. Wir tolerieren keine Streitigkeiten oder andere toxischen Inhalte im Chat!\n\n" +
                    "2️⃣ 𑁉 NSFW-Inhalte (Nacktheit, Gewalt & mehr) können verstörend auf Mitglieder wirken und sind daher untersagt.\n\n" +
                    "3️⃣ 𑁉 Übersteuerte Geräusche & flackernde Emojis sind verboten, da sie das Wohlempfinden beeinträchtigen können.\n\n" +
                    "4️⃣ 𑁉 Werbung ist nur in den dazugehörigen Textkanälen gestattet, um unsere Mitglieder nicht unnötig zu nerven.\n\n" +
                    "5️⃣ 𑁉 Spam jeglicher Art (Doppelte Nachrichten, Channelhopping & u.ä.) ist aufgrund von Levelvorteilen verboten.\n\n" +
                    "6️⃣ 𑁉 Das Ausgeben von andere Nutzer, Mitglieder oder Teammitglieder ist untersagt und führt zur Sperrung.\n\n" +
                    "7️⃣ 𑁉 Postet auf keinen Fall irgendwelche privaten Adressen oder Telefonnummern in den Öffentlichen Chat, egal ob von euch oder jemand anderen.\n\n" +
                    "8️⃣ 𑁉 Unwissenheit schützt nicht vor einer Strafe. Allerdings hast du das Recht, einen Antrag auf Entsperrung bei uns einzureichen.\n\n" +
                    "9️⃣ 𑁉 Das Betteln um Ränge oder Berechtigungen ist ebenfalls untersagt.\n\n" +
                    "🔟 𑁉 Stimmverzerrer oder Soundboards sind nur gestattet, wenn dies ein Teammitglied erlaubt.",
        )
        .setColor("Red")
        .setImage("https://cdn.discordapp.com/attachments/1269339771420016722/1269340748256514153/WOC_Banner_Server-Regeln.png?ex=6aca70b1&is=6ac91f31&hm=5319881ca26dba96936e67731f49d0a81261ae983dc46829e45022ae7ee9d5e2&")
        .setFooter({ text: "Du erklärst dich mit diesen Regeln bei der Nutzung unseres Discord-Servers einverstanden.", iconURL: client.user.displayAvatarURL() });

      const regelButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("seite-2")
            .setLabel("📚 » Nächste Seite")
            .setStyle(ButtonStyle.Danger),
        );
      await msg.edit({ embeds: [regelwerkEmbed], components: [regelButton] });

    } else if (embedType === "partner") {
      const channel = interaction.guild.channels.cache.get(settings.get("channels.partnerInfo")); // Channel ID
      const msg = await channel.messages.fetch(settings.get("messages.partnerInfo")); // Nachricht ID

      const partnerEmbed = new EmbedBuilder()
        .setDescription(
          "# `👥` - **SO WIRST DU EIN PARTNER!**\n" +
                    "Ein **Server-Partner** von uns zu sein ist eine **einmalige Möglichkeit**, um eine **riesige Auswahl an Usern** zu erreichen.\n\n" +
                    "# `🔥` ᕁ **WAS SIND DIE BEDINGUNGEN?**\n\n" +
                    "<:Pfeil:1119709908540076124> Um ein Partner zu werden, musst du die **unteren Voraussetzungen** erfüllen, damit du dich bewerben kannst.\n\n" +
                    "- `👥` » Mindestens **100 Server-Mitglieder** besitzen!\n" +
                    `- \`💬\` » Hält <#${settings.get("channels.rules")}> und die **[Discord ToS](https://discord.com/terms)** ein!\n` +
                    "- `💖` » Ist ein **vollständiger deutscher Discord-Server**!\n" +
                    `- \`📢\` » Muss unserem <#${settings.get("channels.advertising")}> Kanal **folgen**!\n` +
                    "# `📡` ᕁ **WAS SIND DIE VORTEILE?**\n" +
                    "<:Pfeil:1119709908540076124> Wir veranstalten regelmäßig Events um die Server unserer Partner noch etwas bekannter zu machen.",
        )
        .setColor("Blurple")
        .setImage("https://cdn.discordapp.com/attachments/1539321113010765924/1539321446432505986/image.png?ex=6a8e7610&is=6a8d2490&hm=eaca0313ce62bc14795b31a950297646bd97ce1da3aadcbc92913fbb81c6bf30&");

      const partnerButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("partner")
            .setLabel("✅ » Als Partner bewerben")
            .setStyle(ButtonStyle.Success),
        );
      await msg.edit({ embeds: [partnerEmbed], components: [partnerButton] });

    } else if (embedType === "gebannt") {
      const channel = interaction.guild.channels.cache.get(settings.get("channels.bannedInfo")); // Channel ID
      const msg = await channel.messages.fetch(settings.get("messages.bannedInfo")); // Nachricht ID

      const gebanntEmbed = new EmbedBuilder()
        .setTitle("⠀⠀ ⠀⠀⠀⠀ ⠀⠀ ⛔ Du wurdest vom Server gebannt!  ⛔⠀⠀ ⠀⠀⠀⠀ ⠀⠀")
        .setDescription(
          "Anscheinend wurdest du vom **Server Gebannt** und bist nun im **Bann-Bereich.**\n\n" +
                    "> » Falls dies eine **Falsche Entscheidung** gewesen ist, **melde dich** bei **einem Teammitglied** und gebe deine **Unschuld** an.\n\n" +
                    "> Öffne ein Ticket für den Bann-Support.",
        )
        .setColor("Red");

      const gebanntButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("gebannt-ticket")
            .setLabel("⛔ » Bann Ticket")
            .setStyle(ButtonStyle.Primary),
        );
      await msg.edit({ embeds: [gebanntEmbed], components: [gebanntButton] });
    } else {
      await interaction.reply({ content: "> `❌` » Embed wurde nicht gefunden.", ephemeral: true });
    }

    await interaction.reply({ content: `> \`✅\` » das \`${embedType}\`-Embed wurde gesendet oder bearbeitet.`, ephemeral: true });
  },
};

