/**
 * One-time seed script. Not a runtime dependency.
 *
 * Pipeline:
 *  1. Places Text Search ("egg tart bakery", "Hong Kong bakery", ...) across
 *     NYC neighborhoods known for egg tarts.
 *  2. Cross-validate against the curated web-research list (scripts/curated.ts):
 *     curated matches get editorial style/flag metadata; curated names Places
 *     missed are looked up individually.
 *  3. Dedupe by normalized name + coordinate proximity (<150 m).
 *  4. Fetch Place Details (hours, phone, website) and upsert into Supabase
 *     using SUPABASE_SERVICE_ROLE_KEY.
 *
 * Run: npm run seed  (requires supabase/schema.sql applied first)
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { CURATED, type CuratedShop } from "./curated";
import type { EggTartStyle, Hours, DayKey, PriceRange } from "../lib/types";

config({ path: ".env.local" });

const PLACES_KEY = process.env.GOOGLE_PLACES_SERVER_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!PLACES_KEY || !SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing env vars. Check .env.local against .env.example.");
  process.exit(1);
}

const NEIGHBORHOODS = [
  "Chinatown, Manhattan, New York",
  "Flushing, Queens, New York",
  "Sunset Park, Brooklyn, New York",
  "Elmhurst, Queens, New York",
  "Bensonhurst, Brooklyn, New York",
];
const QUERIES = ["egg tart bakery", "Hong Kong bakery", "Chinese bakery egg tart"];

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  price_level?: number;
  types?: string[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function textSearch(query: string): Promise<PlaceResult[]> {
  const results: PlaceResult[] = [];
  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${PLACES_KEY}`;
  for (let page = 0; page < 2; page++) {
    const res = await fetch(url);
    const body = await res.json();
    if (body.status !== "OK" && body.status !== "ZERO_RESULTS") {
      console.warn(`Places status ${body.status} for "${query}"`);
      break;
    }
    results.push(...(body.results ?? []));
    if (!body.next_page_token) break;
    await sleep(2000); // next_page_token needs a moment to activate
    url = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${body.next_page_token}&key=${PLACES_KEY}`;
  }
  return results;
}

interface PlaceDetails {
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: { periods?: { open: { day: number; time: string }; close?: { day: number; time: string } }[] };
}

async function placeDetails(placeId: string): Promise<PlaceDetails | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website,opening_hours&key=${PLACES_KEY}`;
  const res = await fetch(url);
  const body = await res.json();
  return body.status === "OK" ? body.result : null;
}

const DAY_ORDER: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function toHours(details: PlaceDetails): Hours | null {
  const periods = details.opening_hours?.periods;
  if (!periods?.length) return null;
  const hours: Hours = { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null };
  for (const p of periods) {
    const day = DAY_ORDER[p.open.day];
    if (!day) continue;
    const fmt = (t: string) => `${t.slice(0, 2)}:${t.slice(2)}`;
    hours[day] = p.close ? `${fmt(p.open.time)}-${fmt(p.close.time)}` : "00:00-24:00";
  }
  return hours;
}

function normName(n: string): string {
  return n.toLowerCase().replace(/bakery|cafe|coffee shop|inc\.?|&/g, "").replace(/[^a-z0-9]/g, "");
}

function distMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = (a.lat - b.lat) * 111_320;
  const dLng = (a.lng - b.lng) * 111_320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

function boroughOf(address: string): string {
  if (/brooklyn/i.test(address)) return "Brooklyn";
  if (/queens|flushing|elmhurst/i.test(address)) return "Queens";
  if (/bronx/i.test(address)) return "Bronx";
  if (/staten island/i.test(address)) return "Staten Island";
  return "Manhattan";
}

function neighborhoodOf(address: string, borough: string): string {
  const known: [RegExp, string][] = [
    [/flushing/i, "Flushing"],
    [/elmhurst/i, "Elmhurst"],
    [/sunset park|8th ave.*brooklyn|\b5\d{3} 8th\b/i, "Sunset Park"],
    [/bensonhurst|18th ave.*brooklyn/i, "Bensonhurst"],
    [/mott st|grand st|bayard|canal st|bowery|elizabeth st|doyers|pell/i, "Chinatown"],
  ];
  for (const [re, n] of known) if (re.test(address)) return n;
  return borough === "Manhattan" ? "Chinatown" : borough;
}

function priceOf(level: number | undefined): PriceRange {
  if (level === undefined || level <= 1) return "$";
  return level === 2 ? "$$" : "$$$";
}

/** Keep Places results that plausibly sell egg tarts: bakeries and HK-style cafes. */
function looksLikeTartSource(p: PlaceResult): boolean {
  if (p.types?.includes("bakery")) return true;
  return /bakery|bake|pastry|dan tat|egg tart|hong kong|cafe/i.test(p.name);
}

