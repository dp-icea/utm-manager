"""Drone Mapping Use Cases"""

from typing import List, Optional
from datetime import datetime

from ports.drone_mapping_repository import DroneMappingRepository
from domain.drone_mapping import DroneMapping


class DroneMappingUseCase:
    """Use cases for drone mapping operations"""

    def __init__(self, repository: DroneMappingRepository):
        self.repository = repository

    async def create_drone_mapping(
        self, drone_mapping: DroneMapping
    ) -> DroneMapping:
        """Create a new drone mapping"""
        # Check for duplicates
        existing_by_id = await self.repository.get_by_id(drone_mapping.id)
        if existing_by_id:
            raise ValueError(
                f"Drone mapping with ID '{drone_mapping.id}' already exists"
            )

        existing_by_serial = await self.repository.get_by_serial_number(
            drone_mapping.serial_number
        )
        if existing_by_serial:
            raise ValueError(
                "Drone mapping with serial number"
                f" '{drone_mapping.serial_number}' already exists"
            )

        existing_by_sisant = await self.repository.get_by_sisant(
            drone_mapping.sisant
        )
        if existing_by_sisant:
            raise ValueError(
                f"Drone mapping with SISANT '{drone_mapping.sisant}' already"
                " exists"
            )

        return await self.repository.create(drone_mapping)

    async def get_drone_mapping(self, mapping_id: str) -> DroneMapping:
        """Get drone mapping by ID"""
        mapping = await self.repository.get_by_id(mapping_id)
        if not mapping:
            raise ValueError(f"Drone mapping with ID '{mapping_id}' not found")
        return mapping

    async def list_all_drone_mappings(self) -> List[DroneMapping]:
        """List all active drone mappings"""
        return await self.repository.list_all(include_deleted=False)

    async def update_drone_mapping(
        self, mapping_id: str, **update_fields
    ) -> DroneMapping:
        """Update drone mapping"""
        # Validate the mapping exists
        existing = await self.repository.get_by_id(mapping_id)
        if not existing:
            raise ValueError(f"Drone mapping with ID '{mapping_id}' not found")

        # Check for conflicts if updating unique fields
        if "serial_number" in update_fields:
            existing_by_serial = await self.repository.get_by_serial_number(
                update_fields["serial_number"]
            )
            if existing_by_serial and existing_by_serial.id != mapping_id:
                raise ValueError(
                    f"Serial number '{update_fields['serial_number']}' already"
                    " exists"
                )

        if "sisant" in update_fields:
            existing_by_sisant = await self.repository.get_by_sisant(
                update_fields["sisant"]
            )
            if existing_by_sisant and existing_by_sisant.id != mapping_id:
                raise ValueError(
                    f"SISANT '{update_fields['sisant']}' already exists"
                )

        updated = await self.repository.update(mapping_id, **update_fields)
        if not updated:
            raise ValueError(
                f"Failed to update drone mapping with ID '{mapping_id}'"
            )

        return updated

    async def delete_drone_mapping(
        self, mapping_id: str, deleted_by: Optional[str] = None
    ) -> bool:
        """Soft delete drone mapping"""
        success = await self.repository.delete(mapping_id, deleted_by)
        if not success:
            raise ValueError(
                f"Drone mapping with ID '{mapping_id}' not found or already"
                " deleted"
            )
        return success

    async def restore_drone_mapping(self, mapping_id: str) -> bool:
        """Restore soft deleted drone mapping"""
        success = await self.repository.restore(mapping_id)
        if not success:
            raise ValueError(
                f"Drone mapping with ID '{mapping_id}' not found or not"
                " deleted"
            )
        return success

    async def bulk_create_drone_mappings(
        self, drone_mappings: List[DroneMapping]
    ) -> List[DroneMapping]:
        """Create multiple drone mappings at once"""
        if not drone_mappings:
            return []

        # Validate for duplicates within the batch
        ids = [mapping.id for mapping in drone_mappings]

        if len(set(ids)) != len(ids):
            raise ValueError("Duplicate IDs found in batch")

        # Check for existing mappings
        existing_mappings = await self.repository.list_all()
        existing_ids = {mapping.id for mapping in existing_mappings}

        drone_mappings_to_create = []
        drone_mappings_to_update = []
        drone_mappings_to_remove = []

        for mapping in drone_mappings:
            if mapping.id in existing_ids:
                drone_mappings_to_update.append(mapping)
                continue

            drone_mappings_to_create.append(mapping)

        for existing_id in existing_ids:
            if existing_id not in ids:
                drone_mappings_to_remove.append(existing_id)

        await self.repository.bulk_create(drone_mappings_to_create)

        for mapping in drone_mappings_to_update:
            await self.repository.update(
                mapping.id,
                serial_number=mapping.serial_number,
                sisant=mapping.sisant,
            )

        for mapping_id in drone_mappings_to_remove:
            await self.repository.delete(mapping_id)

        return drone_mappings

    async def find_by_identifier(
        self, identifier: str
    ) -> Optional[DroneMapping]:
        """Find drone mapping by any identifier (id, serial_number, or sisant)"""
        return await self.repository.find_by_identifier(identifier)

    async def get_deletion_statistics(self) -> dict:
        """Get statistics about active and deleted drone mappings"""
        all_mappings = await self.repository.list_all(include_deleted=True)
        active_count = len([m for m in all_mappings if not m.is_deleted()])
        deleted_count = len([m for m in all_mappings if m.is_deleted()])

        return {
            "total_count": len(all_mappings),
            "active_count": active_count,
            "deleted_count": deleted_count,
        }

