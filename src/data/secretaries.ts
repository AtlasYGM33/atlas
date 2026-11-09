/** Secretaries of state in office during the public window.
 *  Names from the Wikipedia current table, dates checked against Ballotpedia where that list was available.
 *  Alaska, Hawaii, and Utah have no secretary of state. Historical holders are not in this file. */

export type Secretary = {
  abbr: string;
  name: string;
  party: "D" | "R";
  start: string;
  note?: string;
  url: string;
};

const SRC = "https://en.wikipedia.org/wiki/Secretary_of_state_(U.S._state_government)";

export const SECRETARIES: Secretary[] = [];

export const NO_SECRETARY = new Set(["AK", "HI", "UT"]);

const BY_ABBR = new Map(SECRETARIES.map((s) => [s.abbr, s]));

export function secretaryOn(asOf: string, abbr: string): Secretary | null {
  // Other states stay off the public map before 2025. Ohio's current secretary has a sworn date in 2019.
  // Secretaries before that date are year-ranges only, so they are not filled in.
  if (asOf < "2025-01-01" && abbr !== "OH") return null;
  const s = BY_ABBR.get(abbr);
  if (!s || s.start > asOf) return null;
  return s;
}
