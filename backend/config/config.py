import os

from typing import Optional
from pydantic_settings import BaseSettings
from motor.motor_asyncio import AsyncIOMotorClient


class Settings(BaseSettings):
    BRUTM_KEY: Optional[str] = None
    BRUTM_BASE_URL: Optional[str] = None
    DSS_AUDIENCE: str = "core-service"
    
    # MongoDB Configuration
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "flight_strips_db"
    
    # Event API Configuration
    EVENT_API_URL: Optional[str] = None
    EVENT_API_TIMEOUT: float = 5.0
    EVENT_DISPATCH_ENABLED: bool = True

    class Config:
        env_file = f".env.{os.getenv('ENV', 'dev')}"
        from_attributes = True
