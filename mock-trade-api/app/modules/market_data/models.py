# Market Data Module - Models

from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from app.core import Base
from datetime import datetime

class MarketData(Base):
    __tablename__ = "market_data"
    market_data_id = Column(String, primary_key=True, index=True)
    instrument_id = Column(String, ForeignKey("instrument.instrument_id"))
    bid_price = Column(Float)
    ask_price = Column(Float)
    bid_qty = Column(Float)
    ask_qty = Column(Float)
    last_price = Column(Float, nullable=True)
    volume = Column(Float, default=0)
    open_price = Column(Float, nullable=True)
    high_price = Column(Float, nullable=True)
    low_price = Column(Float, nullable=True)
    close_price = Column(Float, nullable=True)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PriceQuote(Base):
    __tablename__ = "price_quote"
    quote_id = Column(String, primary_key=True, index=True)
    instrument_id = Column(String, ForeignKey("instrument.instrument_id"))
    price = Column(Float)
    qty = Column(Float)
    side = Column(String)  # BID or ASK
    quote_time = Column(DateTime, default=datetime.utcnow)
    source = Column(String)  # Market feed source
    created_at = Column(DateTime, default=datetime.utcnow)

