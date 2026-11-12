/** Place + time resolution for Atlas.
 *  A holder is named when a sourced roster covers that office on that date.
 *  A seat with no source stays blank. Nothing here invents a person or a 2026 winner.
 */

import { COUNTY_FORM, NYC_COUNTY, NO_ATTORNEY, VARYING_COUNTY, attorneyTitle, lowerChamber, upperChamber } from "@/data/county-forms";
import geo from "@/data/geo-states.json";
import {
  CALENDAR,
  OPENINGS,
  activeSeats,
  administrationOn,
  formatSlash,
  type CalEvent,
} from "@/data/civic";
import { membersOn, type Member } from "@/data/congress";
import { governorOn } from "@/data/governors";
import { NO_LIEUTENANT, lieutenantOn } from "@/data/lieutenants";
import { NO_SECRETARY, secretaryOn } from "@/data/secretaries";
import { LEGISLATOR_AS_OF, LEGISLATOR_SOURCE, legislatorsAtLarge, legislatorsOn, type LegChamber } from "@/data/legislators";
import {
  countyHeading,
  gazetteerJurisdiction,
  gazetteerLine,
  isGazetteerState,
  isIndependent,
  matchOhio,
  nearestOhio,
  nearestGovernment,
  ohioById,
  ohioByPlaceId,
  ohioHits,
  ohioKindLabel,
  ohioTitle,
  placeStateName,
  placeWhere,
  verifiedPlaceId,
  type OhioUnit,
} from "@/data/ohio";

export type Confidence = "HIGH" | "MEDIUM" | "UNPUBLISHED";

export type OfficeView = {
  id: string;
  level: "federal" | "state" | "county" | "township" | "municipal" | "education" | "special";
  title: string;
  jurisdiction: string;
  name: string | null;
  party: string | null;
  start: string | null;
  end: string | null;
  url?: string;
  confidence: Confidence;
  source?: string;
  note?: string;
};

export type VacancyView = {
  id: string;
  abbr: string;
  office: string;
  status: "vacant" | "upcoming";
  reason: string;
  since: string;
  process: string;
  resolution: string;
  expected: string;
  source: string;
};

export type CivicEvent = {
  id: string;
  date: string;
  abbr: string | null;
  title: string;
  body: string;
  kind: CalEvent["kind"] | "runoff" | "recall" | "mail";
};

export type TermView = {
  abbr: string;
  office: string;
  rule: string;
  incumbent: string | null;
  status: string;
  eligibleAgain: string;
};

export type Dossier = {
  title: string;
  subtitle: string;
  how: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  abbr: string | null;
  state: string | null;
  county: string | null;
  countyFips: string | null;
  city: string | null;
  placeId: string | null;
  offices: OfficeView[];
  vacancies: VacancyView[];
  elections: CivicEvent[];
  term: TermView | null;
  sources: { name: string; url: string }[];
};

export type Focus = {
  q?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
};

type Holder = {
  name: string;
  party: string | null;
  start: string;
  end: string;
  url?: string;
};

type LocalOffice = {
  id: string;
  level: OfficeView["level"];
  title: string;
  jurisdiction: string;
  holders: Holder[];
  confidence: Exclude<Confidence, "UNPUBLISHED">;
  source: string;
  sourceUrl: string;
  note?: string;
};

type Place = {
  id: string;
  city: string;
  abbr: string;
  county: string;
  countyFips: string;
  lat: number;
  lng: number;
  zips: string[];
  houseDistrict?: number;
  school: { name: string; url: string; note: string };
  specials: { id: string; title: string; note: string; url: string }[];
  offices: LocalOffice[];
};

const V = "2026-09-18";

const PLACES: Place[] = [
  {
    id: "columbus-oh",
    city: "Columbus",
    abbr: "OH",
    county: "Franklin",
    countyFips: "39049",
    lat: 39.9612,
    lng: -82.9988,
    zips: ["43215", "43201", "43206", "43210", "43212"],
    houseDistrict: 3,
    school: {
      name: "Columbus City Schools",
      url: "https://www.ccsoh.us",
      note: "The board is elected. This publish names the district, not a member roll.",
    },
    specials: [
      {
        id: "cota",
        title: "Central Ohio Transit Authority",
        url: "https://www.cota.com",
        note: "Transit authority. The board is appointed, not a mayor's office.",
      },
      {
        id: "cml",
        title: "Columbus Metropolitan Library",
        url: "https://www.columbuslibrary.org",
        note: "Library district. Trustees are appointed.",
      },
      {
        id: "metro-parks",
        title: "Columbus and Franklin County Metro Parks",
        url: "https://www.metroparks.net",
        note: "Park district. The board is appointed by the probate court.",
      },
    ],
    offices: [
      {
        id: "cmh-mayor",
        level: "municipal",
        title: "Mayor",
        jurisdiction: "Columbus",
        confidence: "HIGH",
        source: "City of Columbus, Mayor's office",
        sourceUrl: "https://www.columbus.gov/Government/Mayors-Office/About-Mayor-Andrew-J.-Ginther",
        note: "Council is a separate body and is not listed member by member.",
        holders: [
          { name: "Michael B. Coleman", party: "D", start: "2000-01-01", end: "2016-01-01" },
          {
            name: "Andrew J. Ginther",
            party: "D",
            start: "2016-01-01",
            end: "2028-01-01",
            url: "https://www.columbus.gov/Government/Mayors-Office/About-Mayor-Andrew-J.-Ginther",
          },
        ],
      },
      {
        id: "fr-ogrady",
        level: "county",
        title: "County commissioner",
        jurisdiction: "Franklin County",
        confidence: "HIGH",
        source: "Franklin County Emergency Management executive committee, meetings through October 21, 2026",
        sourceUrl: "https://www.franklincountyohio.gov/Agency-Directory/Emergency-Management-and-Homeland-Security/About-Us/Executive-Committee-Members",
        holders: [{ name: "John O'Grady", party: "D", start: "2017-01-01", end: "2029-01-01" }],
      },
      {
        id: "fr-boyce",
        level: "county",
        title: "County commissioner",
        jurisdiction: "Franklin County",
        confidence: "HIGH",
        source: "Franklin County Emergency Management executive committee, meetings through October 21, 2026",
        sourceUrl: "https://www.franklincountyohio.gov/Agency-Directory/Emergency-Management-and-Homeland-Security/About-Us/Executive-Committee-Members",
        holders: [{ name: "Kevin Boyce", party: "D", start: "2017-01-02", end: "2029-01-01" }],
      },
      {
        id: "fr-crawley",
        level: "county",
        title: "County commissioner",
        jurisdiction: "Franklin County",
        confidence: "HIGH",
        source: "Franklin County Emergency Management executive committee, meetings through October 21, 2026",
        sourceUrl: "https://www.franklincountyohio.gov/Agency-Directory/Emergency-Management-and-Homeland-Security/About-Us/Executive-Committee-Members",
        holders: [{ name: "Erica C. Crawley", party: "D", start: "2021-01-02", end: "2029-01-01" }],
      },
      {
        id: "fr-sheriff",
        level: "county",
        title: "Sheriff",
        jurisdiction: "Franklin County",
        confidence: "HIGH",
        source: "Franklin County Emergency Management executive committee, meetings through October 21, 2026",
        sourceUrl: "https://www.franklincountyohio.gov/Agency-Directory/Emergency-Management-and-Homeland-Security/About-Us/Executive-Committee-Members",
        holders: [{ name: "Dallas Baldwin", party: "R", start: "2021-01-04", end: "2029-01-04" }],
      },
    ],
  },
  place("chicago-il", "Chicago", "IL", "Cook", "17031", 41.8781, -87.6298, ["60601", "60602", "60611"], 7, "Brandon Johnson", "D", "2023-05-15", "2027-05-15", "https://www.chicago.gov/city/en/depts/mayor.html", "Chicago Public Schools", "https://www.cps.edu", [
    { id: "cta", title: "Chicago Transit Authority", note: "Transit authority. The board is appointed.", url: "https://www.transitchicago.com" },
    { id: "mwrd", title: "Metropolitan Water Reclamation District of Greater Chicago", note: "Nine elected commissioners. This publish does not list the roster seat by seat.", url: "https://mwrd.org" },
    { id: "cpd", title: "Chicago Park District", note: "Park district. The board is appointed.", url: "https://www.chicagoparkdistrict.com" },
  ]),
  place("houston-tx", "Houston", "TX", "Harris", "48201", 29.7604, -95.3698, ["77002", "77004", "77019"], 18, "John Whitmire", "D", "2024-01-01", "2028-01-01", "https://www.houstontx.gov/mayor/", "Houston Independent School District", "https://www.houstonisd.org", [
    { id: "metro", title: "Metropolitan Transit Authority of Harris County", note: "Transit authority. The board is appointed.", url: "https://www.ridemetro.org" },
  ]),
  place("philadelphia-pa", "Philadelphia", "PA", "Philadelphia", "42101", 39.9526, -75.1652, ["19102", "19103", "19107"], 3, "Cherelle L. Parker", "D", "2024-01-02", "2028-01-01", "https://www.phila.gov/departments/mayors-office/", "School District of Philadelphia", "https://www.philasd.org", [
    { id: "septa", title: "SEPTA", note: "Regional transit. The board is appointed by the city and the counties.", url: "https://www.septa.org" },
  ]),
  place("phoenix-az", "Phoenix", "AZ", "Maricopa", "04013", 33.4484, -112.074, ["85003", "85004"], 3, "Kate Gallego", "D", "2019-03-21", "2029-01-01", "https://www.phoenix.gov/mayor", "Phoenix Union High School District", "https://www.pxu.org", [
    { id: "valley-metro", title: "Valley Metro", note: "Regional transit. The board is appointed.", url: "https://www.valleymetro.org" },
  ]),
  place("san-francisco-ca", "San Francisco", "CA", "San Francisco", "06075", 37.7793, -122.4193, ["94102", "94103"], 11, "Daniel Lurie", "D", "2025-01-08", "2029-01-08", "https://sf.gov/departments/mayors-office", "San Francisco Unified School District", "https://www.sfusd.edu", [
    { id: "sfmta", title: "San Francisco Municipal Transportation Agency", note: "Transit and streets. The board is appointed.", url: "https://www.sfmta.com" },
  ]),
  place("denver-co", "Denver", "CO", "Denver", "08031", 39.7392, -104.9903, ["80202", "80203"], 1, "Mike Johnston", "D", "2023-07-17", "2027-07-17", "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Mayors-Office", "Denver Public Schools", "https://www.dpsk12.org", [
    { id: "rtd", title: "Regional Transportation District", note: "Elected board. This publish does not list directors seat by seat.", url: "https://www.rtd-denver.com" },
  ]),
  place("nashville-tn", "Nashville", "TN", "Davidson", "47037", 36.1627, -86.7816, ["37201", "37203"], undefined, "Freddie O'Connell", "D", "2023-09-25", "2027-09-01", "https://www.nashville.gov/departments/mayor", "Metro Nashville Public Schools", "https://www.mnps.org", [
    { id: "wego", title: "WeGo Public Transit", note: "Transit. The board is appointed by the mayor.", url: "https://www.wegotransit.com" },
  ]),
  place("jacksonville-fl", "Jacksonville", "FL", "Duval", "12031", 30.3322, -81.6557, ["32202", "32204"], undefined, "Donna Deegan", "D", "2023-07-01", "2027-07-01", "https://www.jacksonville.gov/mayor", "Duval County Public Schools", "https://www.duvalschools.org", [
    { id: "jta", title: "Jacksonville Transportation Authority", note: "Transit authority. The board is appointed.", url: "https://www.jtafla.com" },
  ]),
  place("dallas-tx", "Dallas", "TX", "Dallas", "48113", 32.7767, -96.797, ["75201", "75202"], 30, "Eric Johnson", "R", "2019-06-17", "2027-06-01", "https://dallascityhall.com/government/citymayor/Pages/default.aspx", "Dallas Independent School District", "https://www.dallasisd.org", [
    { id: "dart", title: "Dallas Area Rapid Transit", note: "Transit. The board is appointed by member cities.", url: "https://www.dart.org" },
  ]),
  place("san-diego-ca", "San Diego", "CA", "San Diego", "06073", 32.7157, -117.1611, ["92101"], 51, "Todd Gloria", "D", "2020-12-10", "2028-12-10", "https://www.sandiego.gov/mayor", "San Diego Unified School District", "https://www.sandiegounified.org", [
    { id: "mts", title: "San Diego Metropolitan Transit System", note: "Transit. The board is appointed.", url: "https://www.sdmts.com" },
  ]),
  place("los-angeles-ca", "Los Angeles", "CA", "Los Angeles", "06037", 34.0537, -118.2428, ["90012", "90015"], 34, "Karen Bass", "D", "2022-12-12", "2026-12-14", "https://mayor.lacity.gov", "Los Angeles Unified School District", "https://www.lausd.org", [
    { id: "lametro", title: "Los Angeles County Metropolitan Transportation Authority", note: "Transit. The board is a mix of local officials and appointees.", url: "https://www.metro.net" },
  ]),
  place("cleveland-oh", "Cleveland", "OH", "Cuyahoga", "39035", 41.5052, -81.6934, ["44113", "44114", "44115"], undefined, "Justin M. Bibb", "D", "2022-01-03", "2030-01-03", "https://www.clevelandohio.gov/city-hall", "Cleveland Metropolitan School District", "https://www.clevelandmetroschools.org", [
    { id: "gcrta", title: "Greater Cleveland Regional Transit Authority", note: "Transit authority. The board is appointed.", url: "https://www.riderta.com" },
  ], "Sworn January 3, 2022. Re-elected November 4, 2025. Council is a separate body and is not listed member by member."),
  place("cincinnati-oh", "Cincinnati", "OH", "Hamilton", "39061", 39.1031, -84.512, ["45202", "45206", "45219"], undefined, "Aftab Pureval", "D", "2022-01-04", "2030-01-04", "https://www.cincinnati-oh.gov/mayor/", "Cincinnati Public Schools", "https://www.cps-k12.org", [
    { id: "sorta", title: "Metro / Southwest Ohio Regional Transit Authority", note: "Transit authority. The board is appointed.", url: "https://www.go-metro.com" },
  ], "Sworn January 4, 2022. Next election is November 6, 2029. Council is a separate body and is not listed member by member."),
  place("dayton-oh", "Dayton", "OH", "Montgomery", "39113", 39.7589, -84.1916, ["45402", "45405"], undefined, "Shenise Turner-Sloss", "D", "2026-01-05", "2030-01-06", "https://ohiomayorsalliance.org/our-members/", "Dayton Public Schools", "https://www.dps.k12.oh.us", [
    { id: "gd-rta", title: "Greater Dayton Regional Transit Authority", note: "Transit authority. The board is appointed.", url: "https://www.i-riderta.org" },
  ], "Elected November 2025 and took office January 5, 2026. Commission members are not listed one by one."),
  place("toledo-oh", "Toledo", "OH", "Lucas", "39095", 41.6528, -83.5379, ["43604", "43605"], undefined, "Wade Kapszukiewicz", "D", "2018-01-02", "2030-01-02", "https://ohiomayorsalliance.org/our-members/", "Toledo Public Schools", "https://www.tps.org", [
    { id: "tarta", title: "Toledo Area Regional Transit Authority", note: "Transit authority. The board is appointed.", url: "https://tarta.com" },
  ], "Sworn January 2, 2018. Next election is November 6, 2029. Council is a separate body and is not listed member by member."),
  place("akron-oh", "Akron", "OH", "Summit", "39153", 41.0814, -81.519, ["44304", "44308"], undefined, "Shammas Malik", "D", "2024-01-01", "2028-01-01", "https://ohiomayorsalliance.org/our-members/", "Akron Public Schools", "https://www.akronschools.com", [
    { id: "metro-rta", title: "METRO Regional Transit Authority", note: "Transit authority. The board is appointed.", url: "https://www.akronmetro.org" },
  ], "Next election is November 2, 2027. Council is a separate body and is not listed member by member."),
  place("springfield-oh", "Springfield", "OH", "Clark", "39023", 39.9242, -83.8088, ["45502", "45503", "45504", "45505", "45506"], undefined, "Rob Rue", "R", "2023-11-14", "2028-01-01", "https://springfieldohio.gov/city-of-springfield-ohio-commission/", "Springfield City School District", "https://www.scsdoh.org", [], "Commission-manager city. Sworn November 14, 2023. The city site lists his term through December 31, 2027. Other commissioners are not listed."),
];

