#!/usr/bin/env node
/**
 * QA — Bruz en Action : vérification des liens externes
 * Usage : node qa/check-links.mjs [--fix]
 *
 * Extrait toutes les URLs des fichiers data/ et vérifie leur accessibilité.
 * Les URLs data.gouv.fr et megalis redirigent (3xx) → considéré OK.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
const CONCURRENCY = 6;
const TIMEOUT_MS = 10_000;

// ── Extraction des URLs ──────────────────────────────────────────────────────

function extractUrls(obj, source) {
  const found = [];
  if (!obj || typeof obj !== "object") return found;
  if (Array.isArray(obj)) {
    for (const item of obj) found.push(...extractUrls(item, source));
    return found;
  }
  const URL_KEYS = ["url", "source_url", "lien_externe"];
  for (const [k, v] of Object.entries(obj)) {
    if (URL_KEYS.includes(k) && typeof v === "string" && v.startsWith("http")) {
      found.push({ url: v, source });
    } else if (typeof v === "object") {
      found.push(...extractUrls(v, source));
    }
  }
  return found;
}

const DATA_FILES = [
  "data/dossiers.json",
  "data/promesses.json",
  "data/actus.json",
  "data/evenements.json",
  "data/meta.json",
];

const allUrls = [];
for (const f of DATA_FILES) {
  try {
    const raw = JSON.parse(readFileSync(join(ROOT, f), "utf8"));
    allUrls.push(...extractUrls(raw, f));
  } catch {
    // fichier absent → skip
  }
}

// Dédoublonner par URL (garder la première source)
const seen = new Map();
for (const { url, source } of allUrls) {
  if (!seen.has(url)) seen.set(url, source);
}
const urls = [...seen.entries()].map(([url, source]) => ({ url, source }));

// ── Vérification en parallèle ────────────────────────────────────────────────

async function checkUrl({ url, source }) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      const res = await fetch(url, {
        method,
        signal: ctrl.signal,
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; BruzEnAction-QA/1.0)" },
      });
      clearTimeout(timer);
      // 403 = site bloque les bots mais existe — avertissement, pas échec
      if (res.status === 403) return { url, source, status: 403, ok: true, warn: true };
      if (res.status < 400) return { url, source, status: res.status, ok: true };
      if (method === "HEAD") continue; // réessayer en GET
      return { url, source, status: res.status, ok: false };
    } catch (e) {
      if (method === "HEAD") continue;
      const status = e.name === "AbortError" ? "TIMEOUT" : "ERR";
      return { url, source, status, ok: false };
    }
  }
  return { url, source, status: "ERR", ok: false };
}

async function runPool(tasks, concurrency) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const task = tasks[i++];
      results.push(await task());
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

console.log(`\n🔍 Vérification de ${urls.length} URL(s) uniques...\n`);

const tasks = urls.map((u) => () => checkUrl(u));
const results = await runPool(tasks, CONCURRENCY);

// ── Rapport ──────────────────────────────────────────────────────────────────

const ok = results.filter((r) => r.ok && !r.warn);
const warned = results.filter((r) => r.warn);
const ko = results.filter((r) => !r.ok);

if (ko.length === 0) {
  console.log(`✅ Tous les liens sont valides (${ok.length}/${results.length})\n`);
} else {
  console.log(`❌  ${ko.length} lien(s) cassé(s) sur ${results.length} :\n`);
  for (const r of ko) {
    console.log(`  ❌ [${r.status}] ${r.url}`);
    console.log(`     └─ source : ${r.source}`);
  }
  console.log("");
}

if (warned.length > 0) {
  console.log(`⚠️  ${warned.length} site(s) bloquant les bots (403) — à vérifier manuellement :\n`);
  for (const r of warned) {
    console.log(`  ⚠️  [403] ${r.url}`);
    console.log(`      └─ source : ${r.source}`);
  }
  console.log("");
}

if (process.env.VERBOSE) {
  console.log(`✅ Liens valides (${ok.length}) :`);
  for (const r of ok) console.log(`  [${r.status}] ${r.url}`);
  console.log("");
}

process.exit(ko.length > 0 ? 1 : 0);
