"""
Correlation ID management for request tracing across the application.

This module provides utilities to generate, store, and retrieve correlation IDs
that can be used to trace requests across multiple services and log entries.
"""

import uuid
from contextvars import ContextVar
from typing import Optional
import logging

# Context variable to store the correlation ID for the current request
_correlation_id: ContextVar[Optional[str]] = ContextVar('correlation_id', default=None)


class CorrelationIdManager:
    """Manager for handling correlation IDs throughout the request lifecycle."""
    
    @staticmethod
    def generate_correlation_id() -> str:
        """Generate a new UUID4 correlation ID."""
        return str(uuid.uuid4())
    
    @staticmethod
    def set_correlation_id(correlation_id: str) -> None:
        """Set the correlation ID for the current request context."""
        _correlation_id.set(correlation_id)
    
    @staticmethod
    def get_correlation_id() -> Optional[str]:
        """Get the correlation ID from the current request context."""
        return _correlation_id.get()
    
    @staticmethod
    def get_or_generate_correlation_id() -> str:
        """Get existing correlation ID or generate a new one if none exists."""
        correlation_id = _correlation_id.get()
        if not correlation_id:
            correlation_id = CorrelationIdManager.generate_correlation_id()
            CorrelationIdManager.set_correlation_id(correlation_id)
        return correlation_id


class CorrelationIdFilter(logging.Filter):
    """
    Logging filter that adds correlation ID to log records.
    
    This filter automatically adds the correlation_id field to all log records,
    making it available for formatters to include in log output.
    """
    
    def filter(self, record: logging.LogRecord) -> bool:
        """Add correlation ID to the log record."""
        record.correlation_id = CorrelationIdManager.get_correlation_id() or "N/A"
        return True


def setup_correlation_logging() -> None:
    """
    Setup logging configuration to include correlation IDs in all log messages.
    
    This function configures the root logger to include correlation IDs
    in the log format and adds the correlation filter to all handlers.
    """
    # Create correlation filter
    correlation_filter = CorrelationIdFilter()
    
    # Get root logger
    root_logger = logging.getLogger()
    
    # Add filter to all existing handlers
    for handler in root_logger.handlers:
        handler.addFilter(correlation_filter)
    
    # Update log format to include correlation ID
    log_format = "[%(correlation_id)s] %(levelname)s:%(name)s:%(message)s"
    
    # Apply new format to all handlers
    for handler in root_logger.handlers:
        if hasattr(handler, 'setFormatter'):
            formatter = logging.Formatter(log_format)
            handler.setFormatter(formatter)