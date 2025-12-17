# Enrichment Module - Models
# Import PortfolioEnrichmentMapping from main models

from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from app.core import Base
from app.models import PortfolioEnrichmentMapping
from datetime import datetime

class EnrichedOrder(Base):
    __tablename__ = "enriched_order"
    enriched_order_id = Column(String, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("order_hdr.order_id"), unique=True)
    instrument_id = Column(String, ForeignKey("instrument.instrument_id"))

    # Market Data Enrichment
    bid_price = Column(Float, nullable=True)
    ask_price = Column(Float, nullable=True)
    last_price = Column(Float, nullable=True)

    # Pricing Enrichment
    mid_price = Column(Float, nullable=True)
    spread = Column(Float, nullable=True)

    # Risk Metrics
    notional_value = Column(Float, nullable=True)
    risk_score = Column(Float, nullable=True)  # 0-100

    # Additional Metadata
    enrichment_data = Column(JSON, nullable=True)  # Store additional enriched data
    enrichment_status = Column(String, default="PENDING")  # PENDING, COMPLETED, FAILED
    enrichment_error = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Re-export for convenience
__all__ = ['EnrichedOrder', 'PortfolioEnrichmentMapping']

