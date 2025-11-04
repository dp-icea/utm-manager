import {
  droneMappingToBackendFormat,
  droneMappingToUIFormat,
  type DroneMapping,
  type DroneMappingUI,
} from "@/shared/model";

import type {
  CreateDroneMappingRequest,
  BulkCreateDroneMappingsRequest,
  UpdateDroneMappingRequest,
  DroneMappingListResponse,
  DroneMappingCreatedResponse,
  BulkDroneMappingCreatedResponse,
  DroneMappingUpdatedResponse,
  DroneMappingStatistics,
} from "./drone-mappings.d";

import { api } from "./api";

const RESOURCE_PATH = "/drone-mappings";

export const DroneMappingsService = {
  create: async (mapping: DroneMappingUI): Promise<DroneMappingUI> => {
    const backendData = droneMappingToBackendFormat(mapping);
    const request: CreateDroneMappingRequest = {
      id: backendData.id,
      serial_number: backendData.serial_number,
      sisant: backendData.sisant,
      created_by: backendData.created_by,
    };
    
    const res = await api.post<{ data: DroneMappingCreatedResponse }>(
      `${RESOURCE_PATH}/`,
      request
    );
    return droneMappingToUIFormat(res.data.data.drone_mapping);
  },

  bulkCreate: async (
    mappings: DroneMappingUI[],
    createdBy?: string
  ): Promise<DroneMappingUI[]> => {
    const request: BulkCreateDroneMappingsRequest = {
      mappings: mappings.map(mapping => {
        const backendData = droneMappingToBackendFormat(mapping);
        return {
          id: backendData.id,
          serial_number: backendData.serial_number,
          sisant: backendData.sisant,
          created_by: createdBy || backendData.created_by,
        };
      }),
      created_by: createdBy,
    };

    const res = await api.post<{ data: BulkDroneMappingCreatedResponse }>(
      `${RESOURCE_PATH}/bulk`,
      request
    );
    return res.data.data.drone_mappings.map(droneMappingToUIFormat);
  },

  getById: async (mappingId: string): Promise<DroneMappingUI> => {
    const res = await api.get<DroneMapping>(`${RESOURCE_PATH}/${mappingId}`);
    return droneMappingToUIFormat(res.data);
  },

  listAll: async (offset: number = 0): Promise<DroneMappingUI[]> => {
    const { data }: { data: { data: DroneMappingListResponse } } = await api.get(
      `${RESOURCE_PATH}/`,
      { params: { offset } }
    );

    if (!data?.data) {
      return [];
    }

    return data.data.drone_mappings.map(droneMappingToUIFormat);
  },

  update: async (
    mappingId: string,
    mapping: Partial<DroneMappingUI>
  ): Promise<DroneMappingUI> => {
    const request: UpdateDroneMappingRequest = {};
    
    if (mapping.id !== undefined) request.id = mapping.id;
    if (mapping.serialNumber !== undefined) request.serial_number = mapping.serialNumber;
    if (mapping.sisant !== undefined) request.sisant = mapping.sisant;
    if (mapping.updatedBy !== undefined) request.updated_by = mapping.updatedBy;

    const res = await api.put<{ data: DroneMappingUpdatedResponse }>(
      `${RESOURCE_PATH}/${mappingId}`,
      request
    );
    return droneMappingToUIFormat(res.data.data.drone_mapping);
  },

  delete: async (mappingId: string, deletedBy?: string): Promise<void> => {
    const params = deletedBy ? { deleted_by: deletedBy } : {};
    await api.delete(`${RESOURCE_PATH}/${mappingId}`, { params });
  },

  restore: async (mappingId: string): Promise<DroneMappingUI> => {
    const res = await api.post<DroneMapping>(`${RESOURCE_PATH}/${mappingId}/restore`);
    return droneMappingToUIFormat(res.data);
  },

  findByIdentifier: async (identifier: string): Promise<DroneMappingUI | null> => {
    try {
      const res = await api.get<DroneMapping>(
        `${RESOURCE_PATH}/search/by-identifier/${identifier}`
      );
      return droneMappingToUIFormat(res.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getStatistics: async (): Promise<DroneMappingStatistics> => {
    const res = await api.get<DroneMappingStatistics>(
      `${RESOURCE_PATH}/statistics/deletion`
    );
    return res.data;
  },
};
// Backward compatibility exports
export const DroneMappingAPI = DroneMappingsService;

// Legacy conversion functions for backward compatibility
export function convertToDroneMapping(response: DroneMapping): DroneMappingUI {
  return droneMappingToUIFormat(response);
}

export function convertToCreateRequest(mapping: DroneMappingUI, createdBy?: string): CreateDroneMappingRequest {
  return {
    id: mapping.id,
    serial_number: mapping.serialNumber,
    sisant: mapping.sisant,
    created_by: createdBy,
  };
}