// The bot code is plain JavaScript; the dashboard only needs these as untyped imports.
declare module "#models/*" {
  const model: any;
  export default model;
}
declare module "#config/settings.schema.js" {
  export const SETTINGS_SCHEMA: Record<string, { label: string; keys: Record<string, { type: string; default: unknown; description: string }> }>;
}
declare module "#config/dashboardProtocol.js" {
  export const KEYS: { snapshot: string; commandChannel: string; result: (id: string) => string };
  export const COMMANDS: { settingsReload: string; commandsSync: string; emojiQuizReview: string };
}
declare module "#core/settings.js" {
  export function coerce(type: string, raw: unknown): unknown;
}
declare module "#systems/emojiQuiz.js" {
  export const DIFFICULTIES: string[];
  export function addEntry(entry: Record<string, unknown>, addedBy?: string | null): Promise<any>;
}
