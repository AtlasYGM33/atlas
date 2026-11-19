/** Paid archive, one decade at a time.
 *  The public map keeps verified names from 2024-01-01 forward.
 *  A decade marked not-aggregated has no election roll. Do not invent one.
 *  The only pre-2024 rows here are lieutenant-governor gaps already sourced in the lieutenant file. */

export type DecadeStatus = "not-aggregated" | "partial";

export type Decade = {
  id: string;
  start: string;
  end: string;
  status: DecadeStatus;
  note: string;
};

export type ArchiveElection = {
  id: string;
  decade: string;
  abbr: string;
  office: string;
  name: string | null;
  status: "resigned" | "vacant" | "seated";
  from: string;
  until: string;
  source: string;
};

export const DECADES: Decade[] = [
  ["1900s", "1900-01-01", "1910-01-01"],
  ["1910s", "1910-01-01", "1920-01-01"],
  ["1920s", "1920-01-01", "1930-01-01"],
  ["1930s", "1930-01-01", "1940-01-01"],
  ["1940s", "1940-01-01", "1950-01-01"],
  ["1950s", "1950-01-01", "1960-01-01"],
  ["1960s", "1960-01-01", "1970-01-01"],
  ["1970s", "1970-01-01", "1980-01-01"],
  ["1980s", "1980-01-01", "1990-01-01"],
  ["1990s", "1990-01-01", "2000-01-01"],
].map(([id, start, end]) => ({
  id,
  start,
  end,
  status: "not-aggregated" as const,
  note: "No election roll has been aggregated for this decade.",
}));

DECADES.push(
  {
    id: "2000s",
    start: "2000-01-01",
    end: "2010-01-01",
    status: "partial",
    note: "Ohio and Indiana lieutenant governor gaps only. No vote totals.",
  },
  {
    id: "2010s",
    start: "2010-01-01",
    end: "2020-01-01",
    status: "partial",
    note: "Indiana lieutenant governor resignation only. No vote totals.",
  },
  {
    id: "2020-2023",
    start: "2020-01-01",
    end: "2024-01-01",
    status: "partial",
    note: "The public map starts 2024-01-01. The private pack now has a partial 2022 U.S. Senate seated roll for this slice. Not a full canvass.",
  },
);

/** Sourced rows before the public floor. Names already checked. Not a ballot return. */
export const ARCHIVE_ELECTIONS: ArchiveElection[] = [
  {
    id: "oh-lg-oconnor",
    decade: "2000s",
    abbr: "OH",
    office: "Lieutenant governor",
    name: "Maureen O'Connor",
    status: "resigned",
    from: "2002-12-31",
    until: "2003-01-13",
    source: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Ohio",
  },
  {
    id: "oh-lg-gap-2003",
    decade: "2000s",
    abbr: "OH",
    office: "Lieutenant governor",
    name: null,
    status: "vacant",
    from: "2003-01-01",
    until: "2003-01-13",
    source: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Ohio",
  },
  {
    id: "in-lg-gap-2003",
    decade: "2000s",
    abbr: "IN",
    office: "Lieutenant governor",
    name: null,
    status: "vacant",
    from: "2003-09-13",
    until: "2003-10-20",
    source: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Indiana",
  },
  {
    id: "oh-lg-johnson",
    decade: "2000s",
    abbr: "OH",
    office: "Lieutenant governor",
    name: "Bruce E. Johnson",
    status: "resigned",
    from: "2006-12-08",
    until: "2007-01-08",
    source: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Ohio",
  },
  {
    id: "oh-lg-gap-2006",
    decade: "2000s",
    abbr: "OH",
    office: "Lieutenant governor",
    name: null,
    status: "vacant",
    from: "2006-12-08",
    until: "2007-01-08",
    source: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Ohio",
  },
  {
    id: "in-lg-ellspermann",
    decade: "2010s",
    abbr: "IN",
    office: "Lieutenant governor",
    name: "Sue Ellspermann",
    status: "resigned",
    from: "2016-03-02",
    until: "2016-03-03",
    source: "https://en.wikipedia.org/wiki/Lieutenant_Governor_of_Indiana",
  },
];

export function archiveElectionsIn(decade: string): ArchiveElection[] {
  return ARCHIVE_ELECTIONS.filter((row) => row.decade === decade);
}
