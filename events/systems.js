import client from "../index.js";
import vorschlag from "../functions/vorschlag.js";
import erfolge from "../functions/erfolge.js";
import teammanager from "../functions/teammanager.js";

// Registriert die Systeme auf dem Client und startet sie
// (ersetzt den functions-Loader + die Aufrufe aus der alten src/index.js)
vorschlag(client);
erfolge(client);
teammanager(client);

// Systems
client.vorschlag();

// Handlers
client.handleErfolg();
client.manageTeam();
