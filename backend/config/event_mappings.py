"""Event mappings for route endpoints to event streams"""

from typing import Dict, Tuple
from enum import Enum


class EventStream(str, Enum):
    """Predefined event stream names"""

    # Airspace events
    MANAGER_AIRSPACE_ALLOCATIONS = "MANAGER_AIRSPACE_ALLOCATIONS"
    MANAGER_AIRSPACE_FLIGHTS = "MANAGER_AIRSPACE_FLIGHTS"
    MANAGER_AIRSPACE_FLIGHTS_LIST = "MANAGER_AIRSPACE_FLIGHTS_LIST"

    # Constraint events
    MANAGER_CONSTRAINT_CREATE = "MANAGER_CONSTRAINT_CREATE"
    MANAGER_CONSTRAINT_DELETE = "MANAGER_CONSTRAINT_DELETE"

    # Flight Strip events
    MANAGER_FLIGHT_STRIPS_CREATE = "MANAGER_FLIGHT_STRIPS_CREATE"
    MANAGER_FLIGHT_STRIPS_FETCH = "MANAGER_FLIGHT_STRIPS_FETCH"
    MANAGER_FLIGHT_STRIPS_UPDATE = "MANAGER_FLIGHT_STRIPS_UPDATE"
    MANAGER_FLIGHT_STRIPS_DELETE = "MANAGER_FLIGHT_STRIPS_DELETE"
    MANAGER_FLIGHT_STRIPS_LIST = "MANAGER_FLIGHT_STRIPS_LIST"

    # Health events
    MANAGER_HEALTH_CHECK = "MANAGER_HEALTH_CHECK"


# Route mappings: (method, path_pattern) -> event_stream
# Using path patterns that match FastAPI route definitions
ROUTE_EVENT_MAPPINGS: Dict[Tuple[str, str], str] = {
    # Airspace routes
    ("POST", "/api/airspace/flights"): EventStream.MANAGER_AIRSPACE_FLIGHTS,
    # Flight Strip routes
    ("POST", "/api/flight-strips/"): EventStream.MANAGER_FLIGHT_STRIPS_CREATE,
    ("GET", "/api/flight-strips/"): EventStream.MANAGER_FLIGHT_STRIPS_LIST,
    (
        "DELETE",
        "/api/flight-strips/{flight_strip_name}",
    ): EventStream.MANAGER_FLIGHT_STRIPS_DELETE,
}


def get_event_stream_for_request(method: str, path: str) -> str | None:
    """
    Get the event stream name for a given HTTP method and path

    Args:
        method: HTTP method (GET, POST, PUT, DELETE, etc.)
        path: Request path

    Returns:
        Event stream name if found, None otherwise
    """
    # First try exact match
    exact_key = (method.upper(), path)
    if exact_key in ROUTE_EVENT_MAPPINGS:
        return ROUTE_EVENT_MAPPINGS[exact_key]

    if not path.startswith("/api/"):
        exact_key = (method.upper(), "/api" + path)
        if exact_key in ROUTE_EVENT_MAPPINGS:
            return ROUTE_EVENT_MAPPINGS[exact_key]

    # Try pattern matching for parameterized routes
    for (
        route_method,
        route_pattern,
    ), event_stream in ROUTE_EVENT_MAPPINGS.items():
        if (
            method.upper() == route_method
            and _matches_pattern(path, route_pattern)
            or (
                not path.startswith("/api/")
                and method.upper() == route_method
                and _matches_pattern("/api" + path, route_pattern)
            )
        ):
            return event_stream

    return None


def _matches_pattern(path: str, pattern: str) -> bool:
    """
    Check if a path matches a FastAPI route pattern

    Args:
        path: Actual request path
        pattern: Route pattern with {param} placeholders

    Returns:
        True if path matches pattern, False otherwise
    """
    # Simple pattern matching for FastAPI path parameters
    # Convert {param} to a regex pattern and match
    import re

    # Escape special regex characters except for our placeholders
    escaped_pattern = re.escape(pattern)

    # Replace escaped placeholders with regex patterns
    # \{param_name\} -> [^/]+ (match any non-slash characters)
    regex_pattern = re.sub(r"\\{[^}]+\\}", r"[^/]+", escaped_pattern)

    # Ensure exact match
    regex_pattern = f"^{regex_pattern}$"

    return bool(re.match(regex_pattern, path))
