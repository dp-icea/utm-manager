"""Drone Mapping Repository Port"""

from abc import ABC, abstractmethod
from typing import List, Optional
from domain.drone_mapping import DroneMapping


class DroneMappingRepository(ABC):
    """Abstract repository for drone mapping operations"""

    @abstractmethod
    async def create(self, drone_mapping: DroneMapping) -> DroneMapping:
        """Create a new drone mapping"""
        pass

    @abstractmethod
    async def get_by_id(self, mapping_id: str) -> Optional[DroneMapping]:
        """Get drone mapping by ID"""
        pass

    @abstractmethod
    async def get_by_serial_number(
        self, serial_number: str
    ) -> Optional[DroneMapping]:
        """Get drone mapping by serial number"""
        pass

    @abstractmethod
    async def get_by_sisant(self, sisant: str) -> Optional[DroneMapping]:
        """Get drone mapping by SISANT number"""
        pass

    @abstractmethod
    async def list_all(
        self, include_deleted: bool = False
    ) -> List[DroneMapping]:
        """List all drone mappings"""
        pass

    @abstractmethod
    async def update(
        self, mapping_id: str, **update_fields
    ) -> Optional[DroneMapping]:
        """Update drone mapping"""
        pass

    @abstractmethod
    async def delete(
        self, mapping_id: str, deleted_by: Optional[str] = None
    ) -> bool:
        """Soft delete drone mapping"""
        pass

    @abstractmethod
    async def restore(self, mapping_id: str) -> bool:
        """Restore soft deleted drone mapping"""
        pass

    @abstractmethod
    async def bulk_create(
        self, drone_mappings: List[DroneMapping]
    ) -> List[DroneMapping]:
        """Create multiple drone mappings at once"""
        pass

