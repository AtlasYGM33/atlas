import terms from "@/data/governors-terms.json";

/** Governors from 2000-01-01 through the current term.
 *  Current names and start dates are the National Governors Association roster.
 *  Earlier terms are year-ranges from the NGA biographical file: when two people
 *  share a year, the person already in office keeps that year.
 *  Ohio, Indiana, Kentucky, Alabama, Alaska, and Arizona are the exception. Those terms use the inauguration day and do not overlap. */

export type Governor = {
  abbr: string;
  name: string;
  short: string;
  party: "D" | "R" | "I";
  start: string;
  end: string;
  url: string;
};

export const GOVERNOR_TERMS = terms as Governor[];

export const GOVERNORS: Governor[] = GOVERNOR_TERMS.filter((g) => g.end >= "2099-01-01");

export function governorOn(asOf: string, abbr: string): Governor | null {
  const rows = GOVERNOR_TERMS.filter((g) => g.abbr === abbr && g.start <= asOf && asOf < g.end);
  rows.sort((a, b) => {
    const span = (g: Governor) => Date.parse(g.end) - Date.parse(g.start);
    return span(a) - span(b) || b.start.localeCompare(a.start);
  });
  return rows[0] ?? null;
}
