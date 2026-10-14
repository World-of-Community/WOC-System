import loadCommands from "./loadCommands.js";
import loadComponents from "./loadComponents.js";
import loadEvents from "./loadEvents.js";
import loadSchedules from "./loadSchedules.js";
import registerCommands from "./registerCommands.js";

export { loadCommands, loadComponents, loadEvents, loadSchedules, registerCommands };
export { resolveComponent } from "./loadComponents.js";
export { stopSchedules } from "./loadSchedules.js";

export async function loadAll(client) {
  await loadCommands(client);
  await loadComponents(client);
  await loadEvents(client);
  await loadSchedules(client);
}
