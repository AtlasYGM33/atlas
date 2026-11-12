import { useEffect, useRef, useState } from "react";
import type { CountyGeom, StateGeom } from "@/data/geo";
import { SEATS, type MapMode } from "@/data/civic";
import { governorOn } from "@/data/governors";

export type View = { x: number; y: number; w: number; h: number };

type Props = {
  geoms: StateGeom[];
  markers: Record<string, [number, number]>;
  frame: string;
  selectedAbbr: string | null;
  selectedCounty: string | null;
  mapMode: MapMode;
  /** Abbrs whose House seat is empty on the scrubber date. */
  vacantAbbrs: string[];
  asOf: string;
  cameraId: string;
  cameraBox: [number, number, number, number] | null;
  onSelectState: (abbr: string) => void;
  onZoomState: (abbr: string) => void;
  onSelectCounty: (fips: string, name: string, abbr: string) => void;
  onHover: (text: string | null) => void;
  onClear: () => void;
  showFips: boolean;
};

function presentation(abbr: string, mode: MapMode, vacant: ReadonlySet<string>): string {
  const layer = vacant.has(abbr) ? "vacancy" : FEDERAL_LAYER(abbr);
  if (mode === "all") return layer;
  if (mode === "deadline") return abbr === "AK" || abbr === "AZ" || abbr === "CA" || abbr === "CO" ? "deadline" : "dim";
  if (mode === "vacancy") return vacant.has(abbr) ? "vacancy" : "dim";
  if (mode === "federal") return layer === "federal" ? "federal" : "dim";
  return layer === "statewide" ? "statewide" : "dim";
}

function FEDERAL_LAYER(abbr: string): "federal" | "statewide" {
  return abbr === "UT" || abbr === "CO" || abbr === "MO" || abbr === "IN" ? "federal" : "statewide";
}

function fitAspect(v: View, aspect: number): View {
  const a = v.w / v.h;
  if (!Number.isFinite(aspect) || aspect <= 0) return v;
  if (a > aspect) {
    const h = v.w / aspect;
    return { x: v.x, y: v.y - (h - v.h) / 2, w: v.w, h };
  }
  const w = v.h * aspect;
  return { x: v.x - (w - v.w) / 2, y: v.y, w, h: v.h };
}

function boundsOf(list: StateGeom[]): View {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const g of list) {
    x0 = Math.min(x0, g.b[0]);
    y0 = Math.min(y0, g.b[1]);
    x1 = Math.max(x1, g.b[2]);
    y1 = Math.max(y1, g.b[3]);
  }
  if (!Number.isFinite(x0)) return { x: 0, y: 0, w: 1000, h: 620 };
  const pw = (x1 - x0) * 0.05 + 8;
  const ph = (y1 - y0) * 0.08 + 12;
  return { x: x0 - pw, y: y0 - ph, w: x1 - x0 + pw * 2, h: y1 - y0 + ph * 2 };
}

function fromBox(b: [number, number, number, number]): View {
  const w = Math.max(8, b[2] - b[0]);
  const h = Math.max(8, b[3] - b[1]);
  const pad = Math.max(w, h) < 40 ? 1.4 : 0.22;
  const px = w * pad;
  const py = h * pad;
  return { x: b[0] - px, y: b[1] - py, w: w + px * 2, h: h + py * 2 };
}

let countyCache: CountyGeom[] | null = null;
let countyLoad: Promise<CountyGeom[]> | null = null;

function loadCounties(): Promise<CountyGeom[]> {
  if (countyCache) return Promise.resolve(countyCache);
  countyLoad ??= import("@/data/geo-counties.json").then((mod) => {
    const data = mod.default;
    countyCache = data;
    return data;
  });
  return countyLoad;
}

