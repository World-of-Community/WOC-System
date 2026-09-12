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
  PermissionFlagsBits,
} from "discord.js";

import serverDB from "../../models/serverdb.js";
import config from "../../json/config.json" with { type: "json" };
import logger from "../../functions/logger.js";

/*
 * ============================================================
 * PARTNER IDs NORMALISIEREN
 * ============================================================
 */

function normalizePartnerIDs(partners) {
  const usedIDs = new Set();

  for (const partner of partners) {
    const id = Number(partner.partnerID);

    if (
      Number.isInteger(id) &&
      id > 0 &&
      !usedIDs.has(id)
    ) {
      partner.partnerID = id;
      usedIDs.add(id);
    } else {
      partner.partnerID = null;
    }
  }

  let nextID = 1;

  for (const partner of partners) {
    if (partner.partnerID !== null) {
      continue;
    }

    while (usedIDs.has(nextID)) {
      nextID++;
    }

    partner.partnerID = nextID;
    usedIDs.add(nextID);
    nextID++;
  }

  return partners;
}

/*
 * ============================================================
 * HÖCHSTE PARTNER ID
 * ============================================================
 */

function getHighestPartnerID(partners) {
  if (!partners.length) {
    return 0;
  }

  return Math.max(
    ...partners.map((partner) => {
      const id = Number(partner.partnerID);

      return Number.isInteger(id) && id > 0
        ? id
        : 0;
    }),
  );
}

/*
 * ============================================================
 * URL VALIDIERUNG
 * ============================================================
 */

function isValidInviteLink(url) {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "https:" ||
      parsed.protocol === "http:"
    );
  } catch {
    return false;
  }
}

function isValidImageUrl(url) {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "https:" ||
      parsed.protocol === "http:"
    );
  } catch {
    return false;
  }
}

/*
 * ============================================================
 * DATUM
 * ============================================================
 */

function getPartnerDate(date = new Date()) {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    dateStyle: "long",
  }).format(date);
}

/*
 * ============================================================
 * BUTTON
 * ============================================================
 */

function createPartnerButton(invite) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Partner besuchen")
      .setStyle(ButtonStyle.Link)
      .setURL(invite)
      .setEmoji("🔗"),
  );
}

/*
 * ============================================================
 * FORUM BERECHTIGUNGEN
 * ============================================================
 *
 * @everyone:
 * ❌ keine Nachrichten
 * ❌ keine Antworten
 * ❌ keine Threads
 *
 * Bot:
 * ✅ Nachrichten
 * ✅ Antworten
 * ✅ Threads
 */

async function setupPartnerForumPermissions(
  forumChannel,
  guild,
) {
  try {
    /*
     * @everyone
     */

    await forumChannel.permissionOverwrites.edit(
      guild.roles.everyone,
      {
        SendMessages: false,
        SendMessagesInThreads: false,
        CreatePublicThreads: false,
        CreatePrivateThreads: false,
      },
    );

    /*
     * Bot
     */

    const botMember =
      guild.members.me ||
      await guild.members.fetch(
        forumChannel.client.user.id,
      ).catch(() => null);

    if (botMember) {
      await forumChannel.permissionOverwrites.edit(
        botMember,
        {
          ViewChannel: true,
          ReadMessageHistory: true,

          SendMessages: true,
          SendMessagesInThreads: true,

          CreatePublicThreads: true,
          CreatePrivateThreads: true,

          ManageThreads: true,
        },
      );
    }

    return true;
  } catch (error) {
    logger.error(
      "Partner Forum Permissions konnten nicht gesetzt werden:\n" +
        `Message: ${error?.message}\n` +
        `Code: ${error?.code}\n` +
        `Status: ${error?.status}\n` +
        `Raw: ${JSON.stringify(
          error?.rawError || {},
          null,
          2,
        )}`,
    );

    console.error(
      "PARTNER FORUM PERMISSION ERROR:",
      error,
    );

    return false;
  }
}

/*
 * ============================================================
 * FORUM TAGS ERMITTELN
 * ============================================================
 */

