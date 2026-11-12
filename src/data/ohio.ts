/** Ohio, Indiana, Kentucky, Alabama, Alaska, and Arizona from the Census Bureau 2024 Gazetteer.
 *  A place that sits in more than one county keeps the county of its Census point.
 *  Kentucky, Alabama, Arizona, and Alaska have no township governments.
 *  Alaska census areas are statistical and are not listed.
 *  No officeholder is stored in this file. */

import alabamaJurisdictions from "@/data/alabama-jurisdictions.json";
import alabamaUnits from "@/data/alabama-units.json";
import alaskaJurisdictions from "@/data/alaska-jurisdictions.json";
import alaskaUnits from "@/data/alaska-units.json";
import arizonaJurisdictions from "@/data/arizona-jurisdictions.json";
import arizonaUnits from "@/data/arizona-units.json";
import indianaJurisdictions from "@/data/indiana-jurisdictions.json";
import indianaUnits from "@/data/indiana-units.json";
import kentuckyJurisdictions from "@/data/kentucky-jurisdictions.json";
import kentuckyUnits from "@/data/kentucky-units.json";
import ohioJurisdictions from "@/data/ohio-jurisdictions.json";
import ohioUnits from "@/data/ohio-units.json";

export type OhioKind = "county" | "city" | "town" | "village" | "township" | "borough";

export type OhioUnit = {
  id: string;
  abbr: "OH" | "IN" | "KY" | "AL" | "AK" | "AZ";
  name: string;
  kind: OhioKind;
  countyFips: string;
  county: string;
  lat: number;
  lng: number;
  /** Census functional status. A is an active government. */
  func: string;
  /** Other counties, when the corporation crosses a line. */
  also?: string[];
};

type Row = Omit<OhioUnit, "abbr">;

function tag(abbr: OhioUnit["abbr"], rows: Row[]): OhioUnit[] {
  return rows.map((row) => ({ ...row, abbr }));
}

export const GAZETTEER: OhioUnit[] = [
  ...tag("OH", ohioUnits as Row[]),
  ...tag("IN", indianaUnits as Row[]),
  ...tag("KY", kentuckyUnits as Row[]),
  ...tag("AL", alabamaUnits as Row[]),
  ...tag("AK", alaskaUnits as Row[]),
  ...tag("AZ", arizonaUnits as Row[]),
];

export const OHIO_UNITS = GAZETTEER.filter((unit) => unit.abbr === "OH");

const byId = new Map(GAZETTEER.map((unit) => [unit.id, unit]));

const VERIFIED: Record<string, string> = {
  "akron|city": "akron-oh",
  "cincinnati|city": "cincinnati-oh",
  "cleveland|city": "cleveland-oh",
  "columbus|city": "columbus-oh",
  "dayton|city": "dayton-oh",
  "springfield|city": "springfield-oh",
  "toledo|city": "toledo-oh",
};

const byVerified = new Map<string, OhioUnit>();
for (const unit of OHIO_UNITS) {
  const linked = VERIFIED[`${unit.name.toLowerCase()}|${unit.kind}`];
  if (linked) byVerified.set(linked, unit);
}

export function gazetteerCounts(abbr: string) {
  const rows = GAZETTEER.filter((unit) => unit.abbr === abbr);
  return {
    counties: rows.filter((unit) => unit.kind === "county").length,
    cities: rows.filter((unit) => unit.kind === "city").length,
    towns: rows.filter((unit) => unit.kind === "town").length,
    villages: rows.filter((unit) => unit.kind === "village").length,
    townships: rows.filter((unit) => unit.kind === "township").length,
    boroughs: rows.filter((unit) => unit.kind === "borough").length,
  };
}

export const OHIO_COUNTS = gazetteerCounts("OH");

export function placeStateName(abbr: string): string {
  if (abbr === "AL") return "Alabama";
  if (abbr === "AK") return "Alaska";
  if (abbr === "AZ") return "Arizona";
  if (abbr === "IN") return "Indiana";
  if (abbr === "KY") return "Kentucky";
  if (abbr === "OH") return "Ohio";
  return abbr;
}

const GAZETTEER_ABBRS = new Set(["OH", "IN", "KY", "AL", "AK", "AZ"]);

export function isGazetteerState(abbr: string | null | undefined): abbr is OhioUnit["abbr"] {
  return !!abbr && GAZETTEER_ABBRS.has(abbr);
}

