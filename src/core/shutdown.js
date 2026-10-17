import logger from "./logger.js";
import { disconnectDatabase } from "#db/connection.js";
import { stopDashboardBridge } from "./dashboardBridge.js";
import { stopSchedules } from "../loaders/loadSchedules.js";

let shuttingDown = false;

export async function shutdown(client, { reason = "unknown", exitCode = 0 } = {}) {
  // second signal (e.g. double Ctrl+C) exits immediately
  if (shuttingDown) {
    logger.warn("Forced exit");
    process.exit(exitCode || 1);
  }
  shuttingDown = true;
  logger.info(`Shutting down (${reason})`);

  const killTimer = setTimeout(() => {
    logger.warn("Shutdown timed out, exiting hard");
    process.exit(exitCode || 1);
  }, 10_000);
  killTimer.unref();

  try {
    stopSchedules(client);
  } catch (error) {
    logger.error("Failed to stop schedules:", error);
  }

  try {
    await client.destroy();
    logger.info("Discord connection closed");
  } catch (error) {
    logger.error("Failed to close Discord connection:", error);
  }

  await stopDashboardBridge();
  await disconnectDatabase();

  clearTimeout(killTimer);
  process.exit(exitCode);
}

export function registerShutdownHandlers(client) {
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => shutdown(client, { reason: signal }));
  }
}
