import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } from "discord.js";
import serverdb from "#models/Guild.js";
import userdb from "#models/User.js";
import logger from "#core/logger.js";
import { settings } from "#core/settings.js";

export default {
  name: "admin",
  description: "Team",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      type: 1,
      name: "uprank",
      description: "» Setzt einen Benutzer auf eine höhere Rolle. 🔼",
      options: [
        {
          name: "user",
          description: "» Welcher Benutzer sollte aktualisiert werden?",
          required: true,
          type: 6,
        },
        {
          name: "role",
          description: "» Auf welche Rolle soll der Benutzer befördert werden?",
          required: true,
          type: 8,
        },
      ],
    },
    {
      type: 1,
      name: "downrank",
      description: "» Setzt einen Benutzer auf eine niedrigere Rolle. 🔽",
      options: [
        {
          name: "user",
          description: "» Der Benutzer, der herabgestuft werden soll.",
          required: true,
          type: 6,
        },
        {
          name: "role",
          description: "» Die Rolle, auf die der Benutzer herabgestuft werden soll.",
          required: true,
          type: 8,
        },
      ],
    },
    {
      type: 1,
      name: "bereichswechsel",
      description: "» Aktualisiere den Bereich eines Teammitgliedes. 🔄",
      options: [
        {
          name: "user",
          description: "» Welcher Benutzer sollte aktualisiert werden?",
          required: true,
          type: 6,
        },
        {
          name: "role",
          description: "» Auf welche Rolle soll der Benutzer wechseln?",
          required: true,
          type: 8,
        },
      ],
    },
    {
      type: 1,
      name: "add",
      description: "» Fügt ein neues Teammitglied hinzu. ➕",
      options: [
        {
          name: "user",
          description: "» Welcher User soll eine Team-Rolle bekommen?",
          required: true,
          type: 6,
        },
        {
          name: "role",
          description: "» Welche Rolle soll der User bekommen?",
          required: true,
          type: 8,
        },
      ],
    },
    {
      type: 1,
      name: "kick",
      description: "» Entfernt einen Benutzer aus dem Server-Team. ❌",
      options: [
        {
          name: "user",
          description: "» Der Benutzer, der entfernt werden soll.",
          required: true,
          type: 6,
        },
        {
          name: "role",
          description: "» Die Rolle, die entfernt werden soll.",
          required: true,
          type: 8,
        },
        {
          type: 3,
          name: "reason",
          description: "» Der Grund für das Entfernen aus dem Team.",
          required: false,
        },
      ],
    },
    {
      type: 1,
      name: "aktivieren",
      description: "» Aktiviere eine Funktion. 🟢",
      options: [
        {
          type: 3,
          choices: [
            {
              name: "Changelog",
              value: "changelog",
            },
            {
              name: "Spielersuche",
              value: "spielersuche",
            },
            {
              name: "Vorschläge",
              value: "vorschläge",
            },
            {
              name: "Willkommensnachrichten",
              value: "willkommensnachrichten",
            },
          ],
          name: "system",
          description: "» Welches System soll aktiviert werden?",
          required: true,
        },
      ],
    },
    {
      type: 1,
      name: "deaktivieren",
      description: "» Deaktiviere eine Funktion. 🔴",
      options: [
        {
          type: 3,
          choices: [
            {
              name: "Changelog",
              value: "changelog",
            },
            {
              name: "Spielersuche",
              value: "spielersuche",
            },
            {
              name: "Vorschläge",
              value: "vorschläge",
            },
            {
              name: "Willkommensnachrichten",
              value: "willkommensnachrichten",
            },
          ],
          name: "system",
          description: "» Welches System soll deaktiviert werden?",
          required: true,
        },
      ],
    },
    {
      type: 1,
      name: "donate",
      description: "» Füge den Betrag der Spende an einem User hinzu. 💸",
      options: [
        {
          name: "user",
          description: "» Wähle einen Benutzer aus, der die Spende erhalten soll.",
          required: true,
          type: 6,
        },
        {
          min_value: 1,
          type: 4,
          name: "amount",
          description: "» Gib den Betrag der Spende ein.",
          required: true,
        },
      ],
    },
  ],

  async run(client, interaction) {
    const member = interaction.options.getMember("user");
    const role = interaction.options.getRole("role");
    const reason = interaction.options.getString("reason") || "Kein Grund angegeben";
    const targetChannel = interaction.guild.channels.cache.get(settings.get("channels.teamLog"));
    const formattedDate = `<t:${Math.floor(Date.now() / 1000)}:F>`;
    const sub = interaction.options.getSubcommand();
    const teamrole = interaction.guild.roles.cache.get(settings.get("teamRoles.member"));

    if (member.user.bot) {
      return interaction.reply({
        content: "> `❌` » Bots sind nicht erlaubt!",
        flags: MessageFlags.Ephemeral,
      });
    }

    switch (sub) {
      case "uprank":
        try {
          await member.roles.add(role);

          const Uprankembed = new EmbedBuilder()
            .setTitle("`🔼` | __TEAMMITGLIED RANGUPDATE__")
            .setDescription(`Herzlichen Glückwunsch, ${member}!\nDu wurdest **befördert!**\n\n**__Rang__**:\n${role}`)
            .setColor("Blurple")
            .setTimestamp();

          await targetChannel.send({ content: `${member}`, embeds: [Uprankembed] });

          await interaction.reply({ content: "> `✅` » Das Teammitglied wurde **befördert.**", flags: MessageFlags.Ephemeral });
        } catch (error) {
          logger.error("Fehler beim Hinzufügen der Rolle:", error);

          await interaction.reply({ content: "> `❌` » Es ist ein Fehler aufgetreten.", flags: MessageFlags.Ephemeral });
        }
        break;

      case "downrank":
        try {
          await member.roles.remove(role);

          const RangUpdateembed = new EmbedBuilder()
            .setTitle("`🔽` | __TEAMMITGLIED RANGUPDATE__")
            .setDescription(`${member} wurde **herabgestuft.**\n\n**__Rang__**:\n${role}`)
            .setColor("Blurple")
            .setTimestamp();

          await targetChannel.send({ embeds: [RangUpdateembed] });
          await interaction.reply({ content: "> `✅` » Das Teammitglied wurde **herabgestuft.**", flags: MessageFlags.Ephemeral });

        } catch (error) {
          logger.error("Fehler beim Herabstufen des Benutzers:", error);
          await interaction.reply({ content: "> `❌` » Es ist ein Fehler aufgetreten.", flags: MessageFlags.Ephemeral });
        }
        break;

      case "bereichswechsel":
        try {

          const areaRoles = [
            settings.get("teamRoles.developer"), // Developer
            settings.get("teamRoles.srModerator"), // Sr-Moderator
            settings.get("teamRoles.moderator"), // Moderator
            settings.get("teamRoles.supporter"), // Supporter
            settings.get("teamRoles.builder"), // Builder

            settings.get("leadRoles.developer"), // Developer leitung
            settings.get("leadRoles.support"), // Support leitung
            settings.get("leadRoles.builder"), // Builder leitung
            settings.get("leadRoles.partner"), // Partner leitung
          ];
          const oldRole = member.roles.cache.find(r => areaRoles.includes(r.id));

          await member.roles.remove(areaRoles);
          await member.roles.add(role);

          const AreaChangeEmbed = new EmbedBuilder()
            .setTitle("`🔁` | __TEAMMITGLIED BEREICHSWECHSEL__")
            .setDescription(
              `${member} hat den Bereich gewechselt.\n\n` +
                            `**__Alter Bereich__**:\n${oldRole ? oldRole : "Kein Bereich"}\n\n` +
                            `**__Neuer Bereich__**:\n${role}`,
            )
            .setColor("Blurple")
            .setTimestamp();

          await targetChannel.send({ embeds: [AreaChangeEmbed] });

          await interaction.reply({
            content: "> `✅` » Der Bereich wurde erfolgreich geändert.",
            flags: MessageFlags.Ephemeral,
          });

        } catch (error) {

          logger.error("Fehler beim Bereichswechsel:", error);

          await interaction.reply({
            content: "> `❌` » Es ist ein Fehler aufgetreten.",
            flags: MessageFlags.Ephemeral,
          });

        }
        break;

      case "add":
        try {
          // Teamrolle + Hauptrang
          await member.roles.add(role);
          await member.roles.add(teamrole);

          //// Datum für Embed
          //const formattedDate = new Date().toLocaleDateString('de-DE', {
          //    day: '2-digit',
          //    month: '2-digit',
          //    year: 'numeric',
          //});

          // ID der Supporter-Rolle
          const supporterRoleId = settings.get("teamRoles.supporter");

          const supporterExtraRoles = [
            settings.get("teamRoles.ticketSupport"), // Ticket Support
            settings.get("teamRoles.ticketArea"), // Ticket Bereich
            settings.get("teamRoles.banSupport"), // Bann Support
            settings.get("teamRoles.banArea"), // Bann Bereich
            settings.get("teamRoles.reportLog"), // Report Log
          ];

          // Zusätzliche Rollen für andere Teamränge
          const defaultExtraRoles = [
            settings.get("teamRoles.ticketArea"), // Ticket Bereich
            settings.get("teamRoles.banArea"), // Bann Bereich
            settings.get("teamRoles.reportLog"), // Report Log
          ];

          if (role.id === supporterRoleId) {
            for (const r of supporterExtraRoles) {
              await member.roles.add(r).catch(() => {});
            }
          } else {
            for (const r of defaultExtraRoles) {
              await member.roles.add(r).catch(() => {});
            }
          }

          const TeammitgliedEmbed = new EmbedBuilder()
            .setTitle("`➕` | __NEUES TEAMMITGLIED__")
            .setColor("Blurple")
            .setDescription(`> » Wir begrüßen ${member} herzlichst im Team.\n> Wir hoffen auf eine gemeinsame schöne Zeit!\n\n**__Rang__**\n${role}\n\n**__Im Team seit__**\n${formattedDate}`)
            .setTimestamp();

          targetChannel.send({ content: `${member}`, embeds: [TeammitgliedEmbed] });
          await interaction.reply({ content: "> `✅` » Ein neues Teammitglied ist nun da.", flags: MessageFlags.Ephemeral});
        } catch (error) {
          logger.error("Fehler beim Hinzufügen der Rolle:", error);
          interaction.reply({ content: "> `❌` » Es ist ein Fehler aufgetreten.", flags: MessageFlags.Ephemeral });
        }
        break;

      case "kick": {
        const extraRoles = [
          settings.get("teamRoles.ticketSupport"), // Ticket Support
          settings.get("teamRoles.ticketArea"), // Ticket Bereich
          settings.get("teamRoles.banSupport"), // Bann Support
          settings.get("teamRoles.banArea"), // Bann Bereich
          settings.get("teamRoles.reportLog"), // Report Log
        ];

        // Hauptrollen entfernen
        await member.roles.remove(role).catch(() => {});
        await member.roles.remove(teamrole).catch(() => {});

        // Zusätzliche Rollen prüfen und entfernen
        for (const roleId of extraRoles) {
          const extraRole = interaction.guild.roles.cache.get(roleId);
          if (extraRole && member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId).catch(() => {});
          }
        }
        try {

          const kickEmbed = new EmbedBuilder()
            .setTitle("`❌` | __TEAMMITGLIED ENTFERNT__")
            .setDescription(`${member} wurde von **${interaction.user.displayName}** aus dem Server-Team **Entfernt**.\n\nGrund: \`${reason}\``)
            .setColor("Red")
            .setTimestamp();

          targetChannel.send({ embeds: [kickEmbed] });
          await interaction.reply({ content: "> `✅` » Das Teammitglied wurde aus dem Server-Team **Entfernt.**", flags: MessageFlags.Ephemeral });
        } catch (error) {
          logger.error("❌  | Fehler beim Kicken des Benutzers:", error);
          interaction.reply({ content: "> `❌` » Es ist ein Fehler aufgetreten.", flags: MessageFlags.Ephemeral });
        }
        break;
      }

      case "aktivieren":
      case "deaktivieren": {
        const system = await interaction.options.getString("system");
        const serverData = await serverdb.findOne({ guildID: interaction.guildId });
        if (!serverData) {return;}

        if(sub === "aktivieren") {
          await serverdb.findOneAndUpdate({ guildID: interaction.guildId }, { $pull: { deactivated: `${system}` } });
          await interaction.reply({ content: `> \`🟢\` » Das \`${system}\` System wurde **erfolgreich** __aktiviert.__`, flags: MessageFlags.Ephemeral });
        } else if(sub === "deaktivieren") {
          await serverdb.findOneAndUpdate({ guildID: interaction.guildId }, { $push: { deactivated: `${system}` } });
          await interaction.reply({ content: `> \`🔴\` » Das \`${system}\` System wurde **erfolgreich** __deaktiviert.__`, flags: MessageFlags.Ephemeral });
        }
        break;
      }

      case "donate": {
        const amount = interaction.options.getInteger("amount");

        const confirmButton = new ButtonBuilder()
          .setCustomId("confirm")
          .setLabel("✅ » Bestätigen")
          .setStyle(ButtonStyle.Primary);

        const cancelButton = new ButtonBuilder()
          .setCustomId("cancel")
          .setLabel("❌ » Abbrechen")
          .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

        const response1 = await interaction.reply({
          content: `> \`❗\` » Möchtest du wirklich den Betrag in Höhe von \`${amount}€\` hinzufügen?`,
          components: [row],
          flags: MessageFlags.Ephemeral,
        });

        const collectorFilter1 = (i) => i.user.id === interaction.user.id;

        try {
          const confirmation = await response1.awaitMessageComponent({ filter: collectorFilter1, time: 60_000 });

          if (confirmation.customId === "confirm") {

            const userData = await userdb.findOneAndUpdate(
              { userID: member.id },
              {
                $inc: { donation: amount },
                $setOnInsert: { reactions: {} },
              },
              { returnDocument: "after", upsert: true },
            );

            await userData.save();

            const donateEmbed = new EmbedBuilder()
              .setTitle("`💖` × SPENDE HINZUGEFÜGT!")
              .setDescription(`> \`✅\` » ${member} hat nun \`${userData.donation}€\` (\`+ ${amount}€\`) gespendet!`)
              .setColor("Green")
              .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
              .setTimestamp();

            await confirmation.update({ content: null, embeds: [donateEmbed], components: [] });
          } else if (confirmation.customId === "cancel") {
            // Handle cancellation
            await confirmation.update({
              content: `> \`❌\` » Du hast die Spende in Höhe von \`${amount}€\` **nicht hinzugefügt**`,
              components: [],
            });
          }
        } catch (err) {
          logger.error(err);
          await interaction.followUp({ content: "> `⚠️` » Die Aktion wurde nicht rechtzeitig bestätigt.", flags: MessageFlags.Ephemeral });
        }
        break;
      }
    }
  },
};
