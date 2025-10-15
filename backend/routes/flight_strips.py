"""Flight Strip API Routes - Simplified REST endpoints matching frontend UI"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Path
from http import HTTPStatus

from application.flight_strip_use_case import FlightStripUseCase
from adapters.flight_strip_mongodb_adapter import FlightStripMongoDBAdapter
from domain.flight_strip import FlightStrip
from schemas.requests.flight_strip import (
    CreateFlightStripRequest,
    UpdateFlightStripRequest,
    SearchFlightStripsRequest,
    FlightArea,
)
from schemas.responses.flight_strip import (
    FlightStripResponse,
    FlightStripListResponse,
    FlightStripCreatedResponse,
    FlightStripUpdatedResponse,
    FlightStripDeletedResponse,
)

router = APIRouter(prefix="/flight-strips", tags=["Flight Strips"])


def get_flight_strip_use_case() -> FlightStripUseCase:
    """Dependency injection for flight strip use case"""
    repository = FlightStripMongoDBAdapter()
    return FlightStripUseCase(repository)


@router.post(
    "/",
    response_model=FlightStripCreatedResponse,
    status_code=HTTPStatus.CREATED,
    summary="Create Flight Strip",
    description="Create a new flight strip with the provided information",
)
async def create_flight_strip(
    request: CreateFlightStripRequest,
    use_case: FlightStripUseCase = Depends(get_flight_strip_use_case),
) -> FlightStripCreatedResponse:
    """Create a new flight strip"""

    # Convert request to domain model
    flight_strip = FlightStrip(
        id=request.id,
        flight_area=request.flight_area,
        height=request.height,
        takeoff_space=request.takeoff_space,
        landing_space=request.landing_space,
        takeoff_time=request.takeoff_time,
        landing_time=request.landing_time,
    )

    created_strip = await use_case.create_flight_strip(flight_strip)

    return FlightStripCreatedResponse(
        flight_strip=FlightStripResponse.model_validate(
            created_strip.model_dump()
        )
    )


@router.delete(
    "/{flight_strip_id}",
    response_model=FlightStripDeletedResponse,
    summary="Delete Flight Strip",
    description="Delete a flight strip by its ID",
)
async def delete_flight_strip(
    flight_strip_id: str = Path(..., description="Flight strip ID"),
    use_case: FlightStripUseCase = Depends(get_flight_strip_use_case),
) -> FlightStripDeletedResponse:
    """Delete flight strip"""

    success = await use_case.delete_flight_strip(flight_strip_id)

    return FlightStripDeletedResponse(deleted_id=flight_strip_id)


@router.get(
    "/",
    response_model=FlightStripListResponse,
    summary="List/Search Flight Strips",
    description="List all flight strips or search with filters",
)
async def list_flight_strips(
    flight_area: Optional[FlightArea] = Query(
        None, description="Filter by flight area"
    ),
    takeoff_time_start: Optional[str] = Query(
        None, description="Filter takeoff time from (HH:MM)"
    ),
    takeoff_time_end: Optional[str] = Query(
        None, description="Filter takeoff time to (HH:MM)"
    ),
    limit: int = Query(
        100, ge=1, le=1000, description="Maximum number of results"
    ),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    use_case: FlightStripUseCase = Depends(get_flight_strip_use_case),
) -> FlightStripListResponse:
    """List or search flight strips"""

    if flight_area or takeoff_time_start or takeoff_time_end:
        # Search with filters
        flight_strips = await use_case.search_flight_strips(
            flight_area=flight_area,
            takeoff_time_start=takeoff_time_start,
            takeoff_time_end=takeoff_time_end,
            limit=limit,
            offset=offset,
        )
    else:
        # List all
        all_strips = await use_case.list_all_flight_strips()
        flight_strips = all_strips[offset : offset + limit]

    return FlightStripListResponse(
        flight_strips=[
            FlightStripResponse.model_validate(fs.model_dump())
            for fs in flight_strips
        ],
        total_count=len(flight_strips),
        offset=offset,
        limit=limit,
    )
