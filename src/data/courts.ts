import benches from "@/data/courts.json";

/** High courts only. Not drawn on the map.
 *  A justice is omitted until the start date, and dropped on the end date,
 *  so a November winner is not seated early and a retirement does not linger.
 *  State tables are current membership lists. An empty chair is stated only
 *  once the departure is dated and the successor is not yet sworn in. */

export type CourtParty = "D" | "R" | "I" | "N" | null;

export type Justice = {
  name: string;
  title: string;
  party: CourtParty;
  start: string;
  end?: string;
  /** First day this person is chief, if later than start. */
  chief?: string;
  /** First day they are no longer chief, while still on the court. */
  chiefUntil?: string;
  approx?: boolean;
};

export type Bench = {
  court: string;
  url: string;
  justices: Justice[];
  /** Authorized seats, when a dated vacancy should be shown. */
  seats?: number;
};

const STATE = benches as Record<string, Bench[]>;

const OPEN_SEATS: { court: string; from: string; seats: number }[] = [
  { court: "Supreme Court of the United States", from: "0000-01-01", seats: 9 },
  { court: "Supreme Court of California", from: "2025-11-01", seats: 7 },
  { court: "Hawaii Supreme Court", from: "2025-10-01", seats: 5 },
  { court: "South Carolina Supreme Court", from: "2026-08-01", seats: 5 },
  { court: "New Hampshire Supreme Court", from: "2026-09-15", seats: 5 },
];

const SCOTUS: Bench = {
  court: "Supreme Court of the United States",
  url: "https://www.supremecourt.gov/about/biographies.aspx",
  justices: [
    { name: "Clarence Thomas", title: "Associate justice", party: null, start: "1991-10-23" },
    { name: "John G. Roberts, Jr.", title: "Chief justice", party: null, start: "2005-09-29" },
    { name: "Samuel A. Alito, Jr.", title: "Associate justice", party: null, start: "2006-01-31" },
    { name: "Sonia Sotomayor", title: "Associate justice", party: null, start: "2009-08-08" },
    { name: "Elena Kagan", title: "Associate justice", party: null, start: "2010-08-07" },
    { name: "Neil M. Gorsuch", title: "Associate justice", party: null, start: "2017-04-10" },
    { name: "Brett M. Kavanaugh", title: "Associate justice", party: null, start: "2018-10-06" },
    { name: "Amy Coney Barrett", title: "Associate justice", party: null, start: "2020-10-27" },
    { name: "Ketanji Brown Jackson", title: "Associate justice", party: null, start: "2022-06-30" },
  ],
};

export function justiceRole(j: Justice, asOf: string): string {
  if (j.chief && asOf >= j.chief && (!j.chiefUntil || asOf < j.chiefUntil)) {
    if (j.chiefUntil) return "Acting chief justice";
    return "Chief justice";
  }
  return j.title;
}

function seated(bench: Bench, asOf: string): Bench {
  const justices = bench.justices
    .filter((j) => j.start <= asOf && asOf < (j.end ?? "9999-12-31"))
    .sort((a, b) => {
      const head = (role: string) => role.startsWith("Chief") || role.startsWith("Acting") || role === "Presiding judge";
      const chief = Number(head(justiceRole(b, asOf))) - Number(head(justiceRole(a, asOf)));
      return chief || a.start.localeCompare(b.start) || a.name.localeCompare(b.name);
    });
  const rule = OPEN_SEATS.find((r) => r.court === bench.court && asOf >= r.from);
  return { ...bench, justices, seats: rule?.seats };
}

export function nationalCourt(asOf: string): Bench {
  return seated(SCOTUS, asOf);
}

export function stateCourts(asOf: string, abbr: string): Bench[] {
  return (STATE[abbr] ?? []).map((b) => seated(b, asOf)).filter((b) => b.justices.length > 0 || (b.seats ?? 0) > 0);
}

export function matchJustices(query: string, limit = 6): { name: string; court: string; abbr: string | null }[] {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return [];
  const out: { name: string; court: string; abbr: string | null }[] = [];
  const push = (j: Justice, court: string, abbr: string | null) => {
    if (out.length >= limit) return;
    if (j.name.toLowerCase().includes(q)) out.push({ name: j.name, court, abbr });
  };
  for (const j of SCOTUS.justices) push(j, SCOTUS.court, null);
  for (const [abbr, list] of Object.entries(STATE)) {
    for (const bench of list) for (const j of bench.justices) push(j, bench.court, abbr);
  }
  return out;
}