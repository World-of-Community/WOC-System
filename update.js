/* eslint-disable no-console */
// Made by Vxnsin
//
// Deploy loop: download the latest main, install dependencies if they changed, start the bot.
// When the bot exits with code 0 (e.g. /restart) the update runs again; on a crash it restarts
// with backoff. Run with `node update.js` on the server; the bot itself is started as a child.
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import * as tar from "tar";

dotenv.config({ quiet: true });

const OWNER = "World-of-Community";
const REPO = "WOC-System";
const BRANCH = process.env.UPDATE_BRANCH ?? "main";
const TOKEN = process.env.GITHUB_TOKEN ?? "";

const ROOT = process.cwd();
const ENTRY = "src/index.js";

// never overwritten by an update
const KEEP = [".env", "node_modules", "backups", "update.js", ".git"];

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);
const sha = (file) => (fs.existsSync(file) ? crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") : "");

async function download() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/tarball/${BRANCH}`;
  const headers = { "User-Agent": "woc-updater" };
  if (TOKEN) {headers.Authorization = `Bearer ${TOKEN}`;}

  const res = await fetch(url, { headers });
  if (!res.ok) {throw new Error(`GitHub ${res.status} ${res.statusText}`);}

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "woc-update-"));
  const archive = path.join(tmp, "repo.tar.gz");
  fs.writeFileSync(archive, Buffer.from(await res.arrayBuffer()));
  await tar.extract({ file: archive, cwd: tmp, strip: 1 });
  fs.unlinkSync(archive);
  return tmp;
}

function applyUpdate(source) {
  for (const entry of fs.readdirSync(source)) {
    if (KEEP.includes(entry)) {continue;}
    const from = path.join(source, entry);
    const to = path.join(ROOT, entry);
    fs.rmSync(to, { recursive: true, force: true });
    fs.cpSync(from, to, { recursive: true });
  }
  fs.rmSync(source, { recursive: true, force: true });
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`))));
  });
}

async function update() {
  log("Downloading latest version");
  const lockBefore = sha(path.join(ROOT, "package-lock.json"));
  const source = await download();
  applyUpdate(source);
  log("Files updated");

  if (sha(path.join(ROOT, "package-lock.json")) !== lockBefore || !fs.existsSync(path.join(ROOT, "node_modules"))) {
    log("Dependencies changed, running npm ci");
    await run("npm", ["ci", "--omit=dev", "--no-audit", "--no-fund"]);
  }
}

let child = null;
let crashes = 0;

function startBot() {
  return new Promise((resolve) => {
    log("Starting bot");
    console.log("---------------------------------------------");
    child = spawn(process.execPath, [ENTRY], { stdio: "inherit", cwd: ROOT });
    child.on("exit", (code, signal) => {
      child = null;
      console.log("---------------------------------------------");
      log(`Bot exited (${signal ?? `code ${code}`})`);
      resolve(code ?? 1);
    });
  });
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    log(`${signal} received, stopping`);
    if (child) {child.kill(signal);}
    setTimeout(() => process.exit(0), 12_000).unref();
    if (!child) {process.exit(0);}
  });
}


while (true) {
  try {
    await update();
    crashes = 0;
  } catch (error) {
    log(`Update failed, starting current version: ${error.message}`);
  }

  if (!fs.existsSync(path.join(ROOT, ENTRY))) {
    log(`${ENTRY} not found, giving up`);
    process.exit(1);
  }

  const code = await startBot();

  if (code !== 0) {
    crashes += 1;
    const delay = Math.min(5_000 * 2 ** (crashes - 1), 5 * 60_000);
    log(`Crash #${crashes}, restarting in ${delay / 1000}s`);
    await new Promise((r) => setTimeout(r, delay));
  }
}
