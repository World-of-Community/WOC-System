import { problem, routes, t } from "@vxnsin/inkan";
import EmojiQuizSuggestion from "#models/EmojiQuizSuggestion.js";
import EmojiQuizEntry from "#models/EmojiQuizEntry.js";
import { addEntry, DIFFICULTIES } from "#systems/emojiQuiz.js";
import { COMMANDS } from "#config/dashboardProtocol.js";
import { bridge } from "../services.ts";
import { requireUser, userOf } from "../auth.ts";

const Suggestion = t.object({
  _id: t.string(),
  userId: t.string(),
  username: t.string().nullable().optional(),
  begriff: t.string(),
  emojis: t.string(),
  schwierigkeit: t.string(),
  tipp: t.string().optional(),
  status: t.string(),
  timestamp: t.string(),
});

const Entry = t.object({
  _id: t.string(),
  begriff: t.string(),
  emojis: t.string(),
  tipp: t.string().optional(),
  schwierigkeit: t.string(),
  aliases: t.array(t.string()).optional(),
});

const plain = (doc: unknown) => JSON.parse(JSON.stringify(doc));

export const emojiquizRoutes = routes().use(requireUser);

emojiquizRoutes.get(
  "/emojiquiz/suggestions",
  {
    summary: "Vorschläge, standardmäßig die offenen",
    query: t.object({ status: t.enum(["offen", "angenommen", "abgelehnt"]).default("offen") }),
    response: { 200: t.array(Suggestion) },
  },
  async ({ query }) => plain(await EmojiQuizSuggestion.find({ status: query.status }).sort({ timestamp: -1 }).limit(200).lean()),
);

// Goes through the bot so the author gets the DM and the Discord review message is updated.
emojiquizRoutes.post(
  "/emojiquiz/suggestions/:id/review",
  {
    summary: "Vorschlag annehmen oder ablehnen",
    params: t.object({ id: t.string() }),
    body: t.object({ accept: t.boolean() }),
    response: { 200: t.object({ ok: t.boolean(), status: t.string().optional() }), 400: t.problem() },
  },
  async (ctx) => {
    const result = await bridge.send(COMMANDS.emojiQuizReview, {
      suggestionId: ctx.params.id,
      accept: ctx.body.accept,
      reviewerId: userOf(ctx).id,
      reviewerName: userOf(ctx).name,
    });
    if (!result.ok) {throw problem(400, "review-failed", result.error ?? "Fehlgeschlagen");}
    return { ok: true, status: result.status as string | undefined };
  },
);

emojiquizRoutes.get(
  "/emojiquiz/entries",
  {
    summary: "Der Rätsel-Pool",
    response: { 200: t.object({ difficulties: t.array(t.string()), entries: t.array(Entry) }) },
  },
  async () => ({ difficulties: DIFFICULTIES, entries: plain(await EmojiQuizEntry.find().sort({ begriff: 1 }).lean()) }),
);

emojiquizRoutes.post(
  "/emojiquiz/entries",
  {
    summary: "Rätsel hinzufügen",
    body: t.object({
      begriff: t.string(),
      emojis: t.string(),
      tipp: t.string().optional(),
      schwierigkeit: t.enum(["einfach", "mittel", "schwer"]).default("mittel"),
    }),
    response: { 200: Entry, 400: t.problem() },
  },
  async (ctx) => {
    try {
      return plain(await addEntry(ctx.body, `dashboard:${userOf(ctx).id}`));
    } catch (error) {
      throw problem(400, "invalid-entry", (error as Error).message);
    }
  },
);

emojiquizRoutes.delete(
  "/emojiquiz/entries/:id",
  {
    summary: "Rätsel löschen",
    params: t.object({ id: t.string() }),
    response: { 204: t.empty(), 404: t.problem() },
  },
  async ({ params }) => {
    const entry = await EmojiQuizEntry.findByIdAndDelete(params.id).catch(() => null);
    if (!entry) {throw problem(404, "entry-not-found", "Eintrag nicht gefunden");}
  },
);
