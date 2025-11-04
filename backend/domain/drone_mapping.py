"""Drone Mapping Domain Model"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId


class DroneMapping(BaseModel):
    """
    Domain model for drone mappings that map drone identifiers to human-readable names
    """
    
    # MongoDB ObjectId (handled by adapter)
    _id: Optional[str] = None
    
    id: str = Field(..., description="Human-readable identifier/name for the drone")
    serial_number: str = Field(..., description="Drone serial number")
    sisant: str = Field(..., description="SISANT number for the drone")
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    deleted_by: Optional[str] = None
    
    class Config:
        """Pydantic configuration"""
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat() if v else None
        }
        
    def is_deleted(self) -> bool:
        """Check if the drone mapping is soft deleted"""
        return self.deleted_at is not None
        
    def soft_delete(self, deleted_by: Optional[str] = None) -> None:
        """Soft delete the drone mapping"""
        self.deleted_at = datetime.utcnow()
        self.deleted_by = deleted_by
        
    def restore(self) -> None:
        """Restore a soft deleted drone mapping"""
        self.deleted_at = None
        self.deleted_by = None