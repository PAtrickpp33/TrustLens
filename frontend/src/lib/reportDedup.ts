// src/lib/reportDedup.ts
// Lightweight daily de-dupe for reports (client-side only).
// Stores only SHA-256 hash of a normalized value + timestamp in localStorage.

const STORAGE_KEY = "tl_report_dedup_v1";
const DAY_MS = 24 * 60 * 60 * 1000;

type Entry = { h: string; t: number };

function load(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? (JSON.parse(raw) as Entry[]) : [];
    // cleanup old
    const now = Date.now();
    const clean = arr.filter(e => now - e.t < DAY_MS);
    if (clean.length !== arr.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    return clean;
  } catch {
    return [];
  }
}

function save(entries: Entry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Normalize input before hashing (email/url)
export function normalizeForHash(kind: "email" | "url", value: string) {
  let v = (value || "").trim().toLowerCase();
  if (kind === "url") {
    // strip protocol + leading www.
    v = v.replace(/^\s*https?:\/\//, "").replace(/^www\./, "");
    // collapse multiple slashes
    v = v.replace(/\/{2,}/g, "/");
  }
  return v;
}

export async function sha256Hex(text: string) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function isAlreadyReported(kind: "email" | "url", value: string) {
  const norm = normalizeForHash(kind, value);
  if (!norm) return false;
  const hash = await sha256Hex(norm);
  const entries = load();
  return entries.some(e => e.h === hash);
}

export async function markReported(kind: "email" | "url", value: string) {
  const norm = normalizeForHash(kind, value);
  if (!norm) return;
  const hash = await sha256Hex(norm);
  const entries = load();
  // replace or add
  const now = Date.now();
  const idx = entries.findIndex(e => e.h === hash);
  if (idx >= 0) entries[idx].t = now;
  else entries.push({ h: hash, t: now });
  save(entries);
}
