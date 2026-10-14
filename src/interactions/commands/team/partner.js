import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";

import serverDB from "#models/serverdb.js";
import config from "#config/config.json" with { type: "json" };
import logger from "#core/logger.js";

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
 * PARTNER BUTTON
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
 * Mitglieder:
 * ❌ Keine Nachrichten
 * ❌ Keine Antworten
 * ❌ Keine Threads
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
    await forumChannel.permissionOverwrites.edit(
      guild.roles.everyone,
      {
        SendMessages: false,
        SendMessagesInThreads: false,
        CreatePublicThreads: false,
        CreatePrivateThreads: false,
      },
    );

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

    logger.error(
      "PARTNER FORUM PERMISSION ERROR:",
      error,
    );

    return false;
  }
}

/*
 * ============================================================
 * FORUM TAGS
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
 * HAUPT EMBED
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

/*
 * ============================================================
 * INFO EMBED
 * ============================================================
 *
 * KEINE FIELDS
 *
 * Emojis stehen jeweils in Backticks.
 */

function createInfoPartnerEmbed(
  partner,
  ownerUser,
) {
  const partnerDate = new Date(partner.createdAt);

  const formattedDate =
    partnerDate.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return new EmbedBuilder()
    .setTitle("🔔 Informationen")
    .setColor("Blurple")
    .setDescription(
      `- **Partner seit:** \`${formattedDate}\`\n` +
      `- **Ansprechpartner:** ${ownerUser ? `${ownerUser}` : `<@${partner.ownerID}>`}\n` +
      `- **Kategorie:** \`${partner.category}\``,
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
    await thread.permissionOverwrites.edit(
      guild.roles.everyone,
      {
        SendMessages: false,
        SendMessagesInThreads: false,
      },
    );

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

    {
      type: 1,
      name: "delete",
      description:
        "Lösche einen bestehenden Partner. 🗑️",

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

  async run(client, interaction) {
    try {
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

      const subcommand =
        interaction.options.getSubcommand();

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

      normalizePartnerIDs(
        serverData.partner.partners,
      );

      /*
       * ========================================================
       * ADD
       * ========================================================
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

        if (!isValidInviteLink(invite)) {
          return interaction.reply({
            content:
              "`❌` » Der angegebene Invite-/Partnerlink ist ungültig.",
            flags: 64,
          });
        }

        if (
          thumbnail &&
          !isValidImageUrl(thumbnail)
        ) {
          return interaction.reply({
            content:
              "`❌` » Die angegebene Thumbnail-URL ist ungültig.",
            flags: 64,
          });
        }

        if (
          embedImage &&
          !isValidImageUrl(embedImage)
        ) {
          return interaction.reply({
            content:
              "`❌` » Die angegebene Embed-Bild-URL ist ungültig.",
            flags: 64,
          });
        }

        const highestPartnerID =
          getHighestPartnerID(
            serverData.partner.partners,
          );

        const partnerID =
          highestPartnerID + 1;

        if (
          !config.partnerForumChannelId
        ) {
          return interaction.reply({
            content:
              "`❌` » Es wurde keine `partnerForumChannelId` in der Config hinterlegt.",
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
              "`❌` » Der konfigurierte Partner-Forum-Kanal wurde nicht gefunden.",
            flags: 64,
          });
        }

        if (
          forumChannel.type !==
          ChannelType.GuildForum
        ) {
          return interaction.reply({
            content:
              "`❌` » Der konfigurierte Partner-Kanal ist kein Forum-Kanal.",
            flags: 64,
          });
        }

        const permissionsOK =
          await setupPartnerForumPermissions(
            forumChannel,
            interaction.guild,
          );

        if (!permissionsOK) {
          return interaction.reply({
            content:
              "`❌` » Die Berechtigungen des Partner-Forums konnten nicht gesetzt werden.\n\n" +
              "Bitte überprüfe, ob der Bot die notwendigen Kanalberechtigungen besitzt.",
            flags: 64,
          });
        }

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

        const cleanDescription =
          description.replace(
            /\\n/g,
            "\n",
          );

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

        const mainEmbed =
          createMainPartnerEmbed(
            partnerData,
          );

        const infoEmbed =
          createInfoPartnerEmbed(
            partnerData,
            owner,
          );

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
                    createPartnerButton(
                      invite,
                    ),
                  ],
                },

                reason:
                  `Partner ${name} (ID: ${partnerID})`,
              },
            );

          starterMessage =
            await thread.fetchStarterMessage();

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

          logger.error(
            "PARTNER THREAD ERROR:",
            error,
          );

          return interaction.reply({
            content:
              "`❌` » Fehler beim Erstellen des Forum-Beitrags.\n\n" +
              "Bitte überprüfe die Bot-Berechtigungen und die Forum-Tags.",
            flags: 64,
          });
        }

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

        return interaction.reply({
          content:
            `\`✅\` » Der Partner **${name}** wurde erfolgreich hinzugefügt.\n\n` +
            `> **Partner-ID:** \`${partnerID}\`\n` +
            `> **Kategorie:** \`${kategorie}\`\n` +
            `> **Forum-Beitrag:** ${thread}`,
          flags: 64,
        });
      }

      /*
       * ========================================================
       * EDIT
       * ========================================================
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
              "`❌` » Dieser Partner wurde nicht gefunden.",
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

        if (
          newInvite &&
          !isValidInviteLink(newInvite)
        ) {
          return interaction.reply({
            content:
              "`❌` » Der neue Invite-/Partnerlink ist ungültig.",
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
              "`❌` » Die neue Thumbnail-URL ist ungültig.",
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
              "`❌` » Die neue Bild-URL ist ungültig.",
            flags: 64,
          });
        }

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
          const ownerUser =
            await interaction.client.users
              .fetch(
                partner.ownerID,
              )
              .catch(() => null);

          const newMainEmbed =
            createMainPartnerEmbed(
              partner,
            );

          const newInfoEmbed =
            createInfoPartnerEmbed(
              partner,
              ownerUser,
            );

          const message =
            await thread
              .fetchStarterMessage()
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

          await thread
            .setName(
              partner.name.slice(
                0,
                100,
              ),
            )
            .catch(() => null);

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

          await setupPartnerThreadPermissions(
            thread,
            interaction.guild,
          );
        }

        await serverData.save();

        return interaction.reply({
          content:
            "`✅` » Der Partner **${partner.name}** (`${partner.partnerID}`) wurde erfolgreich bearbeitet.",
          flags: 64,
        });
      }

      /*
       * ========================================================
       * DELETE
       * ========================================================
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
              "`❌` » Dieser Partner wurde nicht gefunden.",
            flags: 64,
          });
        }

        const partner =
          serverData.partner.partners[
            partnerIndex
          ];

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

        serverData.partner.partners.splice(
          partnerIndex,
          1,
        );

        await serverData.save();

        return interaction.reply({
          content:
            "`✅` » Der Partner **${partner.name}** (`${partner.partnerID}`) wurde erfolgreich gelöscht.",
          flags: 64,
        });
      }

      return interaction.reply({
        content:
          "`❌` » Unbekannter Partner-Subcommand.",
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

      logger.error(
        "PARTNER COMMAND ERROR:",
        error,
      );

      if (
        !interaction.replied &&
        !interaction.deferred
      ) {
        return interaction.reply({
          content:
            "`❌` » Beim Ausführen des Partner-Befehls ist ein Fehler aufgetreten.",
          flags: 64,
        });
      }

      if (interaction.deferred) {
        return interaction.editReply({
          content:
            "`❌` » Beim Ausführen des Partner-Befehls ist ein Fehler aufgetreten.",
        });
      }
    }
  },
};
