import fs from "fs";
import logger from "../functions/logger.js";
import chalk from "chalk";
import AsciiTable from "ascii-table";
import { pathToFileURL } from "url";
import path from "path";

const table = new AsciiTable();
table.setHeading("Modals", "Stats").setBorder("|", "=", "0", "0");

export default async (client) => {
  const modalsPath = path.resolve("./modals/");
  const files = fs.readdirSync(modalsPath).filter((file) => file.endsWith(".js"));

  for (const file of files) {
    const filePath = path.join(modalsPath, file);
    const modal = (await import(pathToFileURL(filePath).href)).default;
    if (!modal?.id) {
      table.addRow(file.split(".js")[0], "⛔");
      continue;
    }
    client.modals.set(modal.id, modal);
    table.addRow(modal.id, "✅");
  }
  logger.log(chalk.yellow(table.toString()));
};
