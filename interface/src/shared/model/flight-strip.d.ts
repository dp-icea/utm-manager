export type FlightArea =
  | "red"
  | "yellow"
  | "orange"
  | "green"
  | "blue"
  | "purple";

export const FLIGHT_AREAS: FlightArea[] = [
  "red",
  "yellow",
  "orange",
  "green",
  "blue",
  "purple",
];

export const FLIGHT_AREA_LABELS: Record<FlightArea, string> = {
  red: "Red",
  yellow: "Yellow",
  orange: "Orange",
  green: "Green",
  blue: "Blue",
  purple: "Purple",
};

export function formatFlightArea(area: FlightArea): string {
  return FLIGHT_AREA_LABELS[area];
}

export interface FlightStrip {
  id: string;
  flightArea: FlightArea;
  height: number;
  takeoffSpace: string;
  landingSpace: string;
  takeoffTime: string;
  landingTime: string;
}

export const FLIGHT_AREA_COLORS: Record<FlightArea, string> = {
  red: "hsl(var(--flight-red))",
  yellow: "hsl(var(--flight-yellow))",
  orange: "hsl(var(--flight-orange))",
  green: "hsl(var(--flight-green))",
  blue: "hsl(var(--flight-blue))",
  purple: "hsl(var(--flight-purple))",
};
