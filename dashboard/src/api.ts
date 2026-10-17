import { client } from "@vxnsin/inkan/client";
import type { app } from "../server/app.ts";
import { notify } from "./toast.ts";

// Typed from the server app itself: every path, param and body below is checked against its contract.
export const api = client<typeof app>(location.origin);

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// Unwraps an answer: data on success, an ApiError (with the problem's detail) otherwise.
export async function unwrap<T extends { ok: boolean }>(
  answer: Promise<T>,
  { quiet = false }: { quiet?: boolean } = {},
): Promise<Extract<T, { ok: true }>["data" & keyof Extract<T, { ok: true }>]> {
  const res: any = await answer;
  if (res.ok) {return res.data;}
  const error = new ApiError(res.problem?.detail ?? res.problem?.title ?? `Fehler ${res.status}`, res.status);
  if (!quiet && res.status !== 401) {notify(error.message, "bad");}
  throw error;
}
