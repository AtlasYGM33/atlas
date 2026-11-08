/** Compiled public snapshot for the Atlas map. Not a secretary of state. */

export const VERIFIED = "2026-09-18";
export const DEFAULT_AS_OF = "2026-10-25";
export const TODAY = "2026-11-04";
export const ELECTION = "2026-11-03";
/** Rolls strictly before this date are sold to institutions. The public map starts here. */
export const ARCHIVE_CUTOFF = "2025-01-01";
export const TERM_START = "2025-01-20";
export const TERM_END = "2027-01-20";
export const CONGRESS_SWEAR = "2027-01-03";

export const SENATE_2026 = new Set([
  "AL", "AK", "AR", "CO", "DE", "GA", "ID", "IL", "IA", "KS", "KY", "LA", "ME",
  "MA", "MI", "MN", "MS", "MT", "NE", "NH", "NJ", "NM", "NC", "OK", "OR", "RI",
  "SC", "SD", "TN", "TX", "VA", "WV", "WY",
]);

/** States drawn on the federal / House layer in the reference map. */
export const FEDERAL = new Set(["UT", "CO", "MO", "IN"]);

export const DEADLINE_STATES = new Set(["AK", "AZ", "CA", "CO"]);

export const CAPITALS: Record<string, string> = {
  AL: "Montgomery", AK: "Juneau", AZ: "Phoenix", AR: "Little Rock", CA: "Sacramento",
  CO: "Denver", CT: "Hartford", DE: "Dover", FL: "Tallahassee", GA: "Atlanta",
  HI: "Honolulu", ID: "Boise", IL: "Springfield", IN: "Indianapolis", IA: "Des Moines",
  KS: "Topeka", KY: "Frankfort", LA: "Baton Rouge", ME: "Augusta", MD: "Annapolis",
  MA: "Boston", MI: "Lansing", MN: "Saint Paul", MS: "Jackson", MO: "Jefferson City",
  MT: "Helena", NE: "Lincoln", NV: "Carson City", NH: "Concord", NJ: "Trenton",
  NM: "Santa Fe", NY: "Albany", NC: "Raleigh", ND: "Bismarck", OH: "Columbus",
  OK: "Oklahoma City", OR: "Salem", PA: "Harrisburg", RI: "Providence", SC: "Columbia",
  SD: "Pierre", TN: "Nashville", TX: "Austin", UT: "Salt Lake City", VT: "Montpelier",
  VA: "Richmond", WA: "Olympia", WV: "Charleston", WI: "Madison", WY: "Cheyenne",
  DC: "Washington", PR: "San Juan", VI: "Charlotte Amalie", GU: "Hagåtña",
  AS: "Pago Pago", MP: "Saipan",
};

export const HOUSE_SEATS: Record<string, number> = {
  AL: 7, AK: 1, AZ: 9, AR: 4, CA: 52, CO: 8, CT: 5, DE: 1, FL: 28, GA: 14,
  HI: 2, ID: 2, IL: 17, IN: 9, IA: 4, KS: 4, KY: 6, LA: 6, ME: 2, MD: 8,
  MA: 9, MI: 13, MN: 8, MS: 4, MO: 8, MT: 2, NE: 3, NV: 4, NH: 2, NJ: 12,
  NM: 3, NY: 26, NC: 14, ND: 1, OH: 15, OK: 5, OR: 6, PA: 17, RI: 2, SC: 7,
  SD: 1, TN: 9, TX: 38, UT: 4, VT: 1, VA: 11, WA: 10, WV: 2, WI: 8, WY: 1,
  DC: 0, PR: 0, VI: 0, GU: 0, AS: 0, MP: 0,
};

export const KIND: Record<string, string> = {
  DC: "FEDERAL DISTRICT",
  PR: "TERRITORY", VI: "TERRITORY", GU: "TERRITORY", AS: "TERRITORY", MP: "TERRITORY",
};

export type FilterId = "all" | "vacancies" | "elections" | "results" | "primaries" | "specials" | "deadlines";

export type MapMode = "all" | "vacancy" | "statewide" | "federal" | "deadline";

export type Measure = {
  id: string;
  abbr: string;
  kicker: string;
  title: string;
  body: string;
  scope: "nation" | "state";
};

export const MEASURES: Measure[] = [];

export type Seat = {
  id: string;
  abbr: string;
  label: string;
  title: string;
  body: string;
  resigned: string;
  xKey: "TX-23" | "FL-20";
};

export const SEATS: Seat[] = [];

export type Person = {
  id: string;
  name: string;
  party: string;
  race: string;
  abbr: string;
};

export const PEOPLE: Person[] = [];

export type CalEvent = {
  id: string;
  date: string;
  abbr: string | null;
  title: string;
  body: string;
  kind: "election" | "primary" | "deadline" | "term";
};

