"""
Correlation ID middleware for FastAPI applications.

This middleware handles the extraction, generation, and injection of correlation IDs
for request tracing across the application and external services.
"""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from infrastructure.correlation import CorrelationIdManager
import logging

logger = logging.getLogger(__name__)


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware to handle correlation IDs for request tracing.
    
    This middleware:
    1. Extracts correlation ID from incoming request headers (X-Correlation-ID)
    2. Generates a new correlation ID if none is provided
    3. Sets the correlation ID in the request context
    4. Adds the correlation ID to the response headers
    """
    
    CORRELATION_ID_HEADER = "X-Correlation-ID"
    
    async def dispatch(self, request: Request, call_next):
        """Process the request and inject correlation ID handling."""
        
        # Extract correlation ID from request headers or generate a new one
        correlation_id = request.headers.get(self.CORRELATION_ID_HEADER)
        
        if not correlation_id:
            correlation_id = CorrelationIdManager.generate_correlation_id()
            logger.debug(f"Generated new correlation ID: {correlation_id}")
        else:
            logger.debug(f"Using provided correlation ID: {correlation_id}")
        
        # Set correlation ID in the request context
        CorrelationIdManager.set_correlation_id(correlation_id)
        
        # Process the request
        response = await call_next(request)
        
        # Add correlation ID to response headers for client tracking
        response.headers[self.CORRELATION_ID_HEADER] = correlation_id
        
        return response