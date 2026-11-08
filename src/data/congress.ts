import geo from "@/data/geo-states.json";
import roster from "@/data/congress-current.json";

export type Member = {
  id: string;
  name: string;
  party: "D" | "R" | "I";
  abbr: string;
  chamber: "house" | "senate";
  district?: number;
  start: string;
  end: string;
  url: string;
  note?: string;
};

const MEMBERS = roster as Member[];

const STATE_NAME = Object.fromEntries(geo.states.map((s) => [s.abbr, s.name]));

/** Ohio first, then the other states A–Z. Current terms only. */
export function membersOn(asOf: string, abbr: string | null): { abbr: string; name: string; members: Member[] }[] {
  const live = MEMBERS.filter((m) => {
    if (m.start > asOf) return false;
    if (asOf < m.end) return true;
    return Boolean(m.note) && asOf < "2027-01-03";
  });
  const pool = abbr ? live.filter((m) => m.abbr === abbr) : live;
  const order = new Map<string, Member[]>();
  for (const m of pool) {
    const list = order.get(m.abbr) ?? [];
    list.push(m);
    order.set(m.abbr, list);
  }
  const abbrs = [...order.keys()].sort((a, b) => {
    if (!abbr) {
      if (a === "OH") return -1;
      if (b === "OH") return 1;
    }
    return (STATE_NAME[a] ?? a).localeCompare(STATE_NAME[b] ?? b);
  });
  return abbrs.map((code) => ({
    abbr: code,
    name: STATE_NAME[code] ?? code,
    members: (order.get(code) ?? []).sort((a, b) => {
      if (a.chamber !== b.chamber) return a.chamber === "senate" ? -1 : 1;
      return (a.district ?? 0) - (b.district ?? 0) || a.name.localeCompare(b.name);
    }),
  }));
}

export function matchMembers(query: string, limit = 6): Member[] {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return [];
  const out: Member[] = [];
  for (const m of MEMBERS) {
    if (!m.name.toLowerCase().includes(q)) continue;
    out.push(m);
    if (out.length >= limit) break;
  }
  return out;
}
export function seatLabel(m: Member): string {
  if (m.chamber === "senate") return "U.S. Senate";
  if (!m.district) return "U.S. House · At large";
  return `U.S. House · District ${m.district}`;
}
