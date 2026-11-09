import { useEffect, useMemo, useState } from "react";
import {
  ELIGIBILITY,
  alertsFor,
  apiCatalog,
  calendarEvents,
  compareDossiers,
  mailRule,
  recallNote,
  resolve,
  type CivicEvent,
  type Dossier,
  type Focus,
  type Follow,
} from "@/data/government";
import { gazetteerLine, isGazetteerState, ohioByLetter, ohioByPlaceId, ohioKindLabel, placeStateName, placeWhere, verifiedPlaceId } from "@/data/ohio";
import { formatSlash } from "@/data/civic";

const LEVEL: Record<string, string> = {
  federal: "Federal",
  state: "State",
  county: "County",
  township: "Township",
  municipal: "City",
  education: "School",
  special: "Special district",
};

export function GovernmentPanel({
  asOf,
  focus,
  abbr,
  countyFips,
  onOpenOhio,
}: {
  asOf: string;
  focus: Focus | null;
  abbr: string | null;
  countyFips: string | null;
  onOpenOhio?: (id: string) => void;
}) {
  const dossier = useMemo(
    () => resolve({ asOf, abbr, countyFips, q: focus?.q, lat: focus?.lat, lng: focus?.lng, placeId: focus?.placeId }),
    [asOf, abbr, countyFips, focus?.q, focus?.lat, focus?.lng, focus?.placeId],
  );
  const [compare, setCompare] = useState("2020-08-21");
  const [elig, setElig] = useState(ELIGIBILITY[0]?.id ?? "president");
  const other = useMemo(() => {
    if (!compare) return null;
    return resolve({ asOf: compare, abbr, countyFips, q: focus?.q, lat: focus?.lat, lng: focus?.lng, placeId: focus?.placeId });
  }, [compare, abbr, countyFips, focus?.q, focus?.lat, focus?.lng, focus?.placeId]);
  const changes = other ? compareDossiers(dossier, other) : [];
  const rule = ELIGIBILITY.find((e) => e.id === elig) ?? ELIGIBILITY[0];
  const groups = ["federal", "state", "county", "township", "municipal", "education", "special"] as const;

  return (
    <div className="stack">
      <article className="card static">
        <p className="kicker">Where you are · {dossier.confidence}</p>
        <h3>{dossier.title}</h3>
        <p>{dossier.subtitle}</p>
        <p>{dossier.how}</p>
        <p className="meta">AS OF {formatSlash(asOf)} · HOLDERS WITHOUT A SOURCE ARE LEFT BLANK</p>
      </article>

      {groups.map((level) => {
        const rows = dossier.offices.filter((o) => o.level === level);
        if (!rows.length) return null;
        return (
          <article key={level} className="card static">
            <p className="kicker">{LEVEL[level]}</p>
            <ul className="who">
              {rows.map((o) => (
                <li key={o.id}>
                  <span>{o.title}</span>
                  <strong>
                    {o.name ? (
                      o.url ? (
                        <a href={o.url} target="_blank" rel="noreferrer">
                          {o.party ? `${o.party} ` : ""}
                          {o.name}
                        </a>
                      ) : (
                        <>
                          {o.party ? `${o.party} ` : ""}
                          {o.name}
                        </>
                      )
                    ) : (
                      "Unpublished"
                    )}
                  </strong>
                  <em>
                    {o.confidence}
                    {o.start ? ` · since ${formatSlash(o.start)}` : ""}
                    {o.note ? ` · ${o.note}` : ""}
                  </em>
                </li>
              ))}
            </ul>
          </article>
        );
      })}

      {dossier.term ? (
        <article className="card static">
          <p className="kicker">Term limit · {dossier.term.office}</p>
          <h3>{dossier.term.rule}</h3>
          <p>{dossier.term.status}</p>
          <p className="meta">{dossier.term.incumbent ? dossier.term.incumbent.toUpperCase() : "NO INCUMBENT ON THIS DATE"}</p>
        </article>
      ) : null}

      <article className="card static">
        <p className="kicker">Eligibility</p>
        <h3>What the office requires</h3>
        <div className="chip-row">
          {ELIGIBILITY.map((e) => (
            <button key={e.id} type="button" className={"chip" + (e.id === elig ? " is-on" : "")} onClick={() => setElig(e.id)}>
              {e.office}
            </button>
          ))}
        </div>
        {rule ? (
          <ul className="who">
            <li>
              <span>Age</span>
              <strong>{rule.age}</strong>
            </li>
            <li>
              <span>Citizenship</span>
              <strong>{rule.citizenship}</strong>
            </li>
            <li>
              <span>Residency</span>
              <strong>{rule.residency}</strong>
            </li>
            <li>
              <span>Also</span>
              <strong>{rule.other}</strong>
            </li>
          </ul>
        ) : null}
        {dossier.term && elig === "governor" ? <p>{dossier.term.status}</p> : null}
      </article>

      <article className="card static">
        <p className="kicker">Compare dates</p>
        <h3>What changed</h3>
        <p>The timeline already rebuilds this stack. This holds a second date still, so the two governments can be read together.</p>
        <label className="compare-label">
          Second date
          <input type="date" value={compare} min="2000-01-01" max="2029-12-31" onChange={(e) => setCompare(e.target.value)} />
        </label>
        {changes.length === 0 ? (
          <p>No named office changes between {formatSlash(compare)} and {formatSlash(asOf)}. Blank rows are not counted as a change of person.</p>
        ) : (
          <ul className="who">
            {changes.map((c, i) => (
              <li key={`${c.office}-${i}`}>
                <span>{c.office}</span>
                <strong>{formatSlash(compare)} · {c.onCompare}</strong>
                <em>{formatSlash(asOf)} · {c.onDate}</em>
              </li>
            ))}
          </ul>
        )}
      </article>

      {dossier.vacancies.length ? (
        <article className="card static">
          <p className="kicker">Vacancy reason and resolution</p>
          <ul className="who">
            {dossier.vacancies.map((v) => (
              <li key={v.id}>
                <span>{v.status === "vacant" ? "Vacant" : "Upcoming"} · {v.office}</span>
                <strong>{v.reason}</strong>
                <em>
                  {v.process} {v.resolution} Expected {v.expected}.
                </em>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {isGazetteerState(abbr) && onOpenOhio ? (
        <OhioIndex abbr={abbr} placeId={focus?.placeId} onOpen={onOpenOhio} />
      ) : null}

      <MailAndRecall abbr={dossier.abbr} />
      <ApiCard dossier={dossier} asOf={asOf} />
    </div>
  );
}

function OhioIndex({ abbr, placeId, onOpen }: { abbr: string; placeId?: string; onOpen: (id: string) => void }) {
  const [letter, setLetter] = useState(() => ohioByPlaceId(placeId ?? "")?.name[0]?.toUpperCase() ?? "A");
  useEffect(() => {
    const next = placeId ? ohioByPlaceId(placeId) : undefined;
    if (next?.name[0]) setLetter(next.name[0].toUpperCase());
  }, [placeId]);
  const rows = ohioByLetter(letter, abbr);
  const state = placeStateName(abbr);
  return (
    <article className="card static">
      <p className="kicker">{state} · A to Z</p>
      <h3>{gazetteerLine(abbr)}</h3>
      <p>
        Census Bureau 2024 Gazetteer, alphabetical. Move the date and the dated state officers change. A local holder stays unpublished unless a source is already on the row.
      </p>
      <div className="az" role="tablist" aria-label={`${state} places by letter`}>
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((item) => (
          <button key={item} type="button" className={item === letter ? "is-on" : ""} aria-pressed={item === letter} onClick={() => setLetter(item)}>
            {item}
          </button>
        ))}
      </div>
      <ul className="directory ohio-places">
        {rows.map((unit) => {
          const on = placeId === unit.id || placeId === verifiedPlaceId(unit);
          const where = placeWhere(unit);
          const kindLabel =
            unit.kind === "borough"
              ? unit.name.includes("Municipality")
                ? "Municipality"
                : unit.name.includes("City and Borough")
                  ? "City and borough"
                  : "Borough"
              : ohioKindLabel(unit.kind);
          const quiet = unit.func !== "A" && unit.func !== "B" ? " · no separate government" : "";
          return (
            <li key={unit.id}>
              <button type="button" className={on ? "is-on" : ""} onClick={() => onOpen(unit.id)}>
                <span>{unit.kind === "county" ? `${unit.name} County` : unit.name}</span>
                <em>
                  {kindLabel} · {where}
                  {quiet}
                </em>
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

function MailAndRecall({ abbr }: { abbr: string | null }) {
  const mail = abbr ? mailRule(abbr) : null;
  return (
    <article className="card static">
      <p className="kicker">Mail ballot · recall</p>
      <h3>{mail ? `${abbr} mail ballot` : "Mail ballots follow the state"}</h3>
      {mail ? (
        <>
          <p>Request: {mail.request}</p>
          <p>Return: {mail.back}</p>
          <p className="meta">{mail.confidence} · NOT A SUBSTITUTE FOR THE ELECTION OFFICE</p>
        </>
      ) : (
        <p>Open a state. The return rule is published for every state and the District.</p>
      )}
      <p>{recallNote(abbr)}</p>
    </article>
  );
}

function ApiCard({ dossier, asOf }: { dossier: Dossier; asOf: string }) {
  const sample = dossier.placeId
    ? `/api/v1/location?q=${encodeURIComponent(dossier.title)}&date=${asOf}`
    : dossier.abbr
      ? `/api/v1/location?q=${dossier.abbr}&date=${asOf}`
      : `/api/v1/vacancies?date=${asOf}`;
  return (
    <article className="card static">
      <p className="kicker">Public API</p>
      <h3>Same records, no map</h3>
      <p>Version 1 is read-only. A missing holder comes back as unpublished. It is never filled in.</p>
      <p className="api-path">{sample}</p>
      <ul className="sources">
        {apiCatalog().map((row) => (
          <li key={row.path}>
            <a href={row.path} target="_blank" rel="noreferrer">
              <span>
                {row.method} {row.path}
                <em>{row.note}</em>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function FollowAlerts({ follows, asOf }: { follows: Follow[]; asOf: string }) {
  const rows = alertsFor(follows, asOf);
  if (follows.length === 0) {
    return (
      <article className="card static">
        <p className="kicker">Alerts</p>
        <h3>Follow a place</h3>
        <p>Use Follow on a jurisdiction. Alerts stay in this browser and list the next election, mail deadline, runoff, or vacancy for each place you follow. Nothing is sent to a server.</p>
      </article>
    );
  }
  return (
    <div className="stack">
      <article className="card static">
        <p className="kicker">Following</p>
        <h3>{follows.map((f) => f.label).join(" · ")}</h3>
        <p>These are the next dated records for the places you follow. Moving the timeline changes what is still ahead.</p>
      </article>
      {rows.length === 0 ? <p className="empty">Nothing ahead of this date for the places you follow.</p> : null}
      {rows.map((r) => (
        <article key={r.id} className="card static">
          <p className="kicker">{formatSlash(r.date)}</p>
          <h3>{r.title}</h3>
          <p>{r.body}</p>
        </article>
      ))}
    </div>
  );
}

export function CalendarExtras({
  abbr,
  asOf,
  base,
}: {
  abbr: string | null;
  asOf: string;
  base: CivicEvent[];
}) {
  const [slice, setSlice] = useState<"all" | "mail" | "runoff" | "recall">("all");
  const pool = slice === "all" ? base : calendarEvents().filter((e) => e.kind === slice && (!abbr || !e.abbr || e.abbr === abbr));
  return (
    <div className="stack">
      <div className="chip-row">
        {(["all", "mail", "runoff", "recall"] as const).map((id) => (
          <button key={id} type="button" className={"chip" + (slice === id ? " is-on" : "")} onClick={() => setSlice(id)}>
            {id === "all" ? "Calendar" : id[0]?.toUpperCase() + id.slice(1)}
          </button>
        ))}
      </div>
      {slice === "mail" && abbr && mailRule(abbr) ? (
        <article className="card static">
          <p className="kicker">{abbr}</p>
          <h3>Mail ballot</h3>
          <p>{mailRule(abbr)?.request}</p>
          <p>{mailRule(abbr)?.back}</p>
        </article>
      ) : null}
      {slice === "recall" ? (
        <article className="card static">
          <p className="kicker">Recall</p>
          <p>{recallNote(abbr)}</p>
        </article>
      ) : null}
      <ol className="calendar">
        {pool.map((ev) => (
          <li key={ev.id} className={ev.date <= asOf ? "is-past" : ""}>
            <div className="cal-static">
              <time dateTime={ev.date}>{formatSlash(ev.date)}</time>
              <span>
                <strong>{ev.title}</strong>
                <em>{ev.body}</em>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
