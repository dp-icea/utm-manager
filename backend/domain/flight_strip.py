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
    id: str = Field(..., description="Flight strip identifier")
    flight_area: FlightArea = Field(..., description="Flight area color zone")
    height: int = Field(..., gt=0, description="Flight height in meters")
    takeoff_space: str = Field(..., description="Takeoff space identifier")
    landing_space: str = Field(..., description="Landing space identifier")
    takeoff_time: str = Field(..., description="Takeoff time in HH:MM format")
    landing_time: str = Field(..., description="Landing time in HH:MM format")
    
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