import AsciiTable from "ascii-table";
import logger from "#core/logger.js";

export function createLoadTable(title, column = "Status") {
  const table = new AsciiTable().setHeading(title, column).setBorder("|", "=", "0", "0");
  return {
    ok: (name) => table.addRow(name, "✅"),
    skip: (name, reason = "⏭️") => table.addRow(name, reason),
    fail: (name) => table.addRow(name, "⛔"),
    print: (colorize = (s) => s) => logger.log(colorize(table.toString())),
  };
}
