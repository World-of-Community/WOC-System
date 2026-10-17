// Shared connections (Mongo, Redis) and the bridge to the bot. Cached on globalThis so Vite reloads don't pile them up.
import { randomUUID } from "node:crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Redis } from "ioredis";
import type { SessionStore, SessionRecord } from "@inkanjs/session";
import { KEYS } from "#config/dashboardProtocol.js";

dotenv.config({ quiet: true });

const { MONGO_URI, REDIS_URL, DASHBOARD_TOKEN, SESSION_SECRET } = process.env;
for (const [name, value] of Object.entries({ MONGO_URI, REDIS_URL, DASHBOARD_TOKEN })) {
  if (!value) {throw new Error(`[Dashboard] ${name} is missing (see .env.example)`);}
}

type Cache = { redis: Redis; mongo: Promise<typeof mongoose> };
const g = globalThis as unknown as { __wocDashboard?: Cache };

g.__wocDashboard ??= {
  redis: new Redis(REDIS_URL!, { maxRetriesPerRequest: 3 }),
  mongo: (mongoose.set("strictQuery", false), mongoose.connect(MONGO_URI!, { serverSelectionTimeoutMS: 10_000 })),
};

export const redis = g.__wocDashboard.redis;
export const mongoReady = g.__wocDashboard.mongo;
redis.on("error", (error) => console.error("[Redis]", error.message));

export const dashboardToken = DASHBOARD_TOKEN!;
// derived from the token when no dedicated secret is set
export const sessionSecret = SESSION_SECRET ?? `${DASHBOARD_TOKEN}-session-secret-padding-for-32-bytes`;

// Sessions live in Redis so a logout really ends them.
export const sessionStore: SessionStore = {
  get: async (id) => JSON.parse((await redis.get(`woc:sess:${id}`)) ?? "null") ?? undefined,
  set: async (id, record: SessionRecord, ttl) => void (await redis.set(`woc:sess:${id}`, JSON.stringify(record), "EX", ttl)),
  delete: async (id) => void (await redis.del(`woc:sess:${id}`)),
};

export type Snapshot = {
  updatedAt: number;
  ready: boolean;
  startedAt: number | null;
  ping: number;
  user: { id: string; tag: string; avatar: string } | null;
  guild: { id: string; name: string; icon: string | null; memberCount: number } | null;
  roles: { id: string; name: string; color: string; position: number }[];
  channels: { id: string; name: string; type: string; parentId: string | null }[];
  commands: { name: string; description: string; category: string }[];
};

export type BotResult = { ok: boolean; error?: string; [key: string]: unknown };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const bridge = {
  async snapshot(): Promise<Snapshot | null> {
    const raw = await redis.get(KEYS.snapshot);
    return raw ? JSON.parse(raw) : null;
  },

  // Sends a command to the bot and waits for its result (bot offline -> ok:false).
  async send(type: string, payload: object = {}, timeout = 10_000): Promise<BotResult> {
    const id = randomUUID();
    const receivers = await redis.publish(KEYS.commandChannel, JSON.stringify({ id, type, payload }));
    if (receivers === 0) {return { ok: false, error: "Bot ist offline" };}

    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const raw = await redis.get(KEYS.result(id));
      if (raw) {
        await redis.del(KEYS.result(id));
        return JSON.parse(raw);
      }
      await sleep(150);
    }
    return { ok: false, error: "Keine Antwort vom Bot" };
  },
};
