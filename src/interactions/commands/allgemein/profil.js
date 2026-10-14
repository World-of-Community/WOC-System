import { EmbedBuilder } from "discord.js";
import userdb from "#models/User.js";
import { settings } from "#core/settings.js";

export default {
  name: "profil",
  description: "» Zeigt dir nützliche Stats über einen Account. 👤",
  type: 1,
  options: [
    {
      name: "mitglied",
      description: "» Welches Profil möchtest du Abrufen?",
      required: false,
      type: 6,
    },
  ],

  async run(client, interaction) {
    const member = interaction.options.getMember("mitglied") || interaction.member;

    if (member.user.bot) {
      return interaction.reply({ content: "> `❌` » Du kannst keine Statistiken über Bots abrufen!", ephemeral: true });
    }

    const roleBundesland = {
      "Baden-Württemberg": "Baden-Württemberg",
      "Bayern": "Bayern",
      "Berlin": "Berlin",
      "Brandenburg": "Brandenburg",
      "Bremen": "Bremen",
      "Hamburg": "Hamburg",
      "Hessen": "Hessen",
      "Mecklenburg-Vorpommern": "Mecklenburg-Vorpommern",
      "Niedersachsen": "Niedersachsen",
      "Nordrhein-Westfalen": "Nordrhein-Westfalen",
      "Rheinland-Pfalz": "Rheinland-Pfalz",
      "Saarland": "Saarland",
      "Sachsen": "Sachsen",
      "Sachsen-Anhalt": "Sachsen-Anhalt",
      "Schleswig-Holstein": "Schleswig-Holstein",
      "Thüringen": "Thüringen",
    };

    const roleNationalität = {
      "Österreich": "Österreich",
      "Schweiz": "Schweiz",
      "Sonstiges": "Sonstiges",
    };

    const roleGeschlecht = {
      "Männlich": ":male_sign:",
      "Weiblich": ":female_sign:",
      "Divers": ":heavy_equals_sign:",
    };

    const TeamRoleIds = [
      settings.get("teamRoles.admin"), // Admin
      settings.get("teamRoles.teamLead"), // Team-leitung
      settings.get("teamRoles.developer"), // Developer
      settings.get("teamRoles.srModerator"), // Sr-Moderator
      settings.get("teamRoles.moderator"), // Moderator
      settings.get("teamRoles.supporter"), // Supporter
      settings.get("teamRoles.builder"), // Builder
    ];

    const LeitungRoleIds = [
      settings.get("leadRoles.team"), // Team Leitung
      settings.get("leadRoles.developer"), // Dev Leitung
      settings.get("leadRoles.support"), // Support Leitung
      settings.get("leadRoles.builder"), // Builder Leitung
      settings.get("leadRoles.creator"), // Creator Leitung
      settings.get("leadRoles.clan"), // Clan Leitung
      settings.get("leadRoles.partner"), // Partner Leitung
      settings.get("leadRoles.socialMedia"), // Social Media Leitung
      settings.get("leadRoles.event"), // Event Leitung
      settings.get("leadRoles.application"), // Bewerbung Leitung
      settings.get("leadRoles.emojiQuiz"), // Emoji Quiz Leitung
    ];

    const ExklusivRoleIds = [
      settings.get("exclusiveRoles.creator"), // Creator
      settings.get("exclusiveRoles.vip"), // VIP
      settings.get("exclusiveRoles.sponsor"), // Geldgeber (Sponsor)
      settings.get("exclusiveRoles.cooperation"), // Kooperation
      settings.get("exclusiveRoles.serverPartner"), // Server-Partner
      settings.get("exclusiveRoles.leaderboardWinner"), // Minenarbeiter (Event)
      settings.get("exclusiveRoles.designer"), // Designer
    ];

    const MitgliederRoleIds = [
      settings.get("minecraftRoles.supreme"), // Supreme
      settings.get("minecraftRoles.premium"), // Premium
      settings.get("minecraftRoles.legende"), // Legende
      settings.get("minecraftRoles.diamond"), // Diamond
      settings.get("minecraftRoles.emerald"), // Emerald
      settings.get("minecraftRoles.episch"), // Episch
      settings.get("roles.member"), // Mitglied
    ];

    const BundeslandRoleIds = [
      settings.get("regionRoles.badenWuerttemberg"), // Baden-Württemberg
      settings.get("regionRoles.bayern"), // Bayern
      settings.get("regionRoles.berlin"), // Berlin
      settings.get("regionRoles.brandenburg"), // Brandenburg
      settings.get("regionRoles.bremen"), // Bremen
      settings.get("regionRoles.hamburg"), // Hamburg
      settings.get("regionRoles.hessen"), // Hessen
      settings.get("regionRoles.mecklenburgVorpommern"), // Mecklenburg-Vorpommern
      settings.get("regionRoles.niedersachsen"), // Niedersachsen
      settings.get("regionRoles.nordrheinWestfalen"), // Nordrhein-Westfalen
      settings.get("regionRoles.rheinlandPfalz"), // Rheinland-Pfalz
      settings.get("regionRoles.saarland"), // Saarland
      settings.get("regionRoles.sachsen"), // Sachsen
      settings.get("regionRoles.sachsenAnhalt"), // Sachsen-Anhalt
      settings.get("regionRoles.schleswigHolstein"), // Schleswig-Holstein
      settings.get("regionRoles.thueringen"), // Thüringen
    ];

    const NationalitätRoleIds = [
      settings.get("regionRoles.austria"), // Österreich
      settings.get("regionRoles.switzerland"), // Schweiz
      settings.get("regionRoles.other"), // Sonstiges
    ];

    const GeschlechtRoleIds = [
      settings.get("genderRoles.male"), // Männlich
      settings.get("genderRoles.female"), // Weiblich
      settings.get("genderRoles.diverse"), // Divers
    ];

    const GameRoleIds = [
      settings.get("gameRoles.roblox"), // Roblox
      settings.get("gameRoles.rocketLeague"), // Rocket League
      settings.get("gameRoles.gta5"), // Grand Theft Auto V
      settings.get("gameRoles.minecraft"), // Minecraft
      settings.get("gameRoles.fifa"), // FIFA
      settings.get("gameRoles.lol"), // League of Legends
      settings.get("gameRoles.valorant"), // Valorant
      settings.get("gameRoles.fortnite"), // Fortnite
    ];

    const PingRoleIDs = [
      settings.get("pingRoles.surveys"), // Umfragen Ping
      settings.get("pingRoles.news"), // Neuigkeiten Ping
      settings.get("pingRoles.giveaway"), // Gewinnspiel Ping
      settings.get("pingRoles.serverEvents"), // Server-Events Ping
      settings.get("pingRoles.changes"), // Änderungen Ping
      settings.get("pingRoles.botChangelog"), // Bot-Changelog Ping
      settings.get("pingRoles.changelog"), // Changelog Ping
      settings.get("pingRoles.deadChat"), // Dead Chat Ping
      settings.get("pingRoles.freeGames"), // Gratis Spiele Ping
    ];

    const LevelRoleIds = [
      settings.get("levelRoles.level5"), // Level 5
      settings.get("levelRoles.level10"), // Level 10
      settings.get("levelRoles.level20"), // Level 20
      settings.get("levelRoles.level30"), // Level 30
      settings.get("levelRoles.level40"), // Level 40
      settings.get("levelRoles.level50"), // Level 50
      settings.get("levelRoles.level75"), // Level 75
      settings.get("levelRoles.level100"), // Level 100
    ];

    // Initial Werte
    let userBundesland = "`❓`";
    let userNationalität = "`❓`";
    let userGeschlecht = "`❓`";
    const roleGamesList = [];
    const rolePingsList = [];
    const leitungRoleMentions = [];
    let teamRoleMention = "";
    let bundeslandRoleMention = "";
    let nationalitätRoleMention = "";
    let exklusivRoleMention = "";
    let memberRoleMention = "";
    let outputText;

    // Rollen-Prüfungen für Team, Bundesland, Nationalität, Exklusiv, Mitglied
    const hasTeamRole = TeamRoleIds.some(roleId => {
      if (member.roles.cache.has(roleId)) {
        teamRoleMention = `<@&${roleId}>`;
        return true;
      }
      return false;
    });

    LeitungRoleIds.some(roleId => {
      if (member.roles.cache.has(roleId)) {
        leitungRoleMentions.push(`<@&${roleId}>`);
        return true;
      }
      return false;
    });

    BundeslandRoleIds.some(roleId => {
      if (member.roles.cache.has(roleId)) {
        bundeslandRoleMention = `<@&${roleId}>`;
        return true;
      }
      return false;
    });

    NationalitätRoleIds.some(roleId => {
      if (member.roles.cache.has(roleId)) {
        nationalitätRoleMention = `<@&${roleId}>`;
        return true;
      }
      return false;
    });

    const hasExklusivRole = ExklusivRoleIds.some(roleId => {
      if (member.roles.cache.has(roleId)) {
        exklusivRoleMention = `<@&${roleId}>`;
        return true;
      }
      return false;
    });

    const hasMemberRole = MitgliederRoleIds.some(roleId => {
      if (member.roles.cache.has(roleId)) {
        memberRoleMention = `<@&${roleId}>`;
        return true;
      }
      return false;
    });

    // Level-Rollen anhand der ID erkennen
    const levelRoles = member.roles.cache
      .filter(role => LevelRoleIds.includes(role.id))
      .sort((a, b) => LevelRoleIds.indexOf(a.id) - LevelRoleIds.indexOf(b.id))
      .map(role => `<@&${role.id}>`);

    // Über alle Rollen iterieren, um spezifische Infos zu finden
    for (const role of member.roles.cache.values()) {
      if (role.name === "@everyone") {continue;}

      // Bundesland aus Mapping ermitteln
      if (BundeslandRoleIds.includes(role.id)) {
        userBundesland = roleBundesland[role.name] || `<@&${role.id}>`;
      }

      // Nationalität aus Mapping ermitteln
      if (NationalitätRoleIds.includes(role.id)) {
        userNationalität = roleNationalität[role.name] || "`❓`";
      }

      // Geschlecht aus Mapping ermitteln
      if (GeschlechtRoleIds.includes(role.id)) {
        userGeschlecht = roleGeschlecht[role.name] || "`❓`";
      }

      // Spiele-Rollen sammeln
      if (GameRoleIds.includes(role.id)) {
        roleGamesList.push(`<@&${role.id}>`);
      }

      // Ping-Rollen sammeln
      if (PingRoleIDs.includes(role.id)) {
        rolePingsList.push(`<@&${role.id}>`);
      }
    }

    // outputText bauen
    if (nationalitätRoleMention) {
      outputText = `- \`📌\` » Land: ${nationalitätRoleMention}`;
    } else if (bundeslandRoleMention) {
      outputText = `- \`📌\` » Bundesland: ${bundeslandRoleMention}`;
    } else if (userNationalität !== "❓") {
      outputText = `- \`📌\` » Land: ${userNationalität}`;
    } else if (userBundesland !== "❓") {
      outputText = `- \`📌\` » Bundesland: ${userBundesland}`;
    } else {
      outputText = "- `📌` » Land/Bundesland: `❓`";
    }

    // User-Daten abrufen
    const userData = await userdb.findOne({ userID: member.id }) || {
      giveaway: { eventWins: 0, messages: 0, voiceTime: 0 },
      invites: { joins: 0, left: 0, bonus: 0 },
      onlineTime: 0,
      lastOnline: null,
    };

    // lastOnline speichern, wenn offline/invisible
    await userdb.updateOne(
      { userID: member.id },
      { $set: { lastOnline: new Date() } },
      { upsert: true },
    );

    // Invite-Daten
    const invites = userData.invites || { joins: 0, left: 0, bonus: 0 };
    const inviteJoins = invites.joins || 0;
    const inviteBonus = invites.bonus || 0;
    const inviteLeft = invites.left || 0;
    const totalInvites = inviteJoins + inviteBonus - inviteLeft;

    let lastOnlineText = "";

    const isOffline = !member.presence; // offline ODER unsichtbar

    if (isOffline && userData?.lastOnline) {
      const lastOnline = new Date(userData.lastOnline);

      if (!isNaN(lastOnline)) {
        const date = lastOnline.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        const time = lastOnline.toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        });

        lastOnlineText =
              `- \`📅\` » Zuletzt online: \`${date} - ${time}\`\n`;
      }
    }

    // Embed
    const embed = new EmbedBuilder()
      .setTitle(`\`👤\` × ${member.user.displayName}'s Profil`)
      .setDescription(
        `» **Alle Statistiken** von \`${member.user.username}\`\n\n` +
                "> `👤` **» SERVER PROFIL**\n" +
                `- \`📌\` » Rang: ${hasTeamRole ? teamRoleMention : (hasExklusivRole ? exklusivRoleMention : (hasMemberRole ? memberRoleMention : "Keine Rolle"))} ${leitungRoleMentions.length > 0 ? ` (${leitungRoleMentions.join(", ")})` : ""}\n` +
                `- \`📌\` » Geschlecht: ${userGeschlecht}\n` +
                `${outputText}\n` +
                `- \`⭐\` » Nutzer-Level: ${levelRoles.length > 0 ? levelRoles.join(", ") : "**Keine Levelrolle**"}\n` +
                `- \`🎮\` » Meine Spiele: ${roleGamesList.length > 0 ? roleGamesList.join(", ") : "**Keine Spiele**"}\n` +
                `- \`🔔\` » Server-Pings: ${rolePingsList.length > 0 ? rolePingsList.join(", ") : "**Keine Server-Pings**"}\n\n` +
                "> `📊` **» ALLE STATISTIKEN**\n" +
                (lastOnlineText || "") + // wird nur angezeigt, wenn gesetzt
                `- \`🎁\` » Hat **${userData.giveaway.eventWins || "0"}** Events gewonnen\n` +
                `- \`📚\` » Du hast bereits \`${userData.giveaway.messages || "0"}\` Nachrichten versendet.\n` +
                `- \`🔊\` » \`${(userData.giveaway.voiceTime / 3600000).toFixed(0) || "0"} Stunden\` in Sprachkanälen verbracht.\n\n` +
                `\`📡\` » Du hast **${inviteJoins}** User eingeladen.\n` +
                `(\`${totalInvites}\` Gesamt, \`${inviteBonus}\` Bonus & \`${inviteLeft}\` Verlassen)\n\n`,
      )
      .addFields(
        { name: "`👥` » Server-Mitglied seit:"
          , value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:f> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)`, inline: false  },
        { name: "`⏰` » Account erstellt am:"
          , value: `<t:${Math.round(member.user.createdTimestamp / 1000)}> (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)`, inline: false,
        },
      )
      .addFields(
        { name: "\u200B", value: "> `📌` » Hinweis: Einige Daten können unvollständig sein, wenn der Nutzer kürzlich dem Server beigetreten ist oder Rollen geändert wurden." },
      )
      .setColor("Blurple")
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setFooter({ text: `» Meine Stats auf ${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
      .setTimestamp();

    //// --- Adventskalender Button im Dezember ---
    //const now = new Date();
    //let components = [];
    //if (now.getMonth() === 11) { // Dezember
    //    const adventButton = new ButtonBuilder()
    //        .setCustomId('advent_progress')
    //        .setLabel('🎁 Adventskalender')
    //        .setStyle(ButtonStyle.Primary);
    //    components.push(new ActionRowBuilder().addComponents(adventButton));
    //}

    await interaction.reply({ embeds: [embed], ephemeral: true });

    //if (components.length>0){
    //    await interaction.reply({ embeds:[embed], components, ephemeral:true });
    //} else {
    //    await interaction.reply({ embeds:[embed], ephemeral:true });
    //}
  },
};
