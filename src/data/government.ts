/** Public application shell.
 *  Named holders, city rolls, mail rules, and term-limit tables live in the private data pack.
 *  This file keeps the same exports so the map still resolves a place to offices, all unpublished.
 */

import geo from "@/data/geo-states.json";
import { CALENDAR, type CalEvent } from "@/data/civic";
import { NO_LIEUTENANT } from "@/data/lieutenants";
import { NO_SECRETARY } from "@/data/secretaries";

export type Confidence = "HIGH" | "MEDIUM" | "UNPUBLISHED";

export type OfficeView = {
  id: string;
  level: "federal" | "state" | "county" | "municipal" | "education" | "special";
  title: string;
  jurisdiction: string;
  name: string | null;
  party: string | null;
  start: string | null;
  end: string | null;
  url?: string;
  confidence: Confidence;
  source?: string;
  note?: string;
};

export type VacancyView = {
  id: string;
  abbr: string;
  office: string;
  status: "vacant" | "upcoming";
  reason: string;
  since: string;
  process: string;
  resolution: string;
  expected: string;
  source: string;
};

export type CivicEvent = {
  id: string;
  date: string;
  abbr: string | null;
  title: string;
  body: string;
  kind: CalEvent["kind"] | "runoff" | "recall" | "mail";
};

export type TermView = {
  abbr: string;
  office: string;
  rule: string;
  incumbent: string | null;
  status: string;
  eligibleAgain: string;
};

export type Dossier = {
  title: string;
  subtitle: string;
  how: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  abbr: string | null;
  state: string | null;
  county: string | null;
  countyFips: string | null;
  city: string | null;
  placeId: string | null;
  offices: OfficeView[];
  vacancies: VacancyView[];
  elections: CivicEvent[];
  term: TermView | null;
  sources: { name: string; url: string }[];
};

export type Focus = {
  q?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
};

export type EligibilityRule = {
  id: string;
  office: string;
  age: string;
  citizenship: string;
  residency: string;
  other: string;
};

export const ELIGIBILITY: EligibilityRule[] = [
  {
    id: "president",
    office: "President",
    age: "35",
    citizenship: "Natural-born citizen",
    residency: "14 years a resident of the United States",
    other: "The Twenty-second Amendment limits a person to two elected terms.",
  },
  {
    id: "senate",
    office: "U.S. Senate",
    age: "30",
    citizenship: "Citizen for 9 years",
    residency: "Inhabitant of the state when elected",
    other: "Each state elects two senators, regardless of population.",
  },
  {
    id: "house",
    office: "U.S. House",
    age: "25",
    citizenship: "Citizen for 7 years",
    residency: "Inhabitant of the state when elected",
    other: "Custom, not the Constitution, expects the member to live in the district.",
  },
  {
    id: "governor",
    office: "Governor",
    age: "Usually 30. Check the state constitution.",
    citizenship: "U.S. citizen",
    residency: "A state resident for a period set by that state, often 5 to 7 years",
    other: "Term limits are state law. They are not the same rule in every state.",
  },
  {
    id: "mayor",
    office: "Mayor",
    age: "Usually 18, the age of a qualified elector",
    citizenship: "U.S. citizen where the charter requires it",
    residency: "Must live in the city. Some charters set a minimum number of years.",
    other: "A council-manager city may not elect a mayor with executive power.",
  },
  {
    id: "school",
    office: "School board",
    age: "Qualified elector",
    citizenship: "U.S. citizen",
    residency: "Must live in the district, and sometimes in a subdistrict",
    other: "Many boards are nonpartisan. A seat is local even when the election is in November.",
  },
  {
    id: "sheriff",
    office: "Sheriff",
    age: "Usually 18 or 21",
    citizenship: "U.S. citizen",
    residency: "County resident. Some states require law-enforcement experience.",
    other: "Peace-officer certification is a qualification in several states. It is not universal.",
  },
];

export const VACANCY_DETAIL: Record<string, Omit<VacancyView, "id" | "abbr">> = {};

const byAbbr = new Map(geo.states.map((s) => [s.abbr, s]));
const byFips = new Map(geo.places.map((p) => [p.fips, p]));

