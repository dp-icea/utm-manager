"""Test script for event dispatching functionality"""

import asyncio
import logging
from config.config import Settings
from config.event_mappings import get_event_stream_for_request, EventStream
from infrastructure.event_service import EventService

# Configure logging
logging.basicConfig(level=logging.INFO)


async def test_event_service():
    """Test the event service functionality"""
    print("Testing Event Service...")

    # Create settings with test configuration
    settings = Settings()
    settings.EVENT_API_URL = "http://172.18.31.78:8003"  # Your event API URL

    event_service = EventService(settings)

    # Test dispatching an event
    success = await event_service.dispatch_event(
        "MANAGER_TEST_EVENT", "test-correlation-123"
    )
    print(f"Event dispatch result: {success}")


def test_event_mappings():
    """Test the event mapping functionality"""
    print("\nTesting Event Mappings...")

    test_cases = [
        (
            "POST",
            "/api/flight-strips/",
            EventStream.MANAGER_FLIGHT_STRIPS_CREATE,
        ),
        ("GET", "/api/flight-strips/", EventStream.MANAGER_FLIGHT_STRIPS_LIST),
        ("GET", "/flight-strips/", EventStream.MANAGER_FLIGHT_STRIPS_LIST),
        (
            "GET",
            "/api/flight-strips/123",
            EventStream.MANAGER_FLIGHT_STRIPS_FETCH,
        ),
        (
            "GET",
            "/api/flight-strips/abc-def-ghi",
            EventStream.MANAGER_FLIGHT_STRIPS_FETCH,
        ),
        (
            "PUT",
            "/api/flight-strips/abc-def",
            EventStream.MANAGER_FLIGHT_STRIPS_UPDATE,
        ),
        (
            "PUT",
            "/api/flight-strips/12345",
            EventStream.MANAGER_FLIGHT_STRIPS_UPDATE,
        ),
        (
            "DELETE",
            "/api/flight-strips/test-strip",
            EventStream.MANAGER_FLIGHT_STRIPS_DELETE,
        ),
        (
            "DELETE",
            "/api/flight-strips/any-arbitrary-id-123",
            EventStream.MANAGER_FLIGHT_STRIPS_DELETE,
        ),
        (
            "DELETE",
            "/api/flight-strips/uuid-like-id-abc-def-123",
            EventStream.MANAGER_FLIGHT_STRIPS_DELETE,
        ),
        (
            "DELETE",
            "/flight-strips/F100",
            EventStream.MANAGER_FLIGHT_STRIPS_DELETE,
        ),
        (
            "POST",
            "/api/airspace/allocations",
            EventStream.MANAGER_AIRSPACE_ALLOCATIONS,
        ),
        (
            "POST",
            "/api/constraints/create",
            EventStream.MANAGER_CONSTRAINT_CREATE,
        ),
        ("GET", "/api/healthy/", EventStream.MANAGER_HEALTH_CHECK),
        ("GET", "/api/unknown/route", None),  # Should return None
    ]

    for method, path, expected in test_cases:
        result = get_event_stream_for_request(method, path)
        status = "✓" if result == expected else "✗"
        print(f"{status} {method} {path} -> {result}")


async def main():
    """Run all tests"""
    test_event_mappings()

    # Uncomment the line below to test actual event dispatching
    # (requires the event API to be running)
    # await test_event_service()


if __name__ == "__main__":
    asyncio.run(main())

