// Synchronized with backend schema
export interface DroneMapping {
  _id?: string;
  id: string;
  serial_number: string;
  sisant: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
}

// Legacy interface for backward compatibility with existing UI components
export interface DroneMappingUI {
  _id?: string;
  id: string;
  serialNumber: string;
  sisant: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