export function gazetteerLine(abbr: string): string {
  const counts = gazetteerCounts(abbr);
  if (abbr === "KY") {
    return `${counts.counties} counties and ${counts.cities} cities, A to Z. Kentucky has no township governments.`;
  }
  if (abbr === "IN") {
    return `${counts.counties} counties, ${counts.cities} cities, ${counts.towns} towns, and ${counts.townships} townships, A to Z.`;
  }
  if (abbr === "AL") {
    return `${counts.counties} counties, ${counts.cities} cities, and ${counts.towns} towns, A to Z. Alabama has no township governments.`;
  }
  if (abbr === "AK") {
    return `${counts.boroughs} boroughs and unified municipalities, and ${counts.cities} cities, A to Z. Census areas are not governments.`;
  }
  if (abbr === "AZ") {
    return `${counts.counties} counties, ${counts.cities} cities, and ${counts.towns} towns, A to Z. Arizona has no township governments.`;
  }
  return `${counts.counties} counties, ${counts.cities} cities, ${counts.villages} villages, and ${counts.townships} townships, A to Z.`;
}

export function placeWhere(unit: OhioUnit): string {
  if (unit.abbr === "AK") return unit.kind === "borough" ? "Alaska" : unit.county;
  if (unit.kind === "county" || unit.kind === "borough") return placeStateName(unit.abbr);
  return `${unit.county} County`;
}

export function ohioById(id: string): OhioUnit | undefined {
  return byId.get(id);
}

/** Gazetteer row for a Census id or one of the seven published Ohio cities. */
export function ohioByPlaceId(id: string): OhioUnit | undefined {
  return byId.get(id) ?? byVerified.get(id);
}

export function verifiedPlaceId(unit: OhioUnit): string | undefined {
  if (unit.abbr !== "OH") return undefined;
  return VERIFIED[`${unit.name.toLowerCase()}|${unit.kind}`];
}

export function ohioKindLabel(kind: OhioKind): string {
  if (kind === "county") return "County";
  if (kind === "city") return "City";
  if (kind === "town") return "Town";
  if (kind === "village") return "Village";
  if (kind === "borough") return "Borough";
  return "Township";
}

export function ohioTitle(unit: OhioUnit): string {
  if (unit.kind === "borough") return unit.name;
  if (unit.kind === "county") return `${unit.name} County`;
  return `${unit.name} ${ohioKindLabel(unit.kind)}`;
}

export function ohioByLetter(letter: string, abbr = "OH"): OhioUnit[] {
  const initial = letter.toUpperCase();
  return GAZETTEER.filter((unit) => unit.abbr === abbr && unit.name[0]?.toUpperCase() === initial);
}

export type OhioJurisdiction = {
  cd?: number[];
  /** Alaska senate districts are letters. Every other state uses a number. */
  senate?: Array<number | string>;
  house?: number[];
  school?: string;
};

const JURIS = {
  ...ohioJurisdictions,
  ...indianaJurisdictions,
  ...kentuckyJurisdictions,
  ...alabamaJurisdictions,
  ...alaskaJurisdictions,
  ...arizonaJurisdictions,
} as Record<string, OhioJurisdiction>;

/** Census district overlap for a gazetteer government. School is the district at the Census point. */
export function gazetteerJurisdiction(id: string): OhioJurisdiction | undefined {
  return JURIS[id];
}

