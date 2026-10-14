import path from "node:path";
import chalk from "chalk";
import cron from "node-cron";
import { Events } from "discord.js";
import logger from "#core/logger.js";
import { reportError } from "#core/errors.js";
import { walkJsFiles, importFile, relSrc, SRC_DIR } from "./walk.js";
import { createLoadTable } from "./table.js";

const SCHEDULES_DIR = path.join(SRC_DIR, "schedules");

// Schedule module (or array):
//   { name, cron: "0 0 * * *" | interval: ms, runOnReady?: boolean, execute(client) }
//   { name, start(client) }  – for custom timers; may return a stop() function
// All schedules start on ClientReady so guild cache and client.user exist.
export default async function loadSchedules(client) {
  const table = createLoadTable("Schedules", "Trigger");
  const pending = [];

  for (const file of walkJsFiles(SCHEDULES_DIR)) {
    const label = relSrc(file);
    try {
      const exported = (await importFile(file)).default;
      const modules = Array.isArray(exported) ? exported : [exported];

      for (const schedule of modules) {
        if (!schedule?.name) {
          logger.warn(`Schedule ${label} has no "name" – skipped`);
          table.fail(label);
          continue;
        }
        if (typeof schedule.execute !== "function" && typeof schedule.start !== "function") {
          logger.warn(`Schedule ${schedule.name} (${label}) has neither execute() nor start() – skipped`);
          table.fail(schedule.name);
          continue;
        }
        if (schedule.cron && !cron.validate(schedule.cron)) {
          logger.warn(`Schedule ${schedule.name} (${label}) has an invalid cron expression "${schedule.cron}" – skipped`);
          table.fail(schedule.name);
          continue;
        }

        schedule.file = label;
        pending.push(schedule);
        table.ok(`${schedule.name} (${schedule.cron ?? (schedule.interval ? `every ${schedule.interval / 1000}s` : "custom")})`);
      }
    } catch (error) {
      logger.error(`Failed to load schedule ${label}:`, error);
      table.fail(label);
    }
  }

  table.print(chalk.magentaBright);
  logger.info(`${pending.length} schedules prepared`);

  client.once(Events.ClientReady, () => {
    for (const schedule of pending) {
      startSchedule(client, schedule);
    }
    logger.success(`${pending.length} schedules started`);
  });
}

function startSchedule(client, schedule) {
  const source = `schedule:${schedule.name}@${schedule.file}`;
  let running = false;

  const run = async () => {
    // skip overlapping runs (slow DB on a short interval)
    if (running) {
      logger.debug(`${schedule.name}: previous run still active – skipped`);
      return;
    }
    running = true;
    try {
      await schedule.execute(client);
    } catch (error) {
      reportError(error, { source });
    } finally {
      running = false;
    }
  };

  const handle = { schedule, stop: () => {} };

  try {
    if (typeof schedule.start === "function") {
      const result = schedule.start(client);
      if (typeof result === "function") {handle.stop = result;}
    } else if (schedule.cron) {
      const task = cron.schedule(schedule.cron, run, schedule.timezone ? { timezone: schedule.timezone } : undefined);
      handle.stop = () => task.stop();
    } else if (schedule.interval) {
      const timer = setInterval(run, schedule.interval);
      handle.stop = () => clearInterval(timer);
    }

    if (schedule.runOnReady && typeof schedule.execute === "function") {
      run();
    }

    client.schedules.set(schedule.name, handle);
  } catch (error) {
    reportError(error, { source: `${source}:start` });
  }
}

export function stopSchedules(client) {
  for (const { stop } of client.schedules.values()) {
    try { stop(); } catch { /* ignore */ }
  }
  client.schedules.clear();
}