function place(
  id: string,
  city: string,
  abbr: string,
  county: string,
  countyFips: string,
  lat: number,
  lng: number,
  zips: string[],
  houseDistrict: number | undefined,
  mayor: string,
  party: string,
  start: string,
  end: string,
  url: string,
  school: string,
  schoolUrl: string,
  specials: Place["specials"],
  mayorNote?: string,
): Place {
  return {
    id,
    city,
    abbr,
    county,
    countyFips,
    lat,
    lng,
    zips,
    houseDistrict,
    school: {
      name: school,
      url: schoolUrl,
      note: "The board is elected. This publish names the district, not a member roll.",
    },
    specials,
    offices: [
      {
        id: `${id}-mayor`,
        level: "municipal",
        title: "Mayor",
        jurisdiction: city,
        confidence: "HIGH",
        source: `${city} mayor's office`,
        sourceUrl: url,
        note: mayorNote ?? "City council is a separate body. Members are not invented here.",
        holders: [{ name: mayor, party, start, end, url }],
      },
    ],
  };
}

const AGS: { abbr: string; name: string; party: string; start: string; url: string; note?: string }[] = [
  { abbr: "OH", name: "Dave Yost", party: "R", start: "2019-01-14", url: "https://www.ohioattorneygeneral.gov", note: "Term-limited. He remains attorney general until a successor is sworn. The November 3, 2026 result is not seated here." },
  { abbr: "IL", name: "Kwame Raoul", party: "D", start: "2019-01-14", url: "https://illinoisattorneygeneral.gov" },
  { abbr: "CA", name: "Rob Bonta", party: "D", start: "2021-04-23", url: "https://oag.ca.gov" },
  { abbr: "NY", name: "Letitia James", party: "D", start: "2019-01-01", url: "https://ag.ny.gov" },
  { abbr: "AZ", name: "Kris Mayes", party: "D", start: "2023-01-02", url: "https://www.azag.gov" },
  { abbr: "GA", name: "Christopher M. Carr", party: "R", start: "2016-11-01", url: "https://law.georgia.gov" },
  { abbr: "CO", name: "Philip J. Weiser", party: "D", start: "2019-01-08", url: "https://coag.gov" },
  { abbr: "PA", name: "Dave Sunday", party: "R", start: "2025-01-21", url: "https://www.attorneygeneral.gov" },
];

/** Governor limits. Virginia cannot serve a consecutive term. Thirteen states have none. */
const TERM_LIMIT: Record<string, { rule: string; eligibleAgain: string }> = {};
for (const abbr of ["CT", "ID", "IL", "IA", "MA", "MN", "NH", "NY", "TX", "UT", "VT", "WA", "WI"]) {
  TERM_LIMIT[abbr] = { rule: "No term limit.", eligibleAgain: "The incumbent may run again." };
}
TERM_LIMIT.VA = {
  rule: "One term. A governor may not succeed themselves.",
  eligibleAgain: "Eligible again only after sitting out a term.",
};
TERM_LIMIT.MT = { rule: "Two consecutive terms, then a two-term pause.", eligibleAgain: "After two terms out." };
for (const abbr of ["IN", "OR", "WY"]) {
  TERM_LIMIT[abbr] = { rule: "Two consecutive terms, then a one-term pause.", eligibleAgain: "After one term out." };
}
for (const abbr of ["AR", "CA", "DE", "MI", "MS", "MO", "NV", "ND", "OK"]) {
  TERM_LIMIT[abbr] = { rule: "Two terms in a lifetime.", eligibleAgain: "Not eligible again after two terms." };
}
for (const abbr of [
  "AL", "AK", "AZ", "CO", "FL", "GA", "HI", "KS", "KY", "LA", "ME", "MD", "NE", "NJ", "NM", "NC", "OH", "PA", "RI", "SC", "SD", "TN", "WV",
]) {
  TERM_LIMIT[abbr] = { rule: "Two consecutive terms.", eligibleAgain: "Eligible again after sitting out a term." };
}

const BLOCKED_2026 = new Set(["AL", "AK", "CA", "CO", "FL", "GA", "OH"]);

/** Ohio row officers and presiding officers. Successors from November 3, 2026 are not seated until sworn. */
const OH_ROW: { id: string; title: string; name: string; party: string; start: string; end: string; url: string; source: string; note: string }[] = [
  {
    id: "OH-auditor",
    title: "Auditor of state",
    name: "Keith Faber",
    party: "R",
    start: "2019-01-11",
    end: "2027-01-11",
    url: "https://ohioauditor.gov",
    source: "Ballotpedia, Ohio Auditor of State, current officeholder as of November 7, 2026",
    note: "Term-limited. He stays auditor until a successor is sworn. Ballotpedia had not called the November 3 race, so no winner is named here.",
  },
  {
    id: "OH-treasurer",
    title: "Treasurer of state",
    name: "Robert Sprague",
    party: "R",
    start: "2019-01-14",
    end: "2027-01-14",
    url: "https://tos.ohio.gov",
    source: "Ballotpedia, Ohio Treasurer, current officeholder as of November 7, 2026",
    note: "Term-limited. He stays treasurer until a successor is sworn. The November 3 result is not seated here.",
  },
  {
    id: "OH-senate-president",
    title: "Senate president",
    name: "Robert McColley",
    party: "R",
    start: "2025-01-06",
    end: "2027-01-04",
    url: "https://ballotpedia.org/2026_Ohio_legislative_session",
    source: "Ballotpedia, 2026 Ohio legislative session",
    note: "Presides over the Ohio Senate for this General Assembly. This is not the senator for a local district.",
  },
  {
    id: "OH-speaker",
    title: "Speaker of the House",
    name: "Matt Huffman",
    party: "R",
    start: "2025-01-06",
    end: "2027-01-04",
    url: "https://ballotpedia.org/2026_Ohio_legislative_session",
    source: "Ballotpedia, 2026 Ohio legislative session",
    note: "Presides over the Ohio House for this General Assembly. A local district is a separate row when the Census file has one.",
  },
];

export type EligibilityRule = {
  id: string;
  office: string;
  age: string;
  citizenship: string;
  residency: string;
  other: string;
};

