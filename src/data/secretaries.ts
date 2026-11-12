/** Secretaries of state currently in office.
 *  Names from the Wikipedia current table, dates checked against Ballotpedia where that list was available.
 *  Alaska, Hawaii, and Utah have no secretary of state.
 *  A secretary is shown from the sworn date on this row. Earlier holders are not in this file. */

export type Secretary = {
  abbr: string;
  name: string;
  party: "D" | "R";
  start: string;
  note?: string;
  url: string;
};

const SRC = "https://en.wikipedia.org/wiki/Secretary_of_state_(U.S._state_government)";

export const SECRETARIES: Secretary[] = [
  { abbr: "AL", name: "Wes Allen", party: "R", start: "2023-01-16", url: SRC },
  { abbr: "AZ", name: "Adrian Fontes", party: "D", start: "2023-01-02", url: SRC },
  { abbr: "AR", name: "Cole Jester", party: "R", start: "2025-01-01", url: SRC },
  { abbr: "CA", name: "Shirley Weber", party: "D", start: "2021-01-29", url: SRC },
  { abbr: "CO", name: "Jena Griswold", party: "D", start: "2019-01-08", url: SRC },
  { abbr: "CT", name: "Stephanie Thomas", party: "D", start: "2023-01-04", url: SRC },
  { abbr: "DE", name: "Charuni Patibanda-Sanchez", party: "D", start: "2025-01-29", url: SRC },
  { abbr: "FL", name: "Cord Byrd", party: "R", start: "2022-05-16", note: "Acting from May 2022. Confirmed in April 2023.", url: SRC },
  { abbr: "GA", name: "Brad Raffensperger", party: "R", start: "2019-01-14", url: SRC },
  { abbr: "ID", name: "Phil McGrane", party: "R", start: "2023-01-02", url: SRC },
  { abbr: "IL", name: "Alexi Giannoulias", party: "D", start: "2023-01-09", url: SRC },
  { abbr: "IN", name: "Diego Morales", party: "R", start: "2023-01-01", url: SRC },
  { abbr: "IA", name: "Paul Pate", party: "R", start: "2015-01-01", url: SRC },
  { abbr: "KS", name: "Scott Schwab", party: "R", start: "2019-01-14", url: SRC },
  { abbr: "KY", name: "Michael Adams", party: "R", start: "2020-01-06", url: SRC },
  { abbr: "LA", name: "Nancy Landry", party: "R", start: "2024-01-08", url: SRC },
  { abbr: "ME", name: "Shenna Bellows", party: "D", start: "2021-01-04", url: SRC },
  { abbr: "MD", name: "Susan Lee", party: "D", start: "2023-02-14", url: SRC },
  { abbr: "MA", name: "Bill Galvin", party: "D", start: "1995-01-01", url: SRC },
  { abbr: "MI", name: "Jocelyn Benson", party: "D", start: "2019-01-01", url: SRC },
  { abbr: "MN", name: "Steve Simon", party: "D", start: "2015-01-05", url: SRC },
  { abbr: "MS", name: "Michael Watson", party: "R", start: "2020-01-09", url: SRC },
  { abbr: "MO", name: "Denny Hoskins", party: "R", start: "2025-01-13", url: SRC },
  { abbr: "MT", name: "Christi Jacobsen", party: "R", start: "2021-01-04", url: SRC },
  { abbr: "NE", name: "Bob Evnen", party: "R", start: "2019-01-10", url: SRC },
  { abbr: "NV", name: "Cisco Aguilar", party: "D", start: "2023-01-02", url: SRC },
  { abbr: "NH", name: "David Scanlan", party: "R", start: "2022-01-10", url: SRC },
  { abbr: "NJ", name: "Shirley Emehelu", party: "D", start: "2026-09-25", note: "Acting.", url: SRC },
  { abbr: "NM", name: "Maggie Toulouse Oliver", party: "D", start: "2016-12-09", url: SRC },
  { abbr: "NY", name: "Walter Mosley", party: "D", start: "2024-05-22", url: SRC },
  { abbr: "NC", name: "Elaine Marshall", party: "D", start: "1997-01-03", url: SRC },
  { abbr: "ND", name: "Michael Howe", party: "R", start: "2023-01-01", url: SRC },
  { abbr: "OH", name: "Frank LaRose", party: "R", start: "2019-01-14", note: "Term-limited. He remains secretary of state until a successor is sworn. The November 3, 2026 result is not seated here.", url: SRC },
  { abbr: "OK", name: "Benjamin Lepak", party: "R", start: "2025-10-02", url: SRC },
  { abbr: "OR", name: "Tobias Read", party: "D", start: "2025-01-06", url: SRC },
  { abbr: "PA", name: "Al Schmidt", party: "R", start: "2023-01-17", url: SRC },
  { abbr: "RI", name: "Gregg Amore", party: "D", start: "2023-01-03", url: SRC },
  { abbr: "SC", name: "Mark Hammond", party: "R", start: "2003-01-15", url: SRC },
  { abbr: "SD", name: "Monae Johnson", party: "R", start: "2022-12-05", url: SRC },
  { abbr: "TN", name: "Tre Hargett", party: "R", start: "2009-01-15", url: SRC },
  { abbr: "TX", name: "Robert Howden", party: "R", start: "2026-07-17", note: "Acting.", url: SRC },
  { abbr: "VT", name: "Sarah Copeland-Hanzas", party: "D", start: "2023-01-05", url: SRC },
  { abbr: "VA", name: "Candi King", party: "D", start: "2026-01-17", url: SRC },
  { abbr: "WA", name: "Steve Hobbs", party: "D", start: "2021-11-22", url: SRC },
  { abbr: "WV", name: "Kris Warner", party: "R", start: "2025-01-13", url: SRC },
  { abbr: "WI", name: "Sarah Godlewski", party: "D", start: "2023-03-17", url: SRC },
  { abbr: "WY", name: "Chuck Gray", party: "R", start: "2023-01-02", url: SRC },
];

export const NO_SECRETARY = new Set(["AK", "HI", "UT", "DC", "AS", "GU", "MP", "VI"]);

const BY_ABBR = new Map(SECRETARIES.map((s) => [s.abbr, s]));

export function secretaryOn(asOf: string, abbr: string): Secretary | null {
  if (asOf < "2025-01-01") return null;
  const s = BY_ABBR.get(abbr);
  if (!s || s.start > asOf) return null;
  return s;
}