/** [abbr, south, north, west, east]. Smallest box wins. */
const BOXES: [string, number, number, number, number][] = [
  ["DC", 38.79, 38.996, -77.12, -76.91],
  ["RI", 41.14, 42.02, -71.91, -71.12],
  ["DE", 38.45, 39.84, -75.79, -75.05],
  ["CT", 40.98, 42.05, -73.73, -71.79],
  ["NJ", 38.93, 41.36, -75.56, -73.89],
  ["MD", 37.91, 39.72, -79.49, -75.05],
  ["MA", 41.24, 42.89, -73.51, -69.93],
  ["NH", 42.7, 45.31, -72.56, -70.7],
  ["VT", 42.73, 45.02, -73.44, -71.46],
  ["HI", 18.91, 22.24, -160.25, -154.81],
  ["PR", 17.88, 18.52, -67.27, -65.59],
  ["AK", 51.2, 71.4, -179.2, -129.9],
  ["FL", 24.5, 31.0, -87.63, -80.03],
  ["GA", 30.36, 35.0, -85.61, -80.84],
  ["AL", 30.22, 35.01, -88.47, -84.89],
  ["SC", 32.05, 35.22, -83.35, -78.54],
  ["NC", 33.84, 36.59, -84.32, -75.46],
  ["TN", 34.98, 36.68, -90.31, -81.65],
  ["KY", 36.5, 39.15, -89.57, -81.96],
  ["VA", 36.54, 39.47, -83.68, -75.24],
  ["WV", 37.2, 40.64, -82.64, -77.72],
  ["OH", 38.4, 41.98, -84.82, -80.52],
  ["IN", 37.77, 41.76, -88.1, -84.78],
  ["MI", 41.7, 48.19, -90.42, -82.41],
  ["IL", 36.97, 42.51, -91.51, -87.02],
  ["WI", 42.49, 47.08, -92.89, -86.25],
  ["MS", 30.17, 34.99, -91.66, -88.1],
  ["LA", 28.93, 33.02, -94.04, -88.82],
  ["AR", 33.0, 36.5, -94.62, -89.64],
  ["MO", 35.99, 40.61, -95.77, -89.1],
  ["IA", 40.38, 43.5, -96.64, -90.14],
  ["MN", 43.5, 49.38, -97.24, -89.49],
  ["TX", 25.84, 36.5, -106.65, -93.51],
  ["OK", 33.62, 37.0, -103.0, -94.43],
  ["KS", 36.99, 40.0, -102.05, -94.59],
  ["NE", 40.0, 43.0, -104.05, -95.31],
  ["SD", 42.48, 45.95, -104.06, -96.44],
  ["ND", 45.94, 49.0, -104.05, -96.55],
  ["NM", 31.33, 37.0, -109.05, -103.0],
  ["CO", 36.99, 41.0, -109.06, -102.04],
  ["WY", 40.99, 45.01, -111.06, -104.05],
  ["MT", 44.36, 49.0, -116.05, -104.04],
  ["AZ", 31.33, 37.0, -114.81, -109.04],
  ["UT", 36.99, 42.0, -114.05, -109.04],
  ["NV", 35.0, 42.0, -120.01, -114.04],
  ["ID", 41.99, 49.0, -117.24, -111.04],
  ["CA", 32.53, 42.01, -124.41, -114.13],
  ["OR", 41.99, 46.29, -124.57, -116.46],
  ["WA", 45.54, 49.0, -124.73, -116.92],
  ["PA", 39.72, 42.27, -80.52, -74.69],
  ["NY", 40.5, 45.02, -79.76, -71.86],
  ["ME", 43.06, 47.46, -71.08, -66.95],
];

const UNPUBLISHED_NOTE = "This office applies. The holder is not in the public repository.";

export function placeById(_id: string): { id: string; city: string; county: string } | undefined {
  return undefined;
}

export function mailRule(_abbr: string): { abbr: string; request: string; back: string; confidence: Confidence } | null {
  return null;
}

