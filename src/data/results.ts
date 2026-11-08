/** Called 2026 races. Not a canvass and not a swearing-in.
 *  Senate names are the ones Ballotpedia News and Roll Call both reported.
 *  Governor names are the Ballotpedia News calls. No vote totals. */

export type ResultRow = {
  id: string;
  abbr: string;
  office: string;
  incumbent: string;
  winner: string;
  winnerParty: "D" | "R";
  note: string;
};

const CALLED = "Called · not certified · not sworn in";

export const RESULTS: ResultRow[] = [];

const ORDER = ["OH"];

export function resultsOn(asOf: string, abbr: string | null): ResultRow[] {
  if (asOf < "2026-11-03") return [];
  return RESULTS.filter((r) => !abbr || r.abbr === abbr).sort((a, b) => {
    const ia = ORDER.indexOf(a.abbr);
    const ib = ORDER.indexOf(b.abbr);
    const ra = ia === -1 ? 1 : 0;
    const rb = ib === -1 ? 1 : 0;
    if (ra !== rb) return ra - rb;
    if (a.abbr !== b.abbr) return a.abbr === "OH" ? -1 : b.abbr === "OH" ? 1 : a.abbr.localeCompare(b.abbr);
    return a.office.localeCompare(b.office);
  });
}
