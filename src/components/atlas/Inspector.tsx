import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import {
  ARCHIVE_HOLDINGS,
  CAPITALS,
  CONGRESS_SWEAR,
  DEADLINE_STATES,
  ELECTION,
  CONGRESS,
  ENGINE_LEDGER,
  HOUSE_SEATS,
  KIND,
  MEASURES,
  PEOPLE,
  SENATE_2026,
  VERIFIED,
  activeSeats,
  administrationOn,
  confidence,
  formatLong,
  formatSlash,
  measuresFor,
  nextEvent,
  observedNotes,
  SOURCES,
  type FilterId,
} from "@/data/civic";
import { membersOn, seatLabel } from "@/data/congress";
import { governorOn } from "@/data/governors";
import { lieutenantOn, NO_LIEUTENANT } from "@/data/lieutenants";
import { resultsOn } from "@/data/results";
import { NO_SECRETARY, secretaryOn } from "@/data/secretaries";
import { justiceRole, nationalCourt, stateCourts, type Bench } from "@/data/courts";
import { VACANCY_DETAIL, calendarEvents, placeById, type Follow } from "@/data/government";
import { FollowAlerts, GovernmentPanel } from "@/components/atlas/GovernmentPanel";

export type TabId = "overview" | "offices" | "courts" | "candidates" | "calendar" | "vacancies" | "sources";
export type ExtraId = null | "saved" | "alerts" | "directory";

type Selection =
  | { level: "nation" }
  | { level: "state"; abbr: string; name: string }
  | { level: "county"; abbr: string; name: string; county: string; fips: string };

type Props = {
  selection: Selection;
  asOf: string;
  archive: boolean;
  headline: string;
  checkedLabel: string;
  filter: FilterId;
  tab: TabId;
  extra: ExtraId;
  activeId: string | null;
  names: { abbr: string; name: string }[];
  onTab: (tab: TabId) => void;
  onOpen: (abbr: string) => void;
  onActive: (id: string) => void;
  saved: string[];
  onTogglePin: (id: string) => void;
  focus: { q?: string; lat?: number; lng?: number; placeId?: string } | null;
  follows: Follow[];
  onToggleFollow: (follow: Follow) => void;
};

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "offices", label: "Offices" },
  { id: "courts", label: "Judicial" },
  { id: "candidates", label: "Candidates" },
  { id: "calendar", label: "Calendar" },
  { id: "vacancies", label: "Vacancies" },
  { id: "sources", label: "Sources" },
];

function kindLabel(abbr: string | null, selection: Selection): string {
  if (selection.level === "county") return `COUNTY · ${selection.abbr}`;
  if (!abbr) return "UNITED STATES";
  return KIND[abbr] ?? "STATE";
}

function titleOf(selection: Selection): string {
  if (selection.level === "nation") return "United States";
  if (selection.level === "county") return selection.county;
  return selection.name;
}

function blurb(selection: Selection): string {
  if (selection.level === "nation") {
    return "50 states, the District of Columbia, and five territories. Zoom in for counties.";
  }
  if (selection.level === "county") {
    return `${selection.county} County, ${selection.name}. County lines appear when you zoom. Atlas does not invent local returns.`;
  }
  const seats = HOUSE_SEATS[selection.abbr];
  const capital = CAPITALS[selection.abbr];
  const senate = SENATE_2026.has(selection.abbr) ? " A U.S. Senate seat is on the 2026 ballot." : "";
  if (KIND[selection.abbr] === "TERRITORY") {
    return `${selection.name} sends a delegate, not a voting member of Congress. Capital ${capital}.`;
  }
  if (selection.abbr === "DC") {
    return "The District elects a non-voting delegate. Zoom in — the footprint is small on the national map.";
  }
  return `${seats} U.S. House seat${seats === 1 ? "" : "s"}. Capital ${capital}.${senate} Zoom in for counties.`;
}

