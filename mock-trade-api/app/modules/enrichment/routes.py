# Enrichment Module - Routes (Skeleton)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.modules.enrichment import models
from app.modules.enrichment.schemas import (
    PortfolioEnrichmentMappingCreate,
    PortfolioEnrichmentMappingUpdate,
    PortfolioEnrichmentMappingResponse
)
from app.models import PortfolioEnrichmentMapping
from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional, List

router = APIRouter(prefix="/api/v1/enrichment", tags=["Enrichment"])

class EnrichmentSchema(BaseModel):
    enriched_order_id: str
    order_id: str
    instrument_id: str
    bid_price: Optional[float] = None
    ask_price: Optional[float] = None
    mid_price: Optional[float] = None
    spread: Optional[float] = None
    notional_value: Optional[float] = None
    risk_score: Optional[float] = None
    enrichment_status: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/enrich-order/{order_id}")
def enrich_order(order_id: str, db: Session = Depends(get_db)):
    """
    Enrich an order with market data and risk metrics.
    This endpoint is called after an order is created.
    """
    # TODO: Implement enrichment logic
    # 1. Fetch order details
    # 2. Fetch market data for instrument
    # 3. Calculate pricing metrics (mid, spread, etc.)
    # 4. Calculate risk metrics
    # 5. Store enriched data
    # 6. Publish ENRICHMENT_COMPLETED event

    return {
        "message": "Enrichment started",
        "order_id": order_id,
        "status": "IN_PROGRESS"
    }

@router.get("/enrich-order/{order_id}", response_model=EnrichmentSchema)
def get_enriched_order(order_id: str, db: Session = Depends(get_db)):
    """Get enriched data for an order"""
    enriched = db.query(models.EnrichedOrder).filter(
        models.EnrichedOrder.order_id == order_id
    ).first()
    if not enriched:
        raise HTTPException(status_code=404, detail="Enriched order not found")
    return enriched

@router.post("/bulk-enrich")
def bulk_enrich_orders(db: Session = Depends(get_db)):
    """
    Bulk enrich all pending orders.
    Can be called periodically or triggered manually.
    """
    # TODO: Implement bulk enrichment logic
    return {
        "message": "Bulk enrichment started",
        "count": 0
    }

@router.get("/enrichment-metrics/{order_id}")
def get_enrichment_metrics(order_id: str, db: Session = Depends(get_db)):
    """
    Get calculated enrichment metrics for an order
    """
    enriched = db.query(models.EnrichedOrder).filter(
        models.EnrichedOrder.order_id == order_id
    ).first()
    if not enriched:
        raise HTTPException(status_code=404, detail="Enriched order not found")

    return {
        "order_id": order_id,
        "mid_price": enriched.mid_price,
        "spread": enriched.spread,
        "notional_value": enriched.notional_value,
        "risk_score": enriched.risk_score
    }


# ============ Portfolio Enrichment Mapping Endpoints ============

