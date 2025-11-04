"""Drone Mapping API Routes"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Path, HTTPException
from http import HTTPStatus

from application.drone_mapping_use_case import DroneMappingUseCase
from adapters.drone_mapping_mongodb_adapter import DroneMappingMongoDBAdapter
from domain.drone_mapping import DroneMapping
from schemas.requests.drone_mapping import (
    CreateDroneMappingRequest,
    BulkCreateDroneMappingsRequest,
    UpdateDroneMappingRequest,
)
from schemas.responses.drone_mapping import (
    DroneMappingResponse,
    DroneMappingCreatedResponse,
    DroneMappingCreatedData,
    BulkDroneMappingCreatedResponse,
    BulkDroneMappingCreatedData,
    DroneMappingUpdatedResponse,
    DroneMappingUpdatedData,
    DroneMappingDeletedResponse,
    DroneMappingDeletedData,
    DroneMappingListResponse,
    DroneMappingListData,
)

router = APIRouter(prefix="/drone-mappings", tags=["Drone Mappings"])


def get_drone_mapping_use_case() -> DroneMappingUseCase:
    """Dependency injection for drone mapping use case"""
    repository = DroneMappingMongoDBAdapter()
    return DroneMappingUseCase(repository)


@router.post(
    "/",
    response_model=DroneMappingCreatedResponse,
    status_code=HTTPStatus.CREATED,
    summary="Create Drone Mapping",
    description="Create a new drone mapping with the provided information",
)
async def create_drone_mapping(
    request: CreateDroneMappingRequest,
    use_case: DroneMappingUseCase = Depends(get_drone_mapping_use_case),
) -> DroneMappingCreatedResponse:
    """Create a new drone mapping"""

    try:
        # Convert request to domain model
        drone_mapping = DroneMapping(
            id=request.id,
            serial_number=request.serial_number,
            sisant=request.sisant,
            created_by=request.created_by,
        )

        created_mapping = await use_case.create_drone_mapping(drone_mapping)

        return DroneMappingCreatedResponse(
            data=DroneMappingCreatedData(
                drone_mapping=DroneMappingResponse.from_domain(created_mapping)
            )
        )
    except ValueError as e:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail=str(e))


@router.post(
    "/bulk",
    response_model=BulkDroneMappingCreatedResponse,
    status_code=HTTPStatus.CREATED,
    summary="Bulk Create Drone Mappings",
    description=(
        "Create multiple drone mappings at once (useful for CSV imports)"
    ),
)
async def bulk_create_drone_mappings(
    request: BulkCreateDroneMappingsRequest,
    use_case: DroneMappingUseCase = Depends(get_drone_mapping_use_case),
) -> BulkDroneMappingCreatedResponse:
    """Create multiple drone mappings at once"""

    try:
        # Convert requests to domain models
        drone_mappings = [
            DroneMapping(
                id=mapping.id,
                serial_number=mapping.serial_number,
                sisant=mapping.sisant,
                created_by=request.created_by or mapping.created_by,
            )
            for mapping in request.mappings
        ]

        created_mappings = await use_case.bulk_create_drone_mappings(
            drone_mappings
        )

        return BulkDroneMappingCreatedResponse(
            data=BulkDroneMappingCreatedData(
                drone_mappings=[
                    DroneMappingResponse.from_domain(mapping)
                    for mapping in created_mappings
                ],
                created_count=len(created_mappings),
            )
        )
    except ValueError as e:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail=str(e))


@router.get(
    "/{mapping_id}",
    response_model=DroneMappingResponse,
    summary="Get Drone Mapping",
    description="Get a specific drone mapping by its ID",
)
async def get_drone_mapping(
    mapping_id: str = Path(..., description="Drone mapping ID"),
    use_case: DroneMappingUseCase = Depends(get_drone_mapping_use_case),
) -> DroneMappingResponse:
    """Get drone mapping by ID"""

    try:
        drone_mapping = await use_case.get_drone_mapping(mapping_id)
        return DroneMappingResponse.from_domain(drone_mapping)
    except ValueError as e:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail=str(e))


@router.put(
    "/{mapping_id}",
    response_model=DroneMappingUpdatedResponse,
    summary="Update Drone Mapping",
    description="Update a drone mapping by its ID",
)
async def update_drone_mapping(
    request: UpdateDroneMappingRequest,
    mapping_id: str = Path(..., description="Drone mapping ID"),
    use_case: DroneMappingUseCase = Depends(get_drone_mapping_use_case),
) -> DroneMappingUpdatedResponse:
    """Update drone mapping"""

    try:
        # Convert request to update fields
        update_fields = {
            k: v for k, v in request.model_dump().items() if v is not None
        }

        updated_mapping = await use_case.update_drone_mapping(
            mapping_id, **update_fields
        )

        return DroneMappingUpdatedResponse(
            data=DroneMappingUpdatedData(
                drone_mapping=DroneMappingResponse.from_domain(updated_mapping)
            )
        )
    except ValueError as e:
        status_code = (
            HTTPStatus.NOT_FOUND
            if "not found" in str(e).lower()
            else HTTPStatus.BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=str(e))


@router.delete(
    "/{mapping_id}",
    response_model=DroneMappingDeletedResponse,
    summary="Delete Drone Mapping",
    description=(
        "Soft delete a drone mapping by its ID (can be restored later)"
    ),
)
async def delete_drone_mapping(
    mapping_id: str = Path(..., description="Drone mapping ID"),
    deleted_by: Optional[str] = Query(
        None, description="Who is deleting the mapping"
    ),
    use_case: DroneMappingUseCase = Depends(get_drone_mapping_use_case),
) -> DroneMappingDeletedResponse:
    """Soft delete drone mapping (can be restored later)"""

    try:
        await use_case.delete_drone_mapping(mapping_id, deleted_by)

        return DroneMappingDeletedResponse(
            data=DroneMappingDeletedData(deleted_id=mapping_id)
        )
    except ValueError as e:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail=str(e))


@router.post(
    "/{mapping_id}/restore",
    response_model=DroneMappingResponse,
    summary="Restore Drone Mapping",
    description="Restore a soft-deleted drone mapping",
)
async def restore_drone_mapping(
    mapping_id: str = Path(..., description="Drone mapping ID"),
    use_case: DroneMappingUseCase = Depends(get_drone_mapping_use_case),
) -> DroneMappingResponse:
    """Restore a soft-deleted drone mapping"""

    try:
        await use_case.restore_drone_mapping(mapping_id)

        # Get the restored mapping to return it
        restored_mapping = await use_case.get_drone_mapping(mapping_id)

        return DroneMappingResponse.from_domain(restored_mapping)
    except ValueError as e:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail=str(e))


@router.get(
    "/",
    response_model=DroneMappingListResponse,
    summary="List Drone Mappings",
    description="List all active drone mappings",
)
async def list_drone_mappings(
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    use_case: DroneMappingUseCase = Depends(get_drone_mapping_use_case),
) -> DroneMappingListResponse:
    """List all active drone mappings"""

    drone_mappings = await use_case.list_all_drone_mappings()

    return DroneMappingListResponse(
        data=DroneMappingListData(
            drone_mappings=[
                DroneMappingResponse.from_domain(mapping)
                for mapping in drone_mappings
            ],
            total_count=len(drone_mappings),
            offset=offset,
        )
    )


@router.get(
    "/search/by-identifier/{identifier}",
    response_model=DroneMappingResponse,
    summary="Find Drone Mapping by Identifier",
    description=(
        "Find a drone mapping by any identifier (ID, serial number, or SISANT)"
    ),
)
async def find_by_identifier(
    identifier: str = Path(
        ..., description="Drone identifier (ID, serial number, or SISANT)"
    ),
    use_case: DroneMappingUseCase = Depends(get_drone_mapping_use_case),
) -> DroneMappingResponse:
    """Find drone mapping by any identifier"""

    drone_mapping = await use_case.find_by_identifier(identifier)
    if not drone_mapping:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail=f"No drone mapping found for identifier '{identifier}'",
        )

    return DroneMappingResponse.from_domain(drone_mapping)


@router.get(
    "/statistics/deletion",
    summary="Get Deletion Statistics",
    description="Get statistics about active and deleted drone mappings",
)
async def get_deletion_statistics(
    use_case: DroneMappingUseCase = Depends(get_drone_mapping_use_case),
) -> dict:
    """Get deletion statistics"""

    return await use_case.get_deletion_statistics()