export function Inspector(props: Props) {
  const { selection, asOf, archive, headline, checkedLabel, filter, tab, extra, activeId, onTab, onOpen, onActive, saved, onTogglePin, focus, follows, onToggleFollow } = props;
  const abbr = selection.level === "nation" ? null : selection.abbr;
  const seats = activeSeats(asOf).filter((s) => !abbr || s.abbr === abbr);
  const measures = measuresFor(abbr, asOf);
  const stateMeasures = abbr ? MEASURES.filter((m) => m.abbr === abbr && asOf >= "2026-09-01") : measures;
  const people = PEOPLE.filter((p) => !abbr || p.abbr === abbr);

  const shownMeasures = useMemo(() => {
    const pool = abbr ? stateMeasures : measures;
    if (filter === "deadlines") return pool.filter((m) => DEADLINE_STATES.has(m.abbr));
    if (filter === "vacancies" || filter === "specials" || filter === "primaries") return [];
    return pool;
  }, [abbr, filter, measures, stateMeasures]);

  useEffect(() => {
    if (!activeId) return;
    document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId, tab, extra, filter]);

  const conf = confidence(asOf);
  const pinKey = selection.level === "county" ? `county:${selection.fips}` : `place:${abbr ?? "US"}`;
  const city = focus?.placeId ? placeById(focus.placeId) : undefined;
  const followId = city?.id ?? (abbr ? `state:${abbr}` : "nation");
  const followLabel = city?.city ?? (selection.level === "county" ? `${selection.county} County` : selection.level === "state" ? selection.name : "United States");
  const following = follows.some((f) => f.id === followId);

  return (
    <aside className="inspector" aria-label="Jurisdiction">
      <header className="inspector-head">
        <div className="eyebrow-row">
          <p className="eyebrow">{kindLabel(abbr, selection)}</p>
          <div className="pin-row">
          <button
            type="button"
            className={"pin" + (saved.includes(pinKey) ? " is-on" : "")}
            onClick={() => onTogglePin(pinKey)}
            aria-pressed={saved.includes(pinKey)}
          >
            {saved.includes(pinKey) ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            className={"pin" + (following ? " is-on" : "")}
            onClick={() => onToggleFollow({ id: followId, label: followLabel, abbr, placeId: city?.id })}
            aria-pressed={following}
          >
            {following ? "Following" : "Follow"}
          </button>
          </div>
        </div>
        <h1>{titleOf(selection)}</h1>
        <p className="lede">{blurb(selection)}</p>
        <p className="verify">
          <Check size={14} strokeWidth={2.4} aria-hidden />
          <span className="conf">{archive ? "ARCHIVE" : conf}</span>
          <span>{archive ? "Licensed rolls" : `Verified ${formatSlash(VERIFIED)}`}</span>
          <span className="asof">{archive ? "Before 01/01/2025" : `As of ${formatSlash(asOf)}`}</span>
        </p>
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={extra === null && tab === t.id}
              className={extra === null && tab === t.id ? "is-on" : ""}
              onClick={() => onTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>
      <div className="inspector-scroll">
        {archive ? (
          <>
            <ArchiveExec asOf={asOf} abbr={abbr} names={props.names} onOpen={onOpen} />
            <ArchiveGate />
          </>
        ) : extra === "directory" ? (
          <Directory names={props.names} onOpen={onOpen} selected={abbr} />
        ) : extra === "saved" ? (
          <SavedList saved={saved} names={props.names} onOpen={onOpen} onTogglePin={onTogglePin} />
        ) : extra === "alerts" ? (
          <FollowAlerts follows={follows} asOf={asOf} />
        ) : filter === "results" ? (
          <Results abbr={abbr} asOf={asOf} onOpen={onOpen} />
        ) : tab === "overview" ? (
          <Overview
            asOf={asOf}
            seats={seats.length}
            measures={shownMeasures.length}
            filter={filter}
            headline={headline}
            checkedLabel={checkedLabel}
            selection={selection}
            focus={focus}
          />
        ) : tab === "offices" ? (
          <Offices abbr={abbr} asOf={asOf} seats={seats} />
        ) : tab === "courts" ? (
          <Courts abbr={abbr} asOf={asOf} level={selection.level} />
        ) : tab === "calendar" ? (
          <CalendarList abbr={abbr} asOf={asOf} filter={filter} onOpen={onOpen} />
        ) : tab === "sources" ? (
          <Sources abbr={abbr} />
        ) : tab === "vacancies" || filter === "vacancies" || filter === "specials" ? (
          <SeatList seats={seats} asOf={asOf} activeId={activeId} onOpen={onOpen} onActive={onActive} />
        ) : (
          <>
            <LiveStrip asOf={asOf} headline={headline} checkedLabel={checkedLabel} />
            {shownMeasures.length === 0 && !(abbr && people.length > 0) ? (
              <p className="empty">
                No certified statewide measures in this slice. Move the date past September 2026, or clear the filter.
              </p>
            ) : (
              <MeasureList
                measures={shownMeasures}
                asOf={asOf}
                activeId={activeId}
                onOpen={onOpen}
                onActive={onActive}
              />
            )}
            {abbr && people.length > 0 && tab === "candidates" ? <PeopleList people={people} /> : null}
          </>
        )}
        <p className="disclaimer">
          {archive
            ? "The archive is a licensed corpus. This screen does not include those rolls."
            : "Live public map since 01/01/2025. Not an official canvass. This feed does not publish unofficial vote totals."}
        </p>
      </div>
    </aside>
  );
}

function LiveStrip({ asOf, headline, checkedLabel }: { asOf: string; headline: string; checkedLabel: string }) {
  const notes = observedNotes(asOf);
  return (
    <article className="card static live-card">
      <p className="kicker">Live feed · checked {checkedLabel}</p>
      <h3>{headline}</h3>
      <ul className="live-log">
        {notes.map((n) => (
          <li key={n.id}>
            <span>{formatSlash(n.date)}</span>
            {n.title}
          </li>
        ))}
      </ul>
    </article>
  );
}

function Courts({ abbr, asOf, level }: { abbr: string | null; asOf: string; level: Selection["level"] }) {
  const scotus = nationalCourt(asOf);
  const state = abbr ? stateCourts(asOf, abbr) : [];
  return (
    <div className="stack">
      <article className="card static">
        <p className="kicker">Judicial</p>
        <h3>{abbr ? "Supreme Court and this state's high court" : "The Supreme Court"}</h3>
        <p>
          {abbr
            ? level === "county"
              ? "County trial courts are not listed. The U.S. Supreme Court and this state's high court are both seated for the date on the timeline. A person appears only after they are sworn in. Neither bench is drawn on the map."
              : "The U.S. Supreme Court and this state's high court sit together here, seated for the date on the timeline. A person appears only after they are sworn in, and drops off on the day they leave. Neither bench is drawn on the map."
            : "The Supreme Court sits for the whole country. Open a state to add that state's high court on this same tab. Courts are not drawn on the map."}
        </p>
      </article>
      <BenchCard bench={scotus} scope="United States" asOf={asOf} />
      {abbr && state.length === 0 ? (
        <article className="card static">
          <p>No state high court is listed for this place. Territories are not given a state supreme court here.</p>
        </article>
      ) : (
        state.map((bench) => (
          <BenchCard
            key={bench.court}
            bench={bench}
            scope={abbr ?? ""}
            asOf={asOf}
            note={
              abbr === "OK"
                ? "Oklahoma also has a Court of Criminal Appeals. That bench stays off this list until its roster is checked."
                : abbr === "TX" && bench.court === "Texas Court of Criminal Appeals"
                  ? "Texas has two courts of last resort. This is the criminal court. The civil court is listed above."
                  : undefined
            }
          />
        ))
      )}
    </div>
  );
}

function BenchCard({ bench, scope, asOf, note }: { bench: Bench; scope: string; asOf: string; note?: string }) {
  const open = bench.seats && bench.seats > bench.justices.length ? bench.seats - bench.justices.length : 0;
  return (
    <article className="card static">
      <p className="kicker">
        {scope} · {bench.justices.length} seated{open ? ` · ${open} vacant` : ""}
      </p>
      <h3>
        <a href={bench.url} target="_blank" rel="noreferrer">
          {bench.court}
        </a>
      </h3>
      {note ? <p>{note}</p> : null}
      {open ? <p>{open === 1 ? "One seat is vacant." : `${open} seats are vacant.`} A nominee is not listed until sworn in.</p> : null}
      {bench.justices.length === 0 ? <p>No justice is seated on this date.</p> : null}
      <ul className="who">
        {bench.justices.map((j) => (
          <li key={j.name + j.start}>
            <span>{justiceRole(j, asOf)}</span>
            <strong>{j.name}</strong>
            <em>{j.approx ? `On the court since ${j.start.slice(0, 4)}` : `On the court since ${formatSlash(j.start)}`}</em>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ArchiveExec({
  asOf,
  abbr,
  names,
  onOpen,
}: {
  asOf: string;
  abbr: string | null;
  names: { abbr: string; name: string }[];
  onOpen: (abbr: string) => void;
}) {
  const admin = administrationOn(asOf);
  const states = (abbr ? names.filter((n) => n.abbr === abbr) : [...names].sort((a, b) => {
    if (a.abbr === "OH") return -1;
    if (b.abbr === "OH") return 1;
    return a.name.localeCompare(b.name);
  })).filter((n) => governorOn(asOf, n.abbr));
  return (
    <div className="stack">
      <article className="card static">
        <p className="kicker">Public · back to 01/01/2000</p>
        <h3>President, vice president, and governors</h3>
        <p>These three stay on the map. A shared year stays with the person already in office, so a January inauguration can show up on the next January 1.</p>
      </article>
      <article className="card static">
        <p className="kicker">United States</p>
        {admin ? (
          <ul className="who">
            <li>
              <span>President</span>
              <strong>{admin.party} {admin.president}</strong>
              <em>{admin.note}</em>
            </li>
            <li>
              <span>Vice president</span>
              <strong>{admin.party} {admin.vice}</strong>
            </li>
          </ul>
        ) : (
          <p>No president is seated on this date.</p>
        )}
      </article>
      {states.map((s) => {
        const gov = governorOn(asOf, s.abbr);
        if (!gov) return null;
        return (
          <article key={s.abbr} className="card static">
            <p className="kicker">{s.abbr}</p>
            <h3>{s.name}</h3>
            <ul className="who">
              <li>
                <span>Governor</span>
                <strong>
                  <a href={gov.url} target="_blank" rel="noreferrer">{gov.party} {gov.name}</a>
                </strong>
                <em>Since {formatSlash(gov.start)}</em>
              </li>
            </ul>
            {abbr ? null : (
              <button type="button" className="textish" onClick={() => onOpen(s.abbr)}>Open {s.abbr}</button>
            )}
          </article>
        );
      })}
    </div>
  );
}

function ArchiveGate() {
  const [sent, setSent] = useState(false);
  const [institution, setInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("University");

  function submit(e: FormEvent) {
    e.preventDefault();
    const row = { institution: institution.trim(), email: email.trim(), role, at: new Date().toISOString() };
    if (!row.institution || !row.email.includes("@")) return;
    try {
      const prev = JSON.parse(localStorage.getItem("atlas.archive.requests") ?? "[]") as unknown[];
      const next = Array.isArray(prev) ? [...prev, row].slice(-20) : [row];
      localStorage.setItem("atlas.archive.requests", JSON.stringify(next));
    } catch {
      /* the receipt still shows */
    }
    setSent(true);
  }

  return (
    <div className="stack">
      <article className="card static archive-card">
        <p className="kicker">Institutional archive</p>
        <h3>Rolls before January 1, 2025</h3>
        <p>
          Universities, newsrooms, libraries, and legislatures license the other rolls. President, vice president, and governors stay visible. Congress, high courts, secretaries of state, lieutenant governors, and everyone else before January 1, 2025 stay closed.
        </p>
      </article>
      <ul className="holdings">
        {ARCHIVE_HOLDINGS.map((h) => (
          <li key={h.k}>
            <strong>{h.k}</strong>
            <span>{h.v}</span>
          </li>
        ))}
      </ul>
      {sent ? (
        <p className="receipt">Request noted for {institution}. The rolls stay closed until that institution is cleared. Nothing was charged.</p>
      ) : (
        <form className="archive-form" onSubmit={submit}>
          <label>
            Institution
            <input value={institution} onChange={(e) => setInstitution(e.target.value)} required placeholder="University, newsroom, or library" />
          </label>
          <label>
            Work email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@institution.edu" />
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option>University</option>
              <option>Newsroom</option>
              <option>Library or archive</option>
              <option>Legislature</option>
            </select>
          </label>
          <button type="submit">Request access</button>
        </form>
      )}
    </div>
  );
}

function Sources({ abbr }: { abbr: string | null }) {
  const links = SOURCES.filter((s) => !abbr || !s.abbr || s.abbr === abbr);
  return (
    <div className="stack">
      <article className="card static">
        <p className="kicker">Trust</p>
        <h3>Official sources</h3>
        <ul className="sources">
          {links.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noreferrer">
                <span>
                  {s.name}
                  <em>{s.tag}</em>
                </span>
                <ArrowUpRight size={14} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
        <p className="meta">
          Every published record has a value, a source, a verification date, a jurisdiction, and a confidence level. Low-confidence claims stay off the public map.
        </p>
      </article>
      <article className="card static">
        <p className="kicker">Data engine</p>
        <h3>What is allowed on the map</h3>
        {abbr ? (
          <p>This state's unpublished roster is not loaded here. The national ledger is on the United States view.</p>
        ) : (
          <>
            <div className="ledger">
              <Stat n={String(ENGINE_LEDGER.collected)} l="Collected" />
              <Stat n={String(ENGINE_LEDGER.needsReview)} l="In review" />
              <Stat n={String(ENGINE_LEDGER.held)} l="Held" />
              <Stat n={String(ENGINE_LEDGER.published)} l="Published" />
            </div>
            <p>{ENGINE_LEDGER.note}</p>
            <p className="kicker">Not high confidence</p>
            <p>
              {ENGINE_LEDGER.legislators} legislator names are collected and unpublished. This map does not hold that roster.
            </p>
            <p>Nothing in this view is waiting.</p>
          </>
        )}
        <p className="meta">
          Collect, then verify, then publish. A low-confidence name cannot approve itself. Boundaries stay on the map; this ledger is who held the office, and whether that claim is allowed out.
        </p>
      </article>
    </div>
  );
}

function Overview({
  asOf,
  seats,
  measures,
  filter,
  headline,
  checkedLabel,
  selection,
  focus,
}: {
  asOf: string;
  seats: number;
  measures: number;
  filter: FilterId;
  headline: string;
  checkedLabel: string;
  selection: Selection;
  focus: { q?: string; lat?: number; lng?: number; placeId?: string } | null;
}) {
  const abbr = selection.level === "nation" ? null : selection.abbr;
  const next = nextEvent(asOf, abbr);
  const chain =
    selection.level === "nation"
      ? ["United States"]
      : selection.level === "state"
        ? ["United States", selection.name]
        : ["United States", selection.name, `${selection.county} County`];
  const admin = administrationOn(asOf);
  const gov = abbr ? governorOn(asOf, abbr) : null;
  return (
    <div className="stack">
      <LiveStrip asOf={asOf} headline={headline} checkedLabel={checkedLabel} />
      <GovernmentPanel
        asOf={asOf}
        focus={focus}
        abbr={abbr}
        countyFips={selection.level === "county" ? selection.fips : null}
      />
      <article className="card static">
        <p className="kicker">When</p>
        <h3>{next ? next.title : "Nothing remaining"}</h3>
        <p>{next ? next.body : "This date is past the loaded calendar."}</p>
        <p className="meta">{next ? formatSlash(next.date) : "—"} · {asOf < ELECTION ? "ELECTION VIEW AHEAD" : "TERM VIEW · WHO HOLDS THE OFFICE ON THIS DATE"}</p>
      </article>
      <article className="card static">
        <p className="kicker">Government status</p>
        <h3>United States — civic pulse</h3>
        <div className="pulse-grid">
          <Stat n={String(seats)} l="Federal vacancies" />
          <Stat n={String(measures)} l="Measures in view" />
        </div>
        <p>
          House {CONGRESS.house.R} R {CONGRESS.house.D} D {CONGRESS.house.I} I · {seats} vacant. Senate {CONGRESS.senate.R} R {CONGRESS.senate.D} D {CONGRESS.senate.I} I.
          {" "}{CONGRESS.governorsUp} governors and {CONGRESS.senateUp} Senate seats are on the 2026 ballot.
        </p>
        <p className="meta">119TH CONGRESS · {CONGRESS.source.toUpperCase()} · NOT A 2026 CALL</p>
      </article>
      <article className="card static">
        <p className="kicker">Where</p>
        <h3>Jurisdictions that apply</h3>
        <ol className="chain">
          {chain.map((name, i) => (
            <li key={name}>{i + 1}. {name}</li>
          ))}
        </ol>
        <p>Start with a place. Atlas reads the geography, then the government that applies, then what happens next.</p>
      </article>
      <article className="card static">
        <p className="kicker">Who</p>
        <h3>This is your government</h3>
        {admin ? (
          <ul className="who">
            <li>
              <span>President</span>
              <strong>{admin.party} {admin.president}</strong>
              <em>{admin.note}</em>
            </li>
            <li>
              <span>Vice president</span>
              <strong>{admin.party} {admin.vice}</strong>
            </li>
            {gov ? (
              <li>
                <span>Governor</span>
                <strong>{gov.party} {gov.name}</strong>
                <em>Since {formatSlash(gov.start)}</em>
              </li>
            ) : null}
          </ul>
        ) : (
          <p>No president is seated on this date.</p>
        )}
        {abbr ? (
          <p>
            {HOUSE_SEATS[abbr] ?? 0} U.S. House seat{(HOUSE_SEATS[abbr] ?? 0) === 1 ? "" : "s"}
            {SENATE_2026.has(abbr) ? ". A Senate seat is on the 2026 ballot." : ". No Senate seat is on the 2026 ballot."}
          </p>
        ) : null}
        {filter !== "all" ? <p className="meta">FILTER · {filter.toUpperCase()}</p> : null}
      </article>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="stat">
      <strong>{n}</strong>
      <span>{l}</span>
    </div>
  );
}

function Results({
  abbr,
  asOf,
  onOpen,
}: {
  abbr: string | null;
  asOf: string;
  onOpen: (abbr: string) => void;
}) {
  const rows = resultsOn(asOf, abbr);
  if (asOf < ELECTION) {
    return <p className="empty">No results yet. The general election is {formatSlash(ELECTION)}.</p>;
  }
  return (
    <div className="stack">
      <article className="card static">
        <p className="kicker">Election results · {formatSlash(ELECTION)}</p>
        <h3>{rows.length} called {abbr ? "races" : "races in this list"}</h3>
        <p>
          Winners are news calls, not a certificate. They are not in the Offices tab. The House is not listed seat by seat. Races that were still uncalled at 1:30 a.m. ET on November 4 are left off rather than guessed.
        </p>
      </article>
      {rows.map((r) => (
        <article key={r.id} className="card static">
          <p className="kicker">{r.abbr} · {r.office}</p>
          <h3>{r.winnerParty} {r.winner}</h3>
          <p>Incumbent {r.incumbent}</p>
          <p>{r.note}</p>
          <button type="button" className="textish" onClick={() => onOpen(r.abbr)}>
            Open {r.abbr}
          </button>
        </article>
      ))}
      {rows.length === 0 ? <p className="empty">No called race in this list for this state.</p> : null}
    </div>
  );
}

function Offices({
  abbr,
  asOf,
  seats,
}: {
  abbr: string | null;
  asOf: string;
  seats: { id: string; label: string; title: string; body: string }[];
}) {
  const groups = membersOn(asOf, abbr);
  const count = groups.reduce((n, g) => n + g.members.length, 0);
  return (
    <div className="stack">
      <article className="card static">
        <p className="kicker">In office on this date</p>
        <h3>{count} House and Senate members{abbr ? "" : " · 50 governors"}</h3>
        <p>
          These are the people in office, not the Nov 3 results. Governors are the National Governors Association roster. Congress was checked from House.gov and Senate.gov, Ohio first, then the other states A to Z. Two House seats stay vacant: TX-23 and FL-20.
        </p>
        <p className="meta">{asOf < CONGRESS_SWEAR ? "119TH CONGRESS · NOT A 2026 CALL" : "120TH CONGRESS"}</p>
      </article>
      {groups.map((g) => (
        <article key={g.abbr} className="card static">
          <p className="kicker">{abbr ? "This state" : g.abbr}</p>
          <h3>{g.name}</h3>
          <ul className="who">
            {(() => {
              const gov = governorOn(asOf, g.abbr);
              return gov ? (
                <li>
                  <span>Governor</span>
                  <strong>
                    <a href={gov.url} target="_blank" rel="noreferrer">{gov.party} {gov.name}</a>
                  </strong>
                  <em>Since {formatSlash(gov.start)}</em>
                </li>
              ) : (
                <li>
                  <span>Governor</span>
                  <strong>Not in this roster on this date</strong>
                </li>
              );
            })()}
            {(() => {
              if (NO_LIEUTENANT.has(g.abbr)) {
                return (
                  <li>
                    <span>Lieutenant governor</span>
                    <strong>No such office</strong>
                  </li>
                );
              }
              const lg = lieutenantOn(asOf, g.abbr);
              if (!lg && g.abbr === "NJ") {
                return (
                  <li>
                    <span>Lieutenant governor</span>
                    <strong>Vacant</strong>
                    <em>Listed vacant on the November 2026 roster</em>
                  </li>
                );
              }
              return lg ? (
                <li>
                  <span>{lg.title}</span>
                  <strong>
                    <a href={lg.url} target="_blank" rel="noreferrer">{lg.party} {lg.name}</a>
                  </strong>
                  <em>Since {formatSlash(lg.start)}</em>
                  {lg.note ? <p>{lg.note}</p> : null}
                </li>
              ) : (
                <li>
                  <span>Lieutenant governor</span>
                  <strong>Not in this roster on this date</strong>
                </li>
              );
            })()}
            {(() => {
              if (NO_SECRETARY.has(g.abbr)) {
                return (
                  <li>
                    <span>Secretary of state</span>
                    <strong>No such office</strong>
                    <em>The lieutenant governor keeps that duty.</em>
                  </li>
                );
              }
              const sos = secretaryOn(asOf, g.abbr);
              return sos ? (
                <li>
                  <span>Secretary of state</span>
                  <strong>
                    <a href={sos.url} target="_blank" rel="noreferrer">{sos.party} {sos.name}</a>
                  </strong>
                  <em>Since {formatSlash(sos.start)}</em>
                  {sos.note ? <p>{sos.note}</p> : null}
                </li>
              ) : (
                <li>
                  <span>Secretary of state</span>
                  <strong>Not in this roster on this date</strong>
                </li>
              );
            })()}
            {g.members.map((m) => (
              <li key={m.id}>
                <span>{seatLabel(m)}</span>
                <strong>
                  <a href={m.url} target="_blank" rel="noreferrer">{m.party} {m.name}</a>
                </strong>
                <em>{formatSlash(m.start)} – {formatSlash(m.end)}</em>
                {m.note ? <p>{m.note}</p> : null}
              </li>
            ))}
          </ul>
        </article>
      ))}
      {seats.map((s) => (
        <article key={s.id} className="card static">
          <p className="kicker">Vacant seat</p>
          <h3>{s.title}</h3>
          <p>{s.body}</p>
        </article>
      ))}
    </div>
  );
}

function MeasureList({
  measures,
  asOf,
  activeId,
  onOpen,
  onActive,
}: {
  measures: { id: string; abbr: string; kicker: string; title: string; body: string }[];
  asOf: string;
  activeId: string | null;
  onOpen: (abbr: string) => void;
  onActive: (id: string) => void;
}) {
  if (measures.length === 0) return null;
  const meta =
    asOf < ELECTION
      ? "CERTIFIED · 11/03/2026"
      : asOf < "2026-12-12"
        ? "VOTED · NO CALL IN THIS FEED"
        : "CANVASS DATE PASSED · ROLL NOT INGESTED";
  return (
    <div className="stack">
      {measures.map((m) => (
        <article
          key={m.id}
          id={m.id}
          className={"card" + (activeId === m.id ? " is-active" : "")}
        >
          <button
            type="button"
            onClick={() => {
              onActive(m.id);
              onOpen(m.abbr);
            }}
          >
            <p className="kicker">{m.kicker}</p>
            <h3>{m.title}</h3>
            <p>{m.body}</p>
            <p className="meta">{meta}</p>
          </button>
        </article>
      ))}
    </div>
  );
}

function PeopleList({ people }: { people: { id: string; name: string; party: string; race: string }[] }) {
  return (
    <div className="stack people">
      <p className="kicker">ON THE BALLOT · NOT A PROJECTION</p>
      {people.map((p) => (
        <article key={p.id} className="card static person">
          <h3>{p.name}</h3>
          <p>
            {p.party} · {p.race}. Listed because the seat was open. Atlas does not declare a winner.
          </p>
        </article>
      ))}
    </div>
  );
}

function SeatList({
  seats,
  asOf,
  activeId,
  onOpen,
  onActive,
}: {
  seats: { id: string; abbr: string; label: string; title: string; body: string; resigned: string }[];
  asOf: string;
  activeId: string | null;
  onOpen: (abbr: string) => void;
  onActive: (id: string) => void;
}) {
  if (seats.length === 0) {
    return (
      <p className="empty">
        No House vacancy in this slice on {formatLong(asOf)}. The two 2026 vacancies open in April and close at the January 3, 2027 swearing-in.
      </p>
    );
  }
  return (
    <div className="stack">
      {seats.map((s) => (
        <article key={s.id} id={s.id} className={"card" + (activeId === s.id ? " is-active" : "")}>
          <button
            type="button"
            onClick={() => {
              onActive(s.id);
              onOpen(s.abbr);
            }}
          >
            <p className="kicker">{s.abbr} · U.S. HOUSE · NO SPECIAL WRIT</p>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            {VACANCY_DETAIL[s.id] ? (
              <>
                <p>Reason: {VACANCY_DETAIL[s.id]?.reason}</p>
                <p>Process: {VACANCY_DETAIL[s.id]?.process}</p>
                <p>Resolution: {VACANCY_DETAIL[s.id]?.resolution}</p>
              </>
            ) : null}
            <p className="meta">VACANT SINCE {formatSlash(s.resigned)}{VACANCY_DETAIL[s.id] ? ` · RESOLVES ${VACANCY_DETAIL[s.id]?.expected}` : ""}</p>
          </button>
        </article>
      ))}
      <article className="card static">
        <p className="kicker">ALSO ON THE BALLOT</p>
        <h3>November 3 fills the next term</h3>
        <p>
          {PEOPLE.map((p) => p.name).join(" · ")}. Names are the filed field for the open seats, not a results call.
        </p>
        <p className="meta">{asOf < ELECTION ? "ELECTION AHEAD" : "ELECTION HELD · SEAT OPEN UNTIL JAN 3"}</p>
      </article>
    </div>
  );
}

function CalendarList({
  abbr,
  asOf,
  filter,
  onOpen,
}: {
  abbr: string | null;
  asOf: string;
  filter: FilterId;
  onOpen: (abbr: string) => void;
}) {
  const rows = calendarEvents().filter((ev) => {
    if (abbr && ev.abbr && ev.abbr !== abbr) return false;
    if (filter === "primaries") return ev.kind === "primary";
    if (filter === "deadlines") return ev.kind === "deadline" || ev.kind === "mail";
    if (filter === "elections") return ev.kind === "election" || ev.kind === "runoff";
    if (filter === "vacancies" || filter === "specials") return ev.kind === "recall" || ev.id === "tx-resign" || ev.id === "fl-resign" || ev.id === "swear";
    return true;
  });
  if (rows.length === 0) return <p className="empty">No dates in this filter.</p>;
  return (
    <ol className="calendar">
      {rows.map((ev) => {
        const past = ev.date <= asOf;
        return (
          <li key={ev.id} className={past ? "is-past" : ""}>
            <button
              type="button"
              disabled={!ev.abbr}
              onClick={() => ev.abbr && onOpen(ev.abbr)}
            >
              <time dateTime={ev.date}>{formatSlash(ev.date)}</time>
              <span>
                <strong>{ev.title}</strong>
                <em>{ev.body}</em>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Directory({
  names,
  onOpen,
  selected,
}: {
  names: { abbr: string; name: string }[];
  onOpen: (abbr: string) => void;
  selected: string | null;
}) {
  return (
    <ul className="directory">
      {names.map((n) => (
        <li key={n.abbr}>
          <button type="button" className={selected === n.abbr ? "is-on" : ""} onClick={() => onOpen(n.abbr)}>
            <span>{n.name}</span>
            <em>{n.abbr}</em>
          </button>
        </li>
      ))}
    </ul>
  );
}

function SavedList({
  saved,
  names,
  onOpen,
  onTogglePin,
}: {
  saved: string[];
  names: { abbr: string; name: string }[];
  onOpen: (abbr: string) => void;
  onTogglePin: (id: string) => void;
}) {
  const [ready] = useState(true);
  if (!ready) return null;
  if (saved.length === 0) {
    return <p className="empty">Nothing saved. Use Save on a jurisdiction. Pins stay in this browser.</p>;
  }
  return (
    <ul className="directory">
      {saved.map((id) => {
        const abbr = id.startsWith("place:") ? id.slice(6) : null;
        const name = names.find((n) => n.abbr === abbr)?.name ?? id;
        return (
          <li key={id}>
            <button type="button" onClick={() => abbr && abbr !== "US" && onOpen(abbr)}>
              <span>{abbr === "US" ? "United States" : name}</span>
              <em>{id.startsWith("county:") ? "County" : (abbr ?? "Pin")}</em>
            </button>
            <button type="button" className="textish" onClick={() => onTogglePin(id)}>
              Remove
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "vacancies", label: "Vacancies" },
  { id: "elections", label: "Elections" },
  { id: "results", label: "Election results" },
  { id: "primaries", label: "Primaries" },
  { id: "specials", label: "Specials" },
  { id: "deadlines", label: "Deadlines" },
];

