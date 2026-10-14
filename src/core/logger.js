/* eslint-disable no-console */
import chalk from "chalk";
import { inspect } from "node:util";

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

let currentLevel = LEVELS[(process.env.LOG_LEVEL ?? "info").toLowerCase()] ?? LEVELS.info;

const timestamp = () => chalk.gray(`[${new Date().toISOString()}]`);

const LABELS = {
  debug: chalk.magenta("DEBUG"),
  info: chalk.blue("INFO "),
  warn: chalk.yellow("WARN "),
  error: chalk.red("ERROR"),
  success: chalk.green("OK   "),
};

function formatArg(arg) {
  if (arg instanceof Error) {
    return arg.stack ?? `${arg.name}: ${arg.message}`;
  }
  if (typeof arg === "object" && arg !== null) {
    return inspect(arg, { depth: 4, colors: true });
  }
  return String(arg);
}

function write(level, prefix, args) {
  const threshold = level === "success" ? LEVELS.info : LEVELS[level];
  if (threshold < currentLevel) {return;}

  const out = level === "error" ? console.error : console.log;
  const tag = prefix ? chalk.cyan(`[${prefix}]`) : null;
  const parts = [timestamp(), LABELS[level], tag, ...args.map(formatArg)].filter(Boolean);
  out(parts.join(" "));
}

function createLogger(prefix = "") {
  return {
    debug: (...args) => write("debug", prefix, args),
    info: (...args) => write("info", prefix, args),
    warn: (...args) => write("warn", prefix, args),
    error: (...args) => write("error", prefix, args),
    success: (...args) => write("success", prefix, args),
    log: (...args) => console.log(...args),
    child: (childPrefix) => createLogger(prefix ? `${prefix}:${childPrefix}` : childPrefix),
    setLevel: (level) => {
      if (LEVELS[level] !== undefined) {currentLevel = LEVELS[level];}
    },
  };
}

const logger = createLogger();

export default logger;
export { createLogger };
