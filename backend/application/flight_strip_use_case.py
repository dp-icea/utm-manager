"""Flight Strip Use Cases - Simplified application layer"""

from typing import List, Optional
from datetime import datetime
import logging

from domain.flight_strip import FlightStrip
from schemas.requests.flight_strip import FlightArea
from ports.flight_strip_port import FlightStripRepositoryPort
from schemas.api import ApiException
from http import HTTPStatus


class FlightStripUseCase:
    """
    Simplified Flight Strip Use Cases

    Contains the application logic for flight strip management
    matching the frontend UI requirements.
    """

    def __init__(self, flight_strip_repository: FlightStripRepositoryPort):
        self.repository = flight_strip_repository

    async def create_flight_strip(
        self, flight_strip: FlightStrip
    ) -> FlightStrip:
        """Create a new flight strip with business validation"""
        try:
            # Business rule: Check for duplicate names
            existing = await self.repository.get_by_flight_name(
                flight_strip.name
            )
            if existing:
                raise ApiException(
                    status_code=HTTPStatus.CONFLICT,
                    message=(
                        f"Flight strip with name '{flight_strip.name}' already"
                        " exists"
                    ),
                    details={"existing_name": existing.name},
                )

            # Set creation timestamp
            flight_strip.created_at = datetime.utcnow()
            flight_strip.updated_at = datetime.utcnow()

            created_strip = await self.repository.create(flight_strip)

            logging.info(
                f"Created flight strip: {created_strip.name} in"
                f" {created_strip.flight_area} area"
            )
            return created_strip

        except ApiException:
            raise
        except Exception as e:
            logging.error(f"Error creating flight strip: {e}")
            raise ApiException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                message="Failed to create flight strip",
                details=str(e),
            )

    async def get_flight_strip(self, flight_strip_id: str) -> FlightStrip:
        """Retrieve flight strip by ID"""
        try:
            flight_strip = await self.repository.get_by_id(flight_strip_id)
            if not flight_strip:
                raise ApiException(
                    status_code=HTTPStatus.NOT_FOUND,
                    message=(
                        f"Flight strip with ID '{flight_strip_id}' not found"
                    ),
                )

            return flight_strip

        except ApiException:
            raise
        except Exception as e:
            logging.error(
                f"Error retrieving flight strip {flight_strip_id}: {e}"
            )
            raise ApiException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                message="Failed to retrieve flight strip",
                details=str(e),
            )

    async def get_flight_strip_by_flight_name(
        self, flight_name: str
    ) -> FlightStrip:
        """Retrieve flight strip by flight name"""
        try:
            flight_strip = await self.repository.get_by_flight_name(
                flight_name
            )
            if not flight_strip:
                raise ApiException(
                    status_code=HTTPStatus.NOT_FOUND,
                    message=(
                        f"Flight strip with flight name '{flight_name}' not"
                        " found"
                    ),
                )

            return flight_strip

        except ApiException:
            raise
        except Exception as e:
            logging.error(
                "Error retrieving flight strip by flight name"
                f" {flight_name}: {e}"
            )
            raise ApiException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                message="Failed to retrieve flight strip",
                details=str(e),
            )

    async def update_flight_strip(
        self, flight_strip_id: str, **update_fields
    ) -> FlightStrip:
        """Update existing flight strip with business validation"""
        try:
            # Ensure the flight strip exists
            existing = await self.repository.get_by_id(flight_strip_id)
            if not existing:
                raise ApiException(
                    status_code=HTTPStatus.NOT_FOUND,
                    message=(
                        f"Flight strip with ID '{flight_strip_id}' not found"
                    ),
                )

            # Update fields using domain logic
            existing.update_fields(**update_fields)

            updated_strip = await self.repository.update(existing)

            logging.info(
                f"Updated flight strip: {updated_strip.name} in"
                f" {updated_strip.flight_area} area"
            )
            return updated_strip

        except ApiException:
            raise
        except Exception as e:
            logging.error(
                f"Error updating flight strip {flight_strip_id}: {e}"
            )
            raise ApiException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                message="Failed to update flight strip",
                details=str(e),
            )

    async def delete_flight_strip(self, flight_strip_name: str) -> bool:
        """Delete flight strip"""
        try:
            # Check if flight strip exists
            existing = await self.repository.get_by_flight_name(
                flight_strip_name
            )
            if not existing:
                raise ApiException(
                    status_code=HTTPStatus.NOT_FOUND,
                    message=(
                        f"Flight strip with ID '{flight_strip_name}' not found"
                    ),
                )

            success = await self.repository.delete(flight_strip_name)

            if success:
                logging.info(
                    f"Deleted flight strip: {existing.name} from"
                    f" {existing.flight_area} area"
                )

            return success

        except ApiException:
            raise
        except Exception as e:
            logging.error(
                f"Error deleting flight strip {flight_strip_name}: {e}"
            )
            raise ApiException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                message="Failed to delete flight strip",
                details=str(e),
            )

    async def list_all_flight_strips(self) -> List[FlightStrip]:
        """Get all flight strips"""
        try:
            return await self.repository.list_all()
        except Exception as e:
            logging.error(f"Error listing all flight strips: {e}")
            raise ApiException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                message="Failed to retrieve flight strips",
                details=str(e),
            )

    async def list_by_flight_area(
        self, flight_area: FlightArea
    ) -> List[FlightStrip]:
        """Get flight strips by flight area"""
        try:
            return await self.repository.list_by_flight_area(flight_area)
        except Exception as e:
            logging.error(f"Error listing flights by area {flight_area}: {e}")
            raise ApiException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                message="Failed to retrieve flights by area",
                details=str(e),
            )

    async def search_flight_strips(
        self,
        flight_area: Optional[FlightArea] = None,
        takeoff_time_start: Optional[str] = None,
        takeoff_time_end: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[FlightStrip]:
        """Search flight strips with filters"""
        try:
            return await self.repository.search(
                flight_area=flight_area,
                takeoff_time_start=takeoff_time_start,
                takeoff_time_end=takeoff_time_end,
                limit=limit,
                offset=offset,
            )
        except Exception as e:
            logging.error(f"Error searching flight strips: {e}")
            raise ApiException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                message="Failed to search flight strips",
                details=str(e),
            )
