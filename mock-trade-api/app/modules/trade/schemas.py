"""Trade Module - Pydantic Schemas
Defines request and response models for trade API endpoints.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.core import BaseSchema, TimestampedSchema

class TradeCreateSchema(BaseSchema):
    """Schema for creating a new trade"""
    order_id: Optional[str] = Field(None, description="Associated order ID")
    instrument_id: str = Field(..., description="Instrument identifier")
    side: str = Field(..., description="Trade side: BUY or SELL")
    qty: int = Field(..., gt=0, description="Trade quantity")
    price: float = Field(..., gt=0, description="Trade price")
    trader_id: str = Field(..., description="Trader identifier")
    broker_id: Optional[str] = Field(None, description="Broker identifier")
    account_id: str = Field(..., description="Account identifier")
    expiry_date: Optional[datetime] = Field(None, description="Trade expiry date")


class TradeSchema(TimestampedSchema):
    """Schema for trade response"""
    trade_id: str
    order_id: Optional[str] = None
    instrument_id: str
    side: str
    qty: int
    price: float
    trader_id: str
    broker_id: Optional[str] = None
    account_id: str
    status: str
    notional_value: Optional[float] = None
    commission: float
    pnl: Optional[float] = None
    unrealized_pnl: Optional[float] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TradeAllocationSchema(TimestampedSchema):
    """Schema for trade allocation response"""
    allocation_id: str
    trade_id: str
    account_id: str
    qty: int
    price: Optional[float] = None
    status: str = "ACTIVE"

