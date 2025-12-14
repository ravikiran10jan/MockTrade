# Market Data Module - Routes (Skeleton)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.modules.market_data import models
from pydantic import BaseModel
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/v1/market-data", tags=["Market Data"])

class MarketDataCreateSchema(BaseModel):
    instrument_id: str
    bid_price: float
    ask_price: float
    bid_qty: float
    ask_qty: float
    last_price: float = None
    volume: float = 0

class MarketDataSchema(BaseModel):
    market_data_id: str
    instrument_id: str
    bid_price: float
    ask_price: float
    bid_qty: float
    ask_qty: float
    last_price: float
    volume: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.post("/market-data", response_model=MarketDataSchema)
def create_market_data(
    market_data: MarketDataCreateSchema,
    db: Session = Depends(get_db)
):
    """Create/update market data for an instrument"""
    # Check if market data exists
    existing = db.query(models.MarketData).filter(
        models.MarketData.instrument_id == market_data.instrument_id
    ).first()

    if existing:
        # Update existing
        for key, value in market_data.dict().items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing

    # Create new
    db_market_data = models.MarketData(
        market_data_id=str(uuid.uuid4()),
        **market_data.dict()
    )
    db.add(db_market_data)
    db.commit()
    db.refresh(db_market_data)
    return db_market_data

@router.get("/market-data/{instrument_id}", response_model=MarketDataSchema)
def get_market_data(instrument_id: str, db: Session = Depends(get_db)):
    """Get market data for an instrument"""
    market_data = db.query(models.MarketData).filter(
        models.MarketData.instrument_id == instrument_id
    ).first()
    if not market_data:
        raise HTTPException(status_code=404, detail="Market data not found")
    return market_data

@router.get("/market-data", response_model=list[MarketDataSchema])
def list_market_data(db: Session = Depends(get_db)):
    """List all market data"""
    return db.query(models.MarketData).all()

class PriceQuoteSchema(BaseModel):
    instrument_id: str
    price: float
    qty: float
    side: str  # BID or ASK
    source: str = "MANUAL"

@router.post("/quotes")
def record_price_quote(
    quote: PriceQuoteSchema,
    db: Session = Depends(get_db)
):
    """Record a price quote for market data ingestion"""
    db_quote = models.PriceQuote(
        quote_id=str(uuid.uuid4()),
        **quote.dict()
    )
    db.add(db_quote)
    db.commit()

    # TODO: Trigger enrichment for orders that reference this instrument

    return {"message": "Quote recorded", "quote_id": db_quote.quote_id}

@router.get("/quotes/{instrument_id}")
def get_recent_quotes(instrument_id: str, limit: int = 10, db: Session = Depends(get_db)):
    """Get recent price quotes for an instrument"""
    quotes = db.query(models.PriceQuote).filter(
        models.PriceQuote.instrument_id == instrument_id
    ).order_by(models.PriceQuote.quote_time.desc()).limit(limit).all()
    return quotes

