"""Flight Strip Response Schemas - API output formatting"""

from typing import List
from datetime import datetime
from pydantic import BaseModel

from schemas.requests.flight_strip import FlightArea


class FlightStripResponse(BaseModel):
    """Response schema for flight strip data"""
    
    id: str
    flight_area: FlightArea
    height: int
    takeoff_space: str
    landing_space: str
    takeoff_time: str
    landing_time: str
    created_at: datetime
    updated_at: datetime


class FlightStripListResponse(BaseModel):
    """Response schema for flight strip lists"""
    
    flight_strips: List[FlightStripResponse]
    total_count: int
    offset: int
    limit: int


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
    deleted_id: str