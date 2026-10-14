import path from "node:path";
import chalk from "chalk";
import logger from "#core/logger.js";
import { reportError } from "#core/errors.js";
import { walkJsFiles, importFile, relSrc, SRC_DIR } from "./walk.js";
import { createLoadTable } from "./table.js";

const EVENTS_DIR = path.join(SRC_DIR, "events");

// Event module: { name: Events.X, once?: boolean, execute(client, ...args) } or an array of those.
// Every listener is wrapped so one failing handler can't crash the process or starve the others.
export default async function loadEvents(client) {
  const table = createLoadTable("Events");
  let count = 0;

  for (const file of walkJsFiles(EVENTS_DIR)) {
    const label = relSrc(file);
    try {
      const exported = (await importFile(file)).default;
      const modules = Array.isArray(exported) ? exported : [exported];

      for (const [index, event] of modules.entries()) {
        if (!event?.name || typeof event.execute !== "function") {
          logger.warn(`Event ${label}${modules.length > 1 ? `[${index}]` : ""} has no "name" or execute() – skipped`);
          table.fail(label);
          continue;
        }

        const source = `event:${event.name}@${label}`;
        const listener = async (...args) => {
          try {
            await event.execute(client, ...args);
          } catch (error) {
            reportError(error, { source });
          }
        };

        if (event.once) {
          client.once(event.name, listener);
        } else {
          client.on(event.name, listener);
        }

        table.ok(`${event.name} ← ${label}`);
        count += 1;
      }
    } catch (error) {
      logger.error(`Failed to load event ${label}:`, error);
      table.fail(label);
    }
  }

  table.print(chalk.greenBright);
  logger.info(`${count} event listeners registered`);
}
