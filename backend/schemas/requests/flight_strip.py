"""Flight Strip Request Schemas - API input validation"""

from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class FlightArea(str, Enum):
    """Flight area color zones"""
    RED = "red"
    YELLOW = "yellow"
    ORANGE = "orange"
    GREEN = "green"
    BLUE = "blue"
    PURPLE = "purple"


class CreateFlightStripRequest(BaseModel):
    """Request schema for creating a new flight strip"""
    
    id: str = Field(..., min_length=1, max_length=20, description="Flight strip ID")
    flight_area: FlightArea = Field(..., description="Flight area color zone")
    height: int = Field(..., gt=0, description="Flight height in meters")
    takeoff_space: str = Field(..., min_length=1, max_length=10, description="Takeoff space identifier")
    landing_space: str = Field(..., min_length=1, max_length=10, description="Landing space identifier")
    takeoff_time: str = Field(..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", description="Takeoff time in HH:MM format")
    landing_time: str = Field(..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", description="Landing time in HH:MM format")


class UpdateFlightStripRequest(BaseModel):
    """Request schema for updating a flight strip"""
    
    flight_area: Optional[FlightArea] = Field(None, description="Flight area color zone")
    height: Optional[int] = Field(None, gt=0, description="Flight height in meters")
    takeoff_space: Optional[str] = Field(None, min_length=1, max_length=10, description="Takeoff space identifier")
    landing_space: Optional[str] = Field(None, min_length=1, max_length=10, description="Landing space identifier")
    takeoff_time: Optional[str] = Field(None, pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", description="Takeoff time in HH:MM format")
    landing_time: Optional[str] = Field(None, pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", description="Landing time in HH:MM format")


class SearchFlightStripsRequest(BaseModel):
    """Request schema for searching flight strips"""
    
    flight_area: Optional[FlightArea] = Field(None, description="Filter by flight area")
    takeoff_time_start: Optional[str] = Field(None, pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", description="Filter takeoff time from")
    takeoff_time_end: Optional[str] = Field(None, pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", description="Filter takeoff time to")
    limit: int = Field(default=100, ge=1, le=1000)
    offset: int = Field(default=0, ge=0)