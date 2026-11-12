/** Structural county offices. No holder is stored here. */

export const COUNTY_FORM: Record<string, [string, string][]> = {
  AR: [["judge", "County judge"], ["quorum", "Quorum court"], ["sheriff", "Sheriff"], ["clerk", "County clerk"], ["treasurer", "Treasurer"], ["collector", "Collector"], ["assessor", "Assessor"], ["coroner", "Coroner"]],
  CA: [["supervisors", "Board of supervisors"], ["sheriff", "Sheriff"], ["attorney", "District attorney"], ["assessor", "Assessor"], ["clerk", "County clerk"], ["auditor", "Auditor"], ["treasurer", "Treasurer"]],
  CO: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["clerk", "Clerk and recorder"], ["treasurer", "Treasurer"], ["assessor", "Assessor"], ["coroner", "Coroner"]],
  DE: [["levy", "County council or levy court"], ["sheriff", "Sheriff"], ["clerk", "Clerk of the peace"], ["recorder", "Recorder of deeds"]],
  FL: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["appraiser", "Property appraiser"], ["collector", "Tax collector"], ["elections", "Supervisor of elections"], ["clerk", "Clerk of the circuit court"]],
  GA: [["commission", "County commission"], ["sheriff", "Sheriff"], ["tax", "Tax commissioner"], ["probate", "Judge of probate"], ["clerk", "Clerk of the superior court"]],
  ID: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["attorney", "Prosecuting attorney"], ["clerk", "Clerk"], ["treasurer", "Treasurer"], ["assessor", "Assessor"], ["coroner", "Coroner"]],
  IL: [["board", "County board"], ["sheriff", "Sheriff"], ["attorney", "State's attorney"], ["clerk", "County clerk"], ["treasurer", "Treasurer"]],
  IA: [["supervisors", "Board of supervisors"], ["sheriff", "Sheriff"], ["auditor", "Auditor"], ["treasurer", "Treasurer"], ["recorder", "Recorder"], ["attorney", "County attorney"]],
  KS: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["clerk", "County clerk"], ["treasurer", "Treasurer"], ["attorney", "County attorney"], ["register", "Register of deeds"]],
  LA: [["police", "Police jury or parish council"], ["sheriff", "Sheriff"], ["clerk", "Clerk of court"], ["assessor", "Assessor"], ["coroner", "Coroner"]],
  ME: [["commissioners", "County commissioners"], ["sheriff", "Sheriff"], ["probate", "Judge of probate"], ["register", "Register of probate"], ["deeds", "Register of deeds"]],
  MD: [["council", "County council or commissioners"], ["sheriff", "Sheriff"], ["attorney", "State's attorney"]],
  MA: [["commissioners", "County commissioners"], ["sheriff", "Sheriff"], ["treasurer", "Treasurer"], ["deeds", "Register of deeds"], ["probate", "Register of probate"]],
  MI: [["commissioners", "Board of commissioners"], ["sheriff", "Sheriff"], ["attorney", "Prosecuting attorney"], ["clerk", "County clerk"], ["treasurer", "Treasurer"], ["deeds", "Register of deeds"]],
  MN: [["commissioners", "Board of commissioners"], ["sheriff", "Sheriff"], ["attorney", "County attorney"], ["auditor", "Auditor-treasurer"]],
  MS: [["supervisors", "Board of supervisors"], ["sheriff", "Sheriff"], ["chancery", "Chancery clerk"], ["circuit", "Circuit clerk"], ["tax", "Tax assessor-collector"], ["coroner", "Coroner"]],
  MO: [["commission", "County commission"], ["sheriff", "Sheriff"], ["attorney", "Prosecuting attorney"], ["clerk", "County clerk"], ["collector", "Collector"], ["assessor", "Assessor"], ["treasurer", "Treasurer"], ["recorder", "Recorder of deeds"]],
  MT: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["attorney", "County attorney"], ["clerk", "Clerk and recorder"], ["treasurer", "Treasurer"], ["schools", "Superintendent of schools"]],
  NE: [["board", "Board of commissioners or supervisors"], ["sheriff", "Sheriff"], ["attorney", "County attorney"], ["clerk", "County clerk"], ["treasurer", "Treasurer"], ["assessor", "Assessor"], ["deeds", "Register of deeds"]],
  NV: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["attorney", "District attorney"], ["clerk", "County clerk"], ["treasurer", "Treasurer"], ["assessor", "Assessor"], ["recorder", "Recorder"]],
  NH: [["commissioners", "Board of commissioners"], ["sheriff", "Sheriff"], ["attorney", "County attorney"], ["treasurer", "Treasurer"], ["deeds", "Register of deeds"], ["probate", "Register of probate"]],
  NJ: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["clerk", "County clerk"], ["surrogate", "Surrogate"]],
  NM: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["clerk", "County clerk"], ["treasurer", "Treasurer"], ["assessor", "Assessor"], ["probate", "Probate judge"]],
  NY: [["legislature", "County legislature or board of supervisors"], ["sheriff", "Sheriff"], ["attorney", "District attorney"], ["clerk", "County clerk"]],
  NC: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["deeds", "Register of deeds"]],
  ND: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["attorney", "State's attorney"], ["auditor", "Auditor"], ["treasurer", "Treasurer"], ["recorder", "Recorder"]],
  OK: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["clerk", "County clerk"], ["court", "Court clerk"], ["treasurer", "Treasurer"], ["assessor", "Assessor"]],
  OR: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["attorney", "District attorney"], ["clerk", "County clerk"], ["assessor", "Assessor"], ["treasurer", "Treasurer"]],
  PA: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["attorney", "District attorney"], ["treasurer", "Treasurer"], ["controller", "Controller"], ["prothonotary", "Prothonotary"], ["courts", "Clerk of courts"], ["deeds", "Recorder of deeds"], ["wills", "Register of wills"], ["coroner", "Coroner"]],
  SC: [["council", "County council"], ["sheriff", "Sheriff"], ["clerk", "Clerk of court"], ["coroner", "Coroner"], ["auditor", "Auditor"], ["treasurer", "Treasurer"], ["probate", "Probate judge"]],
  SD: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["attorney", "State's attorney"], ["auditor", "Auditor"], ["treasurer", "Treasurer"], ["deeds", "Register of deeds"]],
  TN: [["mayor", "County mayor"], ["commission", "County commission"], ["sheriff", "Sheriff"], ["trustee", "Trustee"], ["assessor", "Assessor of property"], ["clerk", "County clerk"], ["register", "Register of deeds"]],
  TX: [["judge", "County judge"], ["court", "Commissioners court"], ["sheriff", "Sheriff"], ["tax", "Tax assessor-collector"], ["clerk", "County clerk"], ["district", "District clerk"], ["treasurer", "Treasurer"], ["attorney", "County attorney"]],
  UT: [["commission", "County commission or council"], ["sheriff", "Sheriff"], ["attorney", "County attorney"], ["clerk", "Clerk-auditor"], ["treasurer", "Treasurer"], ["assessor", "Assessor"], ["recorder", "Recorder"]],
  VT: [["judges", "Assistant judges"], ["sheriff", "Sheriff"], ["attorney", "State's attorney"]],
  VA: [["supervisors", "Board of supervisors"], ["sheriff", "Sheriff"], ["attorney", "Commonwealth's attorney"], ["clerk", "Clerk of court"], ["treasurer", "Treasurer"], ["revenue", "Commissioner of the revenue"]],
  WA: [["commissioners", "County commissioners or council"], ["sheriff", "Sheriff"], ["attorney", "Prosecuting attorney"], ["assessor", "Assessor"], ["auditor", "Auditor"], ["treasurer", "Treasurer"]],
  WV: [["commission", "County commission"], ["sheriff", "Sheriff"], ["attorney", "Prosecuting attorney"], ["assessor", "Assessor"], ["clerk", "County clerk"]],
  WI: [["supervisors", "Board of supervisors"], ["sheriff", "Sheriff"], ["clerk", "County clerk"], ["treasurer", "Treasurer"], ["deeds", "Register of deeds"], ["attorney", "District attorney"]],
  WY: [["commissioners", "Board of county commissioners"], ["sheriff", "Sheriff"], ["attorney", "County attorney"], ["clerk", "County clerk"], ["treasurer", "Treasurer"], ["assessor", "Assessor"], ["coroner", "Coroner"]],
};

