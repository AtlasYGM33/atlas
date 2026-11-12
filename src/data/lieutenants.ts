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

export const LIEUTENANTS: Lieutenant[] = [
  { abbr: "AL", name: "Will Ainsworth", party: "R", start: "2019-01-15", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "AK", name: "Nancy Dahlstrom", party: "R", start: "2022-12-05", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "AR", name: "Leslie Rutledge", party: "R", start: "2023-01-10", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "CA", name: "Eleni Kounalakis", party: "D", start: "2019-01-07", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "CO", name: "Dianne Primavera", party: "D", start: "2019-01-08", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "CT", name: "Susan Bysiewicz", party: "D", start: "2019-01-09", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "DE", name: "Kyle Evans Gay", party: "D", start: "2025-01-21", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "FL", name: "Jay Collins", party: "R", start: "2025-08-12", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "GA", name: "Burt Jones", party: "R", start: "2023-01-09", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "HI", name: "Sylvia Luke", party: "D", start: "2022-12-05", end: "2026-04-23", title: "Lieutenant governor", url: SRC },
  { abbr: "HI", name: "Keith Regan", party: "D", start: "2026-04-23", end: "2099-01-01", title: "Lieutenant governor (acting)", note: "Acting while Sylvia Luke is on leave.", url: "https://ballotpedia.org/Keith_Regan" },
  { abbr: "ID", name: "Scott Bedke", party: "R", start: "2023-01-02", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "IL", name: "Juliana Stratton", party: "D", start: "2019-01-14", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "IN", name: "Joe Kernan", party: "D", start: "1997-01-13", end: "2003-09-13", title: "Lieutenant governor", note: "Became governor when Frank O'Bannon died. The office was vacant until October 20, 2003.", url: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Indiana" },
  { abbr: "IN", name: "Kathy Davis", party: "D", start: "2003-10-20", end: "2005-01-10", title: "Lieutenant governor", url: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Indiana" },
  { abbr: "IN", name: "Becky Skillman", party: "R", start: "2005-01-10", end: "2013-01-14", title: "Lieutenant governor", url: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Indiana" },
  { abbr: "IN", name: "Sue Ellspermann", party: "R", start: "2013-01-14", end: "2016-03-02", title: "Lieutenant governor", note: "Resigned March 2, 2016.", url: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Indiana" },
  { abbr: "IN", name: "Eric Holcomb", party: "R", start: "2016-03-03", end: "2017-01-09", title: "Lieutenant governor", note: "Appointed March 3, 2016. Elected governor the same year.", url: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Indiana" },
  { abbr: "IN", name: "Suzanne Crouch", party: "R", start: "2017-01-09", end: "2025-01-13", title: "Lieutenant governor", url: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Indiana" },
  { abbr: "IN", name: "Micah Beckwith", party: "R", start: "2025-01-13", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "IA", name: "Chris Cournoyer", party: "R", start: "2024-12-16", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "KS", name: "David Toland", party: "D", start: "2021-01-02", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "KY", name: "Jacqueline Coleman", party: "D", start: "2019-12-10", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "LA", name: "Billy Nungesser", party: "R", start: "2016-01-11", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "MD", name: "Aruna Miller", party: "D", start: "2023-01-18", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "MA", name: "Kim Driscoll", party: "D", start: "2023-01-05", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "MI", name: "Garlin Gilchrist", party: "D", start: "2019-01-01", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "MN", name: "Peggy Flanagan", party: "D", start: "2019-01-07", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "MS", name: "Delbert Hosemann", party: "R", start: "2020-01-14", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "MO", name: "David Wasinger", party: "R", start: "2025-01-13", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "MT", name: "Kristen Juras", party: "R", start: "2021-01-04", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "NE", name: "Joe Kelly", party: "R", start: "2023-01-05", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "NV", name: "Stavros Anthony", party: "R", start: "2023-01-02", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "NM", name: "Howie Morales", party: "D", start: "2019-01-01", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "NY", name: "Antonio Delgado", party: "D", start: "2022-05-25", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "NC", name: "Rachel Hunt", party: "D", start: "2025-01-01", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "ND", name: "Michelle Strinden", party: "R", start: "2024-12-15", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "OH", name: "Maureen O'Connor", party: "R", start: "1999-01-11", end: "2002-12-31", title: "Lieutenant governor", note: "Resigned December 31, 2002 for the Ohio Supreme Court. The office was vacant until January 13, 2003.", url: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Ohio" },
  { abbr: "OH", name: "Jennette Bradley", party: "R", start: "2003-01-13", end: "2005-01-05", title: "Lieutenant governor", note: "Left this office to become treasurer.", url: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Ohio" },
  { abbr: "OH", name: "Bruce E. Johnson", party: "R", start: "2005-01-05", end: "2006-12-08", title: "Lieutenant governor", note: "Resigned December 8, 2006. The office was vacant until January 8, 2007.", url: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Ohio" },
  { abbr: "OH", name: "Lee Fisher", party: "D", start: "2007-01-08", end: "2011-01-10", title: "Lieutenant governor", url: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Ohio" },
  { abbr: "OH", name: "Mary Taylor", party: "R", start: "2011-01-10", end: "2019-01-14", title: "Lieutenant governor", url: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Ohio" },
  { abbr: "OH", name: "Jon Husted", party: "R", start: "2019-01-14", end: "2025-01-21", title: "Lieutenant governor", note: "Resigned January 21, 2025 for the U.S. Senate. The office was vacant until February 14, 2025.", url: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Ohio" },
  { abbr: "OH", name: "Jim Tressel", party: "R", start: "2025-02-14", end: "2099-01-01", title: "Lieutenant governor", note: "Appointed after Jon Husted went to the U.S. Senate. The November 3, 2026 winner is not seated here.", url: "https://ballotpedia.org/Ohio_Lieutenant_Governor" },
  { abbr: "OK", name: "Matt Pinnell", party: "R", start: "2019-01-14", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "PA", name: "Austin Davis", party: "D", start: "2023-01-17", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "RI", name: "Sabina Matos", party: "D", start: "2021-04-14", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "SC", name: "Pamela Evette", party: "R", start: "2019-01-09", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "SD", name: "Tony Venhuizen", party: "R", start: "2025-01-30", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "TN", name: "Randy McNally", party: "R", start: "2017-01-10", end: "2099-01-01", title: "Lieutenant governor", note: "The Senate speaker holds this title.", url: SRC },
  { abbr: "TX", name: "Dan Patrick", party: "R", start: "2015-01-20", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "UT", name: "Deidre Henderson", party: "R", start: "2021-01-04", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "VT", name: "John Rodgers", party: "R", start: "2025-01-09", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "VA", name: "Ghazala Hashmi", party: "D", start: "2026-01-17", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "WA", name: "Denny Heck", party: "D", start: "2021-01-13", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
  { abbr: "WV", name: "Randy Smith", party: "R", start: "2025-01-08", end: "2099-01-01", title: "Lieutenant governor", note: "The Senate president holds this title.", url: SRC },
  { abbr: "WI", name: "Sara Rodriguez", party: "D", start: "2023-01-03", end: "2099-01-01", title: "Lieutenant governor", url: SRC },
];

export const NO_LIEUTENANT = new Set(["AZ", "ME", "NH", "OR", "WY", "DC", "PR"]);

export function lieutenantOn(asOf: string, abbr: string): Lieutenant | null {
  if (asOf < "2025-01-01") return null;
  const rows = LIEUTENANTS.filter((r) => r.abbr === abbr && r.start <= asOf && asOf < r.end);
  return rows[0] ?? null;
}
