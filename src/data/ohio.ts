/** Census Bureau 2024 Gazetteer for every state loaded in this atlas.
 *  A place that sits in more than one county keeps the county of its Census point.
 *  County subdivisions are listed only when Census marks them as governments.
 *  Alaska census areas are statistical and are not listed.
 *  No officeholder is stored in this file. */

import countyFlags from "@/data/county-flags.json";

export type OhioKind = "county" | "city" | "town" | "village" | "township" | "borough";

export type OhioUnit = {
  id: string;
  abbr: string;
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

export type OhioJurisdiction = {
  cd?: number[];
  /** Alaska senate districts and several New England house districts are names, not plain numbers. */
  senate?: Array<number | string>;
  house?: Array<number | string>;
  school?: string;
};

type Row = Omit<OhioUnit, "abbr">;

const SLUG_ABBR: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new-hampshire": "NH",
  "new-jersey": "NJ",
  "new-mexico": "NM",
  "new-york": "NY",
  "north-carolina": "NC",
  "north-dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode-island": "RI",
  "south-carolina": "SC",
  "south-dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west-virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

const unitModules = import.meta.glob("./*-units.json", { eager: true, import: "default" }) as Record<string, Row[]>;
const jurisModules = import.meta.glob("./*-jurisdictions.json", { eager: true, import: "default" }) as Record<
  string,
  Record<string, OhioJurisdiction>
>;

function abbrFrom(path: string): string | null {
  const file = path.split("/").pop() ?? "";
  const slug = file.replace(/-units\.json$/, "").replace(/-jurisdictions\.json$/, "");
  return SLUG_ABBR[slug] ?? null;
}

function tag(abbr: string, rows: Row[]): OhioUnit[] {
  return rows.map((row) => ({ ...row, abbr }));
}

export const GAZETTEER: OhioUnit[] = Object.entries(unitModules).flatMap(([path, rows]) => {
  const abbr = abbrFrom(path);
  return abbr ? tag(abbr, rows) : [];
});

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

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

export function placeStateName(abbr: string): string {
  return STATE_NAMES[abbr] ?? abbr;
}

const GAZETTEER_ABBRS = new Set(GAZETTEER.map((unit) => unit.abbr));

export function isGazetteerState(abbr: string | null | undefined): abbr is string {
  return !!abbr && GAZETTEER_ABBRS.has(abbr);
}

const INDEPENDENT = new Set(countyFlags.independent);
const PLANNING = new Set(countyFlags.planning);

export function isIndependent(fips: string | null | undefined): boolean {
  return !!fips && INDEPENDENT.has(fips);
}
const TOWN_STATES = new Set(["CT", "ME", "MA", "NH", "RI", "VT", "NY", "WI"]);

function humanJoin(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

export function gazetteerLine(abbr: string): string {
  const counts = gazetteerCounts(abbr);
  if (abbr === "AK") {
    return `${counts.boroughs} boroughs and unified municipalities, and ${counts.cities} cities, A to Z. Census areas are not governments.`;
  }
  const parts: string[] = [];
  if (counts.counties) parts.push(`${counts.counties} ${abbr === "LA" ? "parishes" : "counties"}`);
  if (counts.cities) parts.push(`${counts.cities} cities`);
  if (counts.towns) parts.push(`${counts.towns} towns`);
  if (counts.villages) parts.push(`${counts.villages} villages`);
  if (counts.boroughs) parts.push(`${counts.boroughs} boroughs`);
  if (counts.townships) parts.push(`${counts.townships} townships`);
  let line = `${humanJoin(parts)}, A to Z.`;
  if (abbr === "CT") return `${line} Connecticut has no county governments.`;
  if (abbr === "RI") return `${line} Rhode Island has no county governments.`;
  if (abbr === "HI") return `${line} Hawaii has no incorporated places.`;
  if (counts.townships === 0 && !TOWN_STATES.has(abbr) && abbr !== "HI") {
    line += ` ${placeStateName(abbr)} has no township governments.`;
  }
  return line;
}

export function countyHeading(name: string, abbr: string): string {
  if (abbr === "LA") return `${name} Parish`;
  if (/\b(county|parish|borough|region|municipality)\b/i.test(name)) return name;
  if (abbr === "CT") return `${name} Planning Region`;
  return `${name} County`;
}

export function placeWhere(unit: OhioUnit): string {
  if (unit.abbr === "AK") return unit.kind === "borough" ? "Alaska" : unit.county;
  if (unit.kind === "county" || (unit.kind === "borough" && unit.abbr === "AK")) return placeStateName(unit.abbr);
  if (PLANNING.has(unit.countyFips)) {
    return unit.county.includes("Planning Region") ? unit.county : `${unit.county} Planning Region`;
  }
  if (INDEPENDENT.has(unit.countyFips)) return /city$/i.test(unit.county) ? unit.county : `${unit.county} City`;
  if (unit.abbr === "LA") return `${unit.county} Parish`;
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
  if (unit.kind === "borough" && unit.abbr === "AK") return unit.name;
  if (unit.kind === "county") return countyHeading(unit.name, unit.abbr);
  if (/\b(plantation|gore|location|grant|purchase)$/i.test(unit.name)) return unit.name;
  const label = unit.kind === "borough" ? "Borough" : ohioKindLabel(unit.kind);
  if (unit.name.toLowerCase().endsWith(` ${label.toLowerCase()}`)) return unit.name;
  return `${unit.name} ${label}`;
}

export function ohioByLetter(letter: string, abbr = "OH"): OhioUnit[] {
  const initial = letter.toUpperCase();
  return GAZETTEER.filter((unit) => unit.abbr === abbr && unit.name[0]?.toUpperCase() === initial);
}

const JURIS: Record<string, OhioJurisdiction> = {};
for (const rows of Object.values(jurisModules)) {
  Object.assign(JURIS, rows);
}

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

function fold(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\./g, "");
}

function wantedKind(text: string): OhioKind | null {
  if (/\btownships?\b/.test(text)) return "township";
  if (/\btowns?\b/.test(text)) return "town";
  if (/\bvillages?\b/.test(text)) return "village";
  if (/\bcity\b|\bcities\b/.test(text)) return "city";
  if (/\bboroughs?\b/.test(text)) return "borough";
  if (/\bparish\b|\bparishes\b/.test(text)) return "county";
  if (/\bcounty\b|\bcounties\b/.test(text)) return "county";
  return null;
}

const NAME_TO_ABBR = Object.entries(STATE_NAMES)
  .map(([abbr, name]) => [name.toLowerCase(), abbr] as const)
  .sort((a, b) => b[0].length - a[0].length);

function namedState(text: string): string | null {
  for (const [name, abbr] of NAME_TO_ABBR) {
    if (!GAZETTEER_ABBRS.has(abbr)) continue;
    if (text === name || text.endsWith(` ${name}`)) return abbr;
  }
  const postal = text.match(/(?:^|[\s,])([a-z]{2})$/);
  if (postal && GAZETTEER_ABBRS.has(postal[1].toUpperCase())) return postal[1].toUpperCase();
  return null;
}

function placeQuery(raw: string): { state: string | null; kind: OhioKind | null; q: string } {
  const text = raw.trim().toLowerCase().replace(/\./g, "").replace(/,/g, " ").replace(/\s+/g, " ").trim();
  const state = namedState(text);
  const kind = wantedKind(text);
  let q = text;
  if (state) {
    const name = STATE_NAMES[state]?.toLowerCase();
    if (name) q = q.replace(new RegExp(`\\b${name.replace(/\s+/g, "\\s+")}\\b`), " ");
    q = q.replace(new RegExp(`\\b${state.toLowerCase()}\\b`), " ");
  }
  q = q
    .replace(/\b(township|townships|town|towns|village|villages|city|cities|county|counties|borough|boroughs|parish|parishes)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { state, kind, q };
}

/** Alphabetical hits across the loaded gazetteer states. */
export function ohioHits(query: string, limit = 8): OhioUnit[] {
  const { state, kind, q } = placeQuery(query);
  const folded = fold(q);
  if (folded.length < 2) return [];
  const tokens = folded.split(" ").filter(Boolean);
  const scored: { unit: OhioUnit; rank: number }[] = [];
  for (const unit of GAZETTEER) {
    if (state && unit.abbr !== state) continue;
    if (kind && unit.kind !== kind) continue;
    const name = fold(unit.name);
    const county = fold(unit.county);
    const countyOk = tokens.every((token) => token === name || name.includes(token) || county.startsWith(token));
    if (!countyOk && !name.includes(folded) && !name.startsWith(tokens[0] ?? "")) continue;
    let rank = 9;
    if (name === folded) rank = 0;
    else if (name.startsWith(folded)) rank = 1;
    else if (tokens[0] && name.startsWith(tokens[0]) && tokens.every((token) => name.includes(token) || county.startsWith(token))) rank = 2;
    else if (name.includes(folded)) rank = 3;
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
  const { state: named, kind, q } = placeQuery(query);
  const state = named ?? (isGazetteerState(prefer) ? prefer : null);
  const pool = state ? hits.filter((unit) => unit.abbr === state) : hits;
  const rows = pool.length ? pool : hits;
  if (rows.length === 0) return null;
  if (rows.length === 1) return rows[0] ?? null;
  const stem = rows.filter((unit) => {
    if (kind && unit.kind !== kind) return false;
    const name = fold(unit.name);
    const folded = fold(q);
    return name === folded || name.startsWith(`${folded} `);
  });
  const local = stem.filter((unit) => unit.kind === "city" || unit.kind === "town" || unit.kind === "village" || unit.kind === "borough");
  const exact = local.filter((unit) => fold(unit.name) === fold(q));
  const shared = local.filter((unit) => {
    const name = fold(unit.name);
    const query = fold(q);
    if (name === query) return true;
    if (!name.startsWith(`${query} `)) return false;
    return /^(city and borough|municipality|city|borough|town|village)\b/.test(name.slice(query.length + 1));
  });
  if (!state && new Set(shared.map((unit) => unit.abbr)).size > 1) return null;
  if (exact.length > 1) {
    const active = exact.filter((unit) => unit.func === "A" || unit.func === "B");
    const samePoint = new Set(exact.map((unit) => `${unit.countyFips}:${unit.lat.toFixed(3)}:${unit.lng.toFixed(3)}`)).size === 1;
    if (samePoint && active.length === 1) return active[0] ?? null;
  }
  if (exact.length === 1) return exact[0] ?? null;
  if (exact.length === 0 && local.length === 1) return local[0] ?? null;
  if (kind) {
    const typed = stem.filter((unit) => unit.kind === kind);
    if (!state && new Set(typed.map((unit) => unit.abbr)).size > 1) return null;
    if (typed.length === 1) return typed[0] ?? null;
  }
  return null;
}