export function MapCanvas({
  geoms,
  markers,
  frame,
  selectedAbbr,
  selectedCounty,
  mapMode,
  vacantAbbrs,
  asOf,
  cameraId,
  cameraBox,
  onSelectState,
  onZoomState,
  onSelectCounty,
  onHover,
  onClear,
  showFips,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const userMoved = useRef(false);
  const drag = useRef<{ x: number; y: number; view: View; id: number } | null>(null);
  const [view, setView] = useState<View>({ x: -30, y: -36, w: 1060, h: 690 });
  const [counties, setCounties] = useState<CountyGeom[] | null>(countyCache);
  const [hoverCounty, setHoverCounty] = useState<string | null>(null);

  const visible = geoms.filter((g) => g.frame === frame);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    userMoved.current = false;
    const apply = () => {
      if (userMoved.current) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 48 || h < 48) return;
      const aspect = Math.min(3.2, Math.max(0.35, w / h));
      const base = cameraBox ? fromBox(cameraBox) : boundsOf(visible);
      setView(fitAspect(base, aspect));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cameraId, cameraBox, frame]);

  const countyState = (() => {
    if (view.w > 460) return null;
    if (selectedAbbr) {
      const g = geoms.find((s) => s.abbr === selectedAbbr && s.frame === frame);
      if (g) return g;
    }
    const cx = view.x + view.w / 2;
    const cy = view.y + view.h / 2;
    let best: StateGeom | null = null;
    let bestD = Infinity;
    for (const g of visible) {
      const inside = cx >= g.b[0] && cx <= g.b[2] && cy >= g.b[1] && cy <= g.b[3];
      if (!inside) continue;
      const d = (g.cx - cx) ** 2 + (g.cy - cy) ** 2;
      if (d < bestD) {
        best = g;
        bestD = d;
      }
    }
    return best;
  })();

  useEffect(() => {
    if (!countyState) return;
    let cancel = false;
    loadCounties().then((rows) => {
      if (!cancel) setCounties(rows);
    });
    return () => {
      cancel = true;
    };
  }, [countyState]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      userMoved.current = true;
      const svg = el.querySelector("svg");
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      setView((v) => {
        const factor = Math.exp(e.deltaY * 0.00115);
        const nw = Math.min(1680, Math.max(28, v.w * factor));
        const nh = Math.min(1200, Math.max(18, v.h * factor));
        const ax = v.x + px * v.w;
        const ay = v.y + py * v.h;
        return { x: ax - px * nw, y: ay - py * nh, w: nw, h: nh };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const zoomBy = (factor: number) => {
    setView((v) => {
      const nw = Math.min(1680, Math.max(28, v.w * factor));
      const nh = Math.min(1200, Math.max(18, v.h * factor));
      const cx = v.x + v.w / 2;
      const cy = v.y + v.h / 2;
      return { x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh };
    });
  };

  const countyRows =
    countyState && counties ? counties.filter((c) => c.state === countyState.fips) : [];

  const vacant = new Set(vacantAbbrs);
  const seats = SEATS.filter((s) => frame === "nation" && vacant.has(s.abbr));

  return (
    <div
      ref={wrapRef}
      className="map-wrap"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        moved.current = false;
        drag.current = { x: e.clientX, y: e.clientY, view, id: e.pointerId };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        if (!moved.current && Math.hypot(dx, dy) < 4) return;
        moved.current = true;
        userMoved.current = true;
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!rect) return;
        const sx = d.view.w / rect.width;
        const sy = d.view.h / rect.height;
        setView({ x: d.view.x - dx * sx, y: d.view.y - dy * sy, w: d.view.w, h: d.view.h });
      }}
      onPointerUp={(e) => {
        const had = drag.current;
        const wasDrag = moved.current;
        drag.current = null;
        if (!had || wasDrag) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const node = el instanceof Element ? el : null;
        const county = node?.closest("[data-county]");
        if (county instanceof SVGElement && county.dataset.county && county.dataset.cname && county.dataset.cabbr) {
          onSelectCounty(county.dataset.county, county.dataset.cname, county.dataset.cabbr);
          return;
        }
        const state = node?.closest("[data-abbr]");
        if (state instanceof SVGElement && state.dataset.abbr) {
          if (e.detail >= 2) onZoomState(state.dataset.abbr);
          else onSelectState(state.dataset.abbr);
          return;
        }
        onClear();
      }}
      onPointerLeave={() => {
        if (!drag.current) onHover(null);
      }}
    >
      <svg
        className="map-svg"
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        role="img"
        aria-label="Map of jurisdictions"
      >
        <defs>
          <radialGradient id="vacancy-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-glow)" stopOpacity="0.95" />
            <stop offset="32%" stopColor="var(--color-vacancy)" stopOpacity="0.45" />
            <stop offset="72%" stopColor="var(--color-vacancy)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x={view.x} y={view.y} width={view.w} height={view.h} fill="transparent" />
        {visible.map((g) => {
          const tone = presentation(g.abbr, mapMode, vacant);
          const w = g.b[2] - g.b[0];
          const showLabel = w >= 14 || view.w < 400;
          const gov = governorOn(asOf, g.abbr);
          const showGov = Boolean(gov) && (w >= 34 || view.w < 480 || selectedAbbr === g.abbr);
          return (
            <g key={g.abbr} data-abbr={g.abbr}>
              <path
                d={g.d}
                data-layer={tone}
                className={"jurisdiction" + (selectedAbbr === g.abbr ? " is-selected" : "")}
                onPointerEnter={() => {
                  setHoverCounty(null);
                  onHover(showFips ? `${g.name} · FIPS ${g.fips}` : gov ? `${g.name} · ${gov.short}` : g.name);
                }}
              >
                <title>{gov ? `${g.name} · ${gov.name}` : g.name}</title>
              </path>
              {showLabel ? (
                <g className="state-label">
                  <text
                    x={g.cx}
                    y={showGov ? g.cy - 5 : g.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={w < 28 ? 8 : 11}
                  >
                    {g.abbr}
                  </text>
                  {showGov && gov ? (
                    <text
                      className="gov-label"
                      x={g.cx}
                      y={g.cy + 7}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={w < 40 ? 6.5 : 8}
                    >
                      {gov.short} {gov.party}
                    </text>
                  ) : null}
                </g>
              ) : null}
            </g>
          );
        })}
        {countyRows.map((c) => (
          <path
            key={c.fips}
            d={c.d}
            data-county={c.fips}
            data-cname={c.name}
            data-cabbr={countyState?.abbr}
            className={"county" + (selectedCounty === c.fips ? " is-selected" : "")}
            onPointerEnter={() => {
              setHoverCounty(c.fips);
              onHover(showFips ? `${c.name} · FIPS ${c.fips}` : `${c.name} County`);
            }}
          >
            <title>{showFips ? `${c.name} · FIPS ${c.fips}` : c.name}</title>
          </path>
        ))}
        {frame === "nation"
          ? seats.map((s) => {
              const pt = markers[s.xKey];
              if (!pt) return null;
              const [x, y] = pt;
              return (
                <g key={s.id} className="vacancy-mark">
                  <circle className="glow" cx={x} cy={y} r="58" fill="url(#vacancy-glow)" />
                  <circle className="glow glow-b" cx={x} cy={y} r="34" fill="url(#vacancy-glow)" />
                </g>
              );
            })
          : null}
        {frame === "nation"
          ? seats.map((s) => {
              const pt = markers[s.xKey];
              if (!pt) return null;
              const [x, y] = pt;
              const label = `${s.label} vacant`;
              const width = label.length * 5.6 + 14;
              return (
                <g
                  key={`${s.id}-pill`}
                  className="vacancy-pill"
                  data-abbr={s.abbr}
                  transform={`translate(${x - width / 2}, ${y - 46})`}
                >
                  <rect width={width} height="16" rx="4" />
                  <text x={width / 2} y="11.5" textAnchor="middle">
                    {label}
                  </text>
                </g>
              );
            })
          : null}
        {countyState && view.w < 180
          ? countyRows
              .filter((c) => hoverCounty === c.fips || selectedCounty === c.fips)
              .map((c) => (
                <text
                  key={`${c.fips}-lab`}
                  className="county-label"
                  x={c.cx}
                  y={c.cy}
                  textAnchor="middle"
                >
                  {c.name}
                </text>
              ))
          : null}
        {showFips && countyRows.length === 0
          ? visible.map((g) => {
              const w = g.b[2] - g.b[0];
              if (w < 14 && view.w >= 400) return null;
              return (
                <text
                  key={`${g.abbr}-fips`}
                  className="fips-label"
                  x={g.cx}
                  y={g.cy + (w < 28 ? 9 : 13)}
                  textAnchor="middle"
                  fontSize={w < 28 ? 5.5 : 7}
                  strokeWidth={0.6}
                >
                  {g.fips}
                </text>
              );
            })
          : null}
        {showFips
          ? countyRows.map((c) => (
              <text
                key={`${c.fips}-fips`}
                className="fips-label"
                x={c.cx}
                y={c.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.max(2.4, Math.min(6, view.w / 42))}
                strokeWidth={0.35}
              >
                {c.fips}
              </text>
            ))
          : null}
      </svg>
      <div className="zoom-stack">
        <button type="button" aria-label="Zoom in" onClick={() => zoomBy(0.78)}>
          +
        </button>
        <button type="button" aria-label="Zoom out" onClick={() => zoomBy(1.28)}>
          −
        </button>
      </div>
    </div>
  );
}
