"""MongoDB Adapter for Flight Strip Repository - Simplified implementation"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
import logging

from ports.flight_strip_port import FlightStripRepositoryPort
from domain.flight_strip import FlightStrip
from schemas.requests.flight_strip import FlightArea
from infrastructure.mongodb_client import mongodb_client


class FlightStripMongoDBAdapter(FlightStripRepositoryPort):
    """
    Simplified MongoDB implementation of the FlightStripRepositoryPort.

    Handles MongoDB operations for the simplified flight strip model
    that matches the frontend UI requirements.
    """

    def __init__(self):
        self.collection_name = "flight_strips"

    @property
    def collection(self):
        """Get the MongoDB collection"""
        return mongodb_client.database[self.collection_name]

    def _to_document(self, flight_strip: FlightStrip) -> Dict[str, Any]:
        """Convert domain model to MongoDB document"""
        doc = flight_strip.model_dump(exclude={"id"})

        # Handle datetime serialization
        for field in ["created_at", "updated_at"]:
            if doc.get(field):
                if isinstance(doc[field], str):
                    doc[field] = datetime.fromisoformat(
                        doc[field].replace("Z", "+00:00")
                    )

        return doc

    def _from_document(self, doc: Dict[str, Any]) -> FlightStrip:
        """Convert MongoDB document to domain model"""
        if "_id" in doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]

        return FlightStrip.model_validate(doc)

    async def create(self, flight_strip: FlightStrip) -> FlightStrip:
        """Create a new flight strip"""
        try:
            # Check if name already exists (including soft-deleted ones)
            existing = await self.collection.find_one(
                {"name": flight_strip.name, "is_deleted": {"$ne": True}}
            )
            if existing:
                raise ValueError(
                    f"Flight strip with name '{flight_strip.name}' already"
                    " exists"
                )

            # Auto-generate call_sign from name if not provided (for MongoDB index compatibility)
            if not flight_strip.call_sign:
                flight_strip.call_sign = flight_strip.name

            doc = self._to_document(flight_strip)
            result = await self.collection.insert_one(doc)

            # Retrieve the created document to get the generated ID
            created_doc = await self.collection.find_one(
                {"_id": result.inserted_id}
            )
            return self._from_document(created_doc)

        except Exception as e:
            logging.error(f"Error creating flight strip: {e}")
            raise

    async def get_by_id(self, flight_strip_id: str) -> Optional[FlightStrip]:
        """Retrieve flight strip by ID (excludes soft-deleted by default)"""
        try:
            doc = await self.collection.find_one(
                {"_id": ObjectId(flight_strip_id), "is_deleted": {"$ne": True}}
            )
            return self._from_document(doc) if doc else None
        except Exception as e:
            logging.error(
                f"Error retrieving flight strip by ID {flight_strip_id}: {e}"
            )
            return None

    async def get_by_flight_name(
        self, flight_name: str
    ) -> Optional[FlightStrip]:
        """Retrieve flight strip by flight name (excludes soft-deleted by default)"""
        try:
            doc = await self.collection.find_one(
                {"name": flight_name, "is_deleted": {"$eq": False}}
            )
            return self._from_document(doc) if doc else None
        except Exception as e:
            logging.error(
                "Error retrieving flight strip by flight name"
                f" {flight_name}: {e}"
            )
            return None

    async def update(self, flight_strip: FlightStrip) -> FlightStrip:
        """Update existing flight strip"""
        try:
            if not flight_strip.id:
                raise ValueError("Flight strip ID is required for update")

            flight_strip.updated_at = datetime.utcnow()
            doc = self._to_document(flight_strip)

            result = await self.collection.replace_one(
                {"name": flight_strip.name, "is_deleted": {"$eq": False}}, doc
            )

            if result.matched_count == 0:
                raise ValueError(
                    f"Flight strip with ID {flight_strip.name} not found"
                )

            return flight_strip

        except Exception as e:
            logging.error(
                f"Error updating flight strip {flight_strip.id}: {e}"
            )
            raise

    async def delete(self, flight_strip_name: str) -> bool:
        """Delete flight strip by ID"""
        try:
            result = await self.collection.delete_one(
                {"name": flight_strip_name}
            )
            return result.deleted_count > 0
        except Exception as e:
            logging.error(
                f"Error deleting flight strip {flight_strip_name}: {e}"
            )
            return False

    async def list_all(self) -> List[FlightStrip]:
        """Get all flight strips (excludes soft-deleted by default)"""
        try:
            cursor = self.collection.find({"is_deleted": {"$ne": True}}).sort(
                "created_at", -1
            )
            docs = await cursor.to_list(length=None)
            return [self._from_document(doc) for doc in docs]
        except Exception as e:
            logging.error(f"Error listing all flight strips: {e}")
            return []

    async def list_by_flight_area(
        self, flight_area: FlightArea
    ) -> List[FlightStrip]:
        """Get flight strips by flight area (excludes soft-deleted by default)"""
        try:
            cursor = self.collection.find(
                {"flight_area": flight_area.value, "is_deleted": {"$ne": True}}
            ).sort("takeoff_time", 1)
            docs = await cursor.to_list(length=None)
            return [self._from_document(doc) for doc in docs]
        except Exception as e:
            logging.error(
                "Error listing flight strips by flight area"
                f" {flight_area}: {e}"
            )
            return []

    async def search(
        self,
        flight_area: Optional[FlightArea] = None,
        takeoff_time_start: Optional[str] = None,
        takeoff_time_end: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[FlightStrip]:
        """Search flight strips with filters (excludes soft-deleted by default)"""
        try:
            query = {"is_deleted": {"$ne": True}}

            if flight_area:
                query["flight_area"] = flight_area.value

            # Time range filtering for takeoff time
            if takeoff_time_start or takeoff_time_end:
                time_query = {}
                if takeoff_time_start:
                    time_query["$gte"] = takeoff_time_start
                if takeoff_time_end:
                    time_query["$lte"] = takeoff_time_end
                query["takeoff_time"] = time_query

            cursor = (
                self.collection.find(query)
                .sort("takeoff_time", 1)
                .skip(offset)
                .limit(limit)
            )

            docs = await cursor.to_list(length=limit)
            return [self._from_document(doc) for doc in docs]

        except Exception as e:
            logging.error(f"Error searching flight strips: {e}")
            return []

    async def count_by_flight_area(self) -> dict:
        """Get count of flight strips grouped by flight area (excludes soft-deleted)"""
        try:
            pipeline = [
                {"$match": {"is_deleted": {"$ne": True}}},
                {"$group": {"_id": "$flight_area", "count": {"$sum": 1}}},
                {"$sort": {"_id": 1}},
            ]

            cursor = self.collection.aggregate(pipeline)
            results = await cursor.to_list(length=None)

            return {result["_id"]: result["count"] for result in results}

        except Exception as e:
            logging.error(f"Error counting flight strips by flight area: {e}")
            return {}

    async def soft_delete(
        self, flight_strip_name: str, deleted_by: Optional[str] = None
    ) -> bool:
        """Soft delete flight strip by name"""
        try:
            # Check if flight strip exists and is not already deleted
            existing = await self.collection.find_one(
                {"name": flight_strip_name, "is_deleted": {"$eq": False}}
            )

            if not existing:
                return False

            # Mark as deleted
            result = await self.collection.update_one(
                {"name": flight_strip_name, "is_deleted": {"$eq": False}},
                {
                    "$set": {
                        "is_deleted": True,
                        "deleted_at": datetime.utcnow(),
                        "deleted_by": deleted_by,
                        "updated_at": datetime.utcnow(),
                    }
                },
            )
            return result.modified_count > 0
        except Exception as e:
            logging.error(
                f"Error soft deleting flight strip {flight_strip_name}: {e}"
            )
            return False

    async def restore(self, flight_strip_name: str) -> bool:
        """Restore a soft-deleted flight strip"""
        try:
            # Check if flight strip exists and is deleted
            existing = await self.collection.find_one(
                {"name": flight_strip_name, "is_deleted": True}
            )
            if not existing:
                return False

            # Restore the flight strip
            result = await self.collection.update_one(
                {"name": flight_strip_name},
                {
                    "$set": {
                        "is_deleted": False,
                        "updated_at": datetime.utcnow(),
                    },
                    "$unset": {"deleted_at": "", "deleted_by": ""},
                },
            )
            return result.modified_count > 0
        except Exception as e:
            logging.error(
                f"Error restoring flight strip {flight_strip_name}: {e}"
            )
            return False

    async def list_deleted(self) -> List[FlightStrip]:
        """Get all soft-deleted flight strips"""
        try:
            cursor = self.collection.find({"is_deleted": True}).sort(
                "deleted_at", -1
            )
            docs = await cursor.to_list(length=None)
            return [self._from_document(doc) for doc in docs]
        except Exception as e:
            logging.error(f"Error listing deleted flight strips: {e}")
            return []

    async def count_deleted(self) -> int:
        """Get count of soft-deleted flight strips"""
        try:
            count = await self.collection.count_documents({"is_deleted": True})
            return count
        except Exception as e:
            logging.error(f"Error counting deleted flight strips: {e}")
            return 0

    async def exists(self, flight_strip_id: str) -> bool:
        """Check if flight strip exists (excludes soft-deleted)"""
        try:
            count = await self.collection.count_documents(
                {"_id": ObjectId(flight_strip_id), "is_deleted": {"$ne": True}}
            )
            return count > 0
        except Exception as e:
            logging.error(
                f"Error checking flight strip existence {flight_strip_id}: {e}"
            )
            return False
