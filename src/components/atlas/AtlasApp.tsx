import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Bookmark,
  CalendarDays,
  History,
  Landmark,
  Layers,
  Locate,
  MapPin,
  Navigation,
  Search,
  Share2,
  UserRound,
  Users,
  Vote,
  X,
} from "lucide-react";
import type { StateGeom } from "@/data/geo";
import geo from "@/data/geo-states.json";
import {
  ARCHIVE_CUTOFF,
  DEFAULT_AS_OF,
  ELECTION,
  MEASURES,
  PEOPLE,
  SEATS,
  TODAY,
  activeSeats,
  dateToUnit,
  daysPhrase,
  formatSlash,
  isArchive,
  returnsHeadline,
  unitToDate,
  TIMELINE_MARKS,
  type FilterId,
  type MapMode,
} from "@/data/civic";
import { getLivePulse } from "@/lib/civic-live";
import { matchMembers } from "@/data/congress";
import { GOVERNORS } from "@/data/governors";
import { LIEUTENANTS } from "@/data/lieutenants";
import { RESULTS } from "@/data/results";
import { SECRETARIES } from "@/data/secretaries";
import { matchJustices } from "@/data/courts";
import { focusHits, resolve, type Follow } from "@/data/government";
import { isGazetteerState, ohioById, verifiedPlaceId } from "@/data/ohio";
import { MapCanvas } from "@/components/atlas/MapCanvas";
import { FILTERS, Inspector, type ExtraId, type TabId } from "@/components/atlas/Inspector";

type Selection =
  | { level: "nation" }
  | { level: "state"; abbr: string; name: string }
  | { level: "county"; abbr: string; name: string; county: string; fips: string };

type Camera = { id: string; box: [number, number, number, number] | null };

const byAbbr = new Map(geo.states.map((s) => [s.abbr, s]));
const fipsToAbbr = new Map(geo.states.map((s) => [s.fips, s.abbr]));

function asBox(b: readonly number[]): [number, number, number, number] {
  return [b[0] ?? 0, b[1] ?? 0, b[2] ?? 0, b[3] ?? 0];
}

const TERRITORIES = ["DC", "PR", "VI", "GU", "AS", "MP", "AK", "HI"] as const;

const RAIL: { id: string; label: string; icon: typeof Locate }[] = [
  { id: "home", label: "Nation", icon: Locate },
  { id: "offices", label: "Offices", icon: Landmark },
  { id: "candidates", label: "Candidates", icon: UserRound },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "directory", label: "Directory", icon: Users },
  { id: "share", label: "Share", icon: Share2 },
];

