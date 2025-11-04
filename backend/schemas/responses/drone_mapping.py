"""API response schemas for drone mapping endpoints"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from schemas.api import ApiResponse


class DroneMappingResponse(BaseModel):
    """Response model for a single drone mapping"""

    id: str = Field(
        ..., description="Human-readable identifier/name for the drone"
    )
    serial_number: str = Field(..., description="Drone serial number")
    sisant: str = Field(..., description="SISANT number for the drone")

    # Audit fields
    created_at: datetime = Field(
        ..., description="When the mapping was created"
    )
    updated_at: Optional[datetime] = Field(
        None, description="When the mapping was last updated"
    )
    deleted_at: Optional[datetime] = Field(
        None, description="When the mapping was deleted (if soft deleted)"
    )
    created_by: Optional[str] = Field(
        None, description="Who created this mapping"
    )
    updated_by: Optional[str] = Field(
        None, description="Who last updated this mapping"
    )
    deleted_by: Optional[str] = Field(
        None, description="Who deleted this mapping"
    )

    @classmethod
    def from_domain(cls, drone_mapping) -> "DroneMappingResponse":
        """Convert from domain model to response model"""
        return cls(
            id=drone_mapping.id,
            serial_number=drone_mapping.serial_number,
            sisant=drone_mapping.sisant,
            created_at=drone_mapping.created_at,
            updated_at=drone_mapping.updated_at,
            deleted_at=drone_mapping.deleted_at,
            created_by=drone_mapping.created_by,
            updated_by=drone_mapping.updated_by,
            deleted_by=drone_mapping.deleted_by,
        )


class DroneMappingCreatedData(BaseModel):
    """Data for drone mapping creation response"""

    drone_mapping: DroneMappingResponse


class DroneMappingCreatedResponse(ApiResponse):
    """Response model for drone mapping creation endpoint"""

    message: str = "Drone mapping created successfully"
    data: DroneMappingCreatedData


class BulkDroneMappingCreatedData(BaseModel):
    """Data for bulk drone mapping creation response"""

    drone_mappings: List[DroneMappingResponse]
    created_count: int


class BulkDroneMappingCreatedResponse(ApiResponse):
    """Response model for bulk drone mapping creation endpoint"""

    message: str = "Drone mappings created successfully"
    data: BulkDroneMappingCreatedData


class DroneMappingUpdatedData(BaseModel):
    """Data for drone mapping update response"""

    drone_mapping: DroneMappingResponse


class DroneMappingUpdatedResponse(ApiResponse):
    """Response model for drone mapping update endpoint"""

    message: str = "Drone mapping updated successfully"
    data: DroneMappingUpdatedData


class DroneMappingDeletedData(BaseModel):
    """Data for drone mapping deletion response"""

    deleted_id: str


class DroneMappingDeletedResponse(ApiResponse):
    """Response model for drone mapping deletion endpoint"""

    message: str = "Drone mapping deleted successfully"
    data: DroneMappingDeletedData


class DroneMappingListData(BaseModel):
    """Data for drone mapping list response"""

    drone_mappings: List[DroneMappingResponse]
    total_count: int
    offset: int


class DroneMappingListResponse(ApiResponse):
    """Response model for drone mapping list endpoint"""

    message: str = "Drone mappings retrieved successfully"
    data: DroneMappingListData