export const ELIGIBILITY: EligibilityRule[] = [
  {
    id: "president",
    office: "President",
    age: "35",
    citizenship: "Natural-born citizen",
    residency: "14 years a resident of the United States",
    other: "The Twenty-second Amendment limits a person to two elected terms.",
  },
  {
    id: "senate",
    office: "U.S. Senate",
    age: "30",
    citizenship: "Citizen for 9 years",
    residency: "Inhabitant of the state when elected",
    other: "Each state elects two senators, regardless of population.",
  },
  {
    id: "house",
    office: "U.S. House",
    age: "25",
    citizenship: "Citizen for 7 years",
    residency: "Inhabitant of the state when elected",
    other: "Custom, not the Constitution, expects the member to live in the district.",
  },
  {
    id: "governor",
    office: "Governor",
    age: "Usually 30. Check the state constitution.",
    citizenship: "U.S. citizen",
    residency: "A state resident for a period set by that state, often 5 to 7 years",
    other: "Term limits are state law. They are not the same rule in every state.",
  },
  {
    id: "mayor",
    office: "Mayor",
    age: "Usually 18, the age of a qualified elector",
    citizenship: "U.S. citizen where the charter requires it",
    residency: "Must live in the city. Some charters set a minimum number of years.",
    other: "A council-manager city may not elect a mayor with executive power.",
  },
  {
    id: "school",
    office: "School board",
    age: "Qualified elector",
    citizenship: "U.S. citizen",
    residency: "Must live in the district, and sometimes in a subdistrict",
    other: "Many boards are nonpartisan. A seat is local even when the election is in November.",
  },
  {
    id: "sheriff",
    office: "Sheriff",
    age: "Usually 18 or 21",
    citizenship: "U.S. citizen",
    residency: "County resident. Some states require law-enforcement experience.",
    other: "Peace-officer certification is a qualification in several states. It is not universal.",
  },
];

