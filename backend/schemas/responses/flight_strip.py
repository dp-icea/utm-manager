"""Flight Strip Response Schemas - API output formatting"""

from typing import List
from datetime import datetime
from pydantic import BaseModel

from schemas.requests.flight_strip import FlightArea


class FlightStripResponse(BaseModel):
    """Response schema for flight strip data"""

    name: str
    flight_area: FlightArea
    height: int
    takeoff_space: str
    landing_space: str
    takeoff_time: str
    landing_time: str
    created_at: datetime
    updated_at: datetime
    
    @classmethod
    def from_domain(cls, flight_strip) -> "FlightStripResponse":
        """Create response from domain model, excluding MongoDB ID and call_sign"""
        return cls(
            name=flight_strip.name,
            flight_area=flight_strip.flight_area,
            height=flight_strip.height,
            takeoff_space=flight_strip.takeoff_space,
            landing_space=flight_strip.landing_space,
            takeoff_time=flight_strip.takeoff_time,
            landing_time=flight_strip.landing_time,
            created_at=flight_strip.created_at,
            updated_at=flight_strip.updated_at,
        )


class FlightStripListResponse(BaseModel):
    """Response schema for flight strip lists"""

    flight_strips: List[FlightStripResponse]
    total_count: int
    offset: int


class FlightStripCreatedResponse(BaseModel):
    """Response schema for successful flight strip creation"""

    message: str = "Flight strip created successfully"
    flight_strip: FlightStripResponse


class FlightStripUpdatedResponse(BaseModel):
    """Response schema for successful flight strip update"""

    message: str = "Flight strip updated successfully"
    flight_strip: FlightStripResponse


class FlightStripDeletedResponse(BaseModel):
    """Response schema for successful flight strip deletion"""

    message: str = "Flight strip deleted successfully"
    deleted_name: str

