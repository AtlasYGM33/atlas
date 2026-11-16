/** Candidates, resignations, and called races for the Candidates tab.
 *  A called winner is not seated. A resignation does not invent the next person.
 *  Nothing here is a canvass. */

import { PEOPLE, SEATS } from "@/data/civic";
import { RESULTS } from "@/data/results";

export type CandidateStatus = "holding" | "resigned" | "called" | "candidate" | "not-seeking";

export type CandidateRecord = {
  id: string;
  abbr: string;
  office: string;
  name: string;
  party: string | null;
  status: CandidateStatus;
  from: string;
  until: string;
  note: string;
  source: string;
};

const SOURCED: CandidateRecord[] = [
  {
    id: "oh-lg-husted",
    abbr: "OH",
    office: "Lieutenant governor",
    name: "Jon Husted",
    party: "R",
    status: "resigned",
    from: "2025-01-21",
    until: "2099-01-01",
    note: "Resigned for the U.S. Senate. The office was vacant until February 14, 2025. He is not removed from the Senate roster by this row.",
    source: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Ohio",
  },
  {
    id: "oh-lg-tressel",
    abbr: "OH",
    office: "Lieutenant governor",
    name: "Jim Tressel",
    party: "R",
    status: "holding",
    from: "2025-02-14",
    until: "2099-01-01",
    note: "Appointed. The November 3, 2026 winner is not seated on this row.",
    source: "https://ballotpedia.org/Ohio_Lieutenant_Governor",
  },
  {
    id: "hi-lg-luke",
    abbr: "HI",
    office: "Lieutenant governor",
    name: "Sylvia Luke",
    party: "D",
    status: "holding",
    from: "2026-04-23",
    until: "2099-01-01",
    note: "On leave. Keith Regan is the acting lieutenant governor. This is not a resignation and not a vacancy.",
    source: "https://ballotpedia.org/Keith_Regan",
  },
  {
    id: "oh-sos-larose",
    abbr: "OH",
    office: "Secretary of state",
    name: "Frank LaRose",
    party: "R",
    status: "not-seeking",
    from: "2026-11-03",
    until: "2027-01-20",
    note: "Term-limited. He remains secretary of state until a successor is sworn. No 2026 winner is seated.",
    source: "https://en.wikipedia.org/wiki/Secretary_of_state_(U.S._state_government)",
  },
  {
    id: "oh-ag-yost",
    abbr: "OH",
    office: "Attorney general",
    name: "Dave Yost",
    party: "R",
    status: "not-seeking",
    from: "2026-11-03",
    until: "2027-01-20",
    note: "Term-limited. He remains attorney general until a successor is sworn.",
    source: "https://www.ohioattorneygeneral.gov",
  },
  {
    id: "oh-aud-faber",
    abbr: "OH",
    office: "Auditor of state",
    name: "Keith Faber",
    party: "R",
    status: "not-seeking",
    from: "2026-11-03",
    until: "2027-01-11",
    note: "Term-limited. He stays until a successor is sworn. The November 3 race was not called in this file.",
    source: "https://ohioauditor.gov",
  },
  {
    id: "oh-tos-sprague",
    abbr: "OH",
    office: "Treasurer of state",
    name: "Robert Sprague",
    party: "R",
    status: "not-seeking",
    from: "2026-11-03",
    until: "2027-01-14",
    note: "Term-limited. He stays until a successor is sworn. The November 3 result is not seated.",
    source: "https://tos.ohio.gov",
  },
];

const FROM_SEATS: CandidateRecord[] = SEATS.map((seat) => ({
  id: `${seat.id}-resigned`,
  abbr: seat.abbr,
  office: seat.label,
  name: seat.abbr === "TX" ? "Tony Gonzales" : "Sheila Cherfilus-McCormick",
  party: null,
  status: "resigned" as const,
  from: seat.resigned,
  until: "2027-01-03",
  note: seat.body,
  source: "https://www.house.gov",
}));

const FROM_PEOPLE: CandidateRecord[] = PEOPLE.map((person) => ({
  id: person.id,
  abbr: person.abbr,
  office: person.race,
  name: person.name,
  party: person.party,
  status: "candidate" as const,
  from: "2026-01-01",
  until: "2027-01-03",
  note: "On the ballot for the open seat. Not sworn in. Not treated as the winner.",
  source: "Atlas candidate list for the vacant House seats",
}));

const FROM_CALLS: CandidateRecord[] = RESULTS.map((row) => ({
  id: `${row.id}-called`,
  abbr: row.abbr,
  office: row.office,
  name: row.winner,
  party: row.winnerParty,
  status: "called" as const,
  from: "2026-11-03",
  until: "2027-01-20",
  note: `${row.note} Incumbent ${row.incumbent}. Not certified and not sworn in.`,
  source: "News call recorded in the results list. Not a certificate.",
}));

const ALL = [...SOURCED, ...FROM_SEATS, ...FROM_PEOPLE, ...FROM_CALLS];

export function candidatesOn(asOf: string, abbr: string | null): CandidateRecord[] {
  return ALL.filter((row) => row.from <= asOf && asOf < row.until && (!abbr || row.abbr === abbr)).sort((a, b) => {
    if (a.abbr !== b.abbr) return a.abbr.localeCompare(b.abbr);
    if (a.office !== b.office) return a.office.localeCompare(b.office);
    return a.name.localeCompare(b.name);
  });
}

export const CANDIDATE_LABEL: Record<CandidateStatus, string> = {
  holding: "Still in office",
  resigned: "Resigned",
  called: "Called, not sworn",
  candidate: "Candidate",
  "not-seeking": "Incumbent, not seeking this office",
};
