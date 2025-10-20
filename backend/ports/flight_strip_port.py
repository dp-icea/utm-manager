"""Flight Strip Repository Port - Simplified interface for data persistence"""

from abc import ABC, abstractmethod
from typing import List, Optional

from domain.flight_strip import FlightStrip
from schemas.requests.flight_strip import FlightArea


class FlightStripRepositoryPort(ABC):
    """
    Simplified repository interface for flight strip persistence.

    This port defines the contract for flight strip data operations
    matching the frontend UI requirements.
    """

    @abstractmethod
    async def create(self, flight_strip: FlightStrip) -> FlightStrip:
        """Create a new flight strip"""
        pass

    @abstractmethod
    async def get_by_id(self, flight_strip_id: str) -> Optional[FlightStrip]:
        """Retrieve flight strip by database ID"""
        pass

    @abstractmethod
    async def get_by_flight_name(
        self, flight_name: str
    ) -> Optional[FlightStrip]:
        """Retrieve flight strip by flight name"""
        pass

    @abstractmethod
    async def update(self, flight_strip: FlightStrip) -> FlightStrip:
        """Update existing flight strip"""
        pass

    @abstractmethod
    async def delete(self, flight_strip_name: str) -> bool:
        """Delete flight strip by database ID"""
        pass

    @abstractmethod
    async def list_all(self) -> List[FlightStrip]:
        """Get all flight strips"""
        pass

    @abstractmethod
    async def list_by_flight_area(
        self, flight_area: FlightArea
    ) -> List[FlightStrip]:
        """Get flight strips by flight area"""
        pass

    @abstractmethod
    async def search(
        self,
        flight_area: Optional[FlightArea] = None,
        takeoff_time_start: Optional[str] = None,
        takeoff_time_end: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[FlightStrip]:
        """Search flight strips with filters"""
        pass

    @abstractmethod
    async def count_by_flight_area(self) -> dict:
        """Get count of flight strips grouped by flight area"""
        pass

    @abstractmethod
    async def exists(self, flight_strip_id: str) -> bool:
        """Check if flight strip exists by database ID"""
        pass

