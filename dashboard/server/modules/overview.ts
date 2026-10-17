import { routes, t } from "@vxnsin/inkan";
import { DateTime } from "luxon";
import DailyStat from "#models/DailyStat.js";
import { bridge } from "../services.ts";
import { requireUser } from "../auth.ts";

const ZONE = "Europe/Berlin";
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DAYS = 366;

const Day = t.object({
  date: t.string(),
  joins: t.int(),
  leaves: t.int(),
  messages: t.int(),
  voiceMinutes: t.int(),
  voicePeak: t.int(),
  members: t.int().nullable(),
});

export const overviewRoutes = routes().use(requireUser);

overviewRoutes.get(
  "/overview",
  {
    summary: "Bot-Status und Server-Kennzahlen",
    response: {
      200: t.object({
        online: t.boolean(),
        ping: t.int().optional(),
        startedAt: t.number().nullable().optional(),
        botTag: t.string().optional(),
        guild: t.object({ name: t.string(), icon: t.string().nullable().optional(), memberCount: t.int() }).nullable(),
        counts: t.object({ roles: t.int(), channels: t.int(), commands: t.int() }).optional(),
      }),
    },
  },
  async () => {
    const s = await bridge.snapshot();
    if (!s) {return { online: false, guild: null };}
    return {
      online: s.ready && Date.now() - s.updatedAt < 90_000,
      ping: Math.round(s.ping),
      startedAt: s.startedAt,
      botTag: s.user?.tag,
      guild: s.guild ? { name: s.guild.name, icon: s.guild.icon, memberCount: s.guild.memberCount } : null,
      counts: { roles: s.roles.length, channels: s.channels.length, commands: s.commands.length },
    };
  },
);

overviewRoutes.get(
  "/overview/insights",
  {
    summary: "Joins, Leaves, Nachrichten und Aktivität pro Tag",
    query: t.object({
      days: t.int().min(1).max(366).default(30),
      from: t.string().pattern(DATE).optional(),
      to: t.string().pattern(DATE).optional(),
    }),
    response: {
      200: t.object({
        days: t.int(),
        trackingSince: t.string().nullable(),
        series: t.array(Day),
        totals: t.object({ joins: t.int(), leaves: t.int(), messages: t.int(), voiceMinutes: t.int(), voiceSessions: t.int(), voicePeak: t.int() }),
        hours: t.array(t.int()),
      }),
    },
  },
  async ({ query }) => {
    // an explicit from/to wins over `days` (counted back from today)
    const today = DateTime.now().setZone(ZONE).startOf("day");
    let to = query.to ? DateTime.fromISO(query.to, { zone: ZONE }) : today;
    if (!to.isValid || to > today) {to = today;}
    let from = query.from ? DateTime.fromISO(query.from, { zone: ZONE }) : to.minus({ days: query.days - 1 });
    if (!from.isValid || from > to) {from = to;}
    if (to.diff(from, "days").days + 1 > MAX_DAYS) {from = to.minus({ days: MAX_DAYS - 1 });}
    const days = Math.round(to.diff(from, "days").days) + 1;

    const docs: any[] = await DailyStat.find({ _id: { $gte: from.toFormat("yyyy-MM-dd"), $lte: to.toFormat("yyyy-MM-dd") } }).lean();
    const byDate = new Map(docs.map((d) => [d._id, d]));
    const first: any = await DailyStat.findOne().sort({ _id: 1 }).lean();

    const series = [];
    const hours = new Array<number>(24).fill(0);
    const totals = { joins: 0, leaves: 0, messages: 0, voiceMinutes: 0, voiceSessions: 0, voicePeak: 0 };
    let lastMembers: number | null = null;

    for (let i = 0; i < days; i += 1) {
      const date = from.plus({ days: i }).toFormat("yyyy-MM-dd");
      const doc = byDate.get(date);
      if (doc?.members) {lastMembers = doc.members;}
      series.push({
        date,
        joins: doc?.joins ?? 0,
        leaves: doc?.leaves ?? 0,
        messages: doc?.messages ?? 0,
        voiceMinutes: Math.round(doc?.voiceMinutes ?? 0),
        voicePeak: doc?.voicePeak ?? 0,
        members: lastMembers,
      });
      totals.joins += doc?.joins ?? 0;
      totals.leaves += doc?.leaves ?? 0;
      totals.messages += doc?.messages ?? 0;
      totals.voiceMinutes += Math.round(doc?.voiceMinutes ?? 0);
      totals.voiceSessions += doc?.voiceSessions ?? 0;
      totals.voicePeak = Math.max(totals.voicePeak, doc?.voicePeak ?? 0);
      for (const [hour, count] of Object.entries(doc?.hours ?? {})) {hours[Number(hour)] += Number(count);}
    }

    return { days, trackingSince: first?._id ?? null, series, totals, hours };
  },
);