export const VARYING_COUNTY = new Set(["CA", "DE", "FL", "GA", "IL", "LA", "MD", "MN", "MO", "NE", "NY", "PA", "TX", "UT", "WA"]);
export const NYC_COUNTY = new Set(["36005", "36047", "36061", "36081", "36085"]);
export const TWO_MEMBER_HOUSE = new Set(["AZ", "ID", "ND", "NJ", "SD", "WA"]);
export const NO_ATTORNEY = new Set(["AS", "MP"]);

export function attorneyTitle(abbr: string): string {
  if (abbr === "PR") return "Secretary of Justice";
  return "Attorney general";
}

export function lowerChamber(abbr: string, district?: number | string): string {
  const seat = district == null || district === "" ? "" : ` · District ${district}`;
  if (abbr === "PR") return district == null || district === "" ? "House of Representatives" : `House${seat}`;
  if (abbr === "AS" || abbr === "MP") return "House";
  if (abbr === "CA" || abbr === "NV" || abbr === "NJ" || abbr === "NY" || abbr === "WI") return `State assembly${seat}`;
  if (abbr === "MD" || abbr === "VA" || abbr === "WV") return `House of delegates${seat}`;
  return `State house${seat}`;
}

export function upperChamber(abbr: string, district?: number | string): string {
  const seat = district == null || district === "" ? "" : ` · District ${district}`;
  if (abbr === "DC") return district == null || district === "" ? "Council" : `Council · Ward ${district}`;
  if (abbr === "NE") return `Legislature${seat}`;
  if (abbr === "GU" || abbr === "VI") return "Legislature";
  if (abbr === "PR") return district == null || district === "" ? "Senate" : `Senate${seat}`;
  if (abbr === "AS" || abbr === "MP") return "Senate";
  return `State senate${seat}`;
}

export function lowerNote(abbr: string): string {
  if (abbr === "PR") {
    return "District from the Census 2024 relationship file. The representative is not named. At-large seats are not this district.";
  }
  if (TWO_MEMBER_HOUSE.has(abbr)) {
    const body = abbr === "NJ" ? "New Jersey elects two members of the General Assembly from this district." : "This district elects two representatives.";
    return `District from the Census 2024 state-house relationship file. ${body} Neither is in the published roll. The November 3, 2026 winner is not seated.`;
  }
  if (abbr === "MD" || abbr === "NH" || abbr === "VT") {
    return "District from the Census 2024 state-house relationship file. The district may elect more than one member. No member is in the published roll. The November 3, 2026 winner is not seated.";
  }
  return "District from the Census 2024 state-house relationship file. The member is not in the published roll. The November 3, 2026 winner is not seated.";
}
