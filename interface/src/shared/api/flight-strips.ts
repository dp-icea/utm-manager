/**
 * Flight Strips API Service
 * Handles communication with the backend flight strips API
 */

import type { FlightStrip, FlightStripUI, toBackendFormat, toUIFormat } from "@/shared/model";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface CreateFlightStripRequest {
  id: string;
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
  limit: number;
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
  deleted_id: string;
}

class FlightStripsAPI {
  private baseUrl = `${API_BASE_URL}/api/flight-strips`;

  async createFlightStrip(strip: FlightStripUI): Promise<FlightStrip> {
    const backendData = toBackendFormat(strip);
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create flight strip: ${response.statusText}`);
    }

    const result: FlightStripCreatedResponse = await response.json();
    return result.flight_strip;
  }

  async getFlightStrip(id: string): Promise<FlightStrip> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to get flight strip: ${response.statusText}`);
    }

    return await response.json();
  }

  async updateFlightStrip(id: string, updates: Partial<FlightStripUI>): Promise<FlightStrip> {
    // Convert UI format to backend format for the update
    const backendUpdates: any = {};
    if (updates.flightArea) backendUpdates.flight_area = updates.flightArea;
    if (updates.height) backendUpdates.height = updates.height;
    if (updates.takeoffSpace) backendUpdates.takeoff_space = updates.takeoffSpace;
    if (updates.landingSpace) backendUpdates.landing_space = updates.landingSpace;
    if (updates.takeoffTime) backendUpdates.takeoff_time = updates.takeoffTime;
    if (updates.landingTime) backendUpdates.landing_time = updates.landingTime;

    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendUpdates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update flight strip: ${response.statusText}`);
    }

    const result: FlightStripUpdatedResponse = await response.json();
    return result.flight_strip;
  }

  async deleteFlightStrip(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete flight strip: ${response.statusText}`);
    }
  }

  async listFlightStrips(params?: {
    flight_area?: string;
    takeoff_time_start?: string;
    takeoff_time_end?: string;
    limit?: number;
    offset?: number;
  }): Promise<FlightStripListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.flight_area) searchParams.append('flight_area', params.flight_area);
    if (params?.takeoff_time_start) searchParams.append('takeoff_time_start', params.takeoff_time_start);
    if (params?.takeoff_time_end) searchParams.append('takeoff_time_end', params.takeoff_time_end);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const url = searchParams.toString() ? `${this.baseUrl}?${searchParams}` : this.baseUrl;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to list flight strips: ${response.statusText}`);
    }

    return await response.json();
  }

  async getFlightStripsByArea(flightArea: string): Promise<FlightStripListResponse> {
    const response = await fetch(`${this.baseUrl}/area/${flightArea}`);

    if (!response.ok) {
      throw new Error(`Failed to get flight strips by area: ${response.statusText}`);
    }

    return await response.json();
  }

  // Convenience methods that return UI-formatted data
  async listFlightStripsUI(params?: {
    flight_area?: string;
    takeoff_time_start?: string;
    takeoff_time_end?: string;
    limit?: number;
    offset?: number;
  }): Promise<FlightStripUI[]> {
    const response = await this.listFlightStrips(params);
    return response.flight_strips.map(toUIFormat);
  }

  async getFlightStripUI(id: string): Promise<FlightStripUI> {
    const strip = await this.getFlightStrip(id);
    return toUIFormat(strip);
  }
}

export const flightStripsAPI = new FlightStripsAPI();