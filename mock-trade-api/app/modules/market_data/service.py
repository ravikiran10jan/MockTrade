"""
Market Data Module - Service Layer
Handles business logic for market data and price quote management
"""

from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import logging
from datetime import datetime

from app.core import publish_event, EventType
from app.core.exceptions import InvalidOrderError
from app.modules.market_data.models import MarketData, PriceQuote
from app.modules.market_data.schemas import MarketDataCreateSchema, PriceQuoteCreateSchema

logger = logging.getLogger(__name__)


class MarketDataService:
    """Service for market data operations"""
    
    # ============= MARKET DATA SERVICES =============
    
    @staticmethod
    def create_market_data(db: Session, market_data: MarketDataCreateSchema) -> MarketData:
        """Create or update market data for an instrument"""
        market_data_id = str(uuid.uuid4())
        
        db_market_data = MarketData(
            market_data_id=market_data_id,
            **market_data.dict()
        )
        
        db.add(db_market_data)
        db.commit()
        db.refresh(db_market_data)
        
        # Publish event
        publish_event(EventType.MARKET_DATA_UPDATED, {
            "instrument_id": db_market_data.instrument_id,
            "bid_price": db_market_data.bid_price,
            "ask_price": db_market_data.ask_price
        }, "market_data")
        
        logger.info(f"Created market data {market_data_id} for instrument {db_market_data.instrument_id}")
        return db_market_data
    
    @staticmethod
    def get_market_data(db: Session, instrument_id: str) -> Optional[MarketData]:
        """Get latest market data for an instrument"""
        return db.query(MarketData).filter(
            MarketData.instrument_id == instrument_id
        ).order_by(MarketData.created_at.desc()).first()
    
    @staticmethod
    def list_market_data(
        db: Session,
        status: Optional[str] = None
    ) -> List[MarketData]:
        """List market data with optional status filter"""
        query = db.query(MarketData)
        
        if status:
            query = query.filter(MarketData.status == status)
        
        return query.all()
    
    @staticmethod
    def update_market_data(
        db: Session,
        market_data_id: str,
        market_data: MarketDataCreateSchema
    ) -> MarketData:
        """Update market data"""
        db_market_data = db.query(MarketData).filter(
            MarketData.market_data_id == market_data_id
        ).first()
        
        if not db_market_data:
            raise InvalidOrderError(f"Market data {market_data_id} not found")
        
        for key, value in market_data.dict().items():
            setattr(db_market_data, key, value)
        
        db_market_data.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_market_data)
        
        logger.info(f"Updated market data {market_data_id}")
        return db_market_data
    
    # ============= PRICE QUOTE SERVICES =============
    
    @staticmethod
    def create_price_quote(db: Session, quote_data: PriceQuoteCreateSchema) -> PriceQuote:
        """Create a new price quote"""
        quote_id = str(uuid.uuid4())
        
        db_quote = PriceQuote(
            quote_id=quote_id,
            **quote_data.dict()
        )
        
        db.add(db_quote)
        db.commit()
        db.refresh(db_quote)
        
        # Publish event
        publish_event(EventType.PRICE_QUOTE_RECEIVED, {
            "instrument_id": db_quote.instrument_id,
            "price": db_quote.price,
            "side": db_quote.side
        }, "market_data")
        
        logger.info(f"Created price quote {quote_id}")
        return db_quote
    
    @staticmethod
    def get_price_quotes(
        db: Session,
        instrument_id: str,
        side: Optional[str] = None,
        limit: int = 100
    ) -> List[PriceQuote]:
        """Get price quotes for an instrument"""
        query = db.query(PriceQuote).filter(
            PriceQuote.instrument_id == instrument_id
        )
        
        if side:
            query = query.filter(PriceQuote.side == side)
        
        return query.order_by(PriceQuote.quote_time.desc()).limit(limit).all()
