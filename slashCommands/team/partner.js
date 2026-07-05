import {EmbedBuilder} from "discord.js";
import serverDB from "../../models/serverdb.js";
import logger from "../../functions/logger.js";

export default {
  name: "partner",
  description: "Partner System",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      "type": 1,
      "name": "add",
      "description": "» Füge einen Server-Partner hinzu. 🤝",
      "options": [
        {
          "type": 3,
          "name": "name",
          "description": "» Name des Server-Partners",
          "required": true,
        },
        {
          "type": 3,
          "choices": [
            {
              "name": "Kooperation Partner",
              "value": "Kooperation",
            },
            {
              "name": "Normale Partner",
              "value": "Normale Partner",
            },
          ],
          "name": "kategorie",
          "description": "» Kategorie des Server-Partners",
          "required": true,
        },
        {
          "name": "owner",
          "description": "» Besitzer des Server-Partners",
          "required": true,
          "type": 6,
        },
        {
          "type": 3,
          "name": "invite",
          "description": "» Einladungslink des Server-Partners",
          "required": true,
        },
      ],
    },
    {
      "type": 1,
      "name": "edit",
      "description": "» Bearbeite einen Partner 🤝",
      "options": [
        {
          "autocomplete": true,
          "type": 3,
          "name": "partner",
          "description": "» Wähle ein Server-Partner aus",
          "required": true,
        },
      ],
    },
    {
      "type": 1,
      "name": "delete",
      "description": "» Lösche einen Partner. 🤝",
      "options": [
        {
          "autocomplete": true,
          "type": 3,
          "name": "partner",
          "description": "» Wähle ein Server-Partner aus",
          "required": true,
        },
      ],
    },
    {
      "type": 1,
      "name": "refresh",
      "description": "» Aktualisiere die Partnerliste. 🤝",
      "options": [],
    },
  ],

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "partner") {
      try {
        const serverData = await serverDB.findOne({ guildID: interaction.guild.id });
        if (!serverData || !serverData.partner || !serverData.partner.partners) {
          await interaction.respond([{ name: "`❌` » Kein Partner gefunden", value: "error" }]);
          return;
        }

        const partners = serverData.partner.partners;
        const filtered = partners
          .filter(partner => partner.name.toLowerCase().includes(focusedOption.value.toLowerCase()))
          .slice(0, 25);

        if (filtered.length === 0) {
          filtered.push({ name: "`❌` » Kein Eintrag", value: "Kein Eintrag" });
        }

        await interaction.respond(
          filtered.map(partner => ({ name: `${partner.name} (${partner.category || "N/A"})`, value: partner.name })),
        );
      } catch (error) {
        logger.error("Fehler beim Abrufen der Server-Partner aus der Datenbank:", error);
      }
    }
  },

  async run(client, interaction) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "add": {
        const name = interaction.options.getString("name");
        const kategorie = interaction.options.getString("kategorie");
        const owner = interaction.options.getUser("owner");
        const invite = interaction.options.getString("invite");

        const serverData = await serverDB.findOne({ guildID: interaction.guild.id });

        if (!isValidInviteLink(invite)) {
          await interaction.reply({ content: "`❌` » Der angegebene Einladungslink ist ungültig.", ephemeral: true });
          return;
        }

        if (!serverData || !serverData.partner) {
          serverData.partner = { partners: [] };
        }

        const newPartner = { name, category: kategorie, ownerID: owner.id, invite };
        serverData.partner.partners.push(newPartner);

        try {
          await serverData.save();
          await interaction.reply({ content: `> \`✅\` » Der Server-Partner **${name}** (${owner}) wurde im Bereich **${kategorie}** erfolgreich hinzugefügt!`, ephemeral: true });
        } catch (error) {
          logger.error("Fehler beim Speichern der Partnerdaten:", error);
          await interaction.reply({ content: "`❌` » Fehler beim Speichern der Partnerdaten.", ephemeral: true });
        }

        break;
      }

      case "delete": {
        const partnerNameToDelete = interaction.options.getString("partner");

        try {
          const serverData = await serverDB.findOne({ guildID: interaction.guild.id });

          if (!serverData || !serverData.partner || !serverData.partner.partners) {
            await interaction.reply({ content: "`❌` » Keine Server-Partner zum Löschen gefunden.", ephemeral: true });
            return;
          }

          const partnerIndex = serverData.partner.partners.findIndex(
            partner => partner.name.toLowerCase() === partnerNameToDelete.toLowerCase(),
          );

          if (partnerIndex === -1) {
            await interaction.reply({ content: "`❌` » Der angegebene Server-Partner wurde nicht gefunden.", ephemeral: true });
            return;
          }

          serverData.partner.partners.splice(partnerIndex, 1);
          await serverData.save();

          await interaction.reply({ content: `> \`✅\` » Server-Partner **${partnerNameToDelete}** wurde erfolgreich gelöscht.`, ephemeral: true });
        } catch (error) {
          logger.error("Fehler beim Löschen des Partners:", error);
          await interaction.reply({ content: "`❌` » Fehler beim Löschen des Partners.", ephemeral: true });
        }

        break;
      }

      case "refresh": {
        try {
          const serverData = await serverDB.findOne({ guildID: interaction.guild.id });

          if (!serverData || !serverData.partner || !serverData.partner.partners || serverData.partner.partners.length === 0) {
            await interaction.reply({ content: "> `❌` » Keine Server-Partner zum Aktualisieren gefunden.", ephemeral: true });
            return;
          }

          const newEmbed = createPartnerListEmbed(serverData, interaction);
          const channel = interaction.guild.channels.cache.get(serverData.partner.channel);
          const sentMessage = await channel.messages.fetch(serverData.partner.msg);

          await sentMessage.edit({ embeds: [newEmbed] });
          await interaction.reply({ content: "> `✅` » Die Partnerliste wurde erfolgreich aktualisiert!", ephemeral: true });
        } catch (error) {
          logger.error("Fehler beim Aktualisieren der Partnerliste:", error);
          await interaction.reply({ content: "> `❌` » Fehler beim Aktualisieren der Partnerliste.", ephemeral: true });
        }

        break;
      }
    }
  },
};

