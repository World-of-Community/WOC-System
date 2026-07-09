import { EmbedBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } from "discord.js";
import ms from "ms";
import giveawaydb from "../../models/giveawaydb.js";
import userDB from "../../models/userdb.js";


export default {
  name: "gw",
  description: "Gewinnspiel",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      "type": 1,
      "name": "start",
      "description": "» Starte ein neues Gewinnspiel. 🎁",
      "options": [
        {
          "channel_types": [
            0,
          ],
          "name": "kanal",
          "description": "In welchen Kanal soll das Gewinnspiel stattfinden?",
          "required": true,
          "type": 7,
        },
        {
          "type": 3,
          "choices": [
            {
              "name": "⛔ × Keine Bedingung",
              "value": "none",
            },
            {
              "name": "📚 × Nachrichtenanzahl",
              "value": "messages",
            },
            {
              "name": "🔊 × Sprachkanal-Zeit",
              "value": "voiceTime",
            },
            {
              "name": "📌 × Rolle besitzen",
              "value": "role",
            },
            {
              "name": "👥 × Server-Mitgliedschaft",
              "value": "membersince",
            },
            {
              "name": "💡 × Server-Empfehlung",
              "value": "server",
            },
          ],
          "name": "bedingung",
          "description": "Möchtest du eine Teilnahmebedingung festlegen?",
          "required": true,
        },
        {
          "name": "sponsor",
          "description": "Wähle einen Sponsor für das Gewinnspiel aus.",
          "required": false,
          "type": 6,
        },
      ],
    },
    {
      "type": 1,
      "name": "end",
      "description": "» Beende ein spezielles Gewinnspiel sofort. 🎊",
      "options": [
        {
          "type": 3,
          "name": "nachrichtenid",
          "description": "Welche Nachricht ist es?",
          "required": true,
        },
      ],
    },
    {
      "type": 1,
      "name": "reroll",
      "description": "» Ziehe neue Gewinner aus einem beendeten Gewinnspiel. 🔄",
      "options": [
        {
          "type": 3,
          "name": "nachrichtenid",
          "description": "Welche Nachricht ist es?",
          "required": true,
        },
      ],
    },
  ],

  async run(_client, interaction) {
    const client = interaction.client;
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "start": {
        const sponsor = interaction.options.getMember("sponsor") || null;
        const channel = interaction.options.getChannel("kanal") || interaction.channel;
        const bedingung = interaction.options.getString("bedingung");
        //const startenIn = interaction.options.getString("starten-in");

        // Timer funktioniert noch nicht
        //const startTime = ms(startenIn);
        //if (!startTime) return interaction.reply({ content: '> `❗` » Bitte gib eine gültige Zeit für "starten-in" an. Beispiel: 10m, 1h', ephemerl: true });

        //await interaction.reply(`> \`✅\` - **Gewinnspiel geplant:** Das Gewinnspiel wird in ${startenIn} in dem Kanal ${channel} erstellt.`);

        const generateRandomId = () => Math.floor(1000 + Math.random() * 9000);
        const id = generateRandomId();
        const modal = new ModalBuilder()
          .setTitle("🎁 - Gewinnspiel starten")
          .setCustomId(`gw-modal-${id}`);


        const createTextInput = (customId, label, placeholder, required = true) => {
          return new TextInputBuilder()
            .setCustomId(customId)
            .setLabel(label)
            .setPlaceholder(placeholder)
            .setStyle(TextInputStyle.Short)
            .setRequired(required);
        };

        const addModalComponents = (modal, components) => {
          components.forEach(component => {
            modal.addComponents(new ActionRowBuilder().addComponents(component));
          });
        };

        const durationInput = createTextInput("durationInput", "⏰ - WIE LANGE SOLL DAS GEWINNSPIEL DAUERN?", "Beispiel: 5d 30m");
        const winnerInput = createTextInput("winnerInput", "👥 - WIEVIEL USER KÖNNEN GEWINNEN?", "Beispiel: 15");
        const priceInput = createTextInput("priceInput", "🎁 - WAS GIBT ES ZU GEWINNEN?", "Beispiel: Discord Nitro");

        const bedingungsInputs = {
          messages: createTextInput("bedingungsinput", "📚 - WIE VIELE NACHRICHTEN WERDEN BENÖTIGT?", "Gib eine Anzahl an..."),
          voiceTime: createTextInput("bedingungsinput", "🔊 - WELCHE VOICE-ZEIT SOLL JEMAND HABEN?", "Beispiel: 5h 10m"),
          role: createTextInput("bedingungsinput", "🎭 - WAS FÜR EINE ROLLE WIRD BENÖTIGT?", "Rollen ID"),
          membersince: createTextInput("bedingungsinput", "👥 - WIE LANGE MUSS JEMAND MITGLIED SEIN?", "Beispiel: 5y oder 1mo 7d 30m"),
          server: createTextInput("bedingungsinput", "💡 - WELCHER SERVER SOLL EMPFHOLEN WERDEN", "https://discord.gg/abc"),
        };

        if (bedingung && bedingungsInputs[bedingung]) {
          addModalComponents(modal, [durationInput, winnerInput, priceInput, bedingungsInputs[bedingung]]);
        } else {
          addModalComponents(modal, [durationInput, winnerInput, priceInput]);
        }

        await interaction.showModal(modal);
        let isProcessingComplete = false;
        await client.on("interactionCreate", async (inter) => {
          if (isProcessingComplete) {
            return;
          }
          if (inter.isModalSubmit() && inter.customId === `gw-modal-${id}`) {
            const durationInput = inter.fields.getTextInputValue("durationInput");
            const winnerInput = inter.fields.getTextInputValue("winnerInput");
            const priceInput = inter.fields.getTextInputValue("priceInput").toUpperCase();

            let bedingungInput = "none";
            let bedingungsvalue = "none";

            if (bedingung !== "none" && bedingung && bedingungsInputs[bedingung]) {
              bedingungsvalue = inter.fields.getTextInputValue("bedingungsinput") || "";

              if (bedingung === "voiceTime" || bedingung === "membersince") {
                bedingungInput = bedingungsvalue || null;
              } else {
                bedingungInput = bedingungsvalue;
              }
            }

            if (bedingung === "winnerInput" || bedingung === "messages" || bedingung === "role") {
              if (isNaN(bedingungInput)) {
                return inter.reply({ content: "> `❌` » Es dürfen nur Zahlen angegeben werden.", ephemeral: true });
              }
            }

            const durationDauer = ms(durationInput);
            if (isNaN(durationDauer)) {
              return inter.reply({ content: "> `❌` » Ungültige Dauer angegeben.", ephemeral: true });
            }

            const endDate = new Date(Date.now() + durationDauer);
            const timestamp = Math.floor(endDate / 1000);

            const bedingungsNachrichten = {
              messages: `\n<:Pfeil:1119709908540076124> Mindestens **${bedingungInput || "0"}** Nachrichten senden!`,
              voiceTime: `\n<:Pfeil:1119709908540076124> Mindestens **${bedingungsvalue || "0"}** in Sprachkanälen!`,
              role: `\n<:Pfeil:1119709908540076124> Rolle <@&${bedingungInput || "0"}> **besitzen**`,
              membersince: `\n<:Pfeil:1119709908540076124> **Seit ${ms(bedingungInput, { long: true }) || "0"} auf dem Server**`,
            };
            const bedingungNachricht = bedingung === "none"
              ? ""
              : bedingungsNachrichten[bedingung];

            const embed = new EmbedBuilder()
              .setTitle(`<a:Diamond:1018911546430210128> ${priceInput} <a:Diamond:1018911546430210128>`)
              .setDescription(`<a:Neuigkeiten:1018910061348798564> » **__Informationen__**\n<:PfeilBlau:1147248395837247613> **${winnerInput}** Gewinner\n<:PfeilBlau:1147248395837247613> Erstellt von ${interaction.user}\n<:PfeilBlau:1147248395837247613> Endet **<t:${timestamp}:R>** (<t:${timestamp}:D>)${sponsor ? `\n<:PfeilBlau:1147248395837247613>  Danke an den **Sponsor:** ${sponsor.user}` : ""}\n\n<a:pin:1007908864198463499> » **__Anforderung__**${bedingungNachricht}\n<:Pfeil:1119709908540076124> Klicke auf den **Button** zum teilnehmen!\n\n\`🌍\` » Rufe alle deine Statistiken mit \`/profil\` ab.`)
              .setColor("Blurple")
              .setThumbnail("https://cdn.discordapp.com/attachments/1269341729493094400/1271147368787480621/Gift.gif?ex=66b647bd&is=66b4f63d&hm=61eaa2c48e285bd587d9c30df8d489038c99cb289d5cd6bfa3f404ec8d3c1672&=&size=4096");

            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("giveaway-enter")
                .setLabel("» Klicke zum Teilnehmen")
                .setEmoji("<a:Gewinnspiel:968876390982234202>")
                .setStyle(ButtonStyle.Primary),
            );

            const giveawayMessage = await channel
              .send({ content: "<a:Giveaway:968876442618306560><a:Giveaway:968876442618306560> **NEUES EVENT!** <a:Giveaway:968876442618306560><a:Giveaway:968876442618306560>",
                      embeds: [embed],
                      components: [row],
              });

            const newGiveaway = new giveawaydb({
              channelID: channel.id,
              creator: inter.user.id,
              msgID: giveawayMessage.id,
              price: priceInput,
              teilnehmer: [],
              bedingung,
              bedingungString: bedingungInput,
              duration: durationDauer,
              gewinnerAnzahl: winnerInput,
              startTime: new Date(),
              endTime: null,
            });
            await newGiveaway.save();

            await userDB.updateMany({}, { $set: { "stats.messages": 0, "stats.voiceTime": 0 } });

            await inter.reply({ content: `> \`✅\` - **Gewinnspiel erstellt:** Das Gewinnspiel wurde so eben in dem Kanal ${channel} erstellt.`, ephemeral: true });
            isProcessingComplete = true;
          }
        });

        break;
      }

      case "end": {
        const messageId = interaction.options.getString("nachrichtenid");
        const giveaway = await giveawaydb.findOne({ _id: messageId });

        if (!giveaway) {
          return interaction.reply({ content: "> `❌` » Kein Gewinnspiel mit dieser ID gefunden.", ephemeral: true });
        }
        const endechannel = await interaction.client.channels.fetch(giveaway.channelID);
        const giveawayMessage = await endechannel.messages.fetch(giveaway.msgID);
        if (!giveawayMessage) {
          return interaction.reply({ content: "> `❌` » Nachricht nicht gefunden.", ephemeral: true });
        }

        const winners = await giveawayMessage.reactions.cache.get("🎉")?.users.fetch();

        if (!winners || winners.size === 0) {
          return interaction.reply({ content: "> `❌` » Keine Gewinner für dieses Gewinnspiel gefunden.", ephemeral: true });
        }

        const winnerList = Array.from(winners.values()).filter(user => !user.bot);
        if (winnerList.length === 0) {
          return interaction.reply({ content: "> `❌` » Keine gültigen Gewinner gefunden.", ephemeral: true });
        }

        const winnersDisplay = winnerList.map((winner, index) => `**${index + 1}.** <@${winner.id}>`).join("\n");
        const giveawayend = new EmbedBuilder()
          .setTitle(`<a:Diamond:1018911546430210128> ${giveaway.price} <a:Diamond:1018911546430210128>`)
          .setDescription(`<a:Neuigkeiten:1018910061348798564> » **__Gewinnspiel - Gewinner__**
      <:PfeilBlau:1147248395837247613> Teilnehmer: **${giveaway.teilnehmer.length}**
      <:PfeilBlau:1147248395837247613> Gewinner: ${winnersDisplay || "**`Zu wenig Teilnehmer`**"}
      <:PfeilBlau:1147248395837247613> Erstellt von <@${giveaway.creator}>`)
          .setColor("Red")
          .setThumbnail("https://cdn.discordapp.com/attachments/1269341729493094400/1271147368787480621/Gift.gif?ex=66b647bd&is=66b4f63d&hm=53e18bea4e53fcfa6bef3450c65670ac3d7d1d57e3dd66a18e23d9660dfdfc6d&")
          .setFooter({ text: `${interaction.client.user.displayName} - Bot`, iconURL: `${interaction.guild.iconURL()}` })
          .setTimestamp();

        await giveawayMessage.edit({ embeds: [giveawayend] });

        await giveawaydb.deleteOne({ _id: messageId });

        await interaction.reply({ content: "> `✅` » Gewinnspiel erfolgreich beendet!", ephemeral: true });
        break;
      }

      case "reroll": {
        const rerollId = interaction.options.getString("nachrichtenid");
        const rerollGiveaway = await giveawaydb.findOne({ _id: rerollId });

        if (!rerollGiveaway) {
          return interaction.reply({ content: "> `❌` » Kein Gewinnspiel mit dieser ID gefunden.", ephemeral: true });
        }

        const rerollChannel = await interaction.client.channels.fetch(rerollGiveaway.channelID);
        const rerollMessage = await rerollChannel.messages.fetch(rerollId);
        if (!rerollMessage) {
          return interaction.reply({ content: "> `❌` » Nachricht nicht gefunden.", ephemeral: true });
        }

        const rerollWinners = await rerollMessage.reactions.cache.get("🎉")?.users.fetch();

        if (!rerollWinners || rerollWinners.size === 0) {
          return interaction.reply({ content: "> `❌` » Keine Gewinner für dieses Gewinnspiel gefunden.", ephemeral: true });
        }

        const rerollWinnerList = Array.from(rerollWinners.values()).filter(user => !user.bot);
        if (rerollWinnerList.length === 0) {
          return interaction.reply({ content: "> `❌` » Keine gültigen Gewinner gefunden.", ephemeral: true });
        }

        const newWinner = rerollWinnerList[Math.floor(Math.random() * rerollWinnerList.length)];

        const rerollEmbed = new EmbedBuilder()
          .setTitle(rerollGiveaway.title)
          .setDescription(`<a:Neuigkeiten:1018910061348798564> » **__Gewinnspiel-Gewinner__**
    <:PfeilBlau:1147248395837247613> Teilnehmer: **${rerollGiveaway.teilnehmer.length}**
    <:PfeilBlau:1147248395837247613> Neuer Gewinner: **${newWinner ? `<@${newWinner.id}>` : "`Zu wenig Teilnehmer`"}**
    <:PfeilBlau:1147248395837247613> Erstellt von <@${rerollGiveaway.creator}>`)
          .setColor("Red")
          .setThumbnail("https://cdn.discordapp.com/attachments/1145779055644393592/1148698733056381030/Gewinnspiel.gif?ex=654a8d8f&is=6538188f&hm=d624d3b0def1f058aa42c6c74fd222a12c7673690e7a3146d2bad87deb74118c&")
          .setFooter({ text: `${interaction.client.user.displayName} - Bot`, iconURL: `${interaction.guild.iconURL()}` })
          .setTimestamp();

        await rerollMessage.edit({ embeds: [rerollEmbed] });

        await interaction.reply({ content: "> `✅` » Gewinner erfolgreich neu gezogen und die Nachricht aktualisiert!", ephemeral: true });
        break;
      }
    }
  },
};
