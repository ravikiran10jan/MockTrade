# Trade Module - Routes (Skeleton)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.modules.trade import models
from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional
from enum import Enum

router = APIRouter(prefix="/api/v1/trades", tags=["Trade"])

class TradeCreateSchema(BaseModel):
    order_id: Optional[str] = None
    instrument_id: str
    side: str  # BUY or SELL
    qty: int
    price: float
    trader_id: str
    broker_id: Optional[str] = None
    account_id: str
    expiry_date: Optional[datetime] = None

class TradeSchema(BaseModel):
    trade_id: str
    order_id: Optional[str]
    instrument_id: str
    side: str
    qty: int
    price: float
    trader_id: str
    broker_id: Optional[str]
    account_id: str
    status: str
    notional_value: Optional[float]
    commission: float
    pnl: Optional[float]
    unrealized_pnl: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=TradeSchema)
def create_trade(trade: TradeCreateSchema, db: Session = Depends(get_db)):
    """Create a new trade (usually from a filled order)"""
    notional_value = trade.qty * trade.price

    db_trade = models.Trade(
        trade_id=str(uuid.uuid4()),
        notional_value=notional_value,
        **trade.dict()
    )
    db.add(db_trade)
    db.commit()
    db.refresh(db_trade)

    # Publish event
    from app.shared.services import publish_event, EventType
    publish_event(EventType.TRADE_CREATED, {
        "trade_id": db_trade.trade_id,
        "order_id": db_trade.order_id,
        "instrument_id": db_trade.instrument_id,
        "qty": db_trade.qty
    }, "trade")

    return db_trade

@router.get("/{trade_id}", response_model=TradeSchema)
def get_trade(trade_id: str, db: Session = Depends(get_db)):
    """Get trade by ID"""
    trade = db.query(models.Trade).filter(
        models.Trade.trade_id == trade_id
    ).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade

@router.get("/", response_model=list[TradeSchema])
def list_trades(
    status: Optional[str] = None,
    account_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List trades with optional filters"""
    query = db.query(models.Trade)

    if status:
        query = query.filter(models.Trade.status == status)
    if account_id:
        query = query.filter(models.Trade.account_id == account_id)

    return query.all()

@router.post("/{trade_id}/cancel")
def cancel_trade(
    trade_id: str,
    reason: str = "User requested",
    db: Session = Depends(get_db)
):
    """Cancel a trade"""
    trade = db.query(models.Trade).filter(
        models.Trade.trade_id == trade_id
    ).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    if trade.status != "ACTIVE":
        raise HTTPException(status_code=400, detail=f"Cannot cancel {trade.status} trade")

    trade.status = "CANCELLED"
    trade.cancellation_reason = reason
    db.commit()

    # Publish event
    from app.shared.services import publish_event, EventType
    publish_event(EventType.TRADE_CANCELLED, {
        "trade_id": trade.trade_id,
        "reason": reason
    }, "trade")

    return {"message": "Trade cancelled", "trade_id": trade_id}

@router.post("/{trade_id}/expire")
def expire_trade(trade_id: str, db: Session = Depends(get_db)):
    """Mark a trade as expired"""
    trade = db.query(models.Trade).filter(
        models.Trade.trade_id == trade_id
    ).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    if trade.status != "ACTIVE":
        raise HTTPException(status_code=400, detail=f"Cannot expire {trade.status} trade")

    trade.status = "EXPIRED"
    db.commit()

    # Publish event
    from app.shared.services import publish_event, EventType
    publish_event(EventType.TRADE_EXPIRED, {
        "trade_id": trade.trade_id
    }, "trade")

    return {"message": "Trade expired", "trade_id": trade_id}

@router.post("/{trade_id}/allocate")
def allocate_trade(
    trade_id: str,
    allocation_data: dict,  # {account_id: qty, account_id: qty, ...}
    db: Session = Depends(get_db)
):
    """
    Allocate a trade to multiple accounts.
    allocation_data: {"account_id": qty, ...}
    """
    trade = db.query(models.Trade).filter(
        models.Trade.trade_id == trade_id
    ).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    # TODO: Implement allocation logic with validation
    # 1. Validate total allocated qty = trade qty
    # 2. Create TradeAllocation records
    # 3. Publish TRADE_ALLOCATED event

    return {
        "message": "Allocation started",
        "trade_id": trade_id,
        "allocations": len(allocation_data)
    }

@router.get("/{trade_id}/allocations")
def get_trade_allocations(trade_id: str, db: Session = Depends(get_db)):
    """Get all allocations for a trade"""
    allocations = db.query(models.TradeAllocation).filter(
        models.TradeAllocation.trade_id == trade_id
    ).all()
    return allocations