function isValidInviteLink(link) {
  const inviteRegex = /^(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|plus)\/|discordapp\.com\/invite\/)([a-zA-Z0-9]{2,32})$/;
  return inviteRegex.test(link);
}

function createPartnerListEmbed(serverData, interaction) {
  const embed = new EmbedBuilder()
    .setTitle("Unsere Partnerliste")
    .setColor("Blurple");
  //.setFooter({ text: 'Maximal 15 Server-Partner - Zuletzt aktualisiert:', iconURL: interaction.guild.iconURL() })
  //.setTimestamp();


  const Info = "> Hier sind alle unsere Server-Partner - Wenn du selbst\n> ein Server-Partner werden möchtest, schau bei\n> <#1172819623935221810> vorbei.\n\n";

  // Partner nach Kategorien sortieren
  const cooperationPartners = serverData.partner.partners.filter(partner => partner.category === "Kooperation");
  const normalPartners = serverData.partner.partners.filter(partner => partner.category === "Normale Partner");

  // Kooperation Partner
  const cooperationList = cooperationPartners.length > 0
    ? cooperationPartners
      .map((partner, index) => `\`${index + 1}.\` [${partner.name}](${partner.invite}) (${interaction.guild.members.cache.get(partner.ownerID)?.user.username || "Unbekannt"})`)
      .join("\n")
    : "❌ » Keine Partner eingetragen";

  // Normale Partner
  const normalList = normalPartners.length > 0
    ? normalPartners
      .map((partner, index) => `\`${index + 1}.\` [${partner.name}](${partner.invite}) (${interaction.guild.members.cache.get(partner.ownerID)?.user.username || "Unbekannt"})`)
      .join("\n")
    : "❌ » Keine Partner eingetragen";

  //const description = serverData.partner.partners.length > 0
  //    ? serverData.partner.partners
  //        .map((partner, index) => `\`${index + 1}.\` [${partner.name}](${partner.invite}) (${interaction.guild.members.cache.get(partner.ownerID)?.user.username || 'Unbekannt'})`)
  //        .join('\n')
  //    : '❌ » Keine Partner eingetragen';

  const currentTime = new Date(); // Aktuelle Zeit abrufen
  const formattedTime = currentTime.toLocaleDateString("de-DE", {
    weekday: "long",   // Montag, Dienstag etc.
    day: "2-digit",    // 01, 02, 03 ...
    month: "long",     // Januar, Februar etc.
    year: "numeric",   // 2025
  });

  embed.setDescription(
    Info +
        `**Kooperation Partner:**\n${cooperationList}\n\n` +
        `**Normale Partner:**\n${normalList}`,
  ).setFooter({ text: `Maximal 15 Server-Partner | Aktualisiert am: ${formattedTime}` });

  return embed;
}
