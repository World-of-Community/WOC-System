/*
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
          description: "» Name des Server-Partner's",
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
          description: "» Kategorie des Server-Partner's",
          required: true,
        },
        {
          type: 6,
          name: "owner",
          description: "» Ansprechpartner / Besitzer des Server-Partner's",
          required: true,
        },
        {
          type: 3,
          name: "invite",
          description: "» Einladungslink des Server-Partner's",
          required: true,
        },
        {
          type: 3,
          name: "description",
          description: "» Beschreibung des Partner's",
          required: false,
        },
        {
          type: 3,
          name: "thumbnail",
          description: "» Bild-/Logo-URL des Partner's",
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
          await interaction.respond([{ name: "`❌` » Kein Partner gefunden", value: "error" }]);
          return;
        }

        const partners = serverData.partner.partners;
        const filtered = partners
          .filter(p => p.name.toLowerCase().includes(focusedOption.value.toLowerCase()))
          .slice(0, 25);

        if (filtered.length === 0) {
          await interaction.respond([{ name: "`❌` » Kein Eintrag", value: "Kein Eintrag" }]);
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
          await interaction.editReply({ content: "> `❌` » Der angegebene Einladungslink ist ungültig." });
          return;
        }

        const serverData = await serverDB.findOne({ guildID: interaction.guild.id });
        const forumChannelId = config.partnerForumChannelId; // ID des Forum-Kanals aus der config
        const forumChannel = interaction.guild.channels.cache.get(forumChannelId);

        if (!forumChannel || (forumChannel.type !== ChannelType.GuildForum && forumChannel.type !== ChannelType.GuildText)) {
          await interaction.editReply({ content: "> `❌` » Kein gültiger Forum- oder Textkanal für Partner in der Datenbank konfiguriert." });
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
          .setColor("Blurple");

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
          .setColor("Blurple");

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
            content: `> \`✅\` » Der Server-Partner **${name}** wurde im Thread <#${thread.id}> erfolgreich erstellt!`,
          });

        } catch (error) {
          logger.error("Fehler beim Erstellen des Partner-Threads:", error);
          await interaction.editReply({ content: "`❌` » Fehler beim Erstellen des Forum-Beitrags." });
        }

        break;
      }

      case "delete": {
        const partnerNameToDelete = interaction.options.getString("partner");

        try {
          const serverData = await serverDB.findOne({ guildID: interaction.guild.id });

          if (!serverData || !serverData.partner || !serverData.partner.partners) {
            await interaction.reply({ content: "`❌` » Keine Server-Partner gefunden.", ephemeral: true });
            return;
          }

          const partnerIndex = serverData.partner.partners.findIndex(
            p => p.name.toLowerCase() === partnerNameToDelete.toLowerCase(),
          );

          if (partnerIndex === -1) {
            await interaction.reply({ content: "`❌` » Der angegebene Server-Partner wurde nicht gefunden.", ephemeral: true });
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

          await interaction.reply({ content: `> \`✅\` » Server-Partner **${partnerNameToDelete}** und der zugehörige Beitrag wurden gelöscht.`, ephemeral: true });
        } catch (error) {
          logger.error("Fehler beim Löschen des Partners:", error);
          await interaction.reply({ content: "> `❌` » Fehler beim Löschen des Partners.", ephemeral: true });
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
*/

// test

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} from "discord.js";

import serverDB from "../../models/serverdb.js";
import logger from "../../functions/logger.js";
import config from "../../json/config.json" with { type: "json" };

