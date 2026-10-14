import fs from "fs";
import logger from "../functions/logger.js";
import chalk from "chalk";
import AsciiTable from "ascii-table";
import { pathToFileURL } from "url";
import path from "path";

const table = new AsciiTable();
table.setHeading("Events", "Stats").setBorder("|", "=", "0", "0");

// Diese Event-Dateien werden nicht geladen (übernommen aus der alten index.js)
const blockedEventFiles = new Set([]);

export default async () => {
  const eventsPath = path.resolve("./events/");
  const files = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

  for (const event of files) {
    if (blockedEventFiles.has(event)) {
      table.addRow(event.split(".js")[0], "⏭️");
      continue;
    }

    const filePath = path.join(eventsPath, event);
    await import(pathToFileURL(filePath).href);
    table.addRow(event.split(".js")[0], "✅");
  }
  logger.log(chalk.greenBright(table.toString()));
};
