# WOC-System

Discord-Bot für **World Of Community** – aufgebaut nach dem gleichen Command-Handler-System wie [Clockin](https://github.com/BlackWither17/Clockin).

## Starten

```bash
npm install
npm start        # bzw. npm run dev (nodemon)
```

Konfiguration über `.env` (siehe `.env.example`):

| Variable | Beschreibung |
|---|---|
| `DISCORD_TOKEN` | Bot-Token |
| `DISCORD_CLIENT_ID` | Application-ID |
| `DISCORD_GUILD_ID` | Server-ID (Guild-Commands) |
| `MONGO_URI` | MongoDB-Verbindungsstring |

Nicht-geheime IDs (Kanäle, Rollen usw.) liegen weiterhin in `json/config.json`.

## Struktur

```
index.js              Client, Collections, lädt alle Handler, MongoDB, Login
handlers/             Lader für Commands, Events, Buttons, Modals, SelectMenus
slashCommands/<kat>/  Slash-Commands: { name, description, type, options, run(client, interaction) }
events/               Selbstregistrierende Events (client.on(...)), inkl. Crons/Intervalle
buttons/<kat>/        Buttons: { id, run(client, interaction) } – prefix: true für dynamische IDs (z.B. advent_12)
modals/               Modals: { id, run(client, interaction) } – prefix: true möglich
selectMenus/          Select-Menüs: { id, run(client, interaction) }
functions/            Hilfsfunktionen & Systeme (Logger, sendLog, Vorschlag, Erfolge, Teammanager …)
models/               Mongoose-Models (früher „Datenbank/")
json/                 Konfiguration & Datenspeicher (config.json, flaggen.json …)
```

## Besonderheiten

- **Command-Registrierung** passiert beim Start in `handlers/slashCommand.js` (Guild-Commands).
  Commands mit `coin`/`leaderboard` im Namen sowie `season-pass` und `daily` werden geladen,
  aber **nicht** bei Discord registriert (Filter aus dem alten `deployCommands.js`).
- **Geblockte Events** stehen in `handlers/events.js` (`blockedEventFiles`).
- Dispatch der Interaktionen: `events/interactionCreate.js` (Slash/Context-Menu),
  `events/buttonInteraction.js`, `events/modalInteraction.js`, `events/selectMenus.js`.
- `!teststream` in `index.js` nutzt die echte Streamer-Logik und kann die Live-Rolle tatsächlich vergeben.
