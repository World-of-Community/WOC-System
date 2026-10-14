// Every configurable value of the bot. Defaults are the values that were previously
// hardcoded, so the first start seeds the database with the current configuration.
//
// Types: role, channel, category, thread, message, user, emoji, string, number, boolean,
//        roleList, channelList, stringList, json

const role = (def, description) => ({ type: "role", default: def, description });
const channel = (def, description) => ({ type: "channel", default: def, description });
const category = (def, description) => ({ type: "category", default: def, description });
const thread = (def, description) => ({ type: "thread", default: def, description });
const message = (def, description) => ({ type: "message", default: def, description });
const user = (def, description) => ({ type: "user", default: def, description });
const emoji = (def, description) => ({ type: "emoji", default: def, description });
const string = (def, description) => ({ type: "string", default: def, description });
const number = (def, description) => ({ type: "number", default: def, description });
const boolean = (def, description) => ({ type: "boolean", default: def, description });
const roleList = (def, description) => ({ type: "roleList", default: def, description });
const stringList = (def, description) => ({ type: "stringList", default: def, description });
const json = (def, description) => ({ type: "json", default: def, description });

export const SETTINGS_SCHEMA = {
  roles: {
    label: "Allgemeine Rollen",
    keys: {
      verify: role("1057974831787819049", "Verifiziert"),
      member: role("815920703067914290", "Mitglied"),
      newMember: role("1222122625594294272", "Neues Mitglied (24h)"),
      banned: role("886989738244964362", "Gebannt"),
      birthday: role("1244945910262399046", "Geburtstagskind"),
      birthdayU18: role("1199786765666500710", "Altersrolle unter 18"),
      birthday18Plus: role("1199786814051979344", "Altersrolle ab 18"),
      streamer: role("1266095218239995968", "Live-Streamer"),
      bumpReward: role("1286573447807500319", "Bump-Belohnung"),
    },
  },

  teamRoles: {
    label: "Team-Rollen",
    keys: {
      member: role("820658664536145940", "Teammitglied (Basisrolle)"),
      admin: role("959869691529154631", "Admin"),
      teamLead: role("893423428558782465", "Team-Leitung"),
      developer: role("929349039433056276", "Developer"),
      srModerator: role("816985466230145044", "Sr-Moderator"),
      moderator: role("815920052385480754", "Moderator"),
      supporter: role("815920170371383366", "Supporter"),
      builder: role("1263645368441241700", "Builder"),
      ticketSupport: role("1011207481357238272", "Ticket Support"),
      ticketArea: role("1270369938972082177", "Ticket Bereich"),
      banSupport: role("1209101841015504916", "Bann Support"),
      banArea: role("1155570143393488896", "Bann Bereich"),
      reportLog: role("1285728292367892584", "Report Log"),
    },
  },

  leadRoles: {
    label: "Leitungs-Rollen",
    keys: {
      team: role("1399454355349835917", "Team Leitung"),
      developer: role("1154345358030282782", "Dev Leitung"),
      support: role("1155080722466488351", "Support Leitung"),
      builder: role("1258773853249863734", "Builder Leitung"),
      creator: role("1512871214278770860", "Creator Leitung"),
      clan: role("1269383970349650087", "Clan Leitung"),
      partner: role("1175879013688954980", "Partner Leitung"),
      socialMedia: role("1290377533984079923", "Social Media Leitung"),
      event: role("1246368940318392411", "Event Leitung"),
      application: role("1269370651500609586", "Bewerbung Leitung"),
      emojiQuiz: role("1400183875774185554", "Emoji Quiz Leitung"),
    },
  },

  levelRoles: {
    label: "Level-Rollen",
    keys: {
      level5: role("1258827226846199808", "Level 5 (Inaktiv)"),
      level10: role("1258794944953319534", "Level 10 (Aktiv)"),
      level20: role("1258794479570124920", "Level 20 (Sehr aktiv)"),
      level30: role("1258827956634128467", "Level 30 (Stark aktiv)"),
      level40: role("1258794405507240038", "Level 40 (Mega aktiv)"),
      level50: role("1258825144697360485", "Level 50 (Extrem aktiv)"),
      level75: role("1258794321533075526", "Level 75 (Ultra aktiv)"),
      level100: role("1258825307239219371", "Level 100 (Hyperaktiv)"),
    },
  },

  minecraftRoles: {
    label: "Minecraft-Ränge",
    keys: {
      supreme: role("815921105407574056", "Supreme"),
      premium: role("917826787977871441", "Premium"),
      legende: role("815920452337139733", "Legende"),
      diamond: role("835775627721179167", "Diamond"),
      emerald: role("835775556611997697", "Emerald"),
      episch: role("835775597446955048", "Episch"),
    },
  },

  exclusiveRoles: {
    label: "Exklusive Rollen",
    keys: {
      creator: role("815920219247214644", "Creator"),
      vip: role("862708375698538507", "VIP"),
      booster: role("843013551605284864", "Server-Booster"),
      sponsor: role("1249802165501952053", "Geldgeber / Sponsor"),
      cooperation: role("946040266266144768", "Kooperation"),
      serverPartner: role("1187144777595101225", "Server-Partner"),
      leaderboardWinner: role("1150753421339676722", "Minenarbeiter (Leaderboard-Gewinner)"),
      designer: role("1155235780541821009", "Designer"),
      vanity: role("1010105569866174574", "Unterstützer (Vanity im Status)"),
      twitchSub: role("1067899186542018571", "Twitch-Sub"),
    },
  },

  achievementRoles: {
    label: "Erfolgs-Rollen",
    keys: {
      oneYear: role("972193356333604874", "1 Jahr Server-Mitglied"),
      informant: role("1147250265641201724", "Informant (10 Ideen)"),
      surveys: role("1147250982967836823", "Umfragen (20 Umfragen)"),
      since2021: role("992008555987222548", "Seit 2021 dabei"),
      christmas2021: role("863034801036591114", "Weihnachten 2021"),
      advent2024: role("1312780135530889326", "Adventskalender 2024"),
      christmas2025: role("1445064222894460970", "Weihnachten 2025"),
      advent2025: role("1442140220182106184", "Adventskalender 2025"),
      lucky: role("1124598019862573096", "Glückspilz (Event-Gewinner)"),
      opening2021: role("882240367632744508", "Server-Eröffnung 2021"),
    },
  },

  gameRoles: {
    label: "Spiel-Rollen",
    keys: {
      knockbackFfa: role("1259972154963918858", "KnockbackFFA"),
      rageMode: role("1303652117487157300", "RageMode"),
      jumpNRun: role("1263620833423654942", "Jump n Run"),
      roblox: role("1232072165654794281", "Roblox"),
      rocketLeague: role("1232066510554529905", "Rocket League"),
      gta5: role("1232066545492955136", "Grand Theft Auto V"),
      minecraft: role("1232066588216135880", "Minecraft"),
      fifa: role("1232066657896108082", "FIFA"),
      lol: role("1273369483951734866", "League of Legends"),
      valorant: role("1232066632491208704", "Valorant"),
      fortnite: role("1232070141127426058", "Fortnite"),
    },
  },

  regionRoles: {
    label: "Regions-Rollen",
    keys: {
      badenWuerttemberg: role("1379411398827704362", "Baden-Württemberg"),
      bayern: role("1379411504394141758", "Bayern"),
      berlin: role("1379411613240528936", "Berlin"),
      brandenburg: role("1379411641958924338", "Brandenburg"),
      bremen: role("1379411675773538404", "Bremen"),
      hamburg: role("1379411700931104830", "Hamburg"),
      hessen: role("1379411767452762233", "Hessen"),
      mecklenburgVorpommern: role("1379411797353955379", "Mecklenburg-Vorpommern"),
      niedersachsen: role("1379411848482390128", "Niedersachsen"),
      nordrheinWestfalen: role("1379411880828735568", "Nordrhein-Westfalen"),
      rheinlandPfalz: role("1379411970020605982", "Rheinland-Pfalz"),
      saarland: role("1379412016447492096", "Saarland"),
      sachsen: role("1370492716001132699", "Sachsen"),
      sachsenAnhalt: role("1379412047103660092", "Sachsen-Anhalt"),
      schleswigHolstein: role("1379412115240124517", "Schleswig-Holstein"),
      thueringen: role("1379412160194805810", "Thüringen"),
      austria: role("848163749637914674", "Österreich"),
      switzerland: role("848163753139896330", "Schweiz"),
      other: role("1127923622653210654", "Sonstiges"),
    },
  },

  genderRoles: {
    label: "Geschlechts-Rollen",
    keys: {
      male: role("848173921630945320", "Männlich"),
      female: role("848173917767991377", "Weiblich"),
      diverse: role("870646828348080159", "Divers"),
    },
  },

  pingRoles: {
    label: "Ping-Rollen",
    keys: {
      surveys: role("847805121839890463", "Umfragen Ping"),
      news: role("848085701449744394", "Neuigkeiten Ping"),
      giveaway: role("870297686467817492", "Gewinnspiel Ping"),
      serverEvents: role("870683971846041650", "Server-Events Ping"),
      changes: role("963838152815050763", "Änderungen Ping"),
      botChangelog: role("1147093175186493490", "Bot-Changelog Ping"),
      changelog: role("1478434516451463341", "Changelog Ping"),
      deadChat: role("1246190426646642698", "Dead Chat Ping"),
      freeGames: role("1230568420240527462", "Gratis Spiele Ping"),
      youtube: role("1337362885101359146", "YouTube Ping"),
    },
  },

  channels: {
    label: "Kanäle",
    keys: {
      mainChat: channel("815922756918181898", "Haupt-Chat"),
      rules: channel("815922286502346773", "Regeln"),
      support: channel("819555839362072606", "Ticket-Support"),
      playerSearch: channel("896743941813207081", "Spielersuche"),
      media: channel("886140608039747614", "Bilder & Videos"),
      botCommands: channel("979431125053227068", "Bots verwenden (Auto-Delete)"),
      writingSupport: channel("1284823233761251328", "Schrift-Support"),
      ads: channel("1172920281526960238", "Werbung für alle"),
      advertising: channel("1177536720229650442", "Werbung (Bot-Ankündigung)"),
      welcome: channel("1433189396475023380", "Willkommen / Verlassen"),
      introductions: channel("1250047970116636756", "Vorstellung"),
      birthdays: channel("1243964646449483788", "Geburtstage"),
      changelog: channel("1051393854328279120", "Changelog"),
      team: channel("877446081036836884", "Team-Kanal (Urlaub, Meetings, Warnliste)"),
      teamLog: channel("1173986308641804338", "Team-Log (Beitritt, Bereichswechsel)"),
      teamOverview: channel("1291421526238822481", "Team-Übersicht"),
      rankInfo: channel("872063101640532008", "Ränge-Info"),
      partnerInfo: channel("1172819623935221810", "Partner-Info"),
      partnerApplications: channel("1187028500461391984", "Partner-Bewerbungen"),
      partnerForum: channel("1510989799379566702", "Partner-Forum"),
      bannedInfo: channel("886989426583044117", "Gebannt-Info"),
      banList: channel("1217020305671983205", "Bann-Liste"),
      banLog: channel("985586717283205151", "Bann-Log"),
      reports: channel("1010515517460725782", "Reports"),
      feedback: channel("1336720916591149137", "Feedback"),
      serverLogs: channel("1263436406655680513", "Server-Logs"),
      botStatus: channel("1295742887388254278", "Bot-Status"),
      levelLog: channel("1221819093100007465", "Level-Bot Log"),
      logIgnored: channel("1205936920866328576", "Von Nachrichten-Logs ausgenommen"),
      suggestions: channel("1254340245772701747", "Vorschläge (Forum)"),
      advent: channel("1312772215791685743", "Adventskalender"),
      events: channel("1008696596000677998", "Server-Events"),
      levelBotCommands: channel("870645033232130098", "Level-Bot Commands"),
      youtube: channel("1274833689821319308", "YouTube-Benachrichtigungen"),
      twitch: channel("1269565441513357355", "Twitch-Status"),
    },
  },

  categories: {
    label: "Kategorien",
    keys: {
      info: category("815922210530525264", "Infos (User-Zähler)"),
      unity: category("815922693190582284", "Unity (Online-Zähler)"),
      ads: category("1172819530599378944", "Ads (Partner-Zähler)"),
      news: category("1230540006439915610", "News (Abo-Zähler)"),
      minigames: category("1269567479928197151", "Minigames (Spiele-Zähler)"),
      unban: category("886985648714682439", "Entbannungsanträge"),
    },
  },

  logThreads: {
    label: "Log-Threads",
    keys: {
      channel: thread("1269998213952442525", "Kanal-Logs"),
      message: thread("1269998217181921320", "Nachrichten-Logs"),
      join: thread("1269998215512457259", "Beitritt / Verlassen"),
      roles: thread("1269998221518831721", "Rollen-Logs"),
      server: thread("1269998220440895510", "Server-Logs"),
      moderation: thread("1269998219266490538", "Moderation"),
      invite: thread("1269998218264055818", "Einladungen"),
      botStatus: thread("1296391117507399763", "Bot online/offline"),
      error: thread("1296391118723878932", "Bot-Fehler"),
    },
  },

  messages: {
    label: "Nachrichten (Embeds, die der Bot bearbeitet)",
    keys: {
      rankInfo: message("1260234136665194567", "Ränge-Info Embed"),
      rules: message("1151068177845977148", "Regeln Embed"),
      partnerInfo: message("1187070677073801268", "Partner-Info Embed"),
      bannedInfo: message("1208816459535482961", "Gebannt-Info Embed"),
      teamOverview: message("1293559329961803950", "Team-Übersicht Embed"),
      banList: message("1298680434347081730", "Bann-Liste Embed"),
      warnList: message("1283824671506301051", "Warnliste Embed"),
    },
  },

  suggestions: {
    label: "Vorschlags-System",
    keys: {
      tagAccepted: string("1262860469836710018", "Forum-Tag: Akzeptiert"),
      tagRejected: string("1262860945785622731", "Forum-Tag: Abgelehnt"),
      tagPlanned: string("1266798963076501585", "Forum-Tag: In Planung"),
      tagDuplicate: string("1266798846256746721", "Forum-Tag: Doppelt"),
      categoryTags: json({
        "1262860849673142367": "<a:discordbloblove:855482395325890570> `DC-Server`",
        "1262860327440089158": "<a:wocbook:1178664700469317692> `Website`",
        "1262758801119907920": "<:Supporter:953359782847332362> `Support-Bot`",
        "1262758617279369246": "<a:System:915211580805881876> `System-Bot`",
        "1262759071937859705": "<a:Gift:1263043283555319941> `Gift-Bot`",
        "1266724906930929709": "<a:MinecraftGrassBlock:872034424181637171> `MC-Server`",
      }, "Kategorie-Tag → Anzeigetext"),
      upvoteEmoji: emoji("1008781495055429672", "Upvote-Emoji"),
      downvoteEmoji: emoji("1008781575644782622", "Downvote-Emoji"),
    },
  },

  partner: {
    label: "Partner-System",
    keys: {
      generalTag: string("1511149957481238658", "Forum-Tag: Allgemein"),
      categoryTags: json({
        "Hosting": "1511150137131536386",
        "Minecraft-Server": "1511150437628252190",
        "Webseite": "1511150137131536386",
        "Discord-Server": "1511150075647361024",
        "Affiliate": "1511150187719168011",
      }, "Kategorie → Forum-Tag"),
    },
  },

  bots: {
    label: "Bot-Accounts",
    keys: {
      system: user("1020023299448786955", "WOC System (dieser Bot)"),
      support: user("1031487336783028274", "WOC Support"),
      level: user("339254240012664832", "Level-Bot"),
    },
  },

  coins: {
    label: "Coins",
    keys: {
      min: number(1, "Minimum pro Generierung"),
      max: number(1000, "Maximum pro Generierung"),
      flagQuizReward: number(50, "Coins für eine richtig erratene Flagge (0 = aus)"),
    },
  },

  twitch: {
    label: "Twitch-Status",
    keys: {
      enabled: boolean(true, "Status-System aktiv"),
      // one status message per streamer; messageId is managed by the system
      streamers: json([{ login: "red3405_", messageId: "1545767658257915996" }], "Twitch-Kanäle (/settings twitch add|remove|list)"),
    },
  },

  youtube: {
    label: "YouTube",
    keys: {
      channelId: string("UCWp5vSiHFKItdlOH3vmMaOA", "YouTube-Kanal-ID"),
    },
  },

  system: {
    label: "System",
    keys: {
      disabledCommands: stringList([], "Commands, die nicht bei Discord registriert werden"),
      emojiRoles: roleList([
        "843013551605284864", "862708375698538507", "815920219247214644", "1067899186542018571",
        "1258825307239219371", "1258794321533075526", "1150753421339676722", "820658664536145940",
      ], "Rollen, die /emoji nutzen dürfen"),
      leaderboardExcluded: stringList(["996364148361400330"], "User-IDs, die nie im Leaderboard erscheinen"),
      minecraftIp: string("worldofcommunity.de", "Minecraft-Server IP"),
      vanityCode: string("woc", "Vanity-Invite-Code"),
    },
  },
};

export const SETTING_TYPES = [
  "role", "channel", "category", "thread", "message", "user", "emoji",
  "string", "number", "boolean", "roleList", "channelList", "stringList", "json",
];

export function* iterateSettings() {
  for (const [group, def] of Object.entries(SETTINGS_SCHEMA)) {
    for (const [key, spec] of Object.entries(def.keys)) {
      yield { path: `${group}.${key}`, group, key, ...spec };
    }
  }
}