async function main() {
  const db = createClient(SUPABASE_URL!, SERVICE_KEY!, { auth: { persistSession: false } });

  const probe = await db.from("shops").select("id").limit(1);
  if (probe.error) {
    console.error(
      "The shops table is missing. Paste supabase/schema.sql into the Supabase SQL editor, run it, then rerun npm run seed."
    );
    process.exit(1);
  }

  console.log("Collecting Places results...");
  const collected = new Map<string, PlaceResult>();
  for (const hood of NEIGHBORHOODS) {
    for (const q of QUERIES) {
      const results = await textSearch(`${q} in ${hood}`);
      for (const r of results) if (looksLikeTartSource(r)) collected.set(r.place_id, r);
      await sleep(150);
    }
  }
  console.log(`Places pass: ${collected.size} candidate shops`);

  // Cross-validation pass 1: attach curated metadata to Places matches.
  const matchedCurated = new Set<CuratedShop>();
  function curatedFor(p: PlaceResult): CuratedShop | undefined {
    const n = normName(p.name);
    return CURATED.find((c) => {
      const cn = normName(c.name);
      return (n.includes(cn) || cn.includes(n)) && n.length > 2;
    });
  }

  // Cross-validation pass 2: look up curated names Places missed.
  for (const c of CURATED) {
    const already = Array.from(collected.values()).some((p) => curatedFor(p) === c);
    if (already) continue;
    const results = await textSearch(`${c.name} ${c.hint} New York`);
    const hit = results.find((r) => normName(r.name).includes(normName(c.name).slice(0, 8)));
    if (hit) collected.set(hit.place_id, hit);
    await sleep(150);
  }

  // Dedupe by normalized name + proximity (<150 m).
  const unique: PlaceResult[] = [];
  for (const p of Array.from(collected.values())) {
    const dup = unique.find(
      (u) => normName(u.name) === normName(p.name) && distMeters(u.geometry.location, p.geometry.location) < 150
    );
    if (!dup) unique.push(p);
  }
  console.log(`After dedupe: ${unique.length} shops`);

  console.log("Fetching details and inserting...");
  let inserted = 0;
  for (const p of unique) {
    const curated = curatedFor(p);
    if (curated) matchedCurated.add(curated);
    const details = (await placeDetails(p.place_id)) ?? {};
    const borough = boroughOf(p.formatted_address);
    const styles: EggTartStyle[] = curated?.styles ?? ["Hong Kong-style"];
    const row = {
      name: p.name,
      address: p.formatted_address,
      neighborhood: neighborhoodOf(p.formatted_address, borough),
      borough,
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
      hours: toHours(details),
      phone: details.formatted_phone_number ?? null,
      website: details.website ?? null,
      instagram: null,
      photos: [],
      egg_tart_style: styles,
      is_dedicated_egg_tart_shop: curated?.dedicated ?? false,
      price_range: priceOf(p.price_level),
      best_egg_tart_flag: curated?.best ?? false,
    };
    const { error } = await db.from("shops").upsert(row, { onConflict: "name,address" });
    if (error) console.warn(`Insert failed for ${p.name}: ${error.message}`);
    else inserted++;
    await sleep(120);
  }

  // Storage bucket for guest review photos (idempotent).
  const { error: bucketErr } = await db.storage.createBucket("review-photos", {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (bucketErr && !/already exists/i.test(bucketErr.message)) {
    console.warn(`Bucket creation: ${bucketErr.message}`);
  }

  console.log(`Done. ${inserted} shops upserted. Curated names matched: ${matchedCurated.size}/${CURATED.length}`);
  if (inserted < 40) {
    console.warn("Below the 40-shop launch target; consider adding neighborhoods or queries.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