export default {
  name: "partner",
  description: "Partner System",
  type: 1,
  default_member_permissions: "8",

  options: [
    // =========================================================
    // ADD
    // =========================================================
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
          name: "kategorie",
          description: "» Kategorie des Server-Partners",
          required: true,

          choices: [
            { name: "Hosting", value: "Hosting" },
            { name: "Minecraft-Server", value: "Minecraft-Server" },
            { name: "Webseite", value: "Webseite" },
            { name: "Discord-Server", value: "Discord-Server" },
            { name: "Affiliate", value: "Affiliate" },
            { name: "Sonstiges", value: "Sonstiges" },
          ],
        },

        {
          type: 6,
          name: "owner",
          description: "» Ansprechpartner / Besitzer des Partners",
          required: true,
        },

        {
          type: 3,
          name: "invite",
          description: "» Discord-Einladungslink des Partners",
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
          description: "» Kleine Bild-/Logo-URL des Partners",
          required: false,
        },

        {
          type: 3,
          name: "embed",
          description: "» Optionale Banner-/Embed-Bild-URL",
          required: false,
        },
      ],
    },

    // =========================================================
    // EDIT
    // =========================================================
    {
      type: 1,
      name: "edit",
      description: "» Bearbeite einen bestehenden Server-Partner. ✏️",

      options: [
        {
          type: 3,
          name: "partner",
          description: "» Wähle den zu bearbeitenden Partner",
          required: true,
          autocomplete: true,
        },

        {
          type: 3,
          name: "name",
          description: "» Neuer Name des Partners",
          required: false,
        },

        {
          type: 3,
          name: "kategorie",
          description: "» Neue Kategorie",
          required: false,

          choices: [
            { name: "Hosting", value: "Hosting" },
            { name: "Minecraft-Server", value: "Minecraft-Server" },
            { name: "Webseite", value: "Webseite" },
            { name: "Discord-Server", value: "Discord-Server" },
            { name: "Affiliate", value: "Affiliate" },
            { name: "Sonstiges", value: "Sonstiges" },
          ],
        },

        {
          type: 6,
          name: "owner",
          description: "» Neuer Ansprechpartner / Besitzer",
          required: false,
        },

        {
          type: 3,
          name: "invite",
          description: "» Neuer Discord-Einladungslink",
          required: false,
        },

        {
          type: 3,
          name: "description",
          description: "» Neue Beschreibung",
          required: false,
        },

        {
          type: 3,
          name: "thumbnail",
          description: "» Neue kleine Bild-/Logo-URL",
          required: false,
        },

        {
          type: 3,
          name: "embed",
          description: "» Neue Banner-/Embed-Bild-URL",
          required: false,
        },
      ],
    },

    // =========================================================
    // DELETE
    // =========================================================
    {
      type: 1,
      name: "delete",
      description: "» Lösche einen Partner. 🤝",

      options: [
        {
          type: 3,
          name: "partner",
          description: "» Wähle einen Server-Partner aus",
          required: true,
          autocomplete: true,
        },
      ],
    },
  ],

  // =========================================================
  // AUTOCOMPLETE
  // =========================================================
  async autocomplete(interaction) {
    const focusedOption =
      interaction.options.getFocused(true);

    if (focusedOption.name !== "partner") return;

    try {
      const serverData =
        await serverDB.findOne({
          guildID: interaction.guild.id,
        });

      if (
        !serverData ||
        !serverData.partner ||
        !Array.isArray(
          serverData.partner.partners,
        ) ||
        serverData.partner.partners.length === 0
      ) {
        await interaction.respond([
          {
            name: "`❌` » Kein Partner gefunden",
            value: "error",
          },
        ]);

        return;
      }

      const searchValue =
        focusedOption.value.toLowerCase();

      const filtered =
        serverData.partner.partners
          .filter((p) =>
            String(p.name || "")
              .toLowerCase()
              .includes(searchValue),
          )
          .slice(0, 25);

      if (filtered.length === 0) {
        await interaction.respond([
          {
            name: "`❌` » Kein Eintrag",
            value: "Kein Eintrag",
          },
        ]);

        return;
      }

      await interaction.respond(
        filtered.map((p) => ({
          name: `${p.name} (${p.category || "N/A"})`,
          value: p.name,
        })),
      );
    } catch (error) {
      logger.error(
        "Fehler beim Autocomplete der Server-Partner:",
        error,
      );

      try {
        await interaction.respond([
          {
            name: "`❌` » Fehler beim Laden",
            value: "error",
          },
        ]);
      } catch {}
    }
  },

  // =========================================================
  // RUN
  // =========================================================
  async run(client, interaction) {
    const sub =
      interaction.options.getSubcommand();

    switch (sub) {
      // =======================================================
      // ADD
      // =======================================================
      case "add": {
        await interaction.deferReply({
          ephemeral: true,
        });

        const name =
          interaction.options.getString(
            "name",
          );

        const kategorie =
          interaction.options.getString(
            "kategorie",
          );

        const owner =
          interaction.options.getUser(
            "owner",
          );

        const invite =
          interaction.options.getString(
            "invite",
          );

        const description =
          interaction.options.getString(
            "description",
          ) || null;

        const thumbnail =
          interaction.options.getString(
            "thumbnail",
          ) || null;

        const embed =
          interaction.options.getString(
            "embed",
          ) || null;

        // -------------------------------------------------------
        // INVITE VALIDIEREN
        // -------------------------------------------------------
        if (!isValidInviteLink(invite)) {
          await interaction.editReply({
            content:
              "> `❌` » Der angegebene Discord-Einladungslink ist ungültig.",
          });

          return;
        }

        // -------------------------------------------------------
        // EMBED URL VALIDIEREN
        // -------------------------------------------------------
        if (
          embed &&
          !isValidImageUrl(embed)
        ) {
          await interaction.editReply({
            content:
              "> `❌` » Die angegebene Embed-/Banner-URL ist ungültig.",
          });

          return;
        }

        // -------------------------------------------------------
        // DATENBANK
        // -------------------------------------------------------
        const serverData =
          await serverDB.findOne({
            guildID: interaction.guild.id,
          });

        const forumChannelId =
          config.partnerForumChannelId;

        const forumChannel =
          interaction.guild.channels.cache.get(
            forumChannelId,
          );

        if (
          !forumChannel ||
          (
            forumChannel.type !==
              ChannelType.GuildForum &&
            forumChannel.type !==
              ChannelType.GuildText
          )
        ) {
          await interaction.editReply({
            content:
              "> `❌` » Kein gültiger Forum- oder Textkanal für Partner konfiguriert.",
          });

          return;
        }

        // -------------------------------------------------------
        // PARTNER-ID
        // -------------------------------------------------------
        const partnerCount =
          (
            serverData?.partner
              ?.partners?.length || 0
          ) + 1;

        const formattedDate =
          new Date().toLocaleDateString(
            "de-DE",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            },
          );

        // -------------------------------------------------------
        // HAUPT-EMBED
        // -------------------------------------------------------
        const mainEmbed =
          new EmbedBuilder()
            .setTitle(
              `:shield: ${name} (ID: ${partnerCount})`,
            )

            // Titel ist klickbar
            .setURL(invite)

            .setDescription(
              description ||
                "Keine Beschreibung angegeben.",
            )

            .setColor("Blurple");

        // Kleines Logo
        if (thumbnail) {
          mainEmbed.setThumbnail(
            thumbnail,
          );
        }

        // Großes Banner optional
        if (embed) {
          mainEmbed.setImage(embed);
        }

        // -------------------------------------------------------
        // INFO-EMBED
        // -------------------------------------------------------
        const infoEmbed =
          new EmbedBuilder()
            .setTitle(
              "🔔 Informationen",
            )

            .setDescription(
              `• Partner seit: \`${formattedDate}\`\n` +
              `• Ansprechpartner: <@${owner.id}>\n` +
              `• Kategorie: \`${kategorie}\``,
            )

            .setColor("Blurple");

        // -------------------------------------------------------
        // BUTTON
        // -------------------------------------------------------
        const button =
          createPartnerButton(
            invite,
          );

        // -------------------------------------------------------
        // TAGS
        // -------------------------------------------------------
        const tagId =
          config.partnerKategorieIds?.[
            kategorie
          ] || null;

        const generalTagId =
          config.partnerGeneralTagId ||
          null;

        const appliedTags = [
          tagId,
          generalTagId,
        ].filter(Boolean);

        try {
          let thread;
          let message;

          // =====================================================
          // FORUM
          // =====================================================
          if (
            forumChannel.type ===
            ChannelType.GuildForum
          ) {
            thread =
              await forumChannel.threads.create(
                {
                  name,

                  message: {
                    embeds: [
                      mainEmbed,
                      infoEmbed,
                    ],

                    components: [
                      button,
                    ],
                  },

                  appliedTags,
                },
              );

            message =
              await thread.fetchStarterMessage();
          }

          // =====================================================
          // TEXTKANAL
          // =====================================================
          else {
            thread =
              await forumChannel.threads.create(
                {
                  name,
                  autoArchiveDuration: 60,
                  reason:
                    `Partner Thread für ${name}`,
                },
              );

            message =
              await thread.send({
                embeds: [
                  mainEmbed,
                  infoEmbed,
                ],

                components: [
                  button,
                ],
              });
          }

          // -----------------------------------------------------
          // PARTNER ARRAY
          // -----------------------------------------------------
          if (!serverData.partner) {
            serverData.partner = {
              partners: [],
            };
          }

          if (
            !Array.isArray(
              serverData.partner.partners,
            )
          ) {
            serverData.partner.partners =
              [];
          }

          // -----------------------------------------------------
          // PARTNER SPEICHERN
          // -----------------------------------------------------
          serverData.partner.partners.push(
            {
              name,
              category: kategorie,
              ownerID: owner.id,
              invite,
              description,
              thumbnail,

              // Optionales Banner
              embed,

              threadID: thread.id,
              messageID:
                message?.id || null,

              createdAt:
                new Date(),
            },
          );

          serverData.markModified(
            "partner.partners",
          );

          await serverData.save();

          await interaction.editReply({
            content:
              `> \`✅\` » Der Server-Partner **${name}** wurde im Thread <#${thread.id}> erfolgreich erstellt!`,
          });
        } catch (error) {
          logger.error(
            "Fehler beim Erstellen des Partner-Threads:",
            error,
          );

          await interaction.editReply({
            content:
              "> `❌` » Fehler beim Erstellen des Forum-Beitrags.",
          });
        }

        break;
      }

      // =======================================================
      // EDIT
      // =======================================================
      case "edit": {
        await interaction.deferReply({
          ephemeral: true,
        });

        const partnerName =
          interaction.options.getString(
            "partner",
          );

        try {
          const serverData =
            await serverDB.findOne({
              guildID:
                interaction.guild.id,
            });

          if (
            !serverData ||
            !serverData.partner ||
            !Array.isArray(
              serverData.partner.partners,
            )
          ) {
            await interaction.editReply({
              content:
                "> `❌` » Keine Server-Partner gefunden.",
            });

            return;
          }

          // -----------------------------------------------------
          // PARTNER SUCHEN
          // -----------------------------------------------------
          const partnerIndex =
            serverData.partner.partners.findIndex(
              (p) =>
                String(p.name || "")
                  .toLowerCase() ===
                partnerName.toLowerCase(),
            );

          if (partnerIndex === -1) {
            await interaction.editReply({
              content:
                "> `❌` » Der angegebene Server-Partner wurde nicht gefunden.",
            });

            return;
          }

          const partner =
            serverData.partner
              .partners[partnerIndex];

          // -----------------------------------------------------
          // NEUE WERTE
          // -----------------------------------------------------
          const newName =
            interaction.options.getString(
              "name",
            );

          const newCategory =
            interaction.options.getString(
              "kategorie",
            );

          const newOwner =
            interaction.options.getUser(
              "owner",
            );

          const newInvite =
            interaction.options.getString(
              "invite",
            );

          const newDescription =
            interaction.options.getString(
              "description",
            );

          const newThumbnail =
            interaction.options.getString(
              "thumbnail",
            );

          const newEmbed =
            interaction.options.getString(
              "embed",
            );

          // -----------------------------------------------------
          // ENDGÜLTIGE WERTE
          // -----------------------------------------------------
          const finalName =
            newName || partner.name;

          const finalCategory =
            newCategory ||
            partner.category;

          const finalOwnerID =
            newOwner?.id ||
            partner.ownerID;

          const finalInvite =
            newInvite ||
            partner.invite;

          const finalDescription =
            newDescription !== null
              ? newDescription
              : partner.description ||
                null;

          const finalThumbnail =
            newThumbnail !== null
              ? newThumbnail
              : partner.thumbnail ||
                null;

          const finalEmbed =
            newEmbed !== null
              ? newEmbed
              : partner.embed ||
                null;

          // -----------------------------------------------------
          // INVITE VALIDIEREN
          // -----------------------------------------------------
          if (
            newInvite &&
            !isValidInviteLink(
              newInvite,
            )
          ) {
            await interaction.editReply({
              content:
                "> `❌` » Der neue Discord-Einladungslink ist ungültig.",
            });

            return;
          }

          // -----------------------------------------------------
          // EMBED VALIDIEREN
          // -----------------------------------------------------
          if (
            newEmbed &&
            !isValidImageUrl(
              newEmbed,
            )
          ) {
            await interaction.editReply({
              content:
                "> `❌` » Die neue Embed-/Banner-URL ist ungültig.",
            });

            return;
          }

          // -----------------------------------------------------
          // THREAD LADEN
          // -----------------------------------------------------
          if (!partner.threadID) {
            await interaction.editReply({
              content:
                "> `❌` » Für diesen Partner wurde kein Thread gespeichert.",
            });

            return;
          }

          const thread =
            interaction.guild.channels.cache.get(
              partner.threadID,
            ) ||
            await interaction.guild.channels
              .fetch(
                partner.threadID,
              )
              .catch(() => null);

          if (!thread) {
            await interaction.editReply({
              content:
                "> `❌` » Der zugehörige Partner-Thread wurde nicht gefunden.",
            });

            return;
          }

          // -----------------------------------------------------
          // MESSAGE LADEN
          // -----------------------------------------------------
          let message = null;

          if (partner.messageID) {
            message =
              await thread.messages
                .fetch(
                  partner.messageID,
                )
                .catch(() => null);
          }

          if (!message) {
            message =
              await thread
                .fetchStarterMessage()
                .catch(() => null);
          }

          // -----------------------------------------------------
          // PARTNER-ID
          // -----------------------------------------------------
          const partnerID =
            partnerIndex + 1;

          // -----------------------------------------------------
          // HAUPT-EMBED
          // -----------------------------------------------------
          const mainEmbed =
            new EmbedBuilder()
              .setTitle(
                `:shield: ${finalName} (ID: ${partnerID})`,
              )

              // Titel klickbar
              .setURL(finalInvite)

              .setDescription(
                finalDescription ||
                  "Keine Beschreibung angegeben.",
              )

              .setColor("Blurple");

          // Kleines Logo
          if (finalThumbnail) {
            mainEmbed.setThumbnail(
              finalThumbnail,
            );
          }

          // Großes Banner
          if (finalEmbed) {
            mainEmbed.setImage(
              finalEmbed,
            );
          }

          // -----------------------------------------------------
          // INFO-EMBED
          // -----------------------------------------------------
          const infoEmbed =
            new EmbedBuilder()
              .setTitle(
                "🔔 Informationen",
              )

              .setDescription(
                `• Partner seit: \`${getPartnerDate(partner)}\`\n` +
                `• Ansprechpartner: <@${finalOwnerID}>\n` +
                `• Kategorie: \`${finalCategory}\``,
              )

              .setColor("Blurple");

          // -----------------------------------------------------
          // BUTTON
          // -----------------------------------------------------
          const button =
            createPartnerButton(
              finalInvite,
            );

          // -----------------------------------------------------
          // MESSAGE AKTUALISIEREN
          // -----------------------------------------------------
          const messageData = {
            embeds: [
              mainEmbed,
              infoEmbed,
            ],

            components: [
              button,
            ],
          };

          if (message) {
            await message.edit(
              messageData,
            );
          } else {
            message =
              await thread.send(
                messageData,
              );
          }

          // -----------------------------------------------------
          // THREAD-NAME
          // -----------------------------------------------------
          if (
            thread.name !==
            finalName
          ) {
            await thread
              .setName(finalName)
              .catch(
                (error) => {
                  logger.error(
                    "Thread-Name konnte nicht geändert werden:",
                    error,
                  );
                },
              );
          }

          // -----------------------------------------------------
          // FORUM-TAGS
          // -----------------------------------------------------
          if (
            thread.parent &&
            thread.parent.type ===
              ChannelType.GuildForum
          ) {
            const newTagId =
              config.partnerKategorieIds?.[
                finalCategory
              ] || null;

            const generalTagId =
              config.partnerGeneralTagId ||
              null;

            const newTags = [
              newTagId,
              generalTagId,
            ].filter(Boolean);

            if (
              typeof thread.setAppliedTags ===
              "function"
            ) {
              await thread
                .setAppliedTags(
                  newTags,
                )
                .catch(
                  (error) => {
                    logger.error(
                      "Forum-Tags konnten nicht aktualisiert werden:",
                      error,
                    );
                  },
                );
            }
          }

          // -----------------------------------------------------
          // DATENBANK AKTUALISIEREN
          // -----------------------------------------------------
          partner.name =
            finalName;

          partner.category =
            finalCategory;

          partner.ownerID =
            finalOwnerID;

          partner.invite =
            finalInvite;

          partner.description =
            finalDescription;

          partner.thumbnail =
            finalThumbnail;

          // Banner speichern
          partner.embed =
            finalEmbed;

          partner.threadID =
            thread.id;

          partner.messageID =
            message.id;

          serverData.markModified(
            "partner.partners",
          );

          await serverData.save();

          await interaction.editReply({
            content:
              `> \`✅\` » Der Server-Partner **${finalName}** wurde erfolgreich bearbeitet.`,
          });
        } catch (error) {
          logger.error(
            "Fehler beim Bearbeiten des Partners:",
            error,
          );

          await interaction.editReply({
            content:
              "> `❌` » Beim Bearbeiten des Partners ist ein Fehler aufgetreten.",
          });
        }

        break;
      }

      // =======================================================
      // DELETE
      // =======================================================
      case "delete": {
        await interaction.deferReply({
          ephemeral: true,
        });

        const partnerNameToDelete =
          interaction.options.getString(
            "partner",
          );

        try {
          const serverData =
            await serverDB.findOne({
              guildID:
                interaction.guild.id,
            });

          if (
            !serverData ||
            !serverData.partner ||
            !Array.isArray(
              serverData.partner.partners,
            )
          ) {
            await interaction.editReply({
              content:
                "`❌` » Keine Server-Partner gefunden.",
            });

            return;
          }

          const partnerIndex =
            serverData.partner.partners.findIndex(
              (p) =>
                String(p.name || "")
                  .toLowerCase() ===
                partnerNameToDelete.toLowerCase(),
            );

          if (partnerIndex === -1) {
            await interaction.editReply({
              content:
                "`❌` » Der angegebene Server-Partner wurde nicht gefunden.",
            });

            return;
          }

          const partner =
            serverData.partner
              .partners[partnerIndex];

          // -----------------------------------------------------
          // THREAD LÖSCHEN
          // -----------------------------------------------------
          if (partner.threadID) {
            const threadChannel =
              interaction.guild.channels.cache.get(
                partner.threadID,
              ) ||
              await interaction.guild.channels
                .fetch(
                  partner.threadID,
                )
                .catch(() => null);

            if (threadChannel) {
              await threadChannel
                .delete()
                .catch((err) =>
                  logger.error(
                    "Thread konnte nicht gelöscht werden:",
                    err,
                  ),
                );
            }
          }

          // -----------------------------------------------------
          // PARTNER AUS DATENBANK ENTFERNEN
          // -----------------------------------------------------
          serverData.partner.partners.splice(
            partnerIndex,
            1,
          );

          serverData.markModified(
            "partner.partners",
          );

          await serverData.save();

          await interaction.editReply({
            content:
              `> \`✅\` » Server-Partner **${partnerNameToDelete}** und der zugehörige Beitrag wurden gelöscht.`,
          });
        } catch (error) {
          logger.error(
            "Fehler beim Löschen des Partners:",
            error,
          );

          await interaction.editReply({
            content:
              "> `❌` » Fehler beim Löschen des Partners.",
          });
        }

        break;
      }
    }
  },
};

// =============================================================
// BUTTON
// =============================================================

function createPartnerButton(invite) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(
        "Partner besuchen",
      )
      .setStyle(
        ButtonStyle.Link,
      )
      .setURL(invite),
  );
}

// =============================================================
// DISCORD INVITE VALIDIERUNG
// =============================================================

function isValidInviteLink(link) {
  if (!link) return false;

  const inviteRegex =
    /^(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|plus)\/|discordapp\.com\/invite\/)([a-zA-Z0-9]{2,32})$/;

  return inviteRegex.test(
    link.trim(),
  );
}

// =============================================================
// BILD-/BANNER-URL VALIDIERUNG
// =============================================================

function isValidImageUrl(link) {
  if (!link) return false;

  try {
    const url = new URL(
      link.trim(),
    );

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// =============================================================
// PARTNER-DATUM
// =============================================================

function getPartnerDate(partner) {
  if (partner.createdAt) {
    return new Date(
      partner.createdAt,
    ).toLocaleDateString(
      "de-DE",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
  }

  return "Unbekannt";
}