export const CALENDAR: CalEvent[] = [
  { id: "term-open", date: "2025-01-20", abbr: null, kind: "term", title: "Current term begins", body: "The public atlas window includes the presidential inauguration." },
  { id: "verified", date: "2026-09-18", abbr: null, kind: "deadline", title: "Atlas verification pass", body: "A verification date for the loaded public window. Named rolls are not in this repository." },
  { id: "uocava", date: "2026-09-19", abbr: null, kind: "deadline", title: "Federal overseas/military ballot window (UOCAVA)", body: "Overseas · United States" },
  { id: "general", date: "2026-11-03", abbr: null, kind: "election", title: "2026 Midterm General Election", body: "General · United States" },
  { id: "swear", date: "2027-01-03", abbr: null, kind: "term", title: "120th Congress sworn in", body: "Winners of the November House and Senate elections take office." },
  { id: "term-close", date: "2027-01-20", abbr: null, kind: "term", title: "Public map window closes", body: "The free public map's published window ends January 20, 2027." },
];

export function layerOf(abbr: string): "vacancy" | "federal" | "statewide" {
  if (SEATS.some((s) => s.abbr === abbr)) return "vacancy";
  if (FEDERAL.has(abbr)) return "federal";
  return "statewide";
}

export function activeSeats(asOf: string): Seat[] {
  return SEATS.filter((s) => asOf >= s.resigned && asOf < CONGRESS_SWEAR);
}

export function measuresFor(abbr: string | null, asOf: string): Measure[] {
  if (asOf < "2026-09-01") return [];
  return MEASURES.filter((m) => {
    if (abbr && m.abbr !== abbr) return false;
    if (!abbr && m.scope !== "nation") return false;
    return true;
  });
}

export function confidence(asOf: string): "HIGH" | "LOW" {
  if (asOf < ARCHIVE_CUTOFF) return "LOW";
  return asOf >= TERM_START && asOf <= TERM_END ? "HIGH" : "LOW";
}

export function isArchive(asOf: string): boolean {
  return asOf < ARCHIVE_CUTOFF;
}

export type ReturnsPhase = "before" | "election-day" | "counting" | "canvass";

export function returnsPhase(asOf: string): ReturnsPhase {
  if (asOf < ELECTION) return "before";
  if (asOf === ELECTION) return "election-day";
  if (asOf < "2026-12-12") return "counting";
  return "canvass";
}

export function returnsHeadline(asOf: string): string {
  const phase = returnsPhase(asOf);
  if (phase === "before") return "Ballot is set. No returns yet.";
  if (phase === "election-day") return "Election day. This feed does not call races.";
  if (phase === "counting") return "Returns are moving. No unofficial totals in this feed.";
  return "Canvass deadlines are passing. Official rolls are not ingested yet.";
}

export type LiveNote = { id: string; date: string; title: string; body: string };

export function observedNotes(asOf: string): LiveNote[] {
  return CALENDAR.filter((e) => e.date >= ARCHIVE_CUTOFF && e.date <= asOf)
    .slice()
    .reverse()
    .slice(0, 5)
    .map((e) => ({ id: e.id, date: e.date, title: e.title, body: e.body }));
}

export const ARCHIVE_FLOOR = "2000-01-01";
export const ARCHIVE_HOLDINGS: { k: string; v: string }[] = [
  { k: "Floor", v: "January 1, 2000" },
  { k: "President and vice president", v: "In the archive from January 1, 2000" },
  { k: "Governors", v: "In the archive from January 1, 2000" },
  { k: "Congress", v: "House and Senate in the archive from January 1, 2000" },
  { k: "U.S. Supreme Court", v: "In the archive from January 1, 2000" },
  { k: "State high courts", v: "Not a 2000 roll. Current bench only." },
  { k: "Other offices", v: "Secretaries of state, lieutenant governors, and state legislators are not a complete roll from 2000." },
  { k: "Measures and returns", v: "Prior-cycle ballots and official canvasses are not in this pack." },
];

/** Sitting 119th Congress, from the published Atlas snapshot. Not a 2026 result. */
export const CONGRESS = {
  house: { R: 218, D: 214, I: 1 },
  senate: { R: 53, D: 45, I: 2 },
  governorsUp: 36,
  senateUp: 35,
  source: "Clerk of the House official list of members, 2 September 2026",
};

export const FEDERAL_OFFICES = [];

export function nextEvent(asOf: string, abbr: string | null): CalEvent | null {
  return (
    CALENDAR.filter((e) => e.date >= asOf && (!abbr || e.abbr === null || e.abbr === abbr)).sort((a, b) =>
      a.date.localeCompare(b.date),
    )[0] ?? null
  );
}

