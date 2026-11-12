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

export const RESULTS: ResultRow[] = [
  {
    id: "oh-sen",
    abbr: "OH",
    office: "U.S. Senate · special",
    incumbent: "Jon Husted (R)",
    winner: "Sherrod Brown",
    winnerParty: "D",
    note: `${CALLED}. CNN and NBC projected the race. Brown finishes the term that runs to January 2029.`,
  },
  {
    id: "oh-gov",
    abbr: "OH",
    office: "Governor",
    incumbent: "Mike DeWine (R), term-limited",
    winner: "Amy Acton",
    winnerParty: "D",
    note: `${CALLED}. Ballotpedia News named Acton over Vivek Ramaswamy. Inauguration is still ahead.`,
  },
  {
    id: "ga-gov",
    abbr: "GA",
    office: "Governor",
    incumbent: "Brian Kemp (R), term-limited",
    winner: "Keisha Lance Bottoms",
    winnerParty: "D",
    note: `${CALLED}. Ballotpedia News, 1:30 a.m. ET on Nov 4.`,
  },
  {
    id: "ia-sen",
    abbr: "IA",
    office: "U.S. Senate",
    incumbent: "Joni Ernst (R), not seeking re-election",
    winner: "Josh Turek",
    winnerParty: "D",
    note: `${CALLED}. Roll Call reported Turek defeated Ashley Hinson.`,
  },
  {
    id: "ia-gov",
    abbr: "IA",
    office: "Governor",
    incumbent: "Kim Reynolds (R)",
    winner: "Rob Sand",
    winnerParty: "D",
    note: `${CALLED}. Ballotpedia News named Sand over Zach Lahn. Reynolds was not the nominee.`,
  },
  {
    id: "ks-sen",
    abbr: "KS",
    office: "U.S. Senate",
    incumbent: "Roger Marshall (R)",
    winner: "Adam Hamilton",
    winnerParty: "D",
    note: CALLED,
  },
  {
    id: "me-sen",
    abbr: "ME",
    office: "U.S. Senate",
    incumbent: "Susan Collins (R)",
    winner: "Troy Jackson",
    winnerParty: "D",
    note: CALLED,
  },
  {
    id: "nc-sen",
    abbr: "NC",
    office: "U.S. Senate",
    incumbent: "Thom Tillis (R), not on the general ballot",
    winner: "Roy Cooper",
    winnerParty: "D",
    note: `${CALLED}. Ballotpedia News named Cooper over Michael Whatley.`,
  },
  {
    id: "sc-sen",
    abbr: "SC",
    office: "U.S. Senate",
    incumbent: "Darline Graham (R)",
    winner: "Annie Andrews",
    winnerParty: "D",
    note: `${CALLED}. Graham was appointed after Lindsey Graham's death and remains in the Offices list until a successor is sworn in.`,
  },
  {
    id: "tx-sen",
    abbr: "TX",
    office: "U.S. Senate",
    incumbent: "John Cornyn (R), lost the primary",
    winner: "James Talarico",
    winnerParty: "D",
    note: `${CALLED}. Roll Call reported the general was Talarico against Ken Paxton.`,
  },
  {
    id: "tx-gov",
    abbr: "TX",
    office: "Governor",
    incumbent: "Greg Abbott (R)",
    winner: "Gina Hinojosa",
    winnerParty: "D",
    note: `${CALLED}. Abbott stays governor until the next inauguration. The Offices tab still lists him.`,
  },
];

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
