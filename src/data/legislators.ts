import rows from "@/data/legislators-current.json";

/** Current state legislators from the Open States nightly roster.
 *  The file date is when that roster was downloaded, not a swearing-in.
 *  It is not a reconstruction back to 2000. */

export type LegChamber = "upper" | "lower" | "legislature";

export type Legislator = {
  abbr: string;
  chamber: LegChamber;
  district: string;
  name: string;
  party: string;
  url: string;
};

export const LEGISLATORS = rows as Legislator[];
export const LEGISLATOR_AS_OF = "2026-11-05";
export const LEGISLATOR_SOURCE = "https://openstates.org/data/legislator-csv/";

export function normDistrict(value: number | string): string {
  let s = String(value).trim().toLowerCase();
  s = s.replace(/,/g, " ").replace(/-/g, " ").replace(/\band\b/g, " ");
  s = s.replace(/\bsouth east\b/g, "southeast");
  s = s.replace(/\bsouth west\b/g, "southwest");
  s = s.replace(/\bnorth east\b/g, "northeast");
  s = s.replace(/\bnorth west\b/g, "northwest");
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/ senatorial$/, "").replace(/ district$/, "");
  if (s.startsWith("ward ")) s = s.slice(5);
  if (/^\d+$/.test(s)) return String(Number(s));
  return s;
}

const INDEX = new Map<string, Legislator[]>();
for (const row of LEGISLATORS) {
  const key = `${row.abbr}|${row.chamber}|${normDistrict(row.district)}`;
  const list = INDEX.get(key) ?? [];
  list.push(row);
  INDEX.set(key, list);
}

export function legislatorsOn(abbr: string, chamber: LegChamber, district: number | string): Legislator[] {
  return INDEX.get(`${abbr}|${chamber}|${normDistrict(district)}`) ?? [];
}

export function legislatorsAtLarge(abbr: string, chamber: LegChamber): Legislator[] {
  return LEGISLATORS.filter((row) => {
    if (row.abbr !== abbr || row.chamber !== chamber) return false;
    const district = row.district.toLowerCase();
    return district.includes("at-large") || district.includes("chair");
  });
}
