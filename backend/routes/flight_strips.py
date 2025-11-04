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
        name=request.name,
        flight_area=request.flight_area,
        height=request.height,
        takeoff_space=request.takeoff_space,
        landing_space=request.landing_space,
        takeoff_time=request.takeoff_time,
        landing_time=request.landing_time,
        description=request.description,
        active=request.active,
    )

    created_strip = await use_case.create_flight_strip(flight_strip)

    return FlightStripCreatedResponse(
        flight_strip=FlightStripResponse.from_domain(created_strip)
    )


@router.delete(
    "/{flight_strip_name}",
    response_model=FlightStripDeletedResponse,
    summary="Delete Flight Strip",
    description="Soft delete a flight strip by its name (can be restored later)",
)
async def delete_flight_strip(
    flight_strip_name: str = Path(..., description="Flight strip name"),
    deleted_by: Optional[str] = Query(None, description="Who is deleting the strip"),
    use_case: FlightStripUseCase = Depends(get_flight_strip_use_case),
) -> FlightStripDeletedResponse:
    """Soft delete flight strip (can be restored later)"""

    success = await use_case.delete_flight_strip(flight_strip_name, deleted_by)

    return FlightStripDeletedResponse(deleted_name=flight_strip_name)


@router.post(
    "/{flight_strip_name}/restore",
    response_model=FlightStripResponse,
    summary="Restore Flight Strip",
    description="Restore a soft-deleted flight strip",
)
async def restore_flight_strip(
    flight_strip_name: str = Path(..., description="Flight strip name"),
    use_case: FlightStripUseCase = Depends(get_flight_strip_use_case),
) -> FlightStripResponse:
    """Restore a soft-deleted flight strip"""

    success = await use_case.restore_flight_strip(flight_strip_name)
    
    # Get the restored flight strip to return it
    restored_strip = await use_case.get_flight_strip_by_flight_name(flight_strip_name)
    
    return FlightStripResponse.from_domain(restored_strip)


@router.get(
    "/{flight_strip_id}",
    response_model=FlightStripResponse,
    summary="Get Flight Strip",
    description="Get a specific flight strip by its database ID",
)
async def get_flight_strip(
    flight_strip_id: str = Path(..., description="Flight strip database ID"),
    use_case: FlightStripUseCase = Depends(get_flight_strip_use_case),
) -> FlightStripResponse:
    """Get flight strip by ID"""

    flight_strip = await use_case.get_flight_strip(flight_strip_id)
    return FlightStripResponse.from_domain(flight_strip)


@router.put(
    "/{flight_strip_name}",
    response_model=FlightStripUpdatedResponse,
    summary="Update Flight Strip",
    description="Update a flight strip by its database ID",
)
async def update_flight_strip(
    request: UpdateFlightStripRequest,
    flight_strip_name: str = Path(..., description="Flight strip database ID"),
    use_case: FlightStripUseCase = Depends(get_flight_strip_use_case),
) -> FlightStripUpdatedResponse:
    """Update flight strip"""

    # Convert request to update fields
    update_fields = {
        k: v for k, v in request.model_dump().items() if v is not None
    }

    updated_strip = await use_case.update_flight_strip(
        flight_strip_name, **update_fields
    )

    return FlightStripUpdatedResponse(
        flight_strip=FlightStripResponse.from_domain(updated_strip)
    )


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
            offset=offset,
        )
    else:
        # List all
        flight_strips = await use_case.list_all_flight_strips()

    return FlightStripListResponse(
        flight_strips=[
            FlightStripResponse.from_domain(fs) for fs in flight_strips
        ],
        total_count=len(flight_strips),
        offset=offset,
    )


@router.get(
    "/deleted/list",
    response_model=FlightStripListResponse,
    summary="List Deleted Flight Strips",
    description="Get all soft-deleted flight strips",
)
async def list_deleted_flight_strips(
    use_case: FlightStripUseCase = Depends(get_flight_strip_use_case),
) -> FlightStripListResponse:
    """List all soft-deleted flight strips"""

    deleted_strips = await use_case.list_deleted_flight_strips()

    return FlightStripListResponse(
        flight_strips=[
            FlightStripResponse.from_domain(fs) for fs in deleted_strips
        ],
        total_count=len(deleted_strips),
        offset=0,
    )


@router.get(
    "/statistics/deletion",
    summary="Get Deletion Statistics",
    description="Get statistics about active and deleted flight strips",
)
async def get_deletion_statistics(
    use_case: FlightStripUseCase = Depends(get_flight_strip_use_case),
) -> dict:
    """Get deletion statistics"""

    return await use_case.get_deletion_statistics()
