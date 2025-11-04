"""API request schemas for drone mapping endpoints"""

from typing import List, Optional
from pydantic import BaseModel, Field


class CreateDroneMappingRequest(BaseModel):
    """Request model for creating a single drone mapping"""

    id: str = Field(
        ..., description="Human-readable identifier/name for the drone"
    )
    serial_number: str = Field(..., description="Drone serial number")
    sisant: str = Field(..., description="SISANT number for the drone")
    created_by: Optional[str] = Field(
        None, description="Who created this mapping"
    )


class BulkCreateDroneMappingsRequest(BaseModel):
    """Request model for creating multiple drone mappings at once"""

    mappings: List[CreateDroneMappingRequest] = Field(
        ..., description="List of drone mappings to create"
    )
    created_by: Optional[str] = Field(
        None, description="Who created these mappings"
    )


class UpdateDroneMappingRequest(BaseModel):
    """Request model for updating a drone mapping"""

    id: Optional[str] = Field(
        None, description="Human-readable identifier/name for the drone"
    )
    serial_number: Optional[str] = Field(
        None, description="Drone serial number"
    )
    sisant: Optional[str] = Field(
        None, description="SISANT number for the drone"
    )
    updated_by: Optional[str] = Field(
        None, description="Who updated this mapping"
    )

