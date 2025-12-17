"""
Accounting Module - API Routes
Handles P&L and position tracking endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core import get_db

router = APIRouter(prefix="/api/v1/accounting", tags=["Accounting"])


@router.get("/positions")
def get_positions(db: Session = Depends(get_db)):
    """Get current positions"""
    return {"positions": [], "message": "Accounting module - to be implemented"}


@router.get("/pnl")
def get_pnl(db: Session = Depends(get_db)):
    """Get P&L summary"""
    return {"pnl": {}, "message": "Accounting module - to be implemented"}
