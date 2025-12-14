# Core Configuration and Enums for MockTrade

from enum import Enum
from pydantic import BaseSettings
import os

class Settings(BaseSettings):
    """Application settings"""
    app_name: str = "MockTrade API"
    debug: bool = True
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
    api_version: str = "v1"

    class Config:
        env_file = ".env"

settings = Settings()

# Order and Trade Statuses
class OrderStatus(str, Enum):
    NEW = "NEW"
    FILLED = "FILLED"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"

class TradeStatus(str, Enum):
    ACTIVE = "ACTIVE"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"
    SETTLED = "SETTLED"

class OrderType(str, Enum):
    LIMIT = "LIMIT"
    MARKET = "MARKET"
    STOP = "STOP"

class OrderSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

class TimeInForce(str, Enum):
    DAY = "DAY"
    GTC = "GTC"  # Good Till Cancelled
    IOC = "IOC"  # Immediate or Cancel
    FOK = "FOK"  # Fill or Kill

class EntityType(str, Enum):
    INSTRUMENT = "INSTRUMENT"
    ACCOUNT = "ACCOUNT"
    BROKER = "BROKER"
    TRADER = "TRADER"

