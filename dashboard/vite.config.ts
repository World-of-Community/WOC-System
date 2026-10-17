import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import inkan from "@inkanjs/vite";

// Run from the repo root: `npm run dashboard:dev` (frontend + API on one port) or `npm run dashboard:build`.
export default defineConfig({
  root: import.meta.dirname,
  plugins: [vue(), inkan({ entry: "server/app.ts" })],
  server: { port: Number(process.env.DASHBOARD_PORT ?? 3000) },
  build: { outDir: "dist", emptyOutDir: true },
});
