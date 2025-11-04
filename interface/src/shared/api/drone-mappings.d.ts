import type { DroneMapping } from "@/shared/model";

export interface CreateDroneMappingRequest {
  id: string;
  serial_number: string;
  sisant: string;
  created_by?: string;
}

export interface BulkCreateDroneMappingsRequest {
  mappings: CreateDroneMappingRequest[];
  created_by?: string;
}

export interface UpdateDroneMappingRequest {
  id?: string;
  serial_number?: string;
  sisant?: string;
  updated_by?: string;
}

export interface DroneMappingListResponse {
  drone_mappings: DroneMapping[];
  total_count: number;
  offset: number;
}

export interface DroneMappingCreatedResponse {
  message: string;
  drone_mapping: DroneMapping;
}

export interface BulkDroneMappingCreatedResponse {
  message: string;
  drone_mappings: DroneMapping[];
  created_count: number;
}

export interface DroneMappingUpdatedResponse {
  message: string;
  drone_mapping: DroneMapping;
}

export interface DroneMappingDeletedResponse {
  message: string;
  deleted_id: string;
}

export interface DroneMappingStatistics {
  total_count: number;
  active_count: number;
  deleted_count: number;
}