export function inPublicWindow(asOf: string): boolean {
  return asOf >= TERM_START && asOf <= TERM_END;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

export function formatSlash(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

export function formatLong(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function daysPhrase(asOf: string): string {
  const a = parseISODate(asOf).getTime();
  const e = parseISODate(ELECTION).getTime();
  const days = Math.round((e - a) / 86_400_000);
  if (days > 0) return `${days}d to 3 Nov`;
  if (days === 0) return "Election day";
  return `${Math.abs(days)}d after 3 Nov`;
}

export function addDays(iso: string, days: number): string {
  const t = parseISODate(iso).getTime() + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

const RANGE_START = parseISODate("2000-01-01").getTime();
const RANGE_END = parseISODate("2029-12-31").getTime();

export function dateToUnit(iso: string): number {
  const t = parseISODate(iso).getTime();
  return Math.min(1, Math.max(0, (t - RANGE_START) / (RANGE_END - RANGE_START)));
}

export function unitToDate(unit: number): string {
  const t = RANGE_START + Math.min(1, Math.max(0, unit)) * (RANGE_END - RANGE_START);
  return new Date(t).toISOString().slice(0, 10);
}

export const TIMELINE_MARKS: { iso: string; label: string }[] = [
  { iso: "2000-01-01", label: "2000" },
  { iso: "2008-01-01", label: "2008" },
  { iso: "2016-01-01", label: "2016" },
  { iso: "2024-01-01", label: "2024" },
  { iso: ELECTION, label: "ELECTION" },
  { iso: "2029-01-01", label: "2029" },
  { iso: TODAY, label: "TODAY" },
];

export type Administration = {
  president: string;
  vice: string;
  party: "R" | "D";
  partyName: string;
  start: string;
  end: string;
  note: string;
};

/** Consecutive service, so a date inside the span resolves to that person. */
export const ADMINISTRATIONS: Administration[] = [];

export function administrationOn(asOf: string): Administration | null {
  return ADMINISTRATIONS.find((a) => asOf >= a.start && asOf < a.end) ?? null;
}

export type Opening = {
  id: string;
  abbr: string;
  office: string;
  body: string;
  election: string;
  expires: string;
};

export const OPENINGS: Opening[] = [];

export function openingsOn(asOf: string, abbr: string | null): Opening[] {
  if (asOf < "2026-01-01" || asOf >= "2027-01-20") return [];
  return OPENINGS.filter((o) => !abbr || o.abbr === abbr);
}

export type SourceLink = {
  name: string;
  tag: "OFFICIAL" | "FEDERAL" | "REFERENCE";
  href: string;
  abbr?: string;
};

export const SOURCES: SourceLink[] = [
  { name: "Ballotpedia News, 2026 Senate and governor calls", tag: "REFERENCE", href: "https://news.ballotpedia.org/2026/11/04/democrats-win-u-s-house-and-senate-majorities/" },
  { name: "Roll Call, Senate calls", tag: "REFERENCE", href: "https://rollcall.com/2026/11/04/senate-democrats-majority-midterm-elections-2/" },
  { name: "U.S. House of Representatives", tag: "OFFICIAL", href: "https://www.house.gov" },
  { name: "Clerk of the House", tag: "OFFICIAL", href: "https://clerk.house.gov" },
  { name: "Vote.gov", tag: "FEDERAL", href: "https://vote.gov" },
  { name: "Federal Election Commission", tag: "FEDERAL", href: "https://www.fec.gov" },
  { name: "House Administration primary calendar", tag: "FEDERAL", href: "https://cha.house.gov" },
  { name: "National Association of Attorneys General", tag: "REFERENCE", href: "https://www.naag.org" },
  { name: "National Lieutenant Governors Association", tag: "REFERENCE", href: "https://nlga.us" },
  { name: "National Association of Secretaries of State", tag: "REFERENCE", href: "https://www.nass.org" },
  { name: "Ohio Secretary of State certified ballot, 2026 general election", tag: "OFFICIAL", href: "https://www.ohiosos.gov", abbr: "OH" },
  { name: "Alaska Division of Elections 2026 ballot measures", tag: "OFFICIAL", href: "https://www.elections.alaska.gov", abbr: "AK" },
  { name: "Arizona Secretary of State 2026 ballot publicity pamphlet", tag: "OFFICIAL", href: "https://azsos.gov", abbr: "AZ" },
  { name: "California Secretary of State — qualified statewide measures", tag: "OFFICIAL", href: "https://www.sos.ca.gov", abbr: "CA" },
  { name: "Colorado Secretary of State 2026 ballot", tag: "OFFICIAL", href: "https://www.coloradosos.gov", abbr: "CO" },
];

/** National ledger from the published Atlas data engine. This build does not hold the unpublished names. */
export const ENGINE_LEDGER = {
  collected: 7610,
  needsReview: 7609,
  held: 1,
  published: 0,
  legislators: 7609,
  note: "Current roster names are collected and not published. Each one still needs an official page. The historical archive is not part of this list.",
};

