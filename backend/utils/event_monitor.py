"""Event monitoring utilities for debugging and testing"""

import asyncio
import logging
from typing import Dict, List
from datetime import datetime
from dataclasses import dataclass, field


@dataclass
class EventLog:
    """Log entry for dispatched events"""

    timestamp: datetime
    event_stream: str
    correlation_id: str
    method: str
    path: str
    success: bool
    error_message: str = ""


class EventMonitor:
    """Monitor and log event dispatching for debugging purposes"""

    def __init__(self, max_logs: int = 1000):
        self.max_logs = max_logs
        self.event_logs: List[EventLog] = []
        self.stats: Dict[str, int] = {
            "total_events": 0,
            "successful_events": 0,
            "failed_events": 0,
        }
        self.logger = logging.getLogger(__name__)

    def log_event(
        self,
        event_stream: str,
        correlation_id: str,
        method: str,
        path: str,
        success: bool,
        error_message: str = "",
    ):
        """Log an event dispatch attempt"""
        log_entry = EventLog(
            timestamp=datetime.now(),
            event_stream=event_stream,
            correlation_id=correlation_id,
            method=method,
            path=path,
            success=success,
            error_message=error_message,
        )

        self.event_logs.append(log_entry)

        # Keep only the most recent logs
        if len(self.event_logs) > self.max_logs:
            self.event_logs = self.event_logs[-self.max_logs :]

        # Update statistics
        self.stats["total_events"] += 1
        if success:
            self.stats["successful_events"] += 1
        else:
            self.stats["failed_events"] += 1

    def get_recent_events(self, limit: int = 10) -> List[EventLog]:
        """Get the most recent event logs"""
        return self.event_logs[-limit:]

    def get_stats(self) -> Dict[str, int]:
        """Get event dispatch statistics"""
        return self.stats.copy()

    def get_events_by_stream(self, event_stream: str) -> List[EventLog]:
        """Get all events for a specific stream"""
        return [
            log for log in self.event_logs if log.event_stream == event_stream
        ]

    def print_summary(self):
        """Print a summary of event dispatch statistics"""
        print("\n=== Event Dispatch Summary ===")
        print(f"Total Events: {self.stats['total_events']}")
        print(f"Successful: {self.stats['successful_events']}")
        print(f"Failed: {self.stats['failed_events']}")

        if self.stats["total_events"] > 0:
            success_rate = (
                self.stats["successful_events"] / self.stats["total_events"]
            ) * 100
            print(f"Success Rate: {success_rate:.1f}%")

        print("\n=== Recent Events ===")
        for log in self.get_recent_events(5):
            status = "✓" if log.success else "✗"
            print(
                f"{status} {log.timestamp.strftime('%H:%M:%S')} -"
                f" {log.event_stream} ({log.method} {log.path})"
            )
            if not log.success and log.error_message:
                print(f"   Error: {log.error_message}")


# Global event monitor instance
event_monitor = EventMonitor()

