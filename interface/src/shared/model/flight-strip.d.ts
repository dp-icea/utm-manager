export type FlightArea =
  | "Red"
  | "Yellow"
  | "Orange"
  | "Green"
  | "Blue"
  | "Purple";

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
  Red: "hsl(var(--flight-red))",
  Yellow: "hsl(var(--flight-yellow))",
  Orange: "hsl(var(--flight-orange))",
  Green: "hsl(var(--flight-green))",
  Blue: "hsl(var(--flight-blue))",
  Purple: "hsl(var(--flight-purple))",
};
