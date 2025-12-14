# Trade Module - Schemas
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TradeSchema(BaseModel):
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

class TradeAllocationSchema(BaseModel):
    allocation_id: str
    trade_id: str
    account_id: str
    alloc_qty: int
    alloc_price: Optional[float] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

