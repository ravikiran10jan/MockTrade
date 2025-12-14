# Market Data Module - Schemas
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

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

