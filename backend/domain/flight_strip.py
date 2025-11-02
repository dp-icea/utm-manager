"""Flight Strip Domain Entity - Simplified for UI mockup"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from schemas.requests.flight_strip import FlightArea


class FlightStrip(BaseModel):
    """
    Simplified Flight Strip Domain Entity
    
    Represents a flight strip matching the frontend UI requirements.
    Contains only the essential fields used in the mockup interface.
    """
    
    # Core fields matching frontend interface
    name: str = Field(..., description="Flight strip identifier")
    
    # MongoDB document ID (not sent to frontend)
    id: Optional[str] = Field(None, description="MongoDB document ID")
    
    # Call sign field (required by existing MongoDB index, auto-generated from name)
    call_sign: Optional[str] = Field(None, description="Call sign for MongoDB compatibility")
    flight_area: FlightArea = Field(..., description="Flight area color zone")
    height: Optional[int] = Field(None, gt=0, description="Flight height in meters")
    takeoff_space: Optional[str] = Field(None, description="Takeoff space identifier")
    landing_space: Optional[str] = Field(None, description="Landing space identifier")
    takeoff_time: Optional[str] = Field(None, description="Takeoff time in HH:MM format")
    landing_time: Optional[str] = Field(None, description="Landing time in HH:MM format")
    description: Optional[str] = Field(None, description="Flight strip description")
    active: bool = Field(default=True, description="Whether the flight strip is active")
    
    # Timestamps for tracking
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() + "Z"
        }
    
    def update_fields(self, **kwargs) -> None:
        """Update flight strip fields and timestamp"""
        for field, value in kwargs.items():
            if hasattr(self, field) and value is not None:
                setattr(self, field, value)
        self.updated_at = datetime.utcnow()