"""Event dispatching service for external event API integration"""

import asyncio
import logging
from typing import Optional, Dict, Any
from dataclasses import dataclass
import httpx
from config.config import Settings
from infrastructure.auth_client import BaseClient


@dataclass
class EventPayload:
    """Event payload structure for the external event API"""

    stream: str
    version: str = "1"
    correlation_id: str = ""


class EventService:
    """Service for dispatching events to external event API"""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.event_api_url = getattr(settings, "EVENT_API_URL", None)
        self.timeout = getattr(settings, "EVENT_API_TIMEOUT", 5.0)
        self.logger = logging.getLogger(__name__)

    async def dispatch_event(
        self, event_stream: str, correlation_id: str = ""
    ) -> bool:
        """
        Dispatch an event to the external event API

        Args:
            event_stream: The event stream name (e.g., "MANAGER_FLIGHT_STRIPS_CREATE")
            correlation_id: Optional correlation ID for tracking

        Returns:
            bool: True if event was dispatched successfully, False otherwise
        """
        if not self.event_api_url:
            self.logger.warning(
                "Event API URL not configured, skipping event dispatch"
            )
            return False

        payload = EventPayload(
            stream=event_stream, correlation_id=correlation_id
        )

        try:
            async with BaseClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.event_api_url}/api/v1/events/",
                    json={
                        "stream": payload.stream,
                        "version": payload.version,
                        "correlation_id": payload.correlation_id,
                    },
                    headers={
                        "Content-Type": "application/json",
                        "User-Agent": "UTM-Observer/1.0.0",
                    },
                )

                if response.status_code in (200, 201, 202):
                    self.logger.info(
                        f"Event dispatched successfully: {event_stream}"
                    )
                    return True
                else:
                    self.logger.warning(
                        "Event dispatch failed with status"
                        f" {response.status_code}: {event_stream}"
                    )
                    return False

        except httpx.TimeoutException:
            self.logger.warning(f"Event dispatch timeout for: {event_stream}")
            return False
        except Exception as e:
            self.logger.error(
                f"Event dispatch error for {event_stream}: {str(e)}"
            )
            return False

    def dispatch_event_async(
        self, event_stream: str, correlation_id: str = ""
    ) -> None:
        """
        Fire-and-forget event dispatch (non-blocking)

        Args:
            event_stream: The event stream name
            correlation_id: Optional correlation ID for tracking
        """
        if not self.event_api_url:
            return

        # Create a task that runs in the background without blocking the request
        asyncio.create_task(self.dispatch_event(event_stream, correlation_id))