function loadPins(): string[] {
  try {
    const raw = localStorage.getItem("atlas.pins");
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function AtlasApp() {
  const [asOf, setAsOf] = useState(TODAY);
  const [follow, setFollow] = useState(true);
  const [pulseAt, setPulseAt] = useState<string | null>(null);
  const [headline, setHeadline] = useState(returnsHeadline(TODAY));
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [lens, setLens] = useState<"term" | "election">("term");
  const [filter, setFilter] = useState<FilterId>("all");
  const [mapMode, setMapMode] = useState<MapMode>("all");
  const [tab, setTab] = useState<TabId>("overview");
  const [extra, setExtra] = useState<ExtraId>(null);
  const [selection, setSelection] = useState<Selection>({ level: "nation" });
  const [frame, setFrame] = useState("nation");
  const [camera, setCamera] = useState<Camera>({ id: "nation", box: null });
  const [query, setQuery] = useState("");
  const [hover, setHover] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [follows, setFollows] = useState<Follow[]>([]);
  const [focus, setFocus] = useState<{ q?: string; lat?: number; lng?: number; placeId?: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  const [intro, setIntro] = useState(true);
  const nonce = useRef(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const followRef = useRef(true);

  useEffect(() => {
    setSaved(loadPins());
    try {
      const raw = localStorage.getItem("atlas.follows");
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      if (Array.isArray(parsed)) setFollows(parsed as Follow[]);
    } catch {
      /* empty */
    }
    if (localStorage.getItem("atlas.intro") === "1") setIntro(false);
  }, []);

  useEffect(() => {
    let stop = false;
    async function pull() {
      try {
        const pulse = await getLivePulse();
        if (stop) return;
        setPulseAt(pulse.now);
        setHeadline(pulse.headline);
        if (followRef.current && pulse.asOf >= ARCHIVE_CUTOFF && pulse.asOf <= "2029-12-31") {
          setAsOf(pulse.asOf);
        }
      } catch {
        if (!stop) setPulseAt(new Date().toISOString());
      }
    }
    void pull();
    const poll = window.setInterval(() => void pull(), 20000);
    const clock = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => {
      stop = true;
      window.clearInterval(poll);
      window.clearInterval(clock);
    };
  }, []);

  function stopFollow() {
    followRef.current = false;
    setFollow(false);
  }

  function goLive() {
    followRef.current = true;
    setFollow(true);
    setLens("term");
    setAsOf(TODAY);
  }

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const names = useMemo(
    () => geo.states.map((s) => ({ abbr: s.abbr, name: s.name })).sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const hits = useMemo(() => buildHits(query), [query]);

  const seatsNow = activeSeats(asOf);
  const selectedAbbr = selection.level === "nation" ? null : selection.abbr;
  const selectedCounty = selection.level === "county" ? selection.fips : null;

  function note(text: string) {
    setToast(text);
  }

  function dismissIntro() {
    localStorage.setItem("atlas.intro", "1");
    setIntro(false);
  }

  function ask(intent: string) {
    dismissIntro();
    if (intent === "live") {
      locateMe();
      return;
    }
    if (intent === "ballot") {
      applyFilter("elections");
      return;
    }
    if (intent === "election") {
      setExtra(null);
      setTab("calendar");
      return;
    }
    if (intent === "represent") {
      setExtra(null);
      setTab("offices");
      return;
    }
    if (intent === "vacancies") {
      applyFilter("vacancies");
      return;
    }
    if (intent === "national") {
      home();
      setTab("overview");
      return;
    }
    searchRef.current?.focus();
  }

  function home() {
    nonce.current += 1;
    setFrame("nation");
    setSelection({ level: "nation" });
    setFocus(null);
    setCamera({ id: `nation-${nonce.current}`, box: null });
    setExtra(null);
  }

  function openAbbr(abbr: string, zoom = false) {
    const g = byAbbr.get(abbr);
    if (!g) return;
    setFocus(null);
    setSelection({ level: "state", abbr, name: g.name });
    setExtra(null);
    if (g.frame !== "nation") {
      nonce.current += 1;
      setFrame(g.frame);
      setCamera({ id: `f-${abbr}-${nonce.current}`, box: asBox(g.b) });
      return;
    }
    if (frame !== "nation") {
      nonce.current += 1;
      setFrame("nation");
      setCamera({ id: `n-${abbr}-${nonce.current}`, box: zoom ? asBox(g.b) : null });
      return;
    }
    if (zoom) {
      nonce.current += 1;
      setCamera({ id: `z-${abbr}-${nonce.current}`, box: asBox(g.b) });
    }
  }

  function openCounty(fips: string, name: string, abbr: string) {
    const g = byAbbr.get(abbr);
    if (!g) return;
    setFocus(null);
    setFrame(g.frame);
    setSelection({ level: "county", abbr, name: g.name, county: name, fips });
    setTab("overview");
    setExtra(null);
  }

  function applyFilter(id: FilterId) {
    setFilter(id);
    setExtra(null);
    if (id === "all") {
      setMapMode("all");
      setTab("candidates");
    } else if (id === "vacancies" || id === "specials") {
      setMapMode("vacancy");
      setTab("vacancies");
    } else if (id === "deadlines") {
      setMapMode("deadline");
      setTab("calendar");
    } else if (id === "primaries") {
      setTab("calendar");
    } else if (id === "elections") {
      setMapMode("statewide");
      setTab("candidates");
    } else if (id === "results") {
      setMapMode("statewide");
      setTab("overview");
    }
  }

  function toggleFollow(follow: Follow) {
    setFollows((prev) => {
      const next = prev.some((f) => f.id === follow.id) ? prev.filter((f) => f.id !== follow.id) : [...prev, follow];
      localStorage.setItem("atlas.follows", JSON.stringify(next));
      return next;
    });
  }

  function openCity(placeId: string, abbr: string, county: string, fips: string, x: number, y: number) {
    const g = byAbbr.get(abbr);
    if (!g) return;
    nonce.current += 1;
    setFrame(g.frame);
    setFocus({ placeId });
    setSelection({ level: "county", abbr, name: g.name, county, fips });
    setCamera({ id: `city-${placeId}-${nonce.current}`, box: [x - 36, y - 26, x + 36, y + 26] });
    setTab("overview");
    setExtra(null);
  }

  function locateMe() {
    if (!navigator.geolocation) {
      note("This browser has no location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const dossier = resolve({ asOf, lat, lng });
        if (dossier.placeId && dossier.abbr && dossier.county && dossier.countyFips) {
          const pt = geo.places.find((p) => p.fips === dossier.countyFips);
          openCity(dossier.placeId, dossier.abbr, dossier.county, dossier.countyFips, pt?.x ?? 400, pt?.y ?? 300);
          note(dossier.how);
          return;
        }
        if (dossier.abbr) openAbbr(dossier.abbr, true);
        setFocus({ lat, lng });
        setTab("overview");
        setExtra(null);
        note(dossier.how || "Location read. Open Overview.");
      },
      () => note("Location permission was denied."),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  }

  function togglePin(id: string) {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("atlas.pins", JSON.stringify(next));
      return next;
    });
  }

  async function share() {
    const place = selection.level === "nation" ? "United States" : selection.level === "county" ? `${selection.county}, ${selection.name}` : selection.name;
    const text = `Atlas · ${place} · as of ${formatSlash(asOf)}. ${seatsNow.length} House vacancies in this window.`;
    try {
      await navigator.clipboard.writeText(text);
      note("Summary copied");
    } catch {
      note("Couldn't copy");
    }
  }

  function onRail(id: string) {
    if (id === "home") return home();
    if (id === "share") return void share();
    if (id === "saved" || id === "alerts" || id === "directory") {
      setExtra(id);
      return;
    }
    setExtra(null);
    setTab(id as TabId);
  }

  function chooseHit(hit: Hit) {
    setQuery("");
    if (hit.placeId && hit.place && hit.county) {
      openCity(hit.placeId, hit.abbr, hit.county, hit.place.fips, hit.place.x, hit.place.y);
      return;
    }
    if (hit.court) {
      setExtra(null);
      if (filter === "results") setFilter("all");
      if (hit.abbr === "US") home();
      else openAbbr(hit.abbr, hit.abbr === "AK" || hit.abbr === "HI");
      setTab("courts");
      return;
    }
    if (hit.measureId) setActiveId(hit.measureId);
    if (hit.county && hit.place) {
      const g = byAbbr.get(hit.abbr);
      if (!g) return;
      nonce.current += 1;
      setFrame(g.frame);
      setSelection({
        level: "county",
        abbr: hit.abbr,
        name: g.name,
        county: hit.county,
        fips: hit.place.fips,
      });
      const { x, y } = hit.place;
      setCamera({ id: `c-${hit.place.fips}-${nonce.current}`, box: [x - 36, y - 26, x + 36, y + 26] });
      setTab("overview");
      setExtra(null);
      return;
    }
    if (hit.seat) {
      setTab("vacancies");
      setActiveId(hit.seat);
    } else if (hit.measureId) {
      setTab("candidates");
    }
    openAbbr(hit.abbr, hit.abbr === "AK" || hit.abbr === "HI");
  }

  const frameName =
    frame === "nation"
      ? "NATION"
      : (geo.states.find((s) => s.frame === frame)?.abbr ?? "MAP");

  const archive = isArchive(asOf);
  const railActive =
    extra ??
    (tab === "offices" || tab === "candidates" || tab === "calendar" ? tab : "");

  return (
    <div className={archive ? "atlas is-archive" : "atlas"}>
      <nav className="rail" aria-label="Atlas">
        {RAIL.map((item) => {
          const Icon = item.icon;
          const on = item.id === railActive;
          return (
            <button
              key={item.id}
              type="button"
              className={on ? "is-on" : ""}
              aria-label={item.label}
              title={item.label}
              onClick={() => onRail(item.id)}
            >
              <Icon size={18} strokeWidth={1.75} />
              {item.id === "alerts" ? <i className="dot" /> : null}
            </button>
          );
        })}
      </nav>

      <div className="stage">
        <header className="topbar">
          <div className="brand-row">
            <div className="brand">
              <strong>Atlas</strong>
              <span>Your government. Mapped.</span>
            </div>
            <button
              type="button"
              className={"countdown" + (follow ? " is-live" : "")}
              onClick={goLive}
            >
              <i className="live-pip" aria-hidden />
              {follow ? "Live" : "Jump to live"} · {daysPhrase(asOf)}
            </button>
            <form
              className="search"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                if (hits[0]) chooseHit(hits[0]);
              }}
            >
              <Search size={16} strokeWidth={1.75} aria-hidden />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="City, township, county, ZIP"
                aria-label="Search places, offices, vacancies, or names"
              />
              {query.trim() && hits.length > 0 ? (
                <ul className="search-pop">
                  {hits.map((h) => (
                    <li key={h.id}>
                      <button type="button" onClick={() => chooseHit(h)}>
                        <span>{h.label}</span>
                        <em>{h.hint}</em>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {query.trim() && hits.length === 0 ? (
                <p className="search-pop empty-pop">No matches in this atlas.</p>
              ) : null}
            </form>
            <div className="icon-row">
              <button type="button" className="icon-btn" aria-label="Use my location" onClick={locateMe}>
                <Navigation size={16} />
              </button>
              <button type="button" className="icon-btn" aria-label="Map layers" aria-expanded={layersOpen} onClick={() => setLayersOpen((v) => !v)}>
                <Layers size={16} />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label="Return to verified date"
                onClick={() => {
                  stopFollow();
                  setAsOf(DEFAULT_AS_OF);
                  setLens("term");
                  note("Verified snapshot 10/25/2026");
                }}
              >
                <History size={16} />
              </button>
              <button type="button" className="icon-btn desk-tool" aria-label="Alerts" onClick={() => setExtra("alerts")}>
                <Bell size={16} />
                <i className="dot" />
              </button>
              <button type="button" className="icon-btn desk-tool" aria-label="Copy summary" onClick={() => void share()}>
                <Share2 size={16} />
              </button>
            </div>
            <div className="filters" role="toolbar" aria-label="Filters">
              {FILTERS.map((f) => (
                <button key={f.id} type="button" className={filter === f.id ? "is-on" : ""} onClick={() => applyFilter(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="territories" role="toolbar" aria-label="Territories and insets">
            {TERRITORIES.map((abbr) => (
              <button
                key={abbr}
                type="button"
                className={selectedAbbr === abbr ? "is-on" : ""}
                onClick={() => openAbbr(abbr, true)}
              >
                {abbr}
              </button>
            ))}
          </div>
          {layersOpen ? (
            <div className="layer-pop">
              <LayerButtons mode={mapMode} onPick={(m) => { setMapMode(m); setLayersOpen(false); }} />
            </div>
          ) : null}
        </header>

        <MapCanvas
          geoms={geo.states as StateGeom[]}
          markers={geo.markers as unknown as Record<string, [number, number]>}
          vacantAbbrs={archive ? [] : seatsNow.map((s) => s.abbr)}
          asOf={asOf}
          frame={frame}
          selectedAbbr={selectedAbbr}
          selectedCounty={selectedCounty}
          mapMode={mapMode}
          cameraId={camera.id}
          cameraBox={camera.box}
          onSelectState={(abbr) => openAbbr(abbr, false)}
          onZoomState={(abbr) => openAbbr(abbr, true)}
          onSelectCounty={openCounty}
          onHover={setHover}
          onClear={() => {
            if (selection.level === "county" && selectedAbbr) {
              const g = byAbbr.get(selectedAbbr);
              if (g) setSelection({ level: "state", abbr: g.abbr, name: g.name });
              return;
            }
            setSelection({ level: "nation" });
          }}
        />

        <div className="hint">
          <p>{frameName} · SCROLL TO ZOOM</p>
          <p>{hover ?? (selectedAbbr ? "Double-click a state to zoom" : "Hover a jurisdiction")}</p>
        </div>

        <aside className="legend" aria-label="Map mode">
          <p>Map mode</p>
          <LayerButtons mode={mapMode} onPick={setMapMode} />
          <p className="legend-count">
            {seatsNow.length} vacant · {seatsNow.length} specials · {daysPhrase(asOf).replace(" to 3 Nov", "").replace(" since 3 Nov", " ago")}
          </p>
        </aside>

        <section
          className="timeline"
          aria-label="Date"
          style={{ ["--cut" as string]: `${Math.round(dateToUnit(ARCHIVE_CUTOFF) * 1000) / 10}%` }}
        >
          <div className="time-top">
            <div>
              <p className="kicker">
                {archive ? "Archive · before 01/01/2025" : follow ? `Live · checked ${ageLabel(pulseAt, nowMs)}` : "Public · paused"}
              </p>
              <p className="time-date">{formatSlash(asOf)}</p>
            </div>
            <div className="lens" role="group" aria-label="Lens">
              <button type="button" className={follow ? "is-on" : ""} onClick={goLive}>
                Now
              </button>
              <button
                type="button"
                className={!follow && lens === "election" ? "is-on" : ""}
                onClick={() => {
                  stopFollow();
                  setLens("election");
                  setAsOf(ELECTION);
                }}
              >
                Election
              </button>
            </div>
          </div>
          <label className="slider">
            <span className="sr">As-of date</span>
            <input
              type="range"
              min={0}
              max={1000}
              value={Math.round(dateToUnit(asOf) * 1000)}
              onChange={(e) => {
                stopFollow();
                setAsOf(unitToDate(Number(e.target.value) / 1000));
              }}
            />
          </label>
          <div className="marks">
            {visibleMarks().map((m) => (
              <button
                key={m.label}
                type="button"
                style={{ left: `${dateToUnit(m.iso) * 100}%` }}
                onClick={() => {
                  stopFollow();
                  setAsOf(m.iso);
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="fine">
            {archive
              ? isGazetteerState(selectedAbbr)
                ? "Ohio, Indiana, Kentucky, Alabama, Alaska, and Arizona stay open on this date. Dated state officers change with the slider. Local holders stay unpublished. Congress and the U.S. Supreme Court stay licensed."
                : "President, vice president, and governors stay visible back to 01/01/2000. Congress and the U.S. Supreme Court from that date are in the licensed archive."
              : headline}
          </p>
        </section>

        {frame !== "nation" ? (
          <button type="button" className="back-nation" onClick={home}>
            United States
          </button>
        ) : null}
      </div>

      <Inspector
        selection={selection}
        asOf={asOf}
        archive={archive}
        headline={headline}
        checkedLabel={ageLabel(pulseAt, nowMs)}
        filter={filter}
        tab={tab}
        extra={extra}
        activeId={activeId}
        names={names}
        saved={saved}
        onTab={(next) => {
          setTab(next);
          setExtra(null);
          if (filter === "results") setFilter("all");
        }}
        onOpen={(abbr) => openAbbr(abbr, false)}
        onActive={setActiveId}
        onTogglePin={togglePin}
        focus={focus}
        follows={follows}
        onToggleFollow={toggleFollow}
        onOpenOhio={(id) => {
          const unit = ohioById(id);
          if (!unit) return;
          const placeId = verifiedPlaceId(unit) ?? unit.id;
          const pt = geo.places.find((p) => p.fips === unit.countyFips);
          openCity(placeId, unit.abbr, unit.county, unit.countyFips, pt?.x ?? 740, pt?.y ?? 250);
        }}
      />

      {toast ? <p className="toast" role="status">{toast}</p> : null}
      {intro ? <QuestionGate onAsk={ask} onClose={dismissIntro} /> : null}
    </div>
  );
}

const QUESTIONS: { intent: string; title: string; hint: string; icon: typeof Locate }[] = [
  { intent: "live", title: "Where do I live?", hint: "Search a place. The map reads the geography first.", icon: MapPin },
  { intent: "ballot", title: "What's on my ballot?", hint: "2026 measures and races in this view.", icon: Vote },
  { intent: "election", title: "When is my next election?", hint: "Deadlines, primaries, Election Day.", icon: CalendarDays },
  { intent: "represent", title: "Who represents me?", hint: "The offices that apply on this date.", icon: Landmark },
  { intent: "vacancies", title: "Where are government vacancies?", hint: "Open House seats and term-limited offices.", icon: Layers },
  { intent: "state", title: "What's happening in my state?", hint: "Search a state, then read the panel.", icon: Search },
  { intent: "national", title: "What's happening nationally?", hint: "The government status of the United States.", icon: Locate },
];

function QuestionGate({ onAsk, onClose }: { onAsk: (intent: string) => void; onClose: () => void }) {
  return (
    <div className="intro-scrim" role="presentation" onClick={onClose}>
      <div
        className="intro"
        role="dialog"
        aria-labelledby="atlas-intro-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="intro-top">
          <p className="kicker">What do you want to know?</p>
          <button type="button" className="icon-btn" aria-label="Dismiss" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <h2 id="atlas-intro-title">A map of the government that applies to you.</h2>
        <p>Don't start with politics. Start with a place, or a question. Atlas reads geography, then government, then time.</p>
        <ul>
          {QUESTIONS.map((q) => {
            const Icon = q.icon;
            return (
              <li key={q.intent}>
                <button type="button" onClick={() => onAsk(q.intent)}>
                  <Icon size={16} strokeWidth={1.75} aria-hidden />
                  <span>
                    <strong>{q.title}</strong>
                    <em>{q.hint}</em>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" className="intro-go" onClick={onClose}>
          Explore the map
        </button>
      </div>
    </div>
  );
}

function ageLabel(iso: string | null, nowMs: number): string {
  if (!iso) return "…";
  const s = Math.max(0, Math.round((nowMs - Date.parse(iso)) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

function LayerButtons({ mode, onPick }: { mode: MapMode; onPick: (m: MapMode) => void }) {
  const items: { id: MapMode; label: string; swatch: string }[] = [
    { id: "vacancy", label: "Vacancy", swatch: "sw-vacancy" },
    { id: "statewide", label: "Statewide 2026", swatch: "sw-sage" },
    { id: "federal", label: "Federal / House", swatch: "sw-federal" },
    { id: "deadline", label: "Deadlines", swatch: "sw-deadline" },
  ];
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <button type="button" className={mode === item.id ? "is-on" : ""} onClick={() => onPick(mode === item.id ? "all" : item.id)}>
            <i className={item.swatch} />
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

function visibleMarks() {
  let last = -1;
  return TIMELINE_MARKS.filter((m) => {
    const u = dateToUnit(m.iso);
    if (last >= 0 && u - last < 0.055) return false;
    last = u;
    return true;
  });
}

type Hit = {
  id: string;
  label: string;
  hint: string;
  abbr: string;
  measureId?: string;
  seat?: string;
  county?: string;
  place?: { fips: string; x: number; y: number };
  court?: boolean;
  placeId?: string;
};

function buildHits(query: string): Hit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  const hits: Hit[] = [];
  for (const city of focusHits(query)) {
    hits.push({
      id: city.id,
      label: city.label,
      hint: city.hint,
      abbr: city.abbr,
      placeId: city.placeId,
      county: city.county,
      place: { fips: city.fips, x: city.x, y: city.y },
    });
  }
  for (const s of geo.states) {
    if (s.name.toLowerCase().includes(q) || s.abbr.toLowerCase() === q) {
      hits.push({ id: `s-${s.abbr}`, label: s.name, hint: s.abbr, abbr: s.abbr });
    }
  }
  for (const seat of SEATS) {
    if (
      seat.label.toLowerCase().includes(q) ||
      seat.title.toLowerCase().includes(q) ||
      (q.length >= 5 && "vacancy".startsWith(q))
    ) {
      hits.push({ id: seat.id, label: seat.title, hint: "U.S. House vacancy", abbr: seat.abbr, seat: seat.id });
    }
  }
  for (const m of MEASURES) {
    if (m.title.toLowerCase().includes(q) || m.kicker.toLowerCase().includes(q)) {
      hits.push({ id: m.id, label: m.title, hint: m.kicker, abbr: m.abbr, measureId: m.id });
    }
  }
  for (const p of PEOPLE) {
    if (p.name.toLowerCase().includes(q)) {
      hits.push({ id: p.id, label: p.name, hint: `${p.party} · ${p.race}`, abbr: p.abbr, seat: p.race === "TX-23" ? "tx-23" : "fl-20" });
    }
  }
  for (const g of GOVERNORS) {
    if (g.name.toLowerCase().includes(q) || g.short.toLowerCase().includes(q)) {
      hits.push({ id: `gov-${g.abbr}`, label: g.name, hint: `${g.party} · Governor · ${g.abbr}`, abbr: g.abbr });
    }
  }
  for (const lg of LIEUTENANTS) {
    if (lg.name.toLowerCase().includes(q)) {
      hits.push({ id: `lg-${lg.abbr}-${lg.start}`, label: lg.name, hint: `${lg.party} · ${lg.title} · ${lg.abbr}`, abbr: lg.abbr });
    }
  }
  for (const s of SECRETARIES) {
    if (s.name.toLowerCase().includes(q)) {
      hits.push({ id: `sos-${s.abbr}`, label: s.name, hint: `${s.party} · Secretary of State · ${s.abbr}`, abbr: s.abbr });
    }
  }
  for (const r of RESULTS) {
    if (r.winner.toLowerCase().includes(q) || r.incumbent.toLowerCase().includes(q)) {
      hits.push({ id: `res-${r.id}`, label: r.winner, hint: `${r.winnerParty} · called · ${r.office} · ${r.abbr}`, abbr: r.abbr });
    }
  }
  for (const j of matchJustices(q, 5)) {
    hits.push({
      id: `court-${j.abbr ?? "US"}-${j.name}`,
      label: j.name,
      hint: j.abbr ? `${j.court} · ${j.abbr}` : j.court,
      abbr: j.abbr ?? "US",
      court: true,
    });
  }
  if (q.length >= 3) {
    let n = 0;
    for (const place of geo.places) {
      if (!place.name.toLowerCase().includes(q)) continue;
      const abbr = fipsToAbbr.get(place.st);
      if (!abbr) continue;
      hits.push({
        id: `p-${place.fips}`,
        label: `${place.name} County`,
        hint: abbr,
        abbr,
        county: place.name,
        place: { fips: place.fips, x: place.x, y: place.y },
      });
      n += 1;
      if (n >= 6) break;
    }
    for (const m of matchMembers(q, 4)) {
      const hint = m.chamber === "senate" ? `U.S. Senate · ${m.abbr}` : `U.S. House · ${m.abbr}${m.district ? `-${m.district}` : ""}`;
      hits.push({ id: `m-${m.id}`, label: m.name, hint, abbr: m.abbr });
    }
  }
  const rank = (h: Hit) => (h.label.toLowerCase().startsWith(q) ? 0 : 1);
  hits.sort((a, b) => rank(a) - rank(b) || a.label.localeCompare(b.label));
  return hits.slice(0, 8);
}