const MAIL: { abbr: string; request: string; back: string; confidence: Confidence }[] = [
  { abbr: "AL", request: "Varies. Apply with the county.", back: "Received by noon on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "AK", request: "Apply with the Division of Elections.", back: "Postmark and receipt rules are the division's. Confirm before relying on a mail date.", confidence: "MEDIUM" },
  { abbr: "AZ", request: "Request early. The 2026 window closed before Election Day.", back: "Received by 7 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "AR", request: "Apply with the county clerk.", back: "Received by 7:30 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "CA", request: "Counties mail a ballot. No request is required for most voters.", back: "Postmarked by Election Day and received inside the state's postmark window.", confidence: "MEDIUM" },
  { abbr: "CO", request: "Every active voter is mailed a ballot.", back: "Received by 7 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "CT", request: "Apply with the town clerk.", back: "Received by the time polls close on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "DE", request: "Apply with the Department of Elections.", back: "Received by the time polls close on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "FL", request: "Vote-by-mail request deadline was 5 p.m. Oct. 22, 2026.", back: "Received by 7 p.m. on Nov. 3, 2026. A postmark is not enough.", confidence: "HIGH" },
  { abbr: "GA", request: "Absentee application deadline was Oct. 23, 2026.", back: "Received by 7 p.m. on Nov. 3, 2026. A postmark is not enough.", confidence: "HIGH" },
  { abbr: "HI", request: "Ballots are mailed statewide.", back: "Received by 7 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "ID", request: "Apply with the county.", back: "Received by 8 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "IL", request: "Apply with the election authority.", back: "Postmark rules belong to the election authority. Do not assume a late postmark counts.", confidence: "MEDIUM" },
  { abbr: "IN", request: "Apply with the county.", back: "Received by 6 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "IA", request: "Apply before the published county deadline.", back: "Received by the time polls close on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "KS", request: "Apply with the county election officer.", back: "A postmark by Election Day is the usual rule, with a receipt window. Confirm the day count.", confidence: "MEDIUM" },
  { abbr: "KY", request: "No-excuse absentee had an October request deadline.", back: "Received by 6 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "LA", request: "Request a mail ballot by the secretary of state's calendar.", back: "Received by 4:30 p.m. on Monday, Nov. 2, 2026, the day before Election Day.", confidence: "HIGH" },
  { abbr: "ME", request: "Apply with the municipality.", back: "Received by 8 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "MD", request: "Apply with the State Board of Elections.", back: "Postmarked by Election Day and received inside the state's window.", confidence: "MEDIUM" },
  { abbr: "MA", request: "Vote by mail is available without an excuse.", back: "Postmarked by Election Day and received inside the state's window.", confidence: "MEDIUM" },
  { abbr: "MI", request: "Apply with the clerk.", back: "Received by 8 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "MN", request: "Apply with the county or the secretary of state.", back: "Received by 8 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "MS", request: "An excuse is required.", back: "Received by the statutory absentee deadline. Confirm with the secretary of state.", confidence: "MEDIUM" },
  { abbr: "MO", request: "Apply with the local election authority.", back: "Received by the time polls close on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "MT", request: "Apply with the county.", back: "Received by 8 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "NE", request: "Apply with the county.", back: "Received by the time polls close on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "NV", request: "Every active voter is mailed a ballot.", back: "Postmarked by Election Day and received inside the state's window.", confidence: "MEDIUM" },
  { abbr: "NH", request: "An excuse is required for an absentee ballot.", back: "Received by 5 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "NJ", request: "Apply with the county clerk.", back: "Postmarked by Election Day and received inside the state's window.", confidence: "MEDIUM" },
  { abbr: "NM", request: "Apply with the county clerk.", back: "Received by 7 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "NY", request: "Apply with the board of elections.", back: "Postmarked by Election Day and received inside the state's window.", confidence: "MEDIUM" },
  { abbr: "NC", request: "Apply with the county board.", back: "Received by 7:30 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "ND", request: "No voter registration. Apply for an absentee ballot with the county.", back: "Confirm the receipt time with the county. This row does not invent an hour.", confidence: "MEDIUM" },
  { abbr: "OH", request: "Application deadline was 7 days before Election Day: Oct. 27, 2026.", back: "Received by 7:30 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "OK", request: "Apply with the county election board.", back: "Received by 7 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "OR", request: "Every active voter is mailed a ballot.", back: "Received by the time polls close on Nov. 3, 2026.", confidence: "MEDIUM" },
  { abbr: "PA", request: "Application deadline was 5 p.m. Oct. 27, 2026.", back: "Received by 8 p.m. on Nov. 3, 2026. A postmark is not enough.", confidence: "HIGH" },
  { abbr: "RI", request: "Apply with the board of canvassers.", back: "Received by 8 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "SC", request: "Apply with the county.", back: "Received by 7 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "SD", request: "Apply with the county auditor.", back: "Received by the time polls close on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "TN", request: "An excuse is required.", back: "Received by the time polls close on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "TX", request: "An excuse is required. Apply with the early-voting clerk.", back: "Receipt rules differ for mail and for hand delivery. Confirm the hour with the county.", confidence: "MEDIUM" },
  { abbr: "UT", request: "Ballots are mailed statewide.", back: "Received by 8 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "VT", request: "Ballots are mailed statewide.", back: "Received by 7 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "VA", request: "Apply with the registrar.", back: "Postmarked by Election Day and received by noon on the third day after.", confidence: "MEDIUM" },
  { abbr: "WA", request: "Every voter is mailed a ballot.", back: "Postmarked by Election Day.", confidence: "MEDIUM" },
  { abbr: "WV", request: "Apply with the county clerk.", back: "Confirm the receipt time with the county clerk.", confidence: "MEDIUM" },
  { abbr: "WI", request: "Apply with the clerk.", back: "Received by 8 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "WY", request: "Apply with the county clerk.", back: "Received by 7 p.m. on Nov. 3, 2026.", confidence: "HIGH" },
  { abbr: "DC", request: "Ballots are mailed to registered voters.", back: "Postmarked by Election Day and received inside the District's window.", confidence: "MEDIUM" },
];

const EXTRA: CivicEvent[] = [
  {
    id: "ca-recall-2003",
    date: "2003-10-07",
    abbr: "CA",
    kind: "recall",
    title: "California gubernatorial recall",
    body: "Gray Davis was recalled. Arnold Schwarzenegger was elected the same day. No statewide recall is qualified on the 2026 calendar.",
  },
  {
    id: "oh-reg",
    date: "2026-10-04",
    abbr: "OH",
    kind: "deadline",
    title: "Ohio voter registration deadline",
    body: "Thirty days before the November 3 general election.",
  },
  {
    id: "oh-mail-ask",
    date: "2026-10-27",
    abbr: "OH",
    kind: "mail",
    title: "Ohio mail-ballot application deadline",
    body: "Seven days before Election Day. A completed ballot still has to arrive by 7:30 p.m. on November 3.",
  },
  {
    id: "pa-mail-ask",
    date: "2026-10-27",
    abbr: "PA",
    kind: "mail",
    title: "Pennsylvania mail-ballot application deadline",
    body: "5 p.m. The completed ballot must be received by 8 p.m. on November 3. A postmark is not enough.",
  },
  {
    id: "fl-mail-ask",
    date: "2026-10-22",
    abbr: "FL",
    kind: "mail",
    title: "Florida vote-by-mail request deadline",
    body: "5 p.m. The ballot must be received by 7 p.m. on November 3.",
  },
  {
    id: "ga-mail-ask",
    date: "2026-10-23",
    abbr: "GA",
    kind: "mail",
    title: "Georgia absentee application deadline",
    body: "The ballot must be received by 7 p.m. on November 3, not merely postmarked.",
  },
  {
    id: "ga-runoff",
    date: "2026-12-01",
    abbr: "GA",
    kind: "runoff",
    title: "Georgia general runoff, if required",
    body: "December 1, 2026, only if a race needs a majority and no one has it. Early voting, if a runoff is called, is a short window in late November.",
  },
  {
    id: "ms-runoff",
    date: "2026-12-01",
    abbr: "MS",
    kind: "runoff",
    title: "Mississippi general runoff, if required",
    body: "December 1, 2026, if a general-election race requires a runoff.",
  },
  {
    id: "la-runoff",
    date: "2026-12-12",
    abbr: "LA",
    kind: "runoff",
    title: "Louisiana open general",
    body: "Saturday, December 12, 2026. Mail ballots for this round are due by 4:30 p.m. on December 11. This is the state's second round, not a guess about who qualified.",
  },
];

const RECALL_STATES = ["AZ", "CA", "CO", "GA", "ID", "IL", "KS", "LA", "MI", "MN", "MT", "NV", "NJ", "ND", "OR", "RI", "WA", "WI"];

export const VACANCY_DETAIL: Record<string, Omit<VacancyView, "id" | "abbr">> = {
  "tx-23": {
    office: "U.S. House · Texas 23rd",
    status: "vacant",
    reason: "Resignation of Tony Gonzales.",
    since: "2026-04-14",
    process: "The governor did not issue a special-election writ.",
    resolution: "The November 3 election fills the next term only. The current seat stays empty until the winner is sworn in.",
    expected: "2027-01-03",
    source: "https://clerk.house.gov",
  },
  "fl-20": {
    office: "U.S. House · Florida 20th",
    status: "vacant",
    reason: "Resignation of Sheila Cherfilus-McCormick.",
    since: "2026-04-21",
    process: "Florida did not call a special election.",
    resolution: "The regular general fills the next term. The seat stays empty until the January 3, 2027 swearing-in.",
    expected: "2027-01-03",
    source: "https://clerk.house.gov",
  },
};

/** [abbr, south, north, west, east] */
const BOXES: [string, number, number, number, number][] = [
  ["DC", 38.79, 38.996, -77.12, -76.91],
  ["RI", 41.14, 42.02, -71.91, -71.12],
  ["DE", 38.45, 39.84, -75.79, -75.05],
  ["CT", 40.98, 42.05, -73.73, -71.79],
  ["NJ", 38.93, 41.36, -75.56, -73.89],
  ["MD", 37.91, 39.72, -79.49, -75.05],
  ["MA", 41.24, 42.89, -73.51, -69.93],
  ["NH", 42.7, 45.31, -72.56, -70.7],
  ["VT", 42.73, 45.02, -73.44, -71.46],
  ["HI", 18.91, 22.24, -160.25, -154.81],
  ["PR", 17.88, 18.52, -67.27, -65.59],
  ["AK", 51.2, 71.4, -179.2, -129.9],
  ["FL", 24.5, 31.0, -87.63, -80.03],
  ["GA", 30.36, 35.0, -85.61, -80.84],
  ["AL", 30.22, 35.01, -88.47, -84.89],
  ["SC", 32.05, 35.22, -83.35, -78.54],
  ["NC", 33.84, 36.59, -84.32, -75.46],
  ["TN", 34.98, 36.68, -90.31, -81.65],
  ["KY", 36.5, 39.15, -89.57, -81.96],
  ["VA", 36.54, 39.47, -83.68, -75.24],
  ["WV", 37.2, 40.64, -82.64, -77.72],
  ["OH", 38.4, 41.98, -84.82, -80.52],
  ["IN", 37.77, 41.76, -88.1, -84.78],
  ["MI", 41.7, 48.19, -90.42, -82.41],
  ["IL", 36.97, 42.51, -91.51, -87.02],
  ["WI", 42.49, 47.08, -92.89, -86.25],
  ["MS", 30.17, 34.99, -91.66, -88.1],
  ["LA", 28.93, 33.02, -94.04, -88.82],
  ["AR", 33.0, 36.5, -94.62, -89.64],
  ["MO", 35.99, 40.61, -95.77, -89.1],
  ["IA", 40.38, 43.5, -96.64, -90.14],
  ["MN", 43.5, 49.38, -97.24, -89.49],
  ["TX", 25.84, 36.5, -106.65, -93.51],
  ["OK", 33.62, 37.0, -103.0, -94.43],
  ["KS", 36.99, 40.0, -102.05, -94.59],
  ["NE", 40.0, 43.0, -104.05, -95.31],
  ["SD", 42.48, 45.95, -104.06, -96.44],
  ["ND", 45.94, 49.0, -104.05, -96.55],
  ["NM", 31.33, 37.0, -109.05, -103.0],
  ["CO", 36.99, 41.0, -109.06, -102.04],
  ["WY", 40.99, 45.01, -111.06, -104.05],
  ["MT", 44.36, 49.0, -116.05, -104.04],
  ["AZ", 31.33, 37.0, -114.81, -109.04],
  ["UT", 36.99, 42.0, -114.05, -109.04],
  ["NV", 35.0, 42.0, -120.01, -114.04],
  ["ID", 41.99, 49.0, -117.24, -111.04],
  ["CA", 32.53, 42.01, -124.41, -114.13],
  ["OR", 41.99, 46.29, -124.57, -116.46],
  ["WA", 45.54, 49.0, -124.73, -116.92],
  ["PA", 39.72, 42.27, -80.52, -74.69],
  ["NY", 40.5, 45.02, -79.76, -71.86],
  ["ME", 43.06, 47.46, -71.08, -66.95],
];

const byAbbr = new Map(geo.states.map((s) => [s.abbr, s]));
const byFips = new Map(geo.places.map((p) => [p.fips, p]));

export function placeById(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}

export function mailRule(abbr: string) {
  return MAIL.find((m) => m.abbr === abbr) ?? null;
}

export function calendarEvents(): CivicEvent[] {
  return [...(CALENDAR as CivicEvent[]), ...EXTRA].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

function stateAt(lat: number, lng: number): string | null {
  let best: { abbr: string; area: number } | null = null;
  for (const [abbr, s, n, w, e] of BOXES) {
    if (lat < s || lat > n || lng < w || lng > e) continue;
    const area = (n - s) * (e - w);
    if (!best || area < best.area) best = { abbr, area };
  }
  return best?.abbr ?? null;
}

function km(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const r = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

function holderOn(holders: Holder[], asOf: string): Holder | null {
  return holders.find((h) => h.start <= asOf && asOf < h.end) ?? null;
}

function officeFromHolder(
  id: string,
  level: OfficeView["level"],
  title: string,
  jurisdiction: string,
  holder: { name: string; party: string | null; start: string; end: string; url?: string } | null,
  confidence: Confidence,
  source: string | undefined,
  note: string | undefined,
): OfficeView {
  return {
    id,
    level,
    title,
    jurisdiction,
    name: holder?.name ?? null,
    party: holder?.party ?? null,
    start: holder?.start ?? null,
    end: holder && holder.end < "2090-01-01" ? holder.end : null,
    url: holder?.url,
    confidence,
    source,
    note,
  };
}

function memberOffice(m: Member, asOf: string): OfficeView {
  const title = m.chamber === "senate" ? "U.S. Senator" : m.district ? `U.S. House · District ${m.district}` : "U.S. House · At large";
  return officeFromHolder(
    m.id,
    "federal",
    title,
    m.abbr,
    { name: m.name, party: m.party, start: m.start, end: m.end, url: m.url },
    "HIGH",
    m.url,
    asOf >= m.end ? "Term ended." : undefined,
  );
}

function unpublished(id: string, level: OfficeView["level"], title: string, jurisdiction: string, note: string): OfficeView {
  return {
    id,
    level,
    title,
    jurisdiction,
    name: null,
    party: null,
    start: null,
    end: null,
    confidence: "UNPUBLISHED",
    note,
  };
}

function localOffices(place: Place, asOf: string, levels: OfficeView["level"][]): OfficeView[] {
  const rows: OfficeView[] = [];
  for (const office of place.offices) {
    if (!levels.includes(office.level)) continue;
    const holder = holderOn(office.holders, asOf);
    rows.push(
      officeFromHolder(
        office.id,
        office.level,
        office.title,
        office.jurisdiction,
        holder,
        holder ? office.confidence : "UNPUBLISHED",
        office.source,
        holder ? office.note : `No published holder on ${formatSlash(asOf)}. ${office.note ?? ""}`.trim(),
      ),
    );
    if (holder?.url && !rows[rows.length - 1].url) rows[rows.length - 1].url = holder.url;
    rows[rows.length - 1].url = holder?.url ?? office.sourceUrl;
    rows[rows.length - 1].source = office.source;
  }
  return rows;
}

function schoolAndSpecial(place: Place, cityScope: boolean): OfficeView[] {
  if (!cityScope) return [];
  const school = unpublished(
    `${place.id}-school`,
    "education",
    `School board · ${place.school.name}`,
    place.city,
    place.school.note,
  );
  school.url = place.school.url;
  school.source = place.school.url;
  const specials = place.specials.map((s) => {
    const row = unpublished(`${place.id}-${s.id}`, "special", s.title, place.city, s.note);
    row.url = s.url;
    row.source = s.url;
    return row;
  });
  return [school, ...specials];
}

function structuralCounty(county: string, abbr: string): OfficeView[] {
  const name = `${county} County`;
  const note = "This office applies. The holder is not in the published roll, so no name is shown.";
  return [
    ["commissioners", "County commissioners"],
    ["sheriff", "Sheriff"],
    ["prosecutor", "Prosecutor"],
    ["clerk", "Clerk"],
    ["auditor", "Auditor"],
    ["treasurer", "Treasurer"],
    ["coroner", "Coroner"],
  ].map(([id, title]) => unpublished(`${abbr}-${county}-${id}`, "county", title, name, note));
}

function structuralCity(city: string, abbr: string): OfficeView[] {
  const note = "This office applies. The holder is not in the published roll, so no name is shown.";
  return [
    unpublished(`${abbr}-${city}-mayor`, "municipal", "Mayor", city, note),
    unpublished(`${abbr}-${city}-council`, "municipal", "City council", city, note),
  ];
}

const CENSUS_GAZETTEER = "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html";
const CENSUS_REL = "https://www.census.gov/geographies/reference-files/time-series/geo/relationship-files.html";
const CENSUS_TIGER = "https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html";

function hawaiiSchool(fips: string): OfficeView {
  const row = unpublished(`HI-${fips}-school`, "education", "School district", "Hawaii Department of Education", "");
  row.note = "Hawaii has one statewide school district. This is not a boundary drawn around the county. The board is not named.";
  row.url = CENSUS_GAZETTEER;
  row.source = "U.S. Census Bureau, 2024 Gazetteer";
  return row;
}

function stampCensus(row: OfficeView, note: string): OfficeView {
  row.note = note;
  row.url = CENSUS_GAZETTEER;
  row.source = "U.S. Census Bureau, 2024 Gazetteer";
  return row;
}

function cdTitle(district: number, abbr?: string): string {
  if (!district && abbr === "PR") return "Resident Commissioner";
  if (!district && (abbr === "DC" || abbr === "AS" || abbr === "GU" || abbr === "MP" || abbr === "VI")) return "Delegate · At large";
  return district ? `U.S. House · District ${district}` : "U.S. House · At large";
}

function stampRel(row: OfficeView, note: string): OfficeView {
  row.note = note;
  row.url = CENSUS_REL;
  row.source = "U.S. Census Bureau, 119th Congress and 2024 state legislative relationship files";
  return row;
}

function stateCountyOffices(county: string, abbr: string, fips: string | null): OfficeView[] {
  const name = countyHeading(county, abbr);
  const note = "The office applies. The holder is not in the published roll, so no name is shown.";
  const row = (id: string, title: string, extra = note) => unpublished(`${abbr}-${fips ?? county}-${id}`, "county", title, name, extra);
  const unit = fips ? ohioById(`${abbr.toLowerCase()}-county-${fips}`) : undefined;
  if (fips && isIndependent(fips)) {
    const cityName = /city$/i.test(county) ? county : `${county} City`;
    return [
      unpublished(
        `${abbr}-${fips}-independent`,
        "county",
        "Independent city",
        cityName,
        "This city is not inside a county. The mayor and the council are the local government. No separate county board is seated.",
      ),
    ];
  }
  if (fips && NYC_COUNTY.has(fips)) {
    return [row("nyc", "New York City", "This county is a borough of New York City. The mayor and the council are citywide. No separate county board is seated.")];
  }
  if (fips === "15005") {
    return [
      row("health", "State administration", "Kalawao County is administered by the Hawaii Department of Health. No elected county board is seated."),
      hawaiiSchool(fips),
    ];
  }
  if (abbr === "HI") {
    return [
      row("mayor", "Mayor", "The holder is not in the published roll on this date."),
      row("council", "County council", "Members are not listed."),
      hawaiiSchool(fips ?? county),
    ];
  }
  if (unit?.func === "N" || unit?.func === "I" || abbr === "CT" || abbr === "RI") {
    return [row("government", "County government", "Census does not list a functioning county government here. No officers are seated.")];
  }
  if (unit?.func === "C" || unit?.func === "B") {
    return [row("consolidated", "Consolidated government", "This county government is consolidated with a municipality. The mayor and the council are on that row when the atlas has one. No separate county board is assumed, and no holder is named.")];
  }
  if (abbr === "IN" && fips === "18097") {
    return [
      row(
        "unigov",
        "Consolidated government",
        "Marion County is consolidated with Indianapolis under Unigov. The mayor and the city-county council are on the Indianapolis row. No holder is named.",
      ),
    ];
  }
  if (abbr === "KY" && (fips === "21111" || fips === "21067")) {
    const city = fips === "21111" ? "Louisville" : "Lexington";
    return [
      row(
        "metro",
        "Consolidated government",
        `${name} is consolidated with ${city}. The mayor and the council are on the city row. No holder is named.`,
      ),
    ];
  }
  if (abbr === "IN") {
    return [
      ["commissioners", "Board of county commissioners"],
      ["council", "County council"],
      ["sheriff", "Sheriff"],
      ["auditor", "Auditor"],
      ["treasurer", "Treasurer"],
      ["clerk", "Clerk"],
      ["coroner", "Coroner"],
      ["prosecutor", "Prosecuting attorney"],
      ["assessor", "Assessor"],
      ["recorder", "Recorder"],
    ].map(([id, title]) => row(id, title));
  }
  if (abbr === "KY") {
    return [
      ["judge", "County judge/executive"],
      ["fiscal", "Fiscal court"],
      ["sheriff", "Sheriff"],
      ["clerk", "County clerk"],
      ["jailer", "Jailer"],
      ["coroner", "Coroner"],
      ["pva", "Property valuation administrator"],
      ["attorney", "County attorney"],
    ].map(([id, title]) => row(id, title));
  }
  if (abbr === "AL") {
    return [
      row("commission", "County commission"),
      row("sheriff", "Sheriff"),
      row("probate", "Judge of probate"),
      row(
        "tax",
        "Property tax office",
        "Some counties elect a revenue commissioner. Others elect a tax assessor and a tax collector. This row does not guess which, and no holder is named.",
      ),
      row("coroner", "Coroner"),
    ];
  }
  if (abbr === "AK") {
    const jurisdiction = county;
    const ak = (id: string, title: string, extra = note) => unpublished(`${abbr}-${fips ?? county}-${id}`, "county", title, jurisdiction, extra);
    if (county.endsWith("Census Area")) {
      return [
        ak(
          "unorganized",
          "Unorganized Borough",
          "This census area is not a borough. Cities here are the local government. No holder is named.",
        ),
      ];
    }
    const unified = /City and Borough|Municipality/.test(county);
    if (unified) {
      const namedSchool = fips ? gazetteerJurisdiction(`ak-boro-${fips}`)?.school : undefined;
      const schoolRow = unpublished(
        `${abbr}-${fips ?? county}-school`,
        "education",
        "School district",
        jurisdiction,
        namedSchool
          ? `${namedSchool} contains the Census point for this borough. This is not a boundary. The board is not named.`
          : "The district is not named on this row. A name is not guessed from the place.",
      );
      if (namedSchool) {
        schoolRow.url = CENSUS_TIGER;
        schoolRow.source = "U.S. Census Bureau, TIGER/Line 2024 unified school districts";
      }
      return [
        ak("mayor", "Mayor", "Unified municipality. The holder is not in the published roll on this date."),
        ak("assembly", "Assembly", "Members are not listed."),
        schoolRow,
      ];
    }
    return [
      ak("assembly", "Borough assembly", "Members are not listed."),
      ak(
        "mayor",
        "Borough mayor",
        "Some boroughs appoint a manager instead of electing a strong mayor. This row does not guess the form. No holder is named.",
      ),
    ];
  }
  if (abbr === "AZ") {
    return [
      ["supervisors", "Board of supervisors"],
      ["sheriff", "Sheriff"],
      ["attorney", "County attorney"],
      ["assessor", "Assessor"],
      ["treasurer", "Treasurer"],
      ["recorder", "Recorder"],
      ["superintendent", "County school superintendent"],
      ["clerk", "Clerk of the superior court"],
    ].map(([id, title]) => row(id, title));
  }
  if (abbr === "DC") {
    return [row("none", "No county", "The District is not inside a county. The mayor and the council are the government. No county board is seated.")];
  }
  if (abbr === "GU") {
    return [row("none", "No county", "Guam is not divided into counties. The municipality is the local government. No county board is seated.")];
  }
  if (abbr === "PR") {
    return [
      row("mayor", "Mayor", "The holder is not in the published roll."),
      row("legislature", "Municipal legislature", "Members are not listed."),
    ];
  }
  if (abbr === "AS" && unit?.func !== "N") {
    return [row("county", "County government", "Census lists an active county. The local title is not guessed. No officer is named.")];
  }
  if (abbr === "MP") {
    return [row("municipal", "Municipal government", "Census lists an active municipality. No officer is named.")];
  }
  const form = COUNTY_FORM[abbr];
  if (form) {
    const caution = VARYING_COUNTY.has(abbr) ? " A charter or home-rule county may use a different body. This list does not guess which." : "";
    return form.map(([id, title], index) => row(id, title, index === 0 ? `${note}${caution}` : note));
  }
  return structuralCounty(county, abbr);
}

/** Offices that exist for this place. Names stay blank. */
function ohioOffices(unit: OhioUnit): OfficeView[] {
  const namedSchool = gazetteerJurisdiction(unit.id)?.school;
  const school = () => {
    const row = unpublished(`${unit.id}-school`, "education", "School district", namedSchool ?? unit.name, "");
    if (!namedSchool) return stampCensus(row, "The district is not named on this row. A name is not guessed from the place.");
    const verb = namedSchool.includes(" and ") ? "contain" : "contains";
    row.note = `${namedSchool} ${verb} the Census point for this place. The corporation may cross another district. This is not a boundary. The board is not named.`;
    row.url = CENSUS_TIGER;
    row.source = "U.S. Census Bureau, TIGER/Line 2024 unified school districts";
    return row;
  };
  if (unit.kind === "township") {
    const jurisdiction = `${unit.name} Township`;
    if (unit.abbr === "IN" && (unit.func === "A" || unit.func === "B")) {
      return [
        stampCensus(
          unpublished(`${unit.id}-trustee`, "township", "Township trustee", jurisdiction, ""),
          "Indiana elects one township trustee. The holder is not in the published roll on this date.",
        ),
        stampCensus(
          unpublished(`${unit.id}-board`, "township", "Township board", jurisdiction, ""),
          "The board applies. Members are not listed.",
        ),
      ];
    }
    if (unit.abbr === "OH" && (unit.func === "A" || unit.func === "B")) {
      return [
        stampCensus(
          unpublished(`${unit.id}-trustees`, "township", "Board of township trustees", jurisdiction, ""),
          "Three seats. No trustee is in the published roll on this date.",
        ),
        stampCensus(
          unpublished(`${unit.id}-fiscal`, "township", "Fiscal officer", jurisdiction, ""),
          "The office applies. The holder is not in the published roll on this date.",
        ),
      ];
    }
    if (unit.func === "A" || unit.func === "B" || unit.func === "G") {
      return [
        stampCensus(
          unpublished(`${unit.id}-board`, "township", "Township board", jurisdiction, ""),
          "The township government is active. Members are not listed. The local title is not guessed.",
        ),
      ];
    }
    const why =
      unit.func === "C"
        ? "Consolidated with another government. No separate trustees are seated."
        : unit.func === "N"
          ? "A legal township with no functioning government. No trustees are seated."
          : unit.func === "I"
            ? "Inactive township government. No trustees are seated."
            : "Census lists the name. It is not a separate township government.";
    return [stampCensus(unpublished(`${unit.id}-gov`, "township", "Township government", jurisdiction, ""), why)];
  }
  if (unit.func !== "A" && unit.func !== "B") {
    const why =
      unit.func === "C"
        ? "Consolidated with another government. No separate board is seated."
        : unit.func === "N"
          ? unit.abbr === "GU"
            ? "Census marks this municipality as nonfunctioning. No mayor is named."
            : unit.abbr === "VI"
              ? "Census marks this town as nonfunctioning. No officers are seated."
              : "Census does not list a functioning government here. No officers are seated."
          : unit.func === "I"
            ? "Inactive government. No officers are seated."
            : "Census lists the name. It is not a separate municipal government.";
    const title =
      unit.abbr === "GU"
        ? "Municipality"
        : unit.kind === "town"
          ? "Town government"
          : unit.kind === "village"
            ? "Village government"
            : unit.kind === "borough"
              ? "Borough government"
              : "Municipal government";
    return [stampCensus(unpublished(`${unit.id}-gov`, "municipal", title, unit.name, ""), why), school()];
  }
  if (unit.abbr === "IN" && unit.kind === "town") {
    return [
      stampCensus(
        unpublished(`${unit.id}-council`, "municipal", "Town council", unit.name, ""),
        "Indiana towns elect a council. A separate mayor is not assumed. Members are not listed.",
      ),
      school(),
    ];
  }
  if (unit.id === "in-place-1836003") {
    return [
      stampCensus(
        unpublished(`${unit.id}-mayor`, "municipal", "Mayor", "Indianapolis", ""),
        "Unigov. The holder is not in the published roll on this date.",
      ),
      stampCensus(
        unpublished(`${unit.id}-council`, "municipal", "City-county council", "Indianapolis", ""),
        "The council applies. Members are not listed. Excluded cities and towns keep their own councils.",
      ),
      school(),
    ];
  }
  if (unit.name === "Lexington" && unit.abbr === "KY" && unit.kind === "city") {
    return [
      stampCensus(
        unpublished(`${unit.id}-mayor`, "municipal", "Mayor", "Lexington", ""),
        "Lexington-Fayette is an urban county. The holder is not in the published roll on this date.",
      ),
      stampCensus(
        unpublished(`${unit.id}-council`, "municipal", "Urban county council", "Lexington", ""),
        "Members are not listed.",
      ),
      school(),
    ];
  }
  if (unit.name === "Louisville" && unit.abbr === "KY" && unit.kind === "city") {
    return [
      stampCensus(
        unpublished(`${unit.id}-mayor`, "municipal", "Mayor", "Louisville", ""),
        "Louisville Metro. The pre-merger city is not a second government. The holder is not in the published roll on this date.",
      ),
      stampCensus(
        unpublished(`${unit.id}-council`, "municipal", "Metro council", "Louisville", ""),
        "Members are not listed.",
      ),
      school(),
    ];
  }
  if (unit.kind === "town" && (unit.abbr === "CT" || unit.abbr === "ME" || unit.abbr === "MA" || unit.abbr === "NH" || unit.abbr === "RI" || unit.abbr === "VT")) {
    return [
      stampCensus(
        unpublished(`${unit.id}-select`, "municipal", "Select board", unit.name, ""),
        "A mayor is not assumed. Some towns elect a first selectman as chair. No holder is named.",
      ),
      school(),
    ];
  }
  if (unit.kind === "town" && unit.abbr === "NY") {
    return [
      stampCensus(
        unpublished(`${unit.id}-supervisor`, "municipal", "Town supervisor", unit.name, ""),
        "The office applies. The holder is not in the published roll on this date.",
      ),
      stampCensus(
        unpublished(`${unit.id}-board`, "municipal", "Town board", unit.name, ""),
        "Members are not listed.",
      ),
      school(),
    ];
  }
  if (unit.kind === "town" && unit.abbr === "WI") {
    return [
      stampCensus(
        unpublished(`${unit.id}-board`, "municipal", "Town board", unit.name, ""),
        "Members are not listed. A mayor is not assumed.",
      ),
      school(),
    ];
  }
  if (unit.kind === "borough" && unit.abbr === "CT") {
    return [
      stampCensus(
        unpublished(`${unit.id}-warden`, "municipal", "Warden", unit.name, ""),
        "The office applies. The holder is not in the published roll on this date.",
      ),
      stampCensus(
        unpublished(`${unit.id}-burgesses`, "municipal", "Board of burgesses", unit.name, ""),
        "Members are not listed.",
      ),
      school(),
    ];
  }
  if (unit.kind === "borough") {
    return [
      stampCensus(
        unpublished(`${unit.id}-mayor`, "municipal", "Mayor", unit.name, ""),
        "The office applies. The holder is not in the published roll on this date.",
      ),
      stampCensus(
        unpublished(`${unit.id}-council`, "municipal", "Borough council", unit.name, ""),
        "Members are not listed.",
      ),
      school(),
    ];
  }
  if (unit.abbr === "AS" && unit.kind === "village") {
    return [
      stampCensus(
        unpublished(`${unit.id}-gov`, "municipal", "Village government", unit.name, ""),
        "Census lists an active village government. The local title is not guessed. No holder is named.",
      ),
      school(),
    ];
  }
  const council = unit.kind === "village" ? "Village council" : unit.kind === "town" ? "Town council" : "City council";
  const mayorNote =
    unit.abbr === "AZ" && unit.kind === "town"
      ? "An Arizona town has a mayor. The council often chooses that mayor. The holder is not named."
      : "The office applies. The holder is not in the published roll on this date.";
  return [
    stampCensus(
      unpublished(`${unit.id}-mayor`, "municipal", "Mayor", unit.name, ""),
      mayorNote,
    ),
    stampCensus(
      unpublished(`${unit.id}-council`, "municipal", council, unit.name, ""),
      "Members are not listed.",
    ),
    school(),
  ];
}

export function termView(asOf: string, abbr: string): TermView | null {
  const rule = TERM_LIMIT[abbr];
  if (!rule) return null;
  const gov = governorOn(asOf, abbr);
  const blocked = asOf >= "2026-01-01" && asOf < "2027-01-20" && BLOCKED_2026.has(abbr);
  let status = rule.eligibleAgain;
  if (blocked && gov) {
    status = `${gov.name} is term-limited for the 2026 election and remains in office until a successor is sworn.`;
  } else if (gov && rule.rule.startsWith("No term")) {
    status = `${gov.name} is not blocked by a term limit.`;
  } else if (gov) {
    status = `${gov.name} is the incumbent. ${rule.eligibleAgain}`;
  }
  return { abbr, office: "Governor", rule: rule.rule, incumbent: gov?.name ?? null, status, eligibleAgain: rule.eligibleAgain };
}

function vacanciesFor(asOf: string, abbr: string | null): VacancyView[] {
  const rows: VacancyView[] = [];
  for (const seat of activeSeats(asOf)) {
    if (abbr && seat.abbr !== abbr) continue;
    const detail = VACANCY_DETAIL[seat.id];
    if (!detail) continue;
    rows.push({ id: seat.id, abbr: seat.abbr, ...detail });
  }
  if (asOf >= "2026-01-01" && asOf < "2027-01-20") {
    for (const opening of OPENINGS) {
      if (abbr && opening.abbr !== abbr) continue;
      rows.push({
        id: opening.id,
        abbr: opening.abbr,
        office: opening.office,
        status: "upcoming",
        reason: opening.body,
        since: "2026-01-01",
        process: "The office is on the November 3, 2026 ballot.",
        resolution: "A successor takes office at the end of the current term. The office is not empty today.",
        expected: opening.expires,
        source: "https://www.nga.org/governors/",
      });
    }
    if (abbr === "OH" || !abbr) {
      if (!rows.some((r) => r.id === "gov-oh")) {
        rows.push({
          id: "gov-oh",
          abbr: "OH",
          office: "Governor",
          status: "upcoming",
          reason: "Mike DeWine is in a second consecutive term and cannot run in 2026.",
          since: "2019-01-14",
          process: "Ohio elects a governor on November 3, 2026.",
          resolution: "The office stays filled until the successor is sworn in January 2027.",
          expected: "2027-01",
          source: "https://www.nga.org/governors/",
        });
      }
    }
    if (abbr === "OH") {
      const rowOffices = [
        { id: "oh-auditor-2026", office: "Auditor of state", reason: "Keith Faber is term-limited. He was not a candidate for auditor." },
        { id: "oh-treasurer-2026", office: "Treasurer of state", reason: "Robert Sprague is term-limited. He was not a candidate for treasurer." },
        { id: "oh-ag-2026", office: "Attorney general", reason: "Dave Yost is term-limited for this office." },
        { id: "oh-sos-2026", office: "Secretary of state", reason: "Frank LaRose is term-limited. He was a candidate for auditor, not for this office." },
      ];
      for (const row of rowOffices) {
        if (rows.some((r) => r.id === row.id)) continue;
        rows.push({
          id: row.id,
          abbr: "OH",
          office: row.office,
          status: "upcoming",
          reason: row.reason,
          since: "2019-01-14",
          process: "The office was on the November 3, 2026 ballot.",
          resolution: "The current holder stays until a successor is sworn in January 2027. An uncalled winner is not named.",
          expected: "2027-01",
          source: "https://www.ohiosos.gov",
        });
      }
    }
  }
  return rows;
}

function legChamber(abbr: string, which: "senate" | "house"): LegChamber | null {
  if (abbr === "NE" || abbr === "DC") return which === "senate" ? "legislature" : null;
  return which === "senate" ? "upper" : "lower";
}

const LEG_NOTE = `Open States current roster, file date ${LEGISLATOR_AS_OF}. That date is the file, not a swearing-in. The November 3, 2026 winner is not added here.`;

function pushDistrictMembers(
  offices: OfficeView[],
  abbr: string,
  stateName: string,
  which: "senate" | "house",
  districts: Array<number | string>,
  asOf: string,
  titleFor: (district: number | string) => string,
): boolean {
  const chamber = legChamber(abbr, which);
  if (!chamber) return false;
  if (asOf < "2025-01-01") {
    offices.push(
      stampRel(
        unpublished(`${abbr}-${which}-past`, "state", titleFor(districts[0] ?? ""), stateName, ""),
        "This is the 2024 district map. Current members are not copied onto an earlier date. A full state-legislative roll from January 1, 2000 is not in this file.",
      ),
    );
    return true;
  }
  const seen = new Set<string>();
  const add = (person: { name: string; party: string; url: string; district: string }, title: string, id: string) => {
    const key = `${person.name}|${person.district}|${title}`;
    if (seen.has(key)) return;
    seen.add(key);
    const row = officeFromHolder(
      id,
      "state",
      title,
      stateName,
      { name: person.name, party: person.party, start: LEGISLATOR_AS_OF, end: "2099-01-01", url: person.url || LEGISLATOR_SOURCE },
      "MEDIUM",
      LEGISLATOR_SOURCE,
      LEG_NOTE,
    );
    row.start = null;
    offices.push(row);
  };
  for (const district of districts) {
    const people = legislatorsOn(abbr, chamber, district);
    if (!people.length) {
      offices.push(
        stampRel(
          unpublished(`${abbr}-${which}-${district}`, "state", titleFor(district), stateName, ""),
          "The district is known. Open States does not list a current member, so the seat stays blank.",
        ),
      );
      continue;
    }
    for (const person of people) {
      add(person, titleFor(district), `${abbr}-${which}-${district}-${person.name}`);
    }
  }
  if (abbr === "DC" || abbr === "PR") {
    for (const person of legislatorsAtLarge(abbr, chamber)) {
      const chair = person.district.toLowerCase().includes("chair");
      const title = chair
        ? "Council chair"
        : which === "senate"
          ? abbr === "DC"
            ? "Council · At large"
            : "Senate · At large"
          : "House · At large";
      add(person, title, `${abbr}-${which}-al-${person.name}`);
    }
  }
  return true;
}

function eventsFor(asOf: string, abbr: string | null): CivicEvent[] {
  return calendarEvents().filter((e) => {
    if (abbr && e.abbr && e.abbr !== abbr) return false;
    if (!abbr && e.abbr && e.kind !== "election" && e.kind !== "deadline" && e.kind !== "term") return false;
    return e.date >= "2000-01-01";
  }).filter((e) => !abbr || e.date >= asOf.slice(0, 4) + "-01-01" || e.kind === "recall");
}

export function resolve(input: {
  asOf: string;
  q?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  abbr?: string | null;
  countyFips?: string | null;
}): Dossier {
  const asOf = input.asOf;
  let place = input.placeId ? placeById(input.placeId) : undefined;
  let ohio = input.placeId ? ohioByPlaceId(input.placeId) : undefined;
  if (!place && ohio) {
    const linked = verifiedPlaceId(ohio);
    if (linked) place = placeById(linked);
  }
  let how = "Selected on the map.";
  let abbr = input.abbr ?? null;
  let countyFips = input.countyFips ?? null;
  let countyName: string | null = null;
  let city: string | null = null;

  if (!place && !ohio && input.q) {
    const parsed = parseQuery(input.q, input.abbr ?? abbr);
    if (parsed.place) {
      place = parsed.place;
      ohio = ohioByPlaceId(parsed.place.id) ?? ohio;
      how = parsed.how;
    } else if (parsed.ohio) {
      ohio = parsed.ohio;
      const linked = verifiedPlaceId(ohio);
      if (linked) place = placeById(linked);
      how = parsed.how;
    } else if (parsed.abbr) {
      abbr = parsed.abbr ?? null;
      countyName = parsed.county ?? null;
      how = parsed.how;
    }
  }
  if (!place && !ohio && input.lat != null && input.lng != null) {
    const hit = nearest(input.lat, input.lng);
    const st = stateAt(input.lat, input.lng);
    if (isGazetteerState(st)) {
      const local = nearestOhio(input.lat, input.lng, st);
      const cityClose = hit && hit.place.abbr === st && hit.km <= 8;
      if (cityClose && hit && (!local || hit.km <= local.km)) {
        place = hit.place;
        ohio = ohioByPlaceId(hit.place.id) ?? ohio;
        how = `This point is ${hit.km.toFixed(1)} km from ${hit.place.city} city hall.`;
      } else if (local && local.km <= 18) {
        ohio = local.unit;
        const linked = verifiedPlaceId(ohio);
        if (linked) place = placeById(linked);
        how = `Nearest Census place is ${ohioTitle(ohio)}, ${local.km.toFixed(1)} km from this point. That is not a boundary.`;
      } else if (hit && hit.km <= 35 && hit.place.abbr === st) {
        place = hit.place;
        how = `This point is ${hit.km.toFixed(1)} km from ${hit.place.city} city hall.`;
      } else {
        const territory = st === "DC" || st === "PR" || st === "AS" || st === "GU" || st === "MP" || st === "VI"
          ? nearestGovernment(input.lat, input.lng, st)
          : null;
        if (territory && territory.km <= 100) {
          ohio = territory.unit;
          how = `Nearest Census government is ${ohioTitle(ohio)}, ${territory.km.toFixed(1)} km from this point. That is not a boundary.`;
        } else {
          abbr = st;
          how = `The point is in ${placeStateName(st)}. No city, town, village, or township centroid is close enough to name.`;
        }
      }
    } else if (hit && hit.km <= 35) {
      place = hit.place;
      how = `This point is ${hit.km.toFixed(1)} km from ${hit.place.city} city hall.`;
    } else {
      abbr = st;
      how = st
        ? `The point is in ${byAbbr.get(st)?.name ?? st}. ${hit ? `Nearest published city is ${hit.place.city}, ${hit.km.toFixed(0)} km away, which is not treated as your city.` : ""}`
        : "That point is outside the states, the District, and Puerto Rico in this atlas.";
    }
  }
  if (place) {
    abbr = place.abbr;
    countyFips = place.countyFips;
    countyName = place.county;
    city = place.city;
  } else if (ohio) {
    abbr = ohio.abbr;
    countyFips = ohio.countyFips;
    countyName = ohio.county;
    city = ohio.kind === "county" ? null : ohio.name;
    if (!how.startsWith("Nearest")) {
      const span = ohio.also?.length ? ` Also in ${ohio.also.join(", ")}.` : "";
      how = `${ohioTitle(ohio)} is in the ${placeStateName(ohio.abbr)} gazetteer. ${gazetteerLine(ohio.abbr)}${span}`;
    }
  } else if (countyFips) {
    const hit = PLACES.find((p) => p.countyFips === countyFips);
    const geoCounty = byFips.get(countyFips);
    countyName = hit?.county ?? geoCounty?.name ?? null;
    abbr = hit?.abbr ?? abbr;
  }

  const state = abbr ? byAbbr.get(abbr) : undefined;
  const offices: OfficeView[] = [];
  const admin = administrationOn(asOf);
  if (!abbr || state) {
    offices.push(
      officeFromHolder(
        "president",
        "federal",
        "President",
        "United States",
        admin ? { name: admin.president, party: admin.party, start: admin.start, end: admin.end } : null,
        admin ? "HIGH" : "UNPUBLISHED",
        "National Archives, presidential administrations",
        admin?.note,
      ),
    );
    offices.push(
      officeFromHolder(
        "vice",
        "federal",
        "Vice president",
        "United States",
        admin ? { name: admin.vice, party: admin.party, start: admin.start, end: admin.end } : null,
        admin ? "HIGH" : "UNPUBLISHED",
        "National Archives, presidential administrations",
        undefined,
      ),
    );
  }

  if (abbr && state) {
    const members = membersOn(asOf, abbr).flatMap((g) => g.members);
    const senators = members.filter((m) => m.chamber === "senate");
    const j = ohio ? gazetteerJurisdiction(ohio.id) : undefined;
    const in119 = asOf >= "2025-01-03" && asOf < "2027-01-03";
    if (in119) {
      for (const m of senators) offices.push(memberOffice(m, asOf));
      if (!senators.length) {
        offices.push(
          unpublished(`${abbr}-senate-us`, "federal", "U.S. Senate", state.name, "No senator is seated on this date."),
        );
      }
    } else {
      offices.push(
        unpublished(
          `${abbr}-senate-us`,
          "federal",
          "U.S. Senate",
          state.name,
          "Senators before January 3, 2025 are in the paid archive. They are not published on this map.",
        ),
      );
    }
    const houseMembers = members.filter((m) => m.chamber === "house");
    const houseOf = (district: number) => houseMembers.find((m) => (m.district ?? 0) === district);
    const pushHouse = (list: Member[], note?: string) => {
      list.forEach((m, i) => {
        const row = memberOffice(m, asOf);
        if (note && i === 0) row.note = row.note ? `${row.note} ${note}` : note;
        offices.push(row);
      });
    };
    if (in119 && j?.cd?.length === 1) {
      const district = j.cd[0] ?? 0;
      const house = houseOf(district);
      if (house) offices.push(memberOffice(house, asOf));
      else {
        offices.push(
          stampRel(
            unpublished(`${abbr}-h-${district}`, "federal", cdTitle(district, abbr), state.name, ""),
            district
              ? `No member is seated for district ${district} on ${formatSlash(asOf)}.`
              : abbr === "PR"
                ? `No resident commissioner is seated on ${formatSlash(asOf)}.`
                : abbr === "DC" || abbr === "AS" || abbr === "GU" || abbr === "MP" || abbr === "VI"
                  ? `No delegate is seated on ${formatSlash(asOf)}.`
                  : `No member is seated for the at-large seat on ${formatSlash(asOf)}.`,
          ),
        );
      }
    } else if (in119 && j?.cd && j.cd.length > 1) {
      const named = j.cd.map((d) => houseOf(d ?? 0)).filter((m): m is Member => Boolean(m));
      if (named.length) {
        pushHouse(
          named,
          `This place meets 119th Congress districts ${j.cd.join(", ")}. Each of those members is named. No one of them covers the whole place.`,
        );
      } else {
        offices.push(
          stampRel(
            unpublished(`${abbr}-house`, "federal", "U.S. House", state.name, ""),
            `This place meets 119th Congress districts ${j.cd.join(", ")}. No member is seated for those districts on ${formatSlash(asOf)}.`,
          ),
        );
      }
    } else if (in119 && place?.houseDistrict) {
      const house = houseOf(place.houseDistrict);
      if (house) offices.push(memberOffice(house, asOf));
      else {
        offices.push(
          unpublished(
            `${abbr}-h-${place.houseDistrict}`,
            "federal",
            `U.S. House · District ${place.houseDistrict}`,
            state.name,
            `No member is seated for this district on ${formatSlash(asOf)}.`,
          ),
        );
      }
    } else if (in119 && houseMembers.length) {
      pushHouse(houseMembers);
    } else {
      offices.push(
        unpublished(
          `${abbr}-house`,
          "federal",
          "U.S. House",
          state.name,
          in119
            ? "No House member is on the roll for this state on this date."
            : "House members before January 3, 2025 are in the paid archive. They are not published on this map.",
        ),
      );
    }
    const executive = abbr === "DC" ? "Mayor" : "Governor";
    const gov = governorOn(asOf, abbr);
    offices.push(
      officeFromHolder(
        `${abbr}-gov`,
        "state",
        executive,
        state.name,
        gov ? { name: gov.name, party: gov.party, start: gov.start, end: gov.end, url: gov.url } : null,
        gov ? "HIGH" : "UNPUBLISHED",
        gov?.url,
        gov ? undefined : abbr === "DC" ? "No mayor is on the public roll for this date." : "No governor is on the public roll for this date.",
      ),
    );
    if (!NO_LIEUTENANT.has(abbr)) {
      const lg = lieutenantOn(asOf, abbr);
      offices.push(
        officeFromHolder(
          `${abbr}-lg`,
          "state",
          lg?.title ?? "Lieutenant governor",
          state.name,
          lg ? { name: lg.name, party: lg.party, start: lg.start, end: lg.end, url: lg.url } : null,
          lg ? "HIGH" : "UNPUBLISHED",
          lg?.url,
          lg?.note,
        ),
      );
    }
    if (!NO_SECRETARY.has(abbr)) {
      const sos = secretaryOn(asOf, abbr);
      offices.push(
        officeFromHolder(
          `${abbr}-sos`,
          "state",
          "Secretary of state",
          state.name,
          sos ? { name: sos.name, party: sos.party, start: sos.start, end: "2099-01-01", url: sos.url } : null,
          sos ? "HIGH" : "UNPUBLISHED",
          sos?.url,
          sos?.note,
        ),
      );
    }
    if (!NO_ATTORNEY.has(abbr)) {
      const ag = asOf >= "2025-01-01" ? AGS.find((a) => a.abbr === abbr && a.start <= asOf) : undefined;
      const title = attorneyTitle(abbr);
      if (ag) {
        offices.push(
          officeFromHolder(
            `${abbr}-ag`,
            "state",
            title,
            state.name,
            { name: ag.name, party: ag.party, start: ag.start, end: "2027-01-20", url: ag.url },
            "HIGH",
            ag.url,
            ag.note,
          ),
        );
      } else {
        offices.push(
          unpublished(
            `${abbr}-ag`,
            "state",
            title,
            state.name,
            abbr === "PR"
              ? "The office applies. The secretary is not in the published roll."
              : "The office applies. This attorney general is not in the published roll.",
          ),
        );
      }
    }
    if (j?.senate?.length) {
      pushDistrictMembers(offices, abbr, state.name, "senate", j.senate, asOf, (district) => upperChamber(abbr, district));
    } else {
      offices.push(
        unpublished(
          `${abbr}-senate`,
          "state",
          upperChamber(abbr),
          state.name,
          abbr === "GU" || abbr === "VI"
            ? "The legislature is elected territory-wide. Census does not publish a 2024 district. No member is named."
            : abbr === "AS"
              ? "The Fono has a senate. Census does not publish a 2024 district. No member is named."
              : abbr === "MP"
                ? "The Commonwealth has a senate. Census does not publish a 2024 district. No member is named."
                : abbr === "NE"
                  ? "Nebraska has one legislative chamber. A district is named only when the place is inside one."
                  : abbr === "OH"
                    ? "The Senate president is listed separately. A local senate district still applies, and this atlas does not invent the district number or the member."
                    : "A state senate district applies once a point is inside it. This atlas does not invent the district number or the member.",
        ),
      );
    }
    if (abbr === "OH") {
      for (const row of OH_ROW) {
        const seated = asOf >= "2025-01-01" && row.start <= asOf && asOf < row.end;
        offices.push(
          officeFromHolder(
            row.id,
            "state",
            row.title,
            state.name,
            seated ? { name: row.name, party: row.party, start: row.start, end: row.end, url: row.url } : null,
            seated ? "HIGH" : "UNPUBLISHED",
            row.source,
            seated ? row.note : `No published holder on ${formatSlash(asOf)}.`,
          ),
        );
      }
    }
    if (j?.house?.length) {
      pushDistrictMembers(offices, abbr, state.name, "house", j.house, asOf, (district) => lowerChamber(abbr, district));
    } else if (abbr !== "NE" && abbr !== "DC" && abbr !== "GU" && abbr !== "VI") {
      offices.push(
        unpublished(
          `${abbr}-house-state`,
          "state",
          lowerChamber(abbr),
          state.name,
          abbr === "AS"
            ? "The Fono has a house. Census does not publish a 2024 district. No member is named."
            : abbr === "MP"
              ? "The Commonwealth has a house. Census does not publish a 2024 district. No member is named."
              : abbr === "OH"
                ? "The Speaker is listed separately. A local house district still applies, and this atlas does not invent the district number or the member."
                : "A state house district applies once a point is inside it. This atlas does not invent the district number or the member.",
        ),
      );
    }
  }

  const countyPlace = place ?? PLACES.find((p) => countyFips && p.countyFips === countyFips);
  if (countyPlace && countyName) {
    const verifiedCounty = localOffices(countyPlace, asOf, ["county"]);
    if (verifiedCounty.length) offices.push(...verifiedCounty);
    else offices.push(...stateCountyOffices(countyName, countyPlace.abbr, countyFips));
  } else if (countyName && abbr) {
    offices.push(...stateCountyOffices(countyName, abbr, countyFips));
  }

  if (ohio?.kind === "county" && !offices.some((o) => o.level === "education")) {
    const namedSchool = gazetteerJurisdiction(ohio.id)?.school;
    if (namedSchool) {
      const row = unpublished(`${ohio.id}-school`, "education", "School district", namedSchool, "");
      row.note = `${namedSchool} contains the Census point. This is not a boundary. The board is not named.`;
      row.url = CENSUS_TIGER;
      row.source = "U.S. Census Bureau, TIGER/Line 2024 unified school districts";
      offices.push(row);
    }
  }

  if (place) {
    offices.push(...localOffices(place, asOf, ["municipal"]));
    offices.push(...schoolAndSpecial(place, true));
    if (!offices.some((o) => o.level === "municipal" && (o.title === "City council" || o.title === "City commission"))) {
      const commission = place.id === "springfield-oh" || place.id === "dayton-oh";
      offices.push(
        unpublished(
          `${place.id}-council`,
          "municipal",
          commission ? "City commission" : "City council",
          place.city,
          commission ? "Only the mayor is named. The other commissioners are not listed." : "The council applies. Members are not invented.",
        ),
      );
    }
  } else if (ohio && ohio.kind !== "county" && !(ohio.kind === "borough" && ohio.abbr === "AK")) {
    offices.push(...ohioOffices(ohio));
  } else if (city && abbr && !(ohio?.kind === "borough" && ohio.abbr === "AK")) {
    offices.push(...structuralCity(city, abbr));
  }

  const sources: { name: string; url: string }[] = [];
  for (const office of offices) {
    if (office.url && office.source) {
      if (!sources.some((s) => s.url === office.url)) sources.push({ name: office.source, url: office.url });
    }
  }
  if (place) {
    sources.push({ name: place.school.name, url: place.school.url });
    for (const s of place.specials) sources.push({ name: s.title, url: s.url });
  }

  const named = offices.filter((o) => o.name).length;
  const confidence: Dossier["confidence"] = named >= 6 ? "HIGH" : named >= 2 ? "MEDIUM" : "LOW";
  const also = ohio?.also?.length ? ` · also ${ohio.also.join(", ")}` : "";
  const akBorough = ohio?.kind === "borough" && ohio.abbr === "AK";
  const title = place
    ? place.city
    : ohio && ohio.kind !== "county" && !akBorough
      ? ohioTitle(ohio)
      : countyName
        ? akBorough && ohio
          ? ohio.name
          : countyHeading(countyName, abbr ?? ohio?.abbr ?? "")
        : state?.name ?? "United States";
  const subtitle = place
    ? `${place.county} County, ${state?.name ?? place.abbr}${also}`
    : ohio && ohio.kind !== "county"
      ? `${placeWhere(ohio)}${akBorough ? "" : `, ${placeStateName(ohio.abbr)}`}${also}`
      : countyName
        ? `${state?.name ?? abbr}`
        : state
          ? "State government, plus the federal offices that cover it"
          : "Federal government";

  return {
    title,
    subtitle,
    how: how.trim(),
    confidence,
    abbr,
    state: state?.name ?? null,
    county: countyName,
    countyFips,
    city,
    placeId: place?.id ?? ohio?.id ?? null,
    offices,
    vacancies: vacanciesFor(asOf, abbr),
    elections: eventsFor(asOf, abbr).slice(0, 12),
    term: abbr ? termView(asOf, abbr) : null,
    sources,
  };
}

function nearest(lat: number, lng: number): { place: Place; km: number } | null {
  let best: { place: Place; km: number } | null = null;
  for (const p of PLACES) {
    const d = km(lat, lng, p.lat, p.lng);
    if (!best || d < best.km) best = { place: p, km: d };
  }
  return best;
}

function parseQuery(raw: string, prefer?: string | null): { place?: Place; ohio?: OhioUnit; abbr?: string; county?: string; how: string } {
  const q = raw.trim().toLowerCase().replace(/\./g, "");
  const zip = q.match(/\b(\d{5})(?:-\d{4})?\b/);
  if (zip) {
    const place = PLACES.find((p) => p.zips.includes(zip[1] ?? ""));
    if (place) return { place, how: `ZIP ${zip[1]} is published for ${place.city}.` };
  }
  const ohio = matchOhio(raw, prefer);
  if (ohio) {
    const bare = q.replace(/,/g, " ").replace(/\s+/g, " ").trim();
    const published = PLACES.filter((p) => p.city.toLowerCase() === bare);
    const namedHere = raw.toLowerCase().includes(placeStateName(ohio.abbr).toLowerCase());
    if (published.length === 1 && published[0]?.abbr !== ohio.abbr && !namedHere && prefer !== ohio.abbr) {
      const city = published[0];
      return { place: city, how: `Matched the published city ${city.city}, ${city.abbr}.` };
    }
    const where = ohio.kind === "county" || ohio.kind === "borough" ? placeStateName(ohio.abbr) : `${placeWhere(ohio)}, ${placeStateName(ohio.abbr)}`;
    return { ohio, how: `Matched ${ohioTitle(ohio)}, ${where}.` };
  }
  const state = geo.states.find((s) => q.endsWith(` ${s.abbr.toLowerCase()}`) || q.endsWith(`, ${s.abbr.toLowerCase()}`) || q === s.name.toLowerCase() || q === s.abbr.toLowerCase());
  const cityPart = q.replace(/,/g, " ").replace(/\s+/g, " ").replace(/\b(county|parish|borough)\b/g, "").trim();
  for (const p of PLACES) {
    const name = p.city.toLowerCase();
    if (cityPart === name || cityPart.startsWith(`${name} `) || q.includes(name)) {
      if (!state || state.abbr === p.abbr) return { place: p, how: `Matched the published city ${p.city}, ${p.abbr}.` };
    }
  }
  if (state && /\bcounty\b|\bparish\b/.test(q)) {
    const county = q.replace(state.name.toLowerCase(), "").replace(state.abbr.toLowerCase(), "").replace(/\bcounty\b|\bparish\b|,/g, "").trim();
    const geoCounty = geo.places.find((p) => p.st === state.fips && p.name.toLowerCase() === county);
    if (geoCounty) return { abbr: state.abbr, county: geoCounty.name, how: `Matched ${geoCounty.name} County, ${state.abbr}.` };
  }
  if (state && q === state.name.toLowerCase()) return { abbr: state.abbr, how: `Matched ${state.name}.` };
  return { how: "No published city matched. The map selection still applies." };
}

export function focusHits(query: string): {
  id: string;
  label: string;
  hint: string;
  abbr: string;
  placeId: string;
  county: string;
  fips: string;
  x: number;
  y: number;
}[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const zip = q.match(/\b\d{5}\b/);
  const tokens = q.split(/[^a-z0-9]+/).filter(Boolean);
  const hits: ReturnType<typeof hit>[] = [];
  const seen = new Set<string>();
  for (const unit of ohioHits(query, 8)) {
    const placeId = verifiedPlaceId(unit) ?? unit.id;
    if (seen.has(placeId)) continue;
    seen.add(placeId);
    const pt = byFips.get(unit.countyFips);
    const where = placeWhere(unit);
    hits.push({
      id: `ohio-${unit.id}`,
      label: unit.kind === "county" ? countyHeading(unit.name, unit.abbr) : unit.name,
      hint: `${unit.abbr} · ${ohioKindLabel(unit.kind)} · ${where}${unit.also?.length ? ` · also ${unit.also.join(", ")}` : ""}`,
      abbr: unit.abbr,
      placeId,
      county: unit.county,
      fips: unit.countyFips,
      x: pt?.x ?? 0,
      y: pt?.y ?? 0,
    });
  }
  for (const p of PLACES) {
    const city = p.city.toLowerCase();
    const abbr = p.abbr.toLowerCase();
    const county = p.county.toLowerCase();
    if (zip && p.zips.includes(zip[0] ?? "")) {
      hits.push(hit(p));
      continue;
    }
    const cityHit = city.includes(q) || tokens.includes(city) || tokens.some((t) => t.length >= 3 && city.startsWith(t));
    const countyHit = tokens.includes(county) && (tokens.includes(abbr) || q.includes("county"));
    if (cityHit || countyHit) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      hits.push(hit(p));
    }
  }
  const bare = q.replace(/,/g, " ").replace(/\s+/g, " ").trim();
  const publishedExact = new Set(PLACES.filter((p) => p.city.toLowerCase() === bare).map((p) => p.id));
  const namesState = geo.states.some((s) => q.includes(s.name.toLowerCase()));
  if (publishedExact.size && !namesState) {
    hits.sort((a, b) => Number(publishedExact.has(b.placeId)) - Number(publishedExact.has(a.placeId)));
  }
  return hits.slice(0, 8);
}

function hit(p: Place) {
  const pt = byFips.get(p.countyFips);
  return {
    id: `city-${p.id}`,
    label: p.city,
    hint: `${p.abbr} · ${p.county} County · full government`,
    abbr: p.abbr,
    placeId: p.id,
    county: p.county,
    fips: p.countyFips,
    x: pt?.x ?? 0,
    y: pt?.y ?? 0,
  };
}

export function compareDossiers(left: Dossier, right: Dossier): { office: string; onDate: string; onCompare: string }[] {
  const ids = new Set([...left.offices.map((o) => o.id), ...right.offices.map((o) => o.id)]);
  const changes = [];
  for (const id of ids) {
    const a = left.offices.find((o) => o.id === id);
    const b = right.offices.find((o) => o.id === id);
    const onDate = a?.name ?? "—";
    const onCompare = b?.name ?? "—";
    if (onDate === onCompare) continue;
    const level = a?.level ?? b?.level;
    const title = a?.title ?? b?.title ?? "Office";
    const keepBlank = level === "municipal" || level === "township" || level === "county" || title === "President" || title === "Vice president" || title === "Governor";
    if ((onDate === "—" || onCompare === "—") && !keepBlank) continue;
    changes.push({ office: title, onDate, onCompare });
  }
  return changes.slice(0, 16);
}

export type Follow = { id: string; label: string; abbr: string | null; placeId?: string };

export function alertsFor(follows: Follow[], asOf: string): { id: string; title: string; body: string; date: string }[] {
  if (follows.length === 0) return [];
  const rows: { id: string; title: string; body: string; date: string }[] = [];
  for (const follow of follows) {
    const events = calendarEvents().filter((e) => e.date >= asOf && (!e.abbr || e.abbr === follow.abbr));
    for (const e of events.slice(0, 3)) {
      rows.push({
        id: `${follow.id}-${e.id}`,
        title: `${follow.label} · ${e.title}`,
        body: e.body,
        date: e.date,
      });
    }
    for (const v of vacanciesFor(asOf, follow.abbr)) {
      rows.push({
        id: `${follow.id}-${v.id}`,
        title: `${follow.label} · ${v.status === "vacant" ? "Vacant" : "Upcoming"} · ${v.office}`,
        body: `${v.reason} ${v.resolution}`,
        date: v.expected.length === 7 ? `${v.expected}-01` : v.expected,
      });
    }
  }
  const seen = new Set<string>();
  return rows.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true))).slice(0, 12);
}

export function recallNote(abbr: string | null): string {
  if (!abbr) return "Eighteen states on this list allow a recall of at least some state officers. None is qualified for 2026 in the loaded calendar.";
  if (RECALL_STATES.includes(abbr)) return `${abbr} allows recall of at least some state officers. None is qualified for 2026 in the loaded calendar. The 2003 California recall stays on the historical calendar.`;
  return `${abbr} is not on the loaded recall list. That is not a ruling that recall is impossible. It means this publish has no qualified recall.`;
}
