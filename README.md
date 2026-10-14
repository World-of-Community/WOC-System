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
| `NODE_ENV` | `development` / `production` |
| `LOG_LEVEL` | `debug` / `info` / `warn` / `error` |

Nicht-geheime IDs (Kanäle, Rollen usw.) liegen in `src/config/config.json`.

## Struktur

```
src/
  index.js                 Start: env → MongoDB → Loader → Command-Registrierung → Login
  client.js                Discord-Client + Registries (commands, buttons, modals, selectMenus, schedules)
  config/                  env.js (validierte .env), config.json, index.js (GUILD_ID, CHANNELS, LOG_THREADS)
  core/                    logger, errors (UserError, reportError, handleInteractionError), reply, discordLog, shutdown
  database/                connection.js (Retry, Reconnect-Logging, Disconnect), models/
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
data/                      Laufzeit-/Datendateien (twitchStatus.json, flaggen.json)
scripts/check-load.js      lädt alle Module ohne Login (npm run check)
```

Imports laufen über Aliase aus `package.json`:
`#client`, `#config`, `#core/*`, `#db/*`, `#models/*`, `#systems/*`, `#utils/*`.

## Modul-Formate

```js
// Command
export default { name, description, type, options, run(client, interaction), autocomplete?(interaction) };

// Button / Modal / SelectMenu – prefix: true matcht alle customIds, die mit id beginnen
export default { id, prefix?, run(client, interaction) };

// Event (eine Datei darf auch ein Array exportieren)
export default { name: Events.MessageCreate, once?, execute(client, ...args) };

// Schedule – startet nach ClientReady
export default { name, cron: "0 0 * * *" | interval: ms, runOnReady?, execute(client) };
export default { name, start(client) };   // eigener Timer, darf stop() zurückgeben
```

## Fehlerbehandlung

- Jeder Command/Button/Modal/SelectMenu-Aufruf, jeder Event-Listener und jeder Schedule-Lauf ist gekapselt.
- `throw new UserError("…")` → Text geht als ephemere Antwort an den Nutzer, kein Fehler-Log.
- Alle anderen Fehler → Konsole + Embed im ERROR-Thread (`reportError`), Nutzer bekommt eine generische Meldung.
- `unhandledRejection` / `uncaughtException` werden gemeldet statt den Prozess zu beenden; `SIGINT`/`SIGTERM` fahren sauber herunter.

## Checks

```bash
npm run lint
npm run check
```
