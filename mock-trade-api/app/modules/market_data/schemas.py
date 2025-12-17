# Market Data Module - Schemas
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MarketDataCreateSchema(BaseModel):
    """Schema for creating market data"""
    instrument_id: str
    bid_price: float
    ask_price: float
    bid_qty: float
    ask_qty: float
    last_price: Optional[float] = None
    volume: float = 0
    open_price: Optional[float] = None
    high_price: Optional[float] = None
    low_price: Optional[float] = None
    close_price: Optional[float] = None
    status: str = "ACTIVE"

class MarketDataSchema(BaseModel):
    market_data_id: str
    instrument_id: str
    bid_price: float
    ask_price: float
    bid_qty: float
    ask_qty: float
    last_price: Optional[float] = None
    volume: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PriceQuoteCreateSchema(BaseModel):
    """Schema for creating price quotes"""
    instrument_id: str
    price: float
    qty: float
    side: str  # BID or ASK
    source: str
    quote_time: Optional[datetime] = None

class PriceQuoteSchema(BaseModel):
    quote_id: str
    instrument_id: str
    price: float
    qty: float
    side: str
    source: str
    quote_time: datetime

    class Config:
        from_attributes = True

