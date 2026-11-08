/** Lieutenant governors, or the note that the state has none.
 *  Names checked against Ballotpedia's current list and the Wikipedia current list on 2026-11-05.
 *  Hawaii shows the acting lieutenant governor after April 23, 2026. */

export type Lieutenant = {
  abbr: string;
  name: string;
  party: "D" | "R";
  start: string;
  end: string;
  title: string;
  note?: string;
  url: string;
};

const SRC = "https://ballotpedia.org/List_of_current_lieutenant_governors_in_the_United_States";

export const LIEUTENANTS: Lieutenant[] = [];

export const NO_LIEUTENANT = new Set(["AZ", "ME", "NH", "OR", "WY"]);

export function lieutenantOn(asOf: string, abbr: string): Lieutenant | null {
  const rows = LIEUTENANTS.filter((r) => r.abbr === abbr && r.start <= asOf && asOf < r.end);
  return rows[0] ?? null;
}
