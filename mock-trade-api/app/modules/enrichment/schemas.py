# Enrichment Module - Schemas
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class PortfolioEnrichmentMappingCreateSchema(BaseModel):
    """Schema for creating portfolio enrichment mappings"""
    trader_id: str
    account_id: str
    portfolio_id: str
    status: str = "ACTIVE"

class PortfolioEnrichmentMappingSchema(BaseModel):
    """Schema for portfolio enrichment mapping response"""
    mapping_id: str
    trader_id: str
    account_id: str
    portfolio_id: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class EnrichedOrderSchema(BaseModel):
    enriched_order_id: str
    order_id: str
    instrument_id: str
    bid_price: Optional[float] = None
    ask_price: Optional[float] = None
    last_price: Optional[float] = None
    mid_price: Optional[float] = None
    spread: Optional[float] = None
    notional_value: Optional[float] = None
    risk_score: Optional[float] = None
    enrichment_data: Optional[Dict[str, Any]] = None
    enrichment_status: str
    enrichment_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

