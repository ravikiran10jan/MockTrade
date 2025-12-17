"""Trade Module - API Routes
Handles HTTP routing and delegates business logic to service layer.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict

from app.core import get_db
from app.core.exceptions import TradeNotFoundError, InvalidOrderError
from app.modules.trade.service import TradeService
from app.modules.trade.schemas import TradeCreateSchema, TradeSchema, TradeAllocationSchema

router = APIRouter(prefix="/api/v1/trades", tags=["Trade"])

@router.post("/", response_model=TradeSchema)
def create_trade(trade: TradeCreateSchema, db: Session = Depends(get_db)):
    """Create a new trade (usually from a filled order)"""
    try:
        db_trade = TradeService.create_trade(db, trade)
        return db_trade
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{trade_id}", response_model=TradeSchema)
def get_trade(trade_id: str, db: Session = Depends(get_db)):
    """Get trade by ID"""
    try:
        trade = TradeService.get_trade(db, trade_id)
        return trade
    except TradeNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[TradeSchema])
def list_trades(
    status: Optional[str] = Query(None, description="Filter by trade status"),
    account_id: Optional[str] = Query(None, description="Filter by account ID"),
    trader_id: Optional[str] = Query(None, description="Filter by trader ID"),
    instrument_id: Optional[str] = Query(None, description="Filter by instrument ID"),
    db: Session = Depends(get_db)
):
    """List trades with optional filters"""
    try:
        trades = TradeService.list_trades(
            db,
            status=status,
            account_id=account_id,
            trader_id=trader_id,
            instrument_id=instrument_id
        )
        return trades
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{trade_id}/cancel")
def cancel_trade(
    trade_id: str,
    reason: str = Query("User requested", description="Reason for cancellation"),
    db: Session = Depends(get_db)
):
    """Cancel a trade"""
    try:
        trade = TradeService.cancel_trade(db, trade_id, reason)
        return {"message": "Trade cancelled successfully", "trade_id": trade.trade_id}
    except TradeNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidOrderError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{trade_id}/expire")
def expire_trade(trade_id: str, db: Session = Depends(get_db)):
    """Mark a trade as expired"""
    try:
        trade = TradeService.expire_trade(db, trade_id)
        return {"message": "Trade expired successfully", "trade_id": trade.trade_id}
    except TradeNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidOrderError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{trade_id}/allocate")
def allocate_trade(
    trade_id: str,
    allocation_data: Dict[str, int],
    db: Session = Depends(get_db)
):
    """
    Allocate a trade to multiple accounts.
    Request body: {"account_id": qty, "account_id2": qty2, ...}
    """
    try:
        result = TradeService.allocate_trade(db, trade_id, allocation_data)
        return {"message": "Trade allocated successfully", **result}
    except TradeNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidOrderError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{trade_id}/allocations", response_model=List[TradeAllocationSchema])
def get_trade_allocations(trade_id: str, db: Session = Depends(get_db)):
    """Get all allocations for a trade"""
    try:
        allocations = TradeService.get_trade_allocations(db, trade_id)
        return allocations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

