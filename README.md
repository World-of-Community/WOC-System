# WOC-System

Discord-Bot für **World Of Community**.

## Setup

```bash
npm install
cp .env.example .env   # Werte eintragen
npm start              # oder: npm run dev (nodemon)
```

| Variable | Beschreibung |
|---|---|
| `DISCORD_TOKEN` | Bot-Token |
| `DISCORD_CLIENT_ID` | Application-ID |
| `DISCORD_GUILD_ID` | Server-ID (Guild-Commands) |
| `MONGO_URI` | MongoDB-Verbindungsstring |
| `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` | Twitch-App für das Status-System |
| `YOUTUBE_API_KEY` | YouTube Data API Key (`/youtube`) |
| `NODE_ENV` | `development` / `production` |
| `LOG_LEVEL` | `debug` / `info` / `warn` / `error` |

Alles andere (Rollen, Kanäle, Threads, Tags, Coins, Twitch-User, …) liegt in der Datenbank
und wird per `/settings` verwaltet – siehe [Settings](#settings).

## Deployment

```bash
node update.js      # oder: npm run update
```

`update.js` lädt den aktuellen Stand von `main`, führt bei geänderter `package-lock.json` `npm ci` aus und startet `src/index.js`.
Beendet sich der Bot mit Exit-Code 0 (`/restart`), wird erneut aktualisiert und gestartet; nach einem Absturz wird mit Backoff neu gestartet.
`.env`, `backups/` und `node_modules/` werden beim Update nie überschrieben.

## Struktur

```
src/
  index.js                 Start: env → MongoDB → Settings → Loader → Command-Registrierung → Login
  client.js                Discord-Client + Registries (slashCommands, buttons, modals, selectMenus, schedules)
  config/                  env.js (validierte .env), settings.schema.js (alle Einstellungen + Defaults)
  core/                    logger, errors, reply, settings, discordLog, shutdown
  database/                connection.js, defineModel.js, models/
  loaders/                 laden Commands, Komponenten, Events, Schedules; registerCommands (REST)
  events/<bereich>/        Event-Module
  schedules/               Crons & Intervalle
  interactions/
    commands/<kategorie>/  Slash-Commands
    buttons/<bereich>/     Buttons
    modals/                Modals
    selectMenus/           Select-Menüs
  systems/                 Fachlogik (vorschlag, erfolge, teammanager, leaderboard, twitch, streamerRole, …)
  utils/

scripts/                   check-load.js, db-smoke.js, db-cleanup.js
```

Import-Aliase (`package.json` → `imports`):
`#client`, `#config`, `#config/*`, `#core/*`, `#db/*`, `#models/*`, `#systems/*`, `#utils/*`

```bash
npm run lint     # ESLint
npm run check    # lädt alle Module ohne Login/DB, bricht bei Ladefehlern ab (läuft auch in CI)
```

---

## Code-Stil

Jede Datei hat dieselbe Reihenfolge: **Imports → Konstanten → Hilfsfunktionen → `export default`** (bzw. benannte Exporte am Ende).

- Commands: `name, description, type, default_member_permissions?, options, run, autocomplete?` – immer `async run(client, interaction) {}`, Optionen ohne Anführungszeichen um die Keys.
- Komponenten: `id, prefix?, run`. Events: `name, once?, execute`. Schedules: `name, cron|interval|start, runOnReady?, execute`.
- Logik, die mehrere Dateien teilen, gehört nach `src/systems/` – Events, Schedules und Commands rufen sie nur auf.
- Kein `try/catch` um den ganzen Handler, kein `console.*` – Fehler werfen (`UserError` für Nutzer-Feedback), der Loader fängt sie.
- Keine hardcodierten Discord-IDs: alles über `settings.get()`, neue Werte ins Schema.
- Kommentare auf Englisch und nur, wenn sie etwas erklären, das der Code nicht zeigt. Keine Banner-Kommentare.
- Doppelte oder auskommentierte Alt-Versionen werden gelöscht, nicht aufbewahrt – dafür gibt es Git.

`npm run lint` erzwingt Formatierung (2 Spaces, Semikolons, doppelte Anführungszeichen, trailing commas).

## Entwickeln

### Slash-Command

`src/interactions/commands/<kategorie>/mein-command.js` – der Ordnername ist nur die Kategorie.

```js
import { UserError } from "#core/errors.js";
import { settings } from "#core/settings.js";
import User from "#models/User.js";

export default {
  name: "mein-command",
  description: "» Macht etwas. ✨",
  type: 1,
  default_member_permissions: "8",      // optional, Discord-Permission-Bits als String
  options: [
    { type: 6, name: "user", description: "Ein Nutzer", required: true },
  ],

  async run(client, interaction) {
    const target = interaction.options.getUser("user");
    const data = await User.findOne({ userID: target.id });
    if (!data) {throw new UserError("> `❌` » Keine Daten gefunden.");}

    await interaction.reply({ content: `<@&${settings.get("roles.verify")}>`, ephemeral: true });
  },

  // optional
  async autocomplete(interaction) {
    await interaction.respond([{ name: "Beispiel", value: "beispiel" }]);
  },
};
```

Commands werden beim Start automatisch als Guild-Commands registriert. Einträge in
`system.disabledCommands` (Settings) bleiben geladen, werden aber nicht registriert.

### Button / Modal / Select-Menü

`src/interactions/buttons/<bereich>/x.js`, `src/interactions/modals/x.js`, `src/interactions/selectMenus/x.js`

```js
export default {
  id: "advent_",          // customId; mit prefix: true matchen alle IDs, die so beginnen (advent_1, advent_24)
  prefix: true,
  async run(client, interaction) {
    const [, day] = interaction.customId.split("_");
    await interaction.reply({ content: `Tag ${day}`, ephemeral: true });
  },
};
```

Eine Datei darf auch ein Array mehrerer Komponenten exportieren.

### Event

`src/events/<bereich>/x.js`

```js
import { Events } from "discord.js";

export default {
  name: Events.MessageCreate,
  once: false,                    // optional
  async execute(client, message) {
    // ...
  },
};
```

Mehrere Listener pro Datei: Array exportieren. Jeder Listener ist in try/catch gekapselt –
ein Fehler landet über `reportError()` im Log und im Fehler-Thread, der Bot läuft weiter.

### Schedule (Cron / Intervall)

`src/schedules/x.js` – startet erst, wenn der Client `ready` ist.

```js
export default {
  name: "birthday",
  cron: "0 0 * * *",        // ODER interval: 30_000 (ms)
  runOnReady: false,        // zusätzlich einmal direkt nach dem Start
  async execute(client) {
    // ...
  },
};

// eigener Timer (z.B. node-schedule): start() darf eine stop()-Funktion zurückgeben
export default { name: "custom", start(client) { /* ... */ return () => {}; } };
```

Überlappende Läufe werden übersprungen, Fehler gehen an `reportError()`.

### Model

`src/database/models/Name.js` – `collection` ist Pflicht, damit ein Umbenennen des Models nie
stillschweigend eine neue Collection anlegt.

```js
import { defineModel } from "../defineModel.js";

export default defineModel("Note", {
  userId: { type: String, required: true, index: true },
  text: { type: String, default: "" },
  tags: { type: [String], default: [] },
}, {
  collection: "notes",
  timestamps: true,                                   // optional: createdAt/updatedAt
  indexes: [[{ userId: 1, text: 1 }, { unique: true }]], // optional
});
```

Jedes Model bekommt `findOrCreate(filter, defaults)`:

```js
const note = await Note.findOrCreate({ userId }, { text: "Hallo" });
```

Import immer über den Alias: `import Note from "#models/Note.js";`

### Settings

Alle Rollen-, Kanal-, Thread-, Tag- und Systemwerte stehen in `src/config/settings.schema.js`,
gruppiert nach Thema (`roles`, `teamRoles`, `channels`, `logThreads`, `messages`, `coins`, …).
Der Default im Schema ist der Wert, mit dem eine leere Datenbank beim ersten Start befüllt wird.

```js
import { settings } from "#core/settings.js";

settings.get("channels.support");          // sync, aus dem Cache
settings.group("levelRoles");              // { level5: "…", level10: "…", … }
await settings.set("coins.max", 500, interaction.user.id);
await settings.reset("coins.max");
```

Neue Einstellung = ein Eintrag im Schema:

```js
channels: {
  label: "Kanäle",
  keys: {
    meinKanal: channel("123456789012345678", "Beschreibung für /settings"),
  },
},
```

Typen: `role`, `channel`, `category`, `thread`, `message`, `user`, `emoji`, `string`, `number`,
`boolean`, `roleList`, `channelList`, `stringList`, `json`. `/settings set` akzeptiert IDs,
Erwähnungen, `ja/nein`, kommagetrennte Listen und JSON – passend zum Typ.

Wichtig: `settings.get()` nie auf Modul-Ebene in eine Konstante schreiben, sonst friert der
Wert beim Import ein. Immer dort aufrufen, wo er gebraucht wird.

Discord-Commands: `/settings list [gruppe]`, `/settings get key`, `/settings set key wert`, `/settings reset key`
Twitch-Status: `/settings twitch add|remove|list|enable|disable` – ein Status-Embed pro Kanal in `channels.twitch`

### Fehlerbehandlung

```js
import { UserError, reportError } from "#core/errors.js";

throw new UserError("> `❌` » Du hast nicht genug Coins.");   // Nachricht an den Nutzer, kein Log
await reportError(error, { source: "system:xyz", user: "123" }); // Konsole + Embed im Fehler-Thread
```

- Commands, Komponenten, Events und Schedules sind bereits gekapselt – kein eigenes try/catch nötig,
  außer man will etwas Spezielles tun.
- Unbehandelte Fehler bei Interaktionen bekommen automatisch eine generische Antwort.
- Bekannte Discord-Fehlercodes (Unknown Message, Missing Access, Cannot DM, …) werden nicht als Bot-Fehler gemeldet.
- `unhandledRejection` / `uncaughtException` werden gemeldet statt den Prozess zu beenden; `SIGINT`/`SIGTERM` fahren sauber herunter.

### Logging

```js
import logger from "#core/logger.js";
const log = logger.child("Twitch");
log.info("…"); log.warn("…"); log.error("…", error); log.debug("…");
```

`LOG_LEVEL` in der `.env` steuert, was ausgegeben wird.

### Discord-Logs

```js
import { sendLog } from "#core/discordLog.js";
await sendLog(settings.get("logThreads.moderation"), embed);
```

### Datenbank-Skripte

```bash
node --env-file=.env scripts/db-smoke.js      # Settings laden, Dokumente pro Model zählen
node --env-file=.env scripts/db-cleanup.js    # ungenutzte Collections auflisten (Dry-Run)
node --env-file=.env scripts/db-cleanup.js --apply name1,name2   # genau diese löschen
```
