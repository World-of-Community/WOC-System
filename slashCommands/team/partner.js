import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} from "discord.js";
import serverDB from "../../models/serverdb.js";
import logger from "../../functions/logger.js";
import config from "../../json/config.json" with { type:  "json" };

export default {
  name: "partner",
  description: "Partner System",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      type: 1,
      name: "add",
      description: "» Füge einen Server-Partner hinzu. 🤝",
      options: [
        {
          type: 3,
          name: "name",
          description: "» Name des Server-Partners",
          required: true,
        },
        {
          type: 3,
          choices: [
            { name: "Hosting", value: "Hosting" },
            { name: "Minecraft-Server", value: "Minecraft-Server" },
            { name: "Webseite", value: "Webseite" },
            { name: "Discord-Server", value: "Discord-Server" },
            { name: "Affiliate", value: "Affiliate" },
            { name: "Sonstiges", value: "Sonstiges" },
          ],
          name: "kategorie",
          description: "» Kategorie des Server-Partners",
          required: true,
        },
        {
          type: 6,
          name: "owner",
          description: "» Ansprechpartner / Besitzer des Server-Partners",
          required: true,
        },
        {
          type: 3,
          name: "invite",
          description: "» Einladungslink des Server-Partners",
          required: true,
        },
        {
          type: 3,
          name: "description",
          description: "» Beschreibung des Partners",
          required: false,
        },
        {
          type: 3,
          name: "thumbnail",
          description: "» Bild-/Logo-URL des Partners",
          required: false,
        },
      ],
    },
    {
      type: 1,
      name: "delete",
      description: "» Lösche einen Partner. 🤝",
      options: [
        {
          autocomplete: true,
          type: 3,
          name: "partner",
          description: "» Wähle einen Server-Partner aus",
          required: true,
        },
      ],
    },
  ],

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "partner") {
      try {
        const serverData = await serverDB.findOne({ guildID: interaction.guild.id });
        if (!serverData || !serverData.partner || !serverData.partner.partners) {
          await interaction.respond([{ name: "❌ » Kein Partner gefunden", value: "error" }]);
          return;
        }

        const partners = serverData.partner.partners;
        const filtered = partners
          .filter(p => p.name.toLowerCase().includes(focusedOption.value.toLowerCase()))
          .slice(0, 25);

        if (filtered.length === 0) {
          await interaction.respond([{ name: "❌ » Kein Eintrag", value: "Kein Eintrag" }]);
          return;
        }

        await interaction.respond(
          filtered.map(p => ({ name: `${p.name} (${p.category || "N/A"})`, value: p.name })),
        );
      } catch (error) {
        logger.error("Fehler beim Autocomplete der Server-Partner:", error);
      }
    }
  },

  async run(client, interaction) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "add": {
        await interaction.deferReply({ ephemeral: true });

        const name = interaction.options.getString("name");
        const kategorie = interaction.options.getString("kategorie");
        const owner = interaction.options.getUser("owner");
        const invite = interaction.options.getString("invite");
        const description = interaction.options.getString("description") || "Keine Beschreibung angegeben.";
        const thumbnail = interaction.options.getString("thumbnail");

        if (!isValidInviteLink(invite)) {
          await interaction.editReply({ content: "❌ » Der angegebene Einladungslink ist ungültig." });
          return;
        }

        const serverData = await serverDB.findOne({ guildID: interaction.guild.id });
        const forumChannelId = config.partnerForumChannelId; // ID des Forum-Kanals aus der config
        const forumChannel = interaction.guild.channels.cache.get(forumChannelId);

        if (!forumChannel || (forumChannel.type !== ChannelType.GuildForum && forumChannel.type !== ChannelType.GuildText)) {
          await interaction.editReply({ content: "❌ » Kein gültiger Forum- oder Textkanal für Partner in der Datenbank konfiguriert." });
          return;
        }

        const partnerCount = (serverData?.partner?.partners?.length || 0) + 1;
        const formattedDate = new Date().toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        // 1. Haupt-Embed (Name, ID & Beschreibung)
        const mainEmbed = new EmbedBuilder()
          .setTitle(`:shield: ${name} (ID: ${partnerCount})`)
          .setDescription(description)
          .setColor("#E91E63");

        if (thumbnail) {
          mainEmbed.setThumbnail(thumbnail);
        }

        // 2. Info-Embed (Aufzählung wie im Screenshot)
        const infoEmbed = new EmbedBuilder()
          .setTitle("🔔 Informationen")
          .setDescription(
            `• Partner seit: \`${formattedDate}\`\n` +
            `• Ansprechpartner: <@${owner.id}>\n` +
            `• Kategorie: \`${kategorie}\``,
          )
          .setColor("#E91E63");

        // 3. Link Button
        const button = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Partner besuchen")
            .setStyle(ButtonStyle.Link)
            .setURL(invite),
        );

        const tagId = config.partnerKategorieIds[kategorie] || null;
        const generalTagId = config.partnerGeneralTagId || null;

        try {
          let thread;

          if (forumChannel.type === ChannelType.GuildForum) {
            // Erstellt einen neuen Post in einem Forum-Kanal
            thread = await forumChannel.threads.create({
              name,
              message: {
                embeds: [mainEmbed, infoEmbed],
                components: [button],
              },
              appliedTags: [tagId, generalTagId],
            });
          } else {
            // Erstellt einen Thread in einem normalen Textkanal
            thread = await forumChannel.threads.create({
              name,
              autoArchiveDuration: 60,
              reason: `Partner Thread für ${name}`,
            });

            await thread.send({
              embeds: [mainEmbed, infoEmbed],
              components: [button],
            });
          }

          // In Datenbank speichern
          if (!serverData.partner) {
            serverData.partner = { partners: [] };
          }
          serverData.partner.partners.push({
            name,
            category: kategorie,
            ownerID: owner.id,
            invite,
            threadID: thread.id,
          });

          await serverData.save();

          await interaction.editReply({
            content: `> ✅ » Der Server-Partner **${name}** wurde im Thread <#${thread.id}> erfolgreich erstellt!`,
          });

        } catch (error) {
          logger.error("Fehler beim Erstellen des Partner-Threads:", error);
          await interaction.editReply({ content: "❌ » Fehler beim Erstellen des Forum-Beitrags." });
        }

        break;
      }

      case "delete": {
        const partnerNameToDelete = interaction.options.getString("partner");

        try {
          const serverData = await serverDB.findOne({ guildID: interaction.guild.id });

          if (!serverData || !serverData.partner || !serverData.partner.partners) {
            await interaction.reply({ content: "❌ » Keine Server-Partner gefunden.", ephemeral: true });
            return;
          }

          const partnerIndex = serverData.partner.partners.findIndex(
            p => p.name.toLowerCase() === partnerNameToDelete.toLowerCase(),
          );

          if (partnerIndex === -1) {
            await interaction.reply({ content: "❌ » Der angegebene Server-Partner wurde nicht gefunden.", ephemeral: true });
            return;
          }

          const partner = serverData.partner.partners[partnerIndex];

          // Löscht den Thread im Forum, falls vorhanden
          if (partner.threadID) {
            const threadChannel = interaction.guild.channels.cache.get(partner.threadID);
            if (threadChannel) {
              await threadChannel.delete().catch(err => logger.error("Thread konnte nicht gelöscht werden:", err));
            }
          }

          serverData.partner.partners.splice(partnerIndex, 1);
          await serverData.save();

          await interaction.reply({ content: `> ✅ » Server-Partner **${partnerNameToDelete}** und der zugehörige Beitrag wurden gelöscht.`, ephemeral: true });
        } catch (error) {
          logger.error("Fehler beim Löschen des Partners:", error);
          await interaction.reply({ content: "❌ » Fehler beim Löschen des Partners.", ephemeral: true });
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
