import fs from "fs";
import logger from "../functions/logger.js";
import chalk from "chalk";
import AsciiTable from "ascii-table";
import { pathToFileURL } from "url";
import path from "path";

const table = new AsciiTable();
table.setHeading("Buttons", "Stats").setBorder("|", "=", "0", "0");

export default async (client) => {
  const buttonsPath = path.resolve("./buttons/");
  const dirs = fs.readdirSync(buttonsPath);

  for (const dir of dirs) {
    const dirPath = path.join(buttonsPath, dir);
    const files = fs.readdirSync(dirPath).filter((file) => file.endsWith(".js"));

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const button = (await import(pathToFileURL(filePath).href)).default;
      if (!button?.id) {
        table.addRow(file.split(".js")[0], "⛔");
        continue;
      }
      client.buttons.set(button.id, button);
      table.addRow(button.id, "✅");
    }
  }
  logger.log(chalk.cyanBright(table.toString()));
};