function km(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const r = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Cities, towns, villages, and townships. A county centroid is not a place. */
export function nearestOhio(lat: number, lng: number, abbr?: string | null): { unit: OhioUnit; km: number } | null {
  let best: { unit: OhioUnit; km: number } | null = null;
  for (const unit of GAZETTEER) {
    if (abbr && unit.abbr !== abbr) continue;
    if (unit.kind === "county") continue;
    if (unit.func !== "A" && unit.func !== "B" && unit.func !== "C") continue;
    const d = km(lat, lng, unit.lat, unit.lng);
    if (!best || d < best.km) best = { unit, km: d };
  }
  return best;
}

function wantedKind(text: string): OhioKind | null {
  if (/\btownships?\b/.test(text)) return "township";
  if (/\btowns?\b/.test(text)) return "town";
  if (/\bvillages?\b/.test(text)) return "village";
  if (/\bcity\b|\bcities\b/.test(text)) return "city";
  if (/\bboroughs?\b/.test(text)) return "borough";
  if (/\bcounty\b|\bcounties\b/.test(text)) return "county";
  return null;
}

function namedState(text: string): OhioUnit["abbr"] | null {
  if (/\balaska\b/.test(text)) return "AK";
  if (/\barizona\b/.test(text)) return "AZ";
  if (/\balabama\b/.test(text)) return "AL";
  if (/\bkentucky\b|\bky\b/.test(text)) return "KY";
  if (/\bindiana\b/.test(text)) return "IN";
  if (/\bohio\b|\boh\b/.test(text)) return "OH";
  if (/\bak\b/.test(text)) return "AK";
  if (/\baz\b/.test(text)) return "AZ";
  if (/\bal\b/.test(text)) return "AL";
  return null;
}

/** Alphabetical hits across the loaded gazetteer states. */
export function ohioHits(query: string, limit = 8): OhioUnit[] {
  const raw = query.trim().toLowerCase().replace(/\./g, "").replace(/,/g, " ");
  if (raw.length < 2) return [];
  const kind = wantedKind(raw);
  const state = namedState(raw);
  const q = raw
    .replace(/\bohio\b|\bindiana\b|\bkentucky\b|\balabama\b|\balaska\b|\barizona\b/g, " ")
    .replace(/\boh\b|\bky\b|\bal\b|\bak\b|\baz\b/g, " ")
    .replace(/\b(township|townships|town|towns|village|villages|city|cities|county|counties|borough|boroughs)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (q.length < 2) return [];
  const tokens = q.split(" ").filter(Boolean);
  const scored: { unit: OhioUnit; rank: number }[] = [];
  for (const unit of GAZETTEER) {
    if (state && unit.abbr !== state) continue;
    if (kind && unit.kind !== kind) continue;
    const name = unit.name.toLowerCase();
    const county = unit.county.toLowerCase();
    const countyOk = tokens.every((token) => token === name || name.includes(token) || county.startsWith(token));
    if (!countyOk && !name.includes(q) && !name.startsWith(tokens[0] ?? "")) continue;
    let rank = 9;
    if (name === q) rank = 0;
    else if (name.startsWith(q)) rank = 1;
    else if (tokens[0] && name.startsWith(tokens[0]) && tokens.every((token) => name.includes(token) || county.startsWith(token))) rank = 2;
    else if (name.includes(q)) rank = 3;
    else continue;
    if (tokens.length > 1) {
      const placeTokens = tokens.filter((token) => !county.startsWith(token));
      if (placeTokens.length && !placeTokens.every((token) => name.includes(token))) continue;
    }
    scored.push({ unit, rank });
  }
  scored.sort((a, b) => {
    const label = (unit: OhioUnit) => `${unit.name} ${ohioKindLabel(unit.kind)} ${unit.county} ${unit.abbr}`;
    return a.rank - b.rank || label(a.unit).localeCompare(label(b.unit));
  });
  return scored.slice(0, limit).map((row) => row.unit);
}

/** One place, or nothing. A shared name is not guessed across states or townships. */
export function matchOhio(query: string, prefer?: string | null): OhioUnit | null {
  const hits = ohioHits(query, 40);
  const raw = query.trim().toLowerCase().replace(/\./g, "").replace(/,/g, " ");
  const state = namedState(raw) ?? (isGazetteerState(prefer) ? prefer : null);
  const pool = state ? hits.filter((unit) => unit.abbr === state) : hits;
  const rows = pool.length ? pool : hits;
  if (rows.length === 0) return null;
  if (rows.length === 1) return rows[0] ?? null;
  const kind = wantedKind(raw);
  const q = raw
    .replace(/\bohio\b|\bindiana\b|\bkentucky\b|\balabama\b|\balaska\b|\barizona\b/g, " ")
    .replace(/\boh\b|\bky\b|\bal\b|\bak\b|\baz\b/g, " ")
    .replace(/\b(township|townships|town|towns|village|villages|city|cities|county|counties|borough|boroughs)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const stem = rows.filter((unit) => {
    if (kind && unit.kind !== kind) return false;
    const name = unit.name.toLowerCase();
    return name === q || name.startsWith(`${q} `);
  });
  const local = stem.filter((unit) => unit.kind === "city" || unit.kind === "town" || unit.kind === "village" || unit.kind === "borough");
  // Anchorage is a Kentucky city and the start of Anchorage Municipality. A township in another state does not count.
  if (!state && new Set(local.map((unit) => unit.abbr)).size > 1) return null;
  const exact = local.filter((unit) => unit.name.toLowerCase() === q);
  if (exact.length === 1) return exact[0] ?? null;
  if (exact.length === 0 && local.length === 1) return local[0] ?? null;
  if (kind) {
    const typed = stem.filter((unit) => unit.kind === kind);
    if (!state && new Set(typed.map((unit) => unit.abbr)).size > 1) return null;
    if (typed.length === 1) return typed[0] ?? null;
  }
  return null;
}
