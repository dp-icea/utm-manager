import {
  toBackendFormat,
  toUIFormat,
  type FlightStrip,
  type FlightStripUI,
} from "@/shared/model";

import type { FlightStripListResponse } from "./flight-strips.d";

import { api } from "./api";

const RESOURCE_PATH = "/flight-strips";

export const FlightStripsService = {
  create: async (strip: FlightStripUI): Promise<FlightStripUI> => {
    const backendData = toBackendFormat(strip);
    const res = await api.post(`${RESOURCE_PATH}/`, backendData);
    return toUIFormat(res.data.flight_strip);
  },

  listAll: async (): Promise<FlightStripUI[]> => {
    const { data }: { data: FlightStripListResponse } = await api.get(
      `${RESOURCE_PATH}/`,
    );

    if (!data) {
      return [];
    }

    return data.flight_strips.map(toUIFormat);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${RESOURCE_PATH}/${id}`);
  },
};
