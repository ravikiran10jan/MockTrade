# Event Bus for asynchronous inter-module communication

from typing import Callable, List, Dict, Any
from enum import Enum
from datetime import datetime
import json

class EventType(str, Enum):
    """Events that can be published across modules"""
    # Order Events
    ORDER_CREATED = "order.created"
    ORDER_FILLED = "order.filled"
    ORDER_CANCELLED = "order.cancelled"
    ORDER_UPDATED = "order.updated"

    # Trade Events
    TRADE_CREATED = "trade.created"
    TRADE_CANCELLED = "trade.cancelled"
    TRADE_EXPIRED = "trade.expired"
    TRADE_UPDATED = "trade.updated"

    # Market Data Events
    MARKET_DATA_UPDATED = "market_data.updated"
    PRICE_QUOTE_RECEIVED = "price_quote.received"

    # Enrichment Events
    ENRICHMENT_COMPLETED = "enrichment.completed"
    ENRICHMENT_FAILED = "enrichment.failed"

    # Static Data Events
    INSTRUMENT_CREATED = "instrument.created"
    ACCOUNT_CREATED = "account.created"

class Event:
    """Base event class"""
    def __init__(self, event_type: EventType, data: Dict[str, Any], source: str):
        self.event_type = event_type
        self.data = data
        self.source = source
        self.timestamp = datetime.utcnow()
        self.event_id = f"{event_type}_{self.timestamp.timestamp()}"

    def to_dict(self):
        return {
            "event_id": self.event_id,
            "event_type": self.event_type,
            "data": self.data,
            "source": self.source,
            "timestamp": self.timestamp.isoformat()
        }

class EventBus:
    """
    Simple event bus for inter-module communication.
    Can be extended with message queue (RabbitMQ, Kafka) for production.
    """
    def __init__(self):
        self.subscribers: Dict[EventType, List[Callable]] = {}
        self.event_history: List[Event] = []

    def subscribe(self, event_type: EventType, handler: Callable):
        """Subscribe to an event"""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(handler)
        print(f"✓ Subscribed to {event_type}")

    def publish(self, event: Event):
        """Publish an event"""
        self.event_history.append(event)

        handlers = self.subscribers.get(event.event_type, [])
        for handler in handlers:
            try:
                handler(event)
            except Exception as e:
                print(f"✗ Error handling event {event.event_type}: {str(e)}")

    def get_event_history(self, event_type: EventType = None, limit: int = 100):
        """Get event history"""
        history = self.event_history
        if event_type:
            history = [e for e in history if e.event_type == event_type]
        return history[-limit:]

# Global event bus instance
event_bus = EventBus()

def publish_event(event_type: EventType, data: Dict[str, Any], source: str):
    """Helper function to publish events"""
    event = Event(event_type, data, source)
    event_bus.publish(event)
    return event

