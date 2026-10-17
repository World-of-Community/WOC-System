import { reactive } from "vue";

export type Toast = { id: number; message: string; kind: "ok" | "bad" };

export const toasts = reactive<Toast[]>([]);
let next = 0;

export function notify(message: string, kind: Toast["kind"] = "ok") {
  const id = next++;
  toasts.push({ id, message, kind });
  setTimeout(() => {
    const index = toasts.findIndex((t) => t.id === id);
    if (index !== -1) {toasts.splice(index, 1);}
  }, 3500);
}
