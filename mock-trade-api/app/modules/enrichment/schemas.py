# Enrichment Module - Schemas
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

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


# Portfolio Enrichment Mapping Schemas
class PortfolioEnrichmentMappingCreate(BaseModel):
    source_system: str
    trader_account_id: str
    instrument_code: Optional[str] = ""
    portfolio_code: str
    comments: Optional[str] = ""
    active: Optional[bool] = True


class PortfolioEnrichmentMappingUpdate(BaseModel):
    source_system: Optional[str] = None
    trader_account_id: Optional[str] = None
    instrument_code: Optional[str] = None
    portfolio_code: Optional[str] = None
    comments: Optional[str] = None
    active: Optional[bool] = None


class PortfolioEnrichmentMappingResponse(BaseModel):
    rule_id: int
    rule_type: str = "PORTFOLIO"
    source_system: str
    trader_account_id: str
    instrument_code: Optional[str] = ""
    portfolio_code: str
    comments: Optional[str] = ""
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True

