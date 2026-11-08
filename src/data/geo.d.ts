export type StateGeom = {
  fips: string;
  abbr: string;
  name: string;
  frame: string;
  d: string;
  cx: number;
  cy: number;
  b: [number, number, number, number];
};

export type PlacePoint = {
  fips: string;
  st: string;
  name: string;
  x: number;
  y: number;
};

export type CountyGeom = {
  fips: string;
  state: string;
  name: string;
  d: string;
  cx: number;
  cy: number;
};

export type GeoFile = {
  w: number;
  h: number;
  states: StateGeom[];
  markers: Record<string, [number, number]>;
  places: PlacePoint[];
};

declare module "@/data/geo-states.json" {
  const value: GeoFile;
  export default value;
}

declare module "@/data/geo-counties.json" {
  const value: CountyGeom[];
  export default value;
}
