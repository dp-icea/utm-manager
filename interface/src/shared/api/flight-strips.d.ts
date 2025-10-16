import type { FlightStrip } from "@/shared/model";

export interface CreateFlightStripRequest {
  name: string;
  flight_area: string;
  height: number;
  takeoff_space: string;
  landing_space: string;
  takeoff_time: string;
  landing_time: string;
}

export interface FlightStripListResponse {
  flight_strips: FlightStrip[];
  total_count: number;
  offset: number;
}

export interface FlightStripCreatedResponse {
  message: string;
  flight_strip: FlightStrip;
}

export interface FlightStripUpdatedResponse {
  message: string;
  flight_strip: FlightStrip;
}

export interface FlightStripDeletedResponse {
  message: string;
  deleted_name: string;
}
