"""
Enrichment Module - Service Layer
Handles business logic for order enrichment with market data and portfolio mappings
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import uuid
import logging

from app.core import publish_event, EventType
from app.core.exceptions import InvalidOrderError
from app.modules.enrichment.models import EnrichedOrder, PortfolioEnrichmentMapping
from app.modules.enrichment.schemas import PortfolioEnrichmentMappingCreateSchema

logger = logging.getLogger(__name__)


class EnrichmentService:
    """Service for order enrichment operations"""
    
    @staticmethod
    def create_portfolio_mapping(
        db: Session,
        mapping_data: PortfolioEnrichmentMappingCreateSchema
    ) -> PortfolioEnrichmentMapping:
        """Create a new portfolio enrichment mapping"""
        mapping_id = str(uuid.uuid4())
        
        db_mapping = PortfolioEnrichmentMapping(
            mapping_id=mapping_id,
            **mapping_data.dict()
        )
        
        db.add(db_mapping)
        db.commit()
        db.refresh(db_mapping)
        
        logger.info(f"Created portfolio mapping {mapping_id}")
        return db_mapping
    
    @staticmethod
    def get_portfolio_mapping(db: Session, mapping_id: str) -> Optional[PortfolioEnrichmentMapping]:
        """Get portfolio mapping by ID"""
        return db.query(PortfolioEnrichmentMapping).filter(
            PortfolioEnrichmentMapping.mapping_id == mapping_id
        ).first()
    
    @staticmethod
    def list_portfolio_mappings(
        db: Session,
        trader_id: Optional[str] = None,
        account_id: Optional[str] = None,
        portfolio_id: Optional[str] = None
    ) -> List[PortfolioEnrichmentMapping]:
        """List portfolio mappings with optional filters"""
        query = db.query(PortfolioEnrichmentMapping)
        
        if trader_id:
            query = query.filter(PortfolioEnrichmentMapping.trader_id == trader_id)
        if account_id:
            query = query.filter(PortfolioEnrichmentMapping.account_id == account_id)
        if portfolio_id:
            query = query.filter(PortfolioEnrichmentMapping.portfolio_id == portfolio_id)
        
        return query.all()
    
    @staticmethod
    def update_portfolio_mapping(
        db: Session,
        mapping_id: str,
        mapping_data: PortfolioEnrichmentMappingCreateSchema
    ) -> PortfolioEnrichmentMapping:
        """Update portfolio mapping"""
        db_mapping = EnrichmentService.get_portfolio_mapping(db, mapping_id)
        if not db_mapping:
            raise InvalidOrderError(f"Portfolio mapping {mapping_id} not found")
        
        for key, value in mapping_data.dict().items():
            setattr(db_mapping, key, value)
        
        db.commit()
        db.refresh(db_mapping)
        
        logger.info(f"Updated portfolio mapping {mapping_id}")
        return db_mapping
    
    @staticmethod
    def delete_portfolio_mapping(db: Session, mapping_id: str) -> Dict[str, str]:
        """Delete portfolio mapping"""
        db_mapping = EnrichmentService.get_portfolio_mapping(db, mapping_id)
        if not db_mapping:
            raise InvalidOrderError(f"Portfolio mapping {mapping_id} not found")
        
        db.delete(db_mapping)
        db.commit()
        
        logger.info(f"Deleted portfolio mapping {mapping_id}")
        return {"message": "Portfolio mapping deleted"}
    
    @staticmethod
    def enrich_order(db: Session, order_id: str) -> Dict[str, Any]:
        """
        Enrich an order with market data and portfolio information
        This is a placeholder for the actual enrichment logic
        """
        # TODO: Implement actual enrichment logic
        # 1. Fetch order details
        # 2. Get market data for instrument
        # 3. Get portfolio mapping for trader + account
        # 4. Calculate enriched fields
        # 5. Store in EnrichedOrder table
        
        logger.info(f"Enriched order {order_id}")
        
        publish_event(EventType.ENRICHMENT_COMPLETED, {
            "order_id": order_id
        }, "enrichment")
        
        return {
            "order_id": order_id,
            "status": "enriched"
        }
