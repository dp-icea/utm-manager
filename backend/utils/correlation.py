"""
Utility functions for working with correlation IDs in route handlers and services.

This module provides convenient functions for accessing correlation IDs
within FastAPI route handlers and other application components.
"""

from fastapi import Header
from typing import Optional
from infrastructure.correlation import CorrelationIdManager


def get_correlation_id_from_context() -> Optional[str]:
    """
    Get the correlation ID from the current request context.
    
    This function can be used in any part of the application to retrieve
    the correlation ID that was set by the correlation middleware.
    
    Returns:
        str: The correlation ID if available, None otherwise
    """
    return CorrelationIdManager.get_correlation_id()


def get_or_create_correlation_id() -> str:
    """
    Get the correlation ID from context or create a new one if none exists.
    
    This is useful for background tasks or other scenarios where you need
    to ensure a correlation ID is available.
    
    Returns:
        str: The correlation ID (existing or newly generated)
    """
    return CorrelationIdManager.get_or_generate_correlation_id()


# FastAPI dependency for injecting correlation ID into route handlers
def correlation_id_dependency(
    x_correlation_id: Optional[str] = Header(None, alias="X-Correlation-ID")
) -> str:
    """
    FastAPI dependency to inject correlation ID into route handlers.
    
    This dependency will return the correlation ID from the request context,
    which should have been set by the correlation middleware.
    
    Args:
        x_correlation_id: The correlation ID from request headers (for documentation)
    
    Returns:
        str: The correlation ID from the current context
    
    Example:
        @app.get("/example")
        async def example_endpoint(correlation_id: str = Depends(correlation_id_dependency)):
            logger.info(f"Processing request with correlation ID: {correlation_id}")
            return {"correlation_id": correlation_id}
    """
    # Return the correlation ID from context (set by middleware)
    # The header parameter is mainly for OpenAPI documentation
    return CorrelationIdManager.get_or_generate_correlation_id()