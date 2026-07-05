import fs from "fs";
import logger from "../functions/logger.js";
import chalk from "chalk";
import AsciiTable from "ascii-table";
import { pathToFileURL } from "url";
import path from "path";

const table = new AsciiTable();
table.setHeading("Select Menus", "Stats").setBorder("|", "=", "0", "0");

export default async (client) => {
  const selectMenusPath = path.resolve("./selectMenus/");
  const files = fs.readdirSync(selectMenusPath).filter((file) => file.endsWith(".js"));

  for (const file of files) {
    const filePath = path.join(selectMenusPath, file);
    const selectMenu = (await import(pathToFileURL(filePath).href)).default;
    if (!selectMenu?.id) {
      table.addRow(file.split(".js")[0], "⛔");
      continue;
    }
    client.selectMenus.set(selectMenu.id, selectMenu);
    table.addRow(selectMenu.id, "✅");
  }
  logger.log(chalk.grey(table.toString()));
};
