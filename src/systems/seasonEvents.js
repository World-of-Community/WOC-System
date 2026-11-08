import EventItem from "../database/models/EventItem.js";
import { settings } from "#core/settings.js";

function utcDate(year, month, day, endOfDay = false) {
  return new Date(Date.UTC(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0));
}

export function getEventPeriods(referenceDate = new Date()) {
  const year = referenceDate.getUTCFullYear();
  const newyearStartYear = referenceDate.getUTCMonth() === 0 ? year - 1 : year;
  return {
    easter: { event: "easter", start: utcDate(year, 3, 1), end: utcDate(year, 4, 30, true) },
    halloween: { event: "halloween", start: utcDate(year, 10, 15), end: utcDate(year, 11, 2, true) },
    christmas: { event: "christmas", start: utcDate(year, 12, 20), end: utcDate(year, 12, 26, true) },
    newyear: {
      event: "newyear",
      start: utcDate(newyearStartYear, 12, 27),
      end: utcDate(newyearStartYear + 1, 1, 2, true),
    },
  };
}

export function isEventActive(event, referenceDate = new Date()) {
  const overrideEvent = settings.get("seasonEvents.overrideEvent");
  const overrideExpiresAt = settings.get("seasonEvents.overrideExpiresAt");
  const isCurrentDate = Math.abs(referenceDate.getTime() - Date.now()) <= 60_000;
  if (isCurrentDate && event.event === overrideEvent && overrideExpiresAt && new Date(overrideExpiresAt) > new Date()) {
    return true;
  }
  return referenceDate >= event.start && referenceDate <= event.end;
}

export function getActiveEvent(referenceDate = new Date()) {
  const periods = getEventPeriods(referenceDate);
  const overrideEvent = settings.get("seasonEvents.overrideEvent");
  const overrideExpiresAt = settings.get("seasonEvents.overrideExpiresAt");
  const isCurrentDate = Math.abs(referenceDate.getTime() - Date.now()) <= 60_000;

  if (isCurrentDate && overrideEvent && overrideExpiresAt && new Date(overrideExpiresAt) > new Date()) {
    return periods[overrideEvent] ? overrideEvent : null;
  }

  return Object.keys(periods).find((event) => isEventActive(periods[event], referenceDate)) ?? null;
}

const COLLECTION_RANGES = {
  easter: [3, 10],
  halloween: [3, 10],
  christmas: [2, 6],
  newyear: [5, 14],
};

export async function collectEventItem(userId, eventType, date = new Date()) {
  const range = COLLECTION_RANGES[eventType];
  if (!range) {
    throw new Error(`Unknown event type "${eventType}"`);
  }

  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ));
  const amount = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  const existing = await EventItem.findOne({ userId, eventType });
  if (existing) {
    const item = await EventItem.findOneAndUpdate(
      {
        _id: existing._id,
        $or: [{ lastCollected: null }, { lastCollected: { $lt: startOfDay } }],
      },
      { $inc: { amount }, $set: { lastCollected: date } },
      { returnDocument: "after" },
    );

    if (!item) {
      return null;
    }

    return { amount, total: item.amount };
  }

  const item = await EventItem.create({ userId, eventType, amount, lastCollected: date });
  return { amount, total: item.amount };
}
