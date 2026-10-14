import mongoose from "mongoose";
import logger from "#core/logger.js";
import { env } from "#config";

const log = logger.child("MongoDB");

const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
  heartbeatFrequencyMS: 10_000,
  maxPoolSize: 10,
  autoIndex: env.isDev,
};

let listenersAttached = false;
let closing = false;

function attachListeners() {
  if (listenersAttached) {return;}
  listenersAttached = true;

  const conn = mongoose.connection;
  conn.on("connected", () => log.success("Connected"));
  conn.on("disconnected", () => { if (!closing) {log.warn("Disconnected – driver will reconnect automatically");} });
  conn.on("reconnected", () => log.success("Reconnected"));
  conn.on("error", (error) => log.error("Connection error:", error?.message ?? error));
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Exponential backoff on initial connect (1s, 2s, 4s … capped at 30s).
export async function connectDatabase({ uri = env.mongo.uri, maxRetries = env.mongo.maxRetries } = {}) {
  mongoose.set("strictQuery", false);
  attachListeners();

  for (let attempt = 1; ; attempt += 1) {
    try {
      log.info(`Connecting (attempt ${attempt}/${maxRetries})`);
      await mongoose.connect(uri, CONNECT_OPTIONS);
      return mongoose.connection;
    } catch (error) {
      log.error(`Connect failed: ${error?.message ?? error}`);
      if (attempt >= maxRetries) {
        throw new Error(`MongoDB unreachable after ${maxRetries} attempts`, { cause: error });
      }
      const delay = Math.min(1000 * 2 ** (attempt - 1), 30_000);
      log.warn(`Retrying in ${delay / 1000}s`);
      await sleep(delay);
    }
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState === 0) {return;}
  closing = true;
  try {
    await mongoose.disconnect();
    log.info("Connection closed");
  } catch (error) {
    log.error("Error while closing connection:", error);
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

export default mongoose;
