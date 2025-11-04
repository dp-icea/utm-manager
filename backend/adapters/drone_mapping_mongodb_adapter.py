"""MongoDB Adapter for Drone Mapping Repository"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

from infrastructure.mongodb_client import mongodb_client
from ports.drone_mapping_repository import DroneMappingRepository
from domain.drone_mapping import DroneMapping


class DroneMappingMongoDBAdapter(DroneMappingRepository):
    """MongoDB implementation of drone mapping repository"""

    def __init__(self):
        self.collection_name = "drone_mappings"

    @property
    def collection(self):
        """Get the MongoDB collection"""
        return mongodb_client.get_collection(self.collection_name)

    def _to_document(self, drone_mapping: DroneMapping) -> Dict[str, Any]:
        """Convert domain model to MongoDB document"""
        doc = drone_mapping.model_dump()
        if hasattr(drone_mapping, "_id") and drone_mapping._id:
            doc["_id"] = ObjectId(drone_mapping._id)
        return doc

    def _from_document(self, doc: Dict[str, Any]) -> DroneMapping:
        """Convert MongoDB document to domain model"""
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return DroneMapping(**doc)

    async def create(self, drone_mapping: DroneMapping) -> DroneMapping:
        """Create a new drone mapping"""
        doc = self._to_document(drone_mapping)
        doc.pop("_id", None)  # Remove _id to let MongoDB generate it

        result = await self.collection.insert_one(doc)
        drone_mapping._id = str(result.inserted_id)
        return drone_mapping

    async def get_by_id(self, mapping_id: str) -> Optional[DroneMapping]:
        """Get drone mapping by ID (human-readable ID, not MongoDB _id)"""
        doc = await self.collection.find_one(
            {"id": mapping_id, "deleted_at": None}
        )
        return self._from_document(doc) if doc else None

    async def get_by_serial_number(
        self, serial_number: str
    ) -> Optional[DroneMapping]:
        """Get drone mapping by serial number"""
        doc = await self.collection.find_one(
            {"serial_number": serial_number, "deleted_at": None}
        )
        return self._from_document(doc) if doc else None

    async def get_by_sisant(self, sisant: str) -> Optional[DroneMapping]:
        """Get drone mapping by SISANT number"""
        doc = await self.collection.find_one(
            {"sisant": sisant, "deleted_at": None}
        )
        return self._from_document(doc) if doc else None

    async def list_all(
        self, include_deleted: bool = False
    ) -> List[DroneMapping]:
        """List all drone mappings"""
        query = {} if include_deleted else {"deleted_at": None}

        cursor = self.collection.find(query).sort("created_at", -1)
        docs = await cursor.to_list(length=None)

        return [self._from_document(doc) for doc in docs]

    async def update(
        self, mapping_id: str, **update_fields
    ) -> Optional[DroneMapping]:
        """Update drone mapping"""
        # Remove None values and add updated_at
        update_data = {k: v for k, v in update_fields.items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()

        result = await self.collection.update_one(
            {"id": mapping_id, "deleted_at": None}, {"$set": update_data}
        )

        if result.modified_count > 0:
            return await self.get_by_id(mapping_id)
        return None

    async def delete(
        self, mapping_id: str, deleted_by: Optional[str] = None
    ) -> bool:
        """Soft delete drone mapping"""
        result = await self.collection.update_one(
            {"id": mapping_id, "deleted_at": None},
            {
                "$set": {
                    "deleted_at": datetime.utcnow(),
                    "deleted_by": deleted_by,
                }
            },
        )
        return result.modified_count > 0

    async def restore(self, mapping_id: str) -> bool:
        """Restore soft deleted drone mapping"""
        result = await self.collection.update_one(
            {"id": mapping_id, "deleted_at": {"$ne": None}},
            {"$unset": {"deleted_at": "", "deleted_by": ""}},
        )
        return result.modified_count > 0

    async def bulk_create(
        self, drone_mappings: List[DroneMapping]
    ) -> List[DroneMapping]:
        """Create multiple drone mappings at once"""
        if not drone_mappings:
            return []

        docs = []
        for mapping in drone_mappings:
            doc = self._to_document(mapping)
            doc.pop("_id", None)  # Remove _id to let MongoDB generate it
            docs.append(doc)

        result = await self.collection.insert_many(docs)

        # Update the drone mappings with their new IDs
        for i, inserted_id in enumerate(result.inserted_ids):
            drone_mappings[i]._id = str(inserted_id)

        return drone_mappings

    async def find_by_identifier(
        self, identifier: str
    ) -> Optional[DroneMapping]:
        """Find drone mapping by any identifier (id, serial_number, or sisant)"""
        doc = await self.collection.find_one({
            "$or": [
                {"id": identifier},
                {"serial_number": identifier},
                {"sisant": identifier},
            ],
            "deleted_at": None,
        })
        return self._from_document(doc) if doc else None