function getPartnerTags(
  forumChannel,
  category,
) {
  const availableTags =
    forumChannel.availableTags || [];

  const availableTagIDs = new Set(
    availableTags.map((tag) => tag.id),
  );

  const categoryTag =
    config.partnerKategorieIds?.[category];

  const generalTag =
    config.partnerGeneralTagId;

  const configuredTagIDs = [
    categoryTag,
    generalTag,
  ].filter(Boolean);

  const appliedTags =
    configuredTagIDs.filter((tagID) =>
      availableTagIDs.has(tagID),
    );

  const invalidTagIDs =
    configuredTagIDs.filter(
      (tagID) =>
        !availableTagIDs.has(tagID),
    );

  return {
    appliedTags,
    invalidTagIDs,
  };
}

/*
 * ============================================================
 * EMBEDS
 * ============================================================
 */

function createMainPartnerEmbed(partner) {
  const embed =
    new EmbedBuilder()
      .setTitle(
        `:shield: ${partner.name} (ID: ${partner.partnerID})`,
      )
      .setURL(partner.invite)
      .setDescription(
        partner.description ||
          "Keine Beschreibung angegeben.",
      )
      .setColor("Blurple");

  if (partner.thumbnail) {
    embed.setThumbnail(
      partner.thumbnail,
    );
  }

  if (partner.embed) {
    embed.setImage(
      partner.embed,
    );
  }

  return embed;
}

function createInfoPartnerEmbed(
  partner,
  ownerUser,
) {
  return new EmbedBuilder()
    .setTitle("🔔 Informationen")
    .setColor("Blurple")
    .addFields(
      {
        name: "📅 Erstellt am",
        value: getPartnerDate(
          partner.createdAt,
        ),
        inline: true,
      },
      {
        name: "👤 Besitzer",
        value: ownerUser
          ? `${ownerUser}`
          : `<@${partner.ownerID}>`,
        inline: true,
      },
      {
        name: "📁 Kategorie",
        value: `\`${partner.category}\``,
        inline: true,
      },
    );
}

/*
 * ============================================================
 * THREAD BERECHTIGUNGEN
 * ============================================================
 */

async function setupPartnerThreadPermissions(
  thread,
  guild,
) {
  try {
    /*
     * @everyone darf im Partner-Beitrag NICHT schreiben
     */

    await thread.permissionOverwrites.edit(
      guild.roles.everyone,
      {
        SendMessages: false,
        SendMessagesInThreads: false,
      },
    );

    /*
     * Bot darf schreiben
     */

    const botMember =
      guild.members.me ||
      await guild.members.fetch(
        thread.client.user.id,
      ).catch(() => null);

    if (botMember) {
      await thread.permissionOverwrites.edit(
        botMember,
        {
          ViewChannel: true,
          ReadMessageHistory: true,
          SendMessages: true,
          SendMessagesInThreads: true,
          ManageThreads: true,
        },
      );
    }

    return true;
  } catch (error) {
    logger.warn(
      `Partner-Thread-Berechtigungen konnten nicht gesetzt werden: ${error?.message}`,
    );

    return false;
  }
}

/*
 * ============================================================
 * COMMAND
 * ============================================================
 */

