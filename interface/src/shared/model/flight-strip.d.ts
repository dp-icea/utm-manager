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

// Synchronized with backend schema
export interface FlightStrip {
  name: string;
  flight_area: FlightArea; // Changed to match backend snake_case
  height?: number;
  takeoff_space?: string; // Changed to match backend snake_case
  landing_space?: string; // Changed to match backend snake_case
  takeoff_time?: string; // Changed to match backend snake_case
  landing_time?: string; // Changed to match backend snake_case
  description?: string;
  active: boolean;
  created_at: string; // Added timestamp fields from backend
  updated_at: string;
}

// Legacy interface for backward compatibility with existing UI components
export interface FlightStripUI {
  name: string;
  flightArea: FlightArea;
  height?: number;
  takeoffSpace?: string;
  landingSpace?: string;
  takeoffTime?: string;
  landingTime?: string;
  description?: string;
  active: boolean;
}

// Conversion functions between backend and UI formats
export function toUIFormat(strip: FlightStrip): FlightStripUI {
  return {
    name: strip.name,
    flightArea: strip.flight_area,
    height: strip.height,
    takeoffSpace: strip.takeoff_space,
    landingSpace: strip.landing_space,
    takeoffTime: strip.takeoff_time,
    landingTime: strip.landing_time,
    description: strip.description,
    active: strip.active,
  };
}

export function toBackendFormat(
  strip: FlightStripUI,
): Omit<FlightStrip, "created_at" | "updated_at"> {
  return {
    name: strip.name,
    flight_area: strip.flightArea,
    height: strip.height,
    takeoff_space: strip.takeoffSpace,
    landing_space: strip.landingSpace,
    takeoff_time: strip.takeoffTime,
    landing_time: strip.landingTime,
    description: strip.description,
    active: strip.active,
  };
}

export const FLIGHT_AREA_COLORS: Record<FlightArea, string> = {
  red: "hsl(var(--flight-red))",
  yellow: "hsl(var(--flight-yellow))",
  orange: "hsl(var(--flight-orange))",
  green: "hsl(var(--flight-green))",
  blue: "hsl(var(--flight-blue))",
  purple: "hsl(var(--flight-purple))",
};
