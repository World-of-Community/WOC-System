import path from "node:path";
import chalk from "chalk";
import logger from "#core/logger.js";
import { walkJsFiles, importFile, relSrc, SRC_DIR } from "./walk.js";
import { createLoadTable } from "./table.js";

const INTERACTIONS_DIR = path.join(SRC_DIR, "interactions");

const COMPONENT_TYPES = [
  { key: "buttons", dir: "buttons", title: "Buttons", color: chalk.cyanBright },
  { key: "modals", dir: "modals", title: "Modals", color: chalk.yellow },
  { key: "selectMenus", dir: "selectMenus", title: "Select Menus", color: chalk.grey },
];

// Component module: { id, prefix?: boolean, run(client, interaction) } or an array of those.
// prefix: true matches every customId starting with `id` (e.g. "advent_12")
export default async function loadComponents(client) {
  for (const type of COMPONENT_TYPES) {
    const registry = client[type.key];
    registry.clear();

    const table = createLoadTable(type.title);

    for (const file of walkJsFiles(path.join(INTERACTIONS_DIR, type.dir))) {
      const label = relSrc(file);
      try {
        const exported = (await importFile(file)).default;
        const components = Array.isArray(exported) ? exported : [exported];

        for (const component of components) {
          if (!component?.id || typeof component.run !== "function") {
            logger.warn(`${type.title}: ${label} has no "id" or run() – skipped`);
            table.fail(label);
            continue;
          }

          if (registry.has(component.id)) {
            logger.warn(`${type.title}: duplicate id "${component.id}" in ${label}`);
          }

          component.file = label;
          registry.set(component.id, component);
          table.ok(component.id);
        }
      } catch (error) {
        logger.error(`${type.title}: failed to load ${label}:`, error);
        table.fail(label);
      }
    }

    table.print(type.color);
    logger.info(`${registry.size} ${type.title} loaded`);
  }
}

export function resolveComponent(registry, customId) {
  return registry.get(customId)
    ?? registry.find((c) => c.prefix && customId.startsWith(c.id))
    ?? null;
}