export default {
  name: "partner",

  description:
    "» Verwalte die Partner des Servers.",

  type: 1,

  default_member_permissions:
    PermissionFlagsBits.Administrator.toString(),

  options: [
    /*
     * ========================================================
     * ADD
     * ========================================================
     */

    {
      type: 1,
      name: "add",
      description:
        "Füge einen neuen Partner hinzu.",

      options: [
        {
          type: 3,
          name: "name",
          description:
            "Name des Partners.",
          required: true,
        },

        {
          type: 3,
          name: "kategorie",
          description:
            "Kategorie des Partners.",
          required: true,

          choices: [
            {
              name: "Hosting",
              value: "Hosting",
            },
            {
              name: "Minecraft-Server",
              value: "Minecraft-Server",
            },
            {
              name: "Webseite",
              value: "Webseite",
            },
            {
              name: "Discord-Server",
              value: "Discord-Server",
            },
            {
              name: "Affiliate",
              value: "Affiliate",
            },
            {
              name: "Sonstiges",
              value: "Sonstiges",
            },
          ],
        },

        {
          type: 6,
          name: "owner",
          description:
            "Besitzer des Partners.",
          required: true,
        },

        {
          type: 3,
          name: "invite",
          description:
            "Einladungs-/Partnerlink.",
          required: true,
        },

        {
          type: 3,
          name: "description",
          description:
            "Beschreibung des Partners.",
          required: false,
        },

        {
          type: 3,
          name: "thumbnail",
          description:
            "Thumbnail-URL.",
          required: false,
        },

        {
          type: 3,
          name: "embed",
          description:
            "Bild-URL für das Embed.",
          required: false,
        },
      ],
    },

    /*
     * ========================================================
     * EDIT
     * ========================================================
     */

    {
      type: 1,
      name: "edit",
      description:
        "Bearbeite einen bestehenden Partner.",

      options: [
        {
          type: 3,
          name: "partner",
          description:
            "Welcher Partner soll bearbeitet werden?",
          required: true,
          autocomplete: true,
        },

        {
          type: 3,
          name: "name",
          description:
            "Neuer Name.",
          required: false,
        },

        {
          type: 3,
          name: "kategorie",
          description:
            "Neue Kategorie.",
          required: false,

          choices: [
            {
              name: "Hosting",
              value: "Hosting",
            },
            {
              name: "Minecraft-Server",
              value: "Minecraft-Server",
            },
            {
              name: "Webseite",
              value: "Webseite",
            },
            {
              name: "Discord-Server",
              value: "Discord-Server",
            },
            {
              name: "Affiliate",
              value: "Affiliate",
            },
            {
              name: "Sonstiges",
              value: "Sonstiges",
            },
          ],
        },

        {
          type: 6,
          name: "owner",
          description:
            "Neuer Besitzer.",
          required: false,
        },

        {
          type: 3,
          name: "invite",
          description:
            "Neuer Einladungs-/Partnerlink.",
          required: false,
        },

        {
          type: 3,
          name: "description",
          description:
            "Neue Beschreibung.",
          required: false,
        },

        {
          type: 3,
          name: "thumbnail",
          description:
            "Neue Thumbnail-URL.",
          required: false,
        },

        {
          type: 3,
          name: "embed",
          description:
            "Neue Bild-URL.",
          required: false,
        },
      ],
    },

    /*
     * ========================================================
     * DELETE
     * ========================================================
     */

    {
      type: 1,
      name: "delete",
      description:
        "Lösche einen bestehenden Partner.",

      options: [
        {
          type: 3,
          name: "partner",
          description:
            "Welcher Partner soll gelöscht werden?",
          required: true,
          autocomplete: true,
        },
      ],
    },
  ],

  /*
   * ==========================================================
   * RUN
   * ==========================================================
   *
   * WICHTIG:
   * Dein interactionCreate.js verwendet:
   *
   * slashCommand.run(client, interaction)
   *
   * Deshalb MUSS der Command "run" verwenden.
   */

  async run(client, interaction) {
    try {
      /*
       * ======================================================
       * AUTOCOMPLETE
       * ======================================================
       */

      if (interaction.isAutocomplete()) {
        const serverData =
          await serverDB.findOne({
            guildID:
              interaction.guild.id,
          });

        if (
          !serverData?.partner?.partners?.length
        ) {
          return interaction.respond([]);
        }

        const focused =
          interaction.options
            .getFocused()
            .toLowerCase();

        const results =
          serverData.partner.partners
            .filter((partner) => {
              const name =
                String(
                  partner.name || "",
                ).toLowerCase();

              const id =
                String(
                  partner.partnerID || "",
                );

              return (
                name.includes(focused) ||
                id.includes(focused)
              );
            })
            .slice(0, 25)
            .map((partner) => ({
              name:
                `#${partner.partnerID} – ${partner.name}`.slice(
                  0,
                  100,
                ),

              value: String(
                partner.partnerID,
              ),
            }));

        return interaction.respond(
          results,
        );
      }

      /*
       * ======================================================
       * SUBCOMMAND
       * ======================================================
       */

      const subcommand =
        interaction.options.getSubcommand();

      /*
       * ======================================================
       * SERVER DB
       * ======================================================
       */

      let serverData =
        await serverDB.findOne({
          guildID:
            interaction.guild.id,
        });

      if (!serverData) {
        serverData =
          await serverDB.create({
            guildID:
              interaction.guild.id,
          });
      }

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
        serverData.partner.partners = [];
      }

      /*
       * IDs reparieren
       */

      normalizePartnerIDs(
        serverData.partner.partners,
      );

      /*
       * ======================================================
       * ADD
       * ======================================================
       */

      if (subcommand === "add") {
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
          ) || "";

        const thumbnail =
          interaction.options.getString(
            "thumbnail",
          ) || "";

        const embedImage =
          interaction.options.getString(
            "embed",
          ) || "";

        /*
         * URLs prüfen
         */

        if (!isValidInviteLink(invite)) {
          return interaction.reply({
            content:
              "❌ » Der angegebene Invite-/Partnerlink ist ungültig.",
            flags: 64,
          });
        }

        if (
          thumbnail &&
          !isValidImageUrl(thumbnail)
        ) {
          return interaction.reply({
            content:
              "❌ » Die angegebene Thumbnail-URL ist ungültig.",
            flags: 64,
          });
        }

        if (
          embedImage &&
          !isValidImageUrl(embedImage)
        ) {
          return interaction.reply({
            content:
              "❌ » Die angegebene Embed-Bild-URL ist ungültig.",
            flags: 64,
          });
        }

        /*
         * Partner-ID
         */

        const highestPartnerID =
          getHighestPartnerID(
            serverData.partner.partners,
          );

        const partnerID =
          highestPartnerID + 1;

        /*
         * ======================================================
         * FORUM
         * ======================================================
         */

        if (
          !config.partnerForumChannelId
        ) {
          return interaction.reply({
            content:
              "❌ » Es wurde keine `partnerForumChannelId` in der Config hinterlegt.",
            flags: 64,
          });
        }

        const forumChannel =
          await interaction.guild.channels
            .fetch(
              config.partnerForumChannelId,
            )
            .catch(() => null);

        if (!forumChannel) {
          return interaction.reply({
            content:
              "❌ » Der konfigurierte Partner-Forum-Kanal wurde nicht gefunden.",
            flags: 64,
          });
        }

        if (
          forumChannel.type !==
          ChannelType.GuildForum
        ) {
          return interaction.reply({
            content:
              "❌ » Der konfigurierte Partner-Kanal ist kein Forum-Kanal.",
            flags: 64,
          });
        }

        /*
         * Forum-Berechtigungen
         */

        const permissionsOK =
          await setupPartnerForumPermissions(
            forumChannel,
            interaction.guild,
          );

        if (!permissionsOK) {
          return interaction.reply({
            content:
              "❌ » Die Berechtigungen des Partner-Forums konnten nicht gesetzt werden.\n\n" +
              "Bitte überprüfe, ob der Bot die notwendigen Kanalberechtigungen besitzt.",
            flags: 64,
          });
        }

        /*
         * ======================================================
         * TAGS
         * ======================================================
         */

        const {
          appliedTags,
          invalidTagIDs,
        } = getPartnerTags(
          forumChannel,
          kategorie,
        );

        if (invalidTagIDs.length) {
          logger.warn(
            `Partner ${partnerID}: Ungültige Forum-Tags: ${invalidTagIDs.join(
              ", ",
            )}`,
          );
        }

        /*
         * ======================================================
         * BESCHREIBUNG
         * ======================================================
         */

        const cleanDescription =
          description.replace(
            /\\n/g,
            "\n",
          );

        /*
         * ======================================================
         * PARTNER OBJEKT
         * ======================================================
         */

        const partnerData = {
          partnerID,
          name,
          category: kategorie,
          ownerID: owner.id,
          invite,
          description:
            cleanDescription,
          thumbnail,
          embed: embedImage,
          createdAt: new Date(),
        };

        /*
         * ======================================================
         * EMBEDS
         * ======================================================
         */

        const mainEmbed =
          createMainPartnerEmbed(
            partnerData,
          );

        const infoEmbed =
          createInfoPartnerEmbed(
            partnerData,
            owner,
          );

        /*
         * ======================================================
         * BUTTON
         * ======================================================
         */

        const button =
          createPartnerButton(
            invite,
          );

        /*
         * ======================================================
         * THREAD ERSTELLEN
         * ======================================================
         */

        let thread = null;
        let starterMessage = null;

        try {
          thread =
            await forumChannel.threads.create(
              {
                name:
                  name.slice(0, 100),

                appliedTags,

                message: {
                  embeds: [
                    mainEmbed,
                    infoEmbed,
                  ],

                  components: [
                    button,
                  ],
                },

                reason:
                  `Partner ${name} (ID: ${partnerID})`,
              },
            );

          /*
           * Starter Message
           */

          starterMessage =
            await thread.fetchStarterMessage();

          /*
           * Thread-Berechtigungen
           */

          await setupPartnerThreadPermissions(
            thread,
            interaction.guild,
          );
        } catch (error) {
          logger.error(
            "Fehler beim Erstellen des Partner-Threads:\n" +
              `Message: ${error?.message}\n` +
              `Code: ${error?.code}\n` +
              `Status: ${error?.status}\n` +
              `Raw: ${JSON.stringify(
                error?.rawError || {},
                null,
                2,
              )}`,
          );

          console.error(
            "PARTNER THREAD ERROR:",
            error,
          );

          return interaction.reply({
            content:
              "❌ » Fehler beim Erstellen des Forum-Beitrags.\n\n" +
              "Bitte überprüfe die Bot-Berechtigungen und die Forum-Tags.",
            flags: 64,
          });
        }

        /*
         * ======================================================
         * DB SPEICHERN
         * ======================================================
         */

        serverData.partner.partners.push({
          partnerID,
          name,
          category: kategorie,
          ownerID: owner.id,
          invite,
          description:
            cleanDescription,
          thumbnail,
          embed: embedImage,
          threadID: thread.id,
          messageID:
            starterMessage?.id || null,
          createdAt:
            partnerData.createdAt,
        });

        await serverData.save();

        /*
         * ======================================================
         * ERFOLG
         * ======================================================
         */

        return interaction.reply({
          content:
            `✅ » Der Partner **${name}** wurde erfolgreich hinzugefügt.\n\n` +
            `> **Partner-ID:** \`${partnerID}\`\n` +
            `> **Kategorie:** \`${kategorie}\`\n` +
            `> **Forum-Beitrag:** ${thread}`,
          flags: 64,
        });
      }

      /*
       * ======================================================
       * EDIT
       * ======================================================
       */

      if (subcommand === "edit") {
        const partnerID =
          Number(
            interaction.options.getString(
              "partner",
            ),
          );

        const partner =
          serverData.partner.partners.find(
            (entry) =>
              Number(
                entry.partnerID,
              ) === partnerID,
          );

        if (!partner) {
          return interaction.reply({
            content:
              "❌ » Dieser Partner wurde nicht gefunden.",
            flags: 64,
          });
        }

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

        /*
         * URLs validieren
         */

        if (
          newInvite &&
          !isValidInviteLink(newInvite)
        ) {
          return interaction.reply({
            content:
              "❌ » Der neue Invite-/Partnerlink ist ungültig.",
            flags: 64,
          });
        }

        if (
          newThumbnail &&
          !isValidImageUrl(
            newThumbnail,
          )
        ) {
          return interaction.reply({
            content:
              "❌ » Die neue Thumbnail-URL ist ungültig.",
            flags: 64,
          });
        }

        if (
          newEmbed &&
          !isValidImageUrl(
            newEmbed,
          )
        ) {
          return interaction.reply({
            content:
              "❌ » Die neue Bild-URL ist ungültig.",
            flags: 64,
          });
        }

        /*
         * Werte ändern
         */

        if (newName !== null) {
          partner.name =
            newName;
        }

        if (newCategory !== null) {
          partner.category =
            newCategory;
        }

        if (newOwner) {
          partner.ownerID =
            newOwner.id;
        }

        if (newInvite !== null) {
          partner.invite =
            newInvite;
        }

        if (newDescription !== null) {
          partner.description =
            newDescription.replace(
              /\\n/g,
              "\n",
            );
        }

        if (newThumbnail !== null) {
          partner.thumbnail =
            newThumbnail;
        }

        if (newEmbed !== null) {
          partner.embed =
            newEmbed;
        }

        /*
         * ======================================================
         * THREAD LADEN
         * ======================================================
         */

        let thread = null;

        if (partner.threadID) {
          thread =
            await interaction.guild.channels
              .fetch(
                partner.threadID,
              )
              .catch(() => null);
        }

        if (thread) {
          /*
           * Owner
           */

          const ownerUser =
            await interaction.client.users
              .fetch(
                partner.ownerID,
              )
              .catch(() => null);

          /*
           * Neue Embeds
           */

          const newMainEmbed =
            createMainPartnerEmbed(
              partner,
            );

          const newInfoEmbed =
            createInfoPartnerEmbed(
              partner,
              ownerUser,
            );

          /*
           * Starter Message
           */

          const message =
            await thread.fetchStarterMessage()
              .catch(() => null);

          if (message) {
            await message.edit({
              embeds: [
                newMainEmbed,
                newInfoEmbed,
              ],

              components: [
                createPartnerButton(
                  partner.invite,
                ),
              ],
            });
          }

          /*
           * Thread Name
           */

          await thread
            .setName(
              partner.name.slice(
                0,
                100,
              ),
            )
            .catch(() => null);

          /*
           * ====================================================
           * TAGS
           * ====================================================
           */

          if (
            thread.parent?.type ===
            ChannelType.GuildForum
          ) {
            const {
              appliedTags,
              invalidTagIDs,
            } =
              getPartnerTags(
                thread.parent,
                partner.category,
              );

            if (
              invalidTagIDs.length
            ) {
              logger.warn(
                `Partner ${partner.partnerID}: Ungültige Forum-Tags: ${invalidTagIDs.join(
                  ", ",
                )}`,
              );
            }

            await thread
              .setAppliedTags(
                appliedTags,
              )
              .catch((error) => {
                logger.warn(
                  `Partner ${partner.partnerID}: Tags konnten nicht aktualisiert werden: ${error.message}`,
                );
              });
          }

          /*
           * Thread-Berechtigungen
           */

          await setupPartnerThreadPermissions(
            thread,
            interaction.guild,
          );
        }

        /*
         * DB speichern
         */

        await serverData.save();

        /*
         * Erfolg
         */

        return interaction.reply({
          content:
            `✅ » Der Partner **${partner.name}** (\`${partner.partnerID}\`) wurde erfolgreich bearbeitet.`,
          flags: 64,
        });
      }

      /*
       * ======================================================
       * DELETE
       * ======================================================
       */

      if (subcommand === "delete") {
        const partnerID =
          Number(
            interaction.options.getString(
              "partner",
            ),
          );

        const partnerIndex =
          serverData.partner.partners.findIndex(
            (entry) =>
              Number(
                entry.partnerID,
              ) === partnerID,
          );

        if (partnerIndex === -1) {
          return interaction.reply({
            content:
              "❌ » Dieser Partner wurde nicht gefunden.",
            flags: 64,
          });
        }

        const partner =
          serverData.partner.partners[
            partnerIndex
          ];

        /*
         * Thread löschen
         */

        if (partner.threadID) {
          const thread =
            await interaction.guild.channels
              .fetch(
                partner.threadID,
              )
              .catch(() => null);

          if (thread) {
            await thread
              .delete(
                `Partner gelöscht: ${partner.name} (ID: ${partner.partnerID})`,
              )
              .catch((error) => {
                logger.warn(
                  `Partner-Thread konnte nicht gelöscht werden: ${error.message}`,
                );
              });
          }
        }

        /*
         * DB löschen
         */

        serverData.partner.partners.splice(
          partnerIndex,
          1,
        );

        await serverData.save();

        /*
         * Erfolg
         */

        return interaction.reply({
          content:
            `✅ » Der Partner **${partner.name}** (\`${partner.partnerID}\`) wurde erfolgreich gelöscht.`,
          flags: 64,
        });
      }

      /*
       * ======================================================
       * UNBEKANNTER SUBCOMMAND
       * ======================================================
       */

      return interaction.reply({
        content:
          "❌ » Unbekannter Partner-Subcommand.",
        flags: 64,
      });
    } catch (error) {
      logger.error(
        "Fehler im /partner Command:\n" +
          `Message: ${error?.message}\n` +
          `Code: ${error?.code}\n` +
          `Status: ${error?.status}\n` +
          `Raw: ${JSON.stringify(
            error?.rawError || {},
            null,
            2,
          )}`,
      );

      console.error(
        "PARTNER COMMAND ERROR:",
        error,
      );

      if (
        !interaction.replied &&
        !interaction.deferred
      ) {
        return interaction.reply({
          content:
            "❌ » Beim Ausführen des Partner-Befehls ist ein Fehler aufgetreten.",
          flags: 64,
        });
      }

      if (interaction.deferred) {
        return interaction.editReply({
          content:
            "❌ » Beim Ausführen des Partner-Befehls ist ein Fehler aufgetreten.",
        });
      }
    }
  },
};
