"""
Core module - Shared infrastructure and utilities for all modules.

This module contains:
- Configuration and settings
- Database setup and session management
- Event bus for inter-module communication
- Common exceptions and error handling
- Shared schemas and base models
- Security and authentication utilities
"""

from app.core.config import settings, OrderStatus, TradeStatus, OrderType, OrderSide, TimeInForce, EntityType
from app.core.database import engine, SessionLocal, Base, get_db
from app.core.events import EventType, Event, event_bus, publish_event
from app.core.exceptions import (
    MockTradeException,
    OrderNotFoundError,
    TradeNotFoundError,
    InstrumentNotFoundError,
    AccountNotFoundError,
    InvalidOrderError,
    OrderAlreadyFilledError,
    InsufficientQuantityError,
    MarketDataNotAvailableError,
    EnrichmentError
)
from app.core.schemas import BaseSchema, TimestampedSchema, PaginationRequest, PaginationResponse, ApiResponse, FilterRequest
from app.core.security import SecurityUtils, get_current_user_permissions

__all__ = [
    # Config
    "settings",
    "OrderStatus",
    "TradeStatus",
    "OrderType",
    "OrderSide",
    "TimeInForce",
    "EntityType",
    
    # Database
    "engine",
    "SessionLocal",
    "Base",
    "get_db",
    
    # Events
    "EventType",
    "Event",
    "event_bus",
    "publish_event",
    
    # Exceptions
    "MockTradeException",
    "OrderNotFoundError",
    "TradeNotFoundError",
    "InstrumentNotFoundError",
    "AccountNotFoundError",
    "InvalidOrderError",
    "OrderAlreadyFilledError",
    "InsufficientQuantityError",
    "MarketDataNotAvailableError",
    "EnrichmentError",
    
    # Schemas
    "BaseSchema",
    "TimestampedSchema",
    "PaginationRequest",
    "PaginationResponse",
    "ApiResponse",
    "FilterRequest",
    
    # Security
    "SecurityUtils",
    "get_current_user_permissions",
]
