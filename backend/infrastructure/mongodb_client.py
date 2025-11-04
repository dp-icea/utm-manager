"""MongoDB Client Infrastructure - Connection and database management"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import logging

from config.config import Settings


class MongoDBClient:
    """
    MongoDB client singleton for managing database connections.

    Provides centralized connection management with proper lifecycle
    handling for the MongoDB async driver.
    """

    _instance: Optional["MongoDBClient"] = None
    _client: Optional[AsyncIOMotorClient] = None
    _database: Optional[AsyncIOMotorDatabase] = None

    def __new__(cls) -> "MongoDBClient":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def connect(self) -> None:
        """Initialize MongoDB connection"""
        if self._client is None:
            settings = Settings()

            try:
                self._client = AsyncIOMotorClient(
                    settings.MONGODB_URL,
                    serverSelectionTimeoutMS=5000,  # 5 second timeout
                    maxPoolSize=50,  # Connection pool size
                    minPoolSize=5,
                    maxIdleTimeMS=30000,  # 30 seconds
                )

                # Test the connection
                await self._client.admin.command("ping")

                self._database = self._client[settings.MONGODB_DATABASE]

                logging.info(
                    f"Connected to MongoDB: {settings.MONGODB_DATABASE}"
                )

            except Exception as e:
                logging.error(f"Failed to connect to MongoDB: {e}")
                raise

    async def disconnect(self) -> None:
        """Close MongoDB connection"""
        if self._client:
            self._client.close()
            self._client = None
            self._database = None
            logging.info("Disconnected from MongoDB")

    @property
    def database(self) -> AsyncIOMotorDatabase:
        """Get database instance"""
        if self._database is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self._database

    @property
    def client(self) -> AsyncIOMotorClient:
        """Get client instance"""
        if self._client is None:
            raise RuntimeError("Client not connected. Call connect() first.")
        return self._client

    async def create_indexes(self) -> None:
        """Create database indexes for optimal performance"""
        try:
            # Indexes for the original flight_strips collection
            flight_strips = self._database.flight_strips

            # Create indexes for common queries
            await flight_strips.create_index("call_sign")
            await flight_strips.create_index("status")
            await flight_strips.create_index("assigned_controller")
            await flight_strips.create_index("sector")
            await flight_strips.create_index("priority")
            await flight_strips.create_index("created_at")
            await flight_strips.create_index("updated_at")

            # Compound indexes for common query patterns
            await flight_strips.create_index([("status", 1), ("priority", -1)])
            await flight_strips.create_index(
                [("assigned_controller", 1), ("status", 1)]
            )
            await flight_strips.create_index([("sector", 1), ("status", 1)])

            # Additional indexes for the simplified model fields
            await flight_strips.create_index("flight_area")
            await flight_strips.create_index("takeoff_time")

            # Additional compound index for simplified model queries
            await flight_strips.create_index(
                [("flight_area", 1), ("takeoff_time", 1)]
            )

            logging.info("MongoDB indexes created successfully")

        except Exception as e:
            logging.error(f"Failed to create MongoDB indexes: {e}")
            raise


# Global instance
mongodb_client = MongoDBClient()
