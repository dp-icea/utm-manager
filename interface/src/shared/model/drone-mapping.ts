import type { DroneMapping, DroneMappingUI } from './drone-mapping.d';

// Conversion functions between backend and UI formats
export function droneMappingToUIFormat(mapping: DroneMapping): DroneMappingUI {
  return {
    _id: mapping._id,
    id: mapping.id,
    serialNumber: mapping.serial_number,
    sisant: mapping.sisant,
    createdAt: mapping.created_at,
    updatedAt: mapping.updated_at,
    deletedAt: mapping.deleted_at,
    createdBy: mapping.created_by,
    updatedBy: mapping.updated_by,
    deletedBy: mapping.deleted_by,
  };
}

export function droneMappingToBackendFormat(
  mapping: DroneMappingUI,
): Omit<DroneMapping, "created_at" | "updated_at" | "deleted_at"> {
  return {
    _id: mapping._id,
    id: mapping.id,
    serial_number: mapping.serialNumber,
    sisant: mapping.sisant,
    created_by: mapping.createdBy,
    updated_by: mapping.updatedBy,
    deleted_by: mapping.deletedBy,
  };
}