import { createServerFn } from "@tanstack/react-start";

export type GeocodeHit = {
  matched: string;
  lat: number;
  lng: number;
  stateFips: string;
  stateAbbr: string;
  countyFips: string;
  countyName: string;
};

type Query = { address?: string; lat?: number; lng?: number };

const ENDPOINT = "https://geocoding.geo.census.gov/geocoder/geographies";

function cleanAddress(value: string): string | null {
  const address = value.replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
  if (address.length < 5 || !/\d/.test(address) || !/[a-z]/i.test(address)) return null;
  return address;
}

function pad(value: unknown, width: number): string {
  return String(value ?? "").replace(/\D/g, "").padStart(width, "0");
}

function geography(row: Record<string, unknown> | undefined, lat: number, lng: number, matched: string): GeocodeHit | null {
  if (!row) return null;
  const states = (row.States as Record<string, unknown>[] | undefined)?.[0];
  const counties = (row.Counties as Record<string, unknown>[] | undefined)?.[0];
  const abbr = String(states?.STUSAB ?? "").toUpperCase();
  const countyFips = pad(counties?.GEOID, 5);
  const rawName = String(counties?.NAME ?? "");
  const base = String(counties?.BASENAME ?? "").replace(/ County$/i, "");
  const countyName = / county$/i.test(rawName) ? base : rawName || base;
  if (!abbr || countyFips.length !== 5 || !countyName) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    matched,
    lat,
    lng,
    stateFips: pad(states?.GEOID ?? states?.STATE, 2),
    stateAbbr: abbr,
    countyFips,
    countyName,
  };
}

export async function lookupCensus(input: Query): Promise<GeocodeHit | null> {
  const address = input.address ? cleanAddress(input.address) : null;
  const lat = Number(input.lat);
  const lng = Number(input.lng);
  const byPoint = !address && Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  if (!address && !byPoint) return null;
  const url = new URL(address ? `${ENDPOINT}/onelineaddress` : `${ENDPOINT}/coordinates`);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("vintage", "Current_Current");
  url.searchParams.set("format", "json");
  if (address) url.searchParams.set("address", address);
  else {
    url.searchParams.set("x", String(lng));
    url.searchParams.set("y", String(lat));
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { accept: "application/json" } });
  if (!response.ok) return null;
  const body = (await response.json()) as { result?: Record<string, unknown> };
  const result = body.result ?? {};
  if (address) {
    const match = (result.addressMatches as Record<string, unknown>[] | undefined)?.[0];
    if (!match) return null;
    const coordinates = match.coordinates as { x?: number; y?: number } | undefined;
    return geography(
      match.geographies as Record<string, unknown> | undefined,
      Number(coordinates?.y),
      Number(coordinates?.x),
      String(match.matchedAddress ?? address),
    );
  }
  return geography(result.geographies as Record<string, unknown> | undefined, lat, lng, "This point");
}

export const geocodeCensus = createServerFn({ method: "POST" })
  .validator((data: Query) => data)
  .handler(async ({ data }) => lookupCensus(data));