export function calendarEvents(): CivicEvent[] {
  return [...(CALENDAR as CivicEvent[])].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function termView(_asOf: string, _abbr: string): TermView | null {
  return null;
}

function stateAt(lat: number, lng: number): string | null {
  let best: { abbr: string; area: number } | null = null;
  for (const [abbr, s, n, w, e] of BOXES) {
    if (lat < s || lat > n || lng < w || lng > e) continue;
    const area = (n - s) * (e - w);
    if (!best || area < best.area) best = { abbr, area };
  }
  return best?.abbr ?? null;
}

function unpublished(id: string, level: OfficeView["level"], title: string, jurisdiction: string, note = UNPUBLISHED_NOTE): OfficeView {
  return {
    id,
    level,
    title,
    jurisdiction,
    name: null,
    party: null,
    start: null,
    end: null,
    confidence: "UNPUBLISHED",
    note,
  };
}

function structuralCounty(county: string, abbr: string): OfficeView[] {
  const name = `${county} County`;
  return [
    ["commissioners", "County commissioners"],
    ["sheriff", "Sheriff"],
    ["prosecutor", "Prosecutor"],
    ["clerk", "Clerk"],
    ["auditor", "Auditor"],
    ["treasurer", "Treasurer"],
    ["coroner", "Coroner"],
  ].map(([id, title]) => unpublished(`${abbr}-${county}-${id}`, "county", title, name));
}

function parseQuery(raw: string): { abbr?: string; county?: string; fips?: string; how: string } {
  const q = raw.trim().toLowerCase().replace(/\./g, "");
  const state = geo.states.find(
    (s) => q.endsWith(` ${s.abbr.toLowerCase()}`) || q.endsWith(`, ${s.abbr.toLowerCase()}`) || q === s.name.toLowerCase() || q === s.abbr.toLowerCase(),
  );
  if (state && /\bcounty\b|\bparish\b/.test(q)) {
    const county = q
      .replace(state.name.toLowerCase(), "")
      .replace(state.abbr.toLowerCase(), "")
      .replace(/\bcounty\b|\bparish\b|,/g, "")
      .trim();
    const geoCounty = geo.places.find((p) => p.st === state.fips && p.name.toLowerCase() === county);
    if (geoCounty) return { abbr: state.abbr, county: geoCounty.name, fips: geoCounty.fips, how: `Matched ${geoCounty.name} County, ${state.abbr}.` };
  }
  if (state) return { abbr: state.abbr, how: `Matched ${state.name}.` };
  return { how: "No published city is in this public build. The map selection still applies." };
}

export function resolve(input: {
  asOf: string;
  q?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  abbr?: string | null;
  countyFips?: string | null;
}): Dossier {
  const asOf = input.asOf;
  let how = "Selected on the map.";
  let abbr = input.abbr ?? null;
  let countyFips = input.countyFips ?? null;
  let countyName: string | null = null;

  if (input.q) {
    const parsed = parseQuery(input.q);
    if (parsed.abbr) abbr = parsed.abbr;
    if (parsed.county) countyName = parsed.county;
    if (parsed.fips) countyFips = parsed.fips;
    how = parsed.how;
  } else if (input.lat != null && input.lng != null) {
    const st = stateAt(input.lat, input.lng);
    abbr = st;
    how = st
      ? `The point is in ${byAbbr.get(st)?.name ?? st}. City halls are not in this public build.`
      : "That point is outside the states, the District, and Puerto Rico in this atlas.";
  }

  if (countyFips && !countyName) {
    const geoCounty = byFips.get(countyFips);
    countyName = geoCounty?.name ?? null;
    if (!abbr && geoCounty) abbr = geo.states.find((s) => s.fips === geoCounty.st)?.abbr ?? null;
  }

  const state = abbr ? byAbbr.get(abbr) : undefined;
  const offices: OfficeView[] = [];
  if (!abbr || state) {
    offices.push(unpublished("president", "federal", "President", "United States"));
    offices.push(unpublished("vice", "federal", "Vice president", "United States"));
  }
  if (abbr && state) {
    offices.push(unpublished(`${abbr}-sen-1`, "federal", "U.S. Senator", state.name));
    offices.push(unpublished(`${abbr}-sen-2`, "federal", "U.S. Senator", state.name));
    offices.push(unpublished(`${abbr}-house`, "federal", "U.S. House", state.name, "A congressional district applies once a city is published. No member is named in this public build."));
    offices.push(unpublished(`${abbr}-gov`, "state", "Governor", state.name));
    if (!NO_LIEUTENANT.has(abbr)) offices.push(unpublished(`${abbr}-lg`, "state", "Lieutenant governor", state.name));
    if (!NO_SECRETARY.has(abbr)) offices.push(unpublished(`${abbr}-sos`, "state", "Secretary of state", state.name));
    offices.push(unpublished(`${abbr}-ag`, "state", "Attorney general", state.name));
    offices.push(unpublished(`${abbr}-senate`, "state", "State senate", state.name, "A state senate district applies. This public build does not invent the district or the member."));
    offices.push(unpublished(`${abbr}-house-state`, "state", "State house", state.name, "A state house district applies. This public build does not invent the district or the member."));
  }
  if (countyName && abbr) offices.push(...structuralCounty(countyName, abbr));

  const title = countyName ? `${countyName} County` : state?.name ?? "United States";
  const subtitle = countyName ? (state?.name ?? abbr ?? "") : state ? "State government, plus the federal offices that cover it" : "Federal government";

  return {
    title,
    subtitle,
    how: how.trim(),
    confidence: "LOW",
    abbr,
    state: state?.name ?? null,
    county: countyName,
    countyFips,
    city: null,
    placeId: null,
    offices,
    vacancies: [],
    elections: calendarEvents()
      .filter((e) => {
        if (abbr && e.abbr && e.abbr !== abbr) return false;
        if (!abbr && e.abbr && e.kind !== "election" && e.kind !== "deadline" && e.kind !== "term") return false;
        return true;
      })
      .slice(0, 12),
    term: null,
    sources: [],
  };
}

export function focusHits(_query: string): {
  id: string;
  label: string;
  hint: string;
  abbr: string;
  placeId: string;
  county: string;
  fips: string;
  x: number;
  y: number;
}[] {
  return [];
}

export function compareDossiers(left: Dossier, right: Dossier): { office: string; onDate: string; onCompare: string }[] {
  const ids = new Set([...left.offices.map((o) => o.id), ...right.offices.map((o) => o.id)]);
  const changes = [];
  for (const id of ids) {
    const a = left.offices.find((o) => o.id === id);
    const b = right.offices.find((o) => o.id === id);
    const onDate = a?.name ?? "—";
    const onCompare = b?.name ?? "—";
    if (onDate === onCompare) continue;
    const level = a?.level ?? b?.level;
    const title = a?.title ?? b?.title ?? "Office";
    const keepBlank = level === "municipal" || level === "county" || title === "President" || title === "Vice president" || title === "Governor";
    if ((onDate === "—" || onCompare === "—") && !keepBlank) continue;
    changes.push({ office: title, onDate, onCompare });
  }
  return changes.slice(0, 16);
}

export type Follow = { id: string; label: string; abbr: string | null; placeId?: string };

export function alertsFor(follows: Follow[], asOf: string): { id: string; title: string; body: string; date: string }[] {
  if (follows.length === 0) return [];
  const rows: { id: string; title: string; body: string; date: string }[] = [];
  for (const follow of follows) {
    const events = calendarEvents().filter((e) => e.date >= asOf && (!e.abbr || e.abbr === follow.abbr));
    for (const e of events.slice(0, 3)) {
      rows.push({
        id: `${follow.id}-${e.id}`,
        title: `${follow.label} · ${e.title}`,
        body: e.body,
        date: e.date,
      });
    }
  }
  return rows.slice(0, 12);
}

export function recallNote(abbr: string | null): string {
  if (!abbr) return "Recall rules ship with the private data pack. None is qualified here.";
  return `${abbr} has no recall loaded in this public build. That is not a ruling that recall is impossible.`;
}

export function apiCatalog() {
  return [
    { method: "GET", path: "/api/v1/location?q=OH&date=2026-11-07", note: "State or county to the governments that apply. Holders stay unpublished in this build." },
    { method: "GET", path: "/api/v1/location?lat=39.9612&lng=-82.9988&compare=2020-08-21", note: "A point, and an optional second date." },
    { method: "GET", path: "/api/v1/offices?abbr=OH&date=2026-11-07", note: "The office list only." },
    { method: "GET", path: "/api/v1/vacancies?abbr=TX&date=2026-11-07", note: "Reason, process, and how a vacancy ends." },
    { method: "GET", path: "/api/v1/elections?abbr=GA", note: "Calendar. Runoff, recall, and mail rows ship with the private data pack." },
  ];
}
