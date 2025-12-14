from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import TradeHdr
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/api/v1/trades", tags=["Trades"])

@router.get("/")
def list_trades(db: Session = Depends(get_db)):
    """Get all trades"""
    trades = db.query(TradeHdr).all()
    return trades

@router.get("/{trade_id}")
def get_trade(trade_id: str, db: Session = Depends(get_db)):
    """Get a single trade by ID"""
    trade = db.query(TradeHdr).filter(TradeHdr.trade_id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade

@router.post("/{trade_id}/cancel")
def cancel_trade(trade_id: str, db: Session = Depends(get_db)):
    """Cancel a trade"""
    trade = db.query(TradeHdr).filter(TradeHdr.trade_id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    if trade.status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Trade is already cancelled")

    if trade.status == "EXPIRED":
        raise HTTPException(status_code=400, detail="Cannot cancel an expired trade")

    trade.status = "CANCELLED"
    db.commit()
    db.refresh(trade)
    return {"message": "Trade cancelled successfully", "trade": trade}

@router.post("/{trade_id}/expire")
def expire_trade(trade_id: str, db: Session = Depends(get_db)):
    """Expire a trade"""
    trade = db.query(TradeHdr).filter(TradeHdr.trade_id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    if trade.status == "EXPIRED":
        raise HTTPException(status_code=400, detail="Trade is already expired")

    if trade.status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Cannot expire a cancelled trade")

    trade.status = "EXPIRED"
    db.commit()
    db.refresh(trade)
    return {"message": "Trade expired successfully", "trade": trade}