@router.post("/portfolio-mappings", response_model=PortfolioEnrichmentMappingResponse)
def create_portfolio_mapping(
    mapping: PortfolioEnrichmentMappingCreate,
    db: Session = Depends(get_db)
):
    """Create a new portfolio enrichment mapping"""
    try:
        db_mapping = PortfolioEnrichmentMapping(
            source_system=mapping.source_system,
            trader_account_id=mapping.trader_account_id,
            instrument_code=mapping.instrument_code or "",
            portfolio_code=mapping.portfolio_code,
            comments=mapping.comments or "",
            active="Y" if mapping.active else "N",
            created_at=datetime.utcnow()
        )
        db.add(db_mapping)
        db.commit()
        db.refresh(db_mapping)
        
        # Convert to response format
        return PortfolioEnrichmentMappingResponse(
            rule_id=db_mapping.rule_id,
            rule_type="PORTFOLIO",
            source_system=db_mapping.source_system,
            trader_account_id=db_mapping.trader_account_id,
            instrument_code=db_mapping.instrument_code,
            portfolio_code=db_mapping.portfolio_code,
            comments=db_mapping.comments,
            active=db_mapping.active == "Y",
            created_at=db_mapping.created_at
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create mapping: {str(e)}")


@router.get("/portfolio-mappings", response_model=List[PortfolioEnrichmentMappingResponse])
def list_portfolio_mappings(
    source_system: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """List all portfolio enrichment mappings with optional filtering"""
    query = db.query(PortfolioEnrichmentMapping)
    
    if source_system:
        query = query.filter(PortfolioEnrichmentMapping.source_system == source_system)
    
    if active_only:
        query = query.filter(PortfolioEnrichmentMapping.active == "Y")
    
    mappings = query.all()
    
    return [
        PortfolioEnrichmentMappingResponse(
            rule_id=m.rule_id,
            rule_type="PORTFOLIO",
            source_system=m.source_system,
            trader_account_id=m.trader_account_id,
            instrument_code=m.instrument_code,
            portfolio_code=m.portfolio_code,
            comments=m.comments,
            active=m.active == "Y",
            created_at=m.created_at
        )
        for m in mappings
    ]


@router.get("/portfolio-mappings/{rule_id}", response_model=PortfolioEnrichmentMappingResponse)
def get_portfolio_mapping(rule_id: int, db: Session = Depends(get_db)):
    """Get a specific portfolio enrichment mapping by ID"""
    mapping = db.query(PortfolioEnrichmentMapping).filter(
        PortfolioEnrichmentMapping.rule_id == rule_id
    ).first()
    
    if not mapping:
        raise HTTPException(status_code=404, detail="Portfolio mapping not found")
    
    return PortfolioEnrichmentMappingResponse(
        rule_id=mapping.rule_id,
        rule_type="PORTFOLIO",
        source_system=mapping.source_system,
        trader_account_id=mapping.trader_account_id,
        instrument_code=mapping.instrument_code,
        portfolio_code=mapping.portfolio_code,
        comments=mapping.comments,
        active=mapping.active == "Y",
        created_at=mapping.created_at
    )


@router.put("/portfolio-mappings/{rule_id}", response_model=PortfolioEnrichmentMappingResponse)
def update_portfolio_mapping(
    rule_id: int,
    mapping_update: PortfolioEnrichmentMappingUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing portfolio enrichment mapping"""
    mapping = db.query(PortfolioEnrichmentMapping).filter(
        PortfolioEnrichmentMapping.rule_id == rule_id
    ).first()
    
    if not mapping:
        raise HTTPException(status_code=404, detail="Portfolio mapping not found")
    
    try:
        # Update fields if provided
        if mapping_update.source_system is not None:
            mapping.source_system = mapping_update.source_system
        if mapping_update.trader_account_id is not None:
            mapping.trader_account_id = mapping_update.trader_account_id
        if mapping_update.instrument_code is not None:
            mapping.instrument_code = mapping_update.instrument_code
        if mapping_update.portfolio_code is not None:
            mapping.portfolio_code = mapping_update.portfolio_code
        if mapping_update.comments is not None:
            mapping.comments = mapping_update.comments
        if mapping_update.active is not None:
            mapping.active = "Y" if mapping_update.active else "N"
        
        db.commit()
        db.refresh(mapping)
        
        return PortfolioEnrichmentMappingResponse(
            rule_id=mapping.rule_id,
            rule_type="PORTFOLIO",
            source_system=mapping.source_system,
            trader_account_id=mapping.trader_account_id,
            instrument_code=mapping.instrument_code,
            portfolio_code=mapping.portfolio_code,
            comments=mapping.comments,
            active=mapping.active == "Y",
            created_at=mapping.created_at
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update mapping: {str(e)}")


@router.delete("/portfolio-mappings/{rule_id}")
def delete_portfolio_mapping(rule_id: int, db: Session = Depends(get_db)):
    """Delete a portfolio enrichment mapping"""
    mapping = db.query(PortfolioEnrichmentMapping).filter(
        PortfolioEnrichmentMapping.rule_id == rule_id
    ).first()
    
    if not mapping:
        raise HTTPException(status_code=404, detail="Portfolio mapping not found")
    
    try:
        db.delete(mapping)
        db.commit()
        return {"message": "Portfolio mapping deleted successfully", "rule_id": rule_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to delete mapping: {str(e)}")

