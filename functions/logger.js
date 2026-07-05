/* eslint-disable no-console */
import chalk from "chalk";

const logger = {
  info: (...args) => console.log(chalk.blue("INFO:"), ...args),
  warn: (...args) => console.log(chalk.yellow("WARN:"), ...args),
  error: (...args) => console.log(chalk.red("ERROR:"), ...args),
  success: (...args) => console.log(chalk.green("SUCCESS:"), ...args),
  log: (...args) => console.log(...args),
};

export default logger;
