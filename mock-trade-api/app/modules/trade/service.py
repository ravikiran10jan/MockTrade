"""
Trade Module - Service Layer
Contains business logic for trade operations, separated from HTTP routing.
"""

from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

from app.core import publish_event, EventType
from app.core.exceptions import TradeNotFoundError, InvalidOrderError
from app.modules.trade.models import Trade, TradeAllocation
from app.modules.trade.schemas import TradeCreateSchema


class TradeService:
    """Service class for trade business logic"""
    
    @staticmethod
    def create_trade(db: Session, trade_data: TradeCreateSchema) -> Trade:
        """
        Create a new trade from order fill or manual entry
        
        Args:
            db: Database session
            trade_data: Trade creation data
            
        Returns:
            Created Trade instance
        """
        # Calculate notional value
        notional_value = trade_data.qty * trade_data.price
        
        # Create trade instance
        db_trade = Trade(
            trade_id=str(uuid.uuid4()),
            notional_value=notional_value,
            **trade_data.dict()
        )
        
        db.add(db_trade)
        db.commit()
        db.refresh(db_trade)
        
        # Publish event for other modules to consume
        publish_event(EventType.TRADE_CREATED, {
            "trade_id": db_trade.trade_id,
            "order_id": db_trade.order_id,
            "instrument_id": db_trade.instrument_id,
            "qty": db_trade.qty,
            "price": db_trade.price,
            "side": db_trade.side
        }, "trade")
        
        return db_trade
    
    @staticmethod
    def get_trade(db: Session, trade_id: str) -> Trade:
        """
        Get a trade by ID
        
        Args:
            db: Database session
            trade_id: Trade identifier
            
        Returns:
            Trade instance
            
        Raises:
            TradeNotFoundError: If trade doesn't exist
        """
        trade = db.query(Trade).filter(Trade.trade_id == trade_id).first()
        if not trade:
            raise TradeNotFoundError(f"Trade {trade_id} not found")
        return trade
    
    @staticmethod
    def list_trades(
        db: Session,
        status: Optional[str] = None,
        account_id: Optional[str] = None,
        trader_id: Optional[str] = None,
        instrument_id: Optional[str] = None
    ) -> List[Trade]:
        """
        List trades with optional filters
        
        Args:
            db: Database session
            status: Filter by trade status
            account_id: Filter by account
            trader_id: Filter by trader
            instrument_id: Filter by instrument
            
        Returns:
            List of Trade instances
        """
        query = db.query(Trade)
        
        if status:
            query = query.filter(Trade.status == status)
        if account_id:
            query = query.filter(Trade.account_id == account_id)
        if trader_id:
            query = query.filter(Trade.trader_id == trader_id)
        if instrument_id:
            query = query.filter(Trade.instrument_id == instrument_id)
        
        return query.all()
    
    @staticmethod
    def cancel_trade(db: Session, trade_id: str, reason: str = "User requested") -> Trade:
        """
        Cancel a trade
        
        Args:
            db: Database session
            trade_id: Trade identifier
            reason: Cancellation reason
            
        Returns:
            Updated Trade instance
            
        Raises:
            TradeNotFoundError: If trade doesn't exist
            InvalidOrderError: If trade cannot be cancelled
        """
        trade = TradeService.get_trade(db, trade_id)
        
        if trade.status != "ACTIVE":
            raise InvalidOrderError(f"Cannot cancel {trade.status} trade")
        
        trade.status = "CANCELLED"
        trade.cancellation_reason = reason
        trade.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(trade)
        
        # Publish cancellation event
        publish_event(EventType.TRADE_CANCELLED, {
            "trade_id": trade.trade_id,
            "reason": reason,
            "cancelled_at": trade.updated_at.isoformat()
        }, "trade")
        
        return trade
    
    @staticmethod
    def expire_trade(db: Session, trade_id: str) -> Trade:
        """
        Mark a trade as expired
        
        Args:
            db: Database session
            trade_id: Trade identifier
            
        Returns:
            Updated Trade instance
            
        Raises:
            TradeNotFoundError: If trade doesn't exist
            InvalidOrderError: If trade cannot be expired
        """
        trade = TradeService.get_trade(db, trade_id)
        
        if trade.status != "ACTIVE":
            raise InvalidOrderError(f"Cannot expire {trade.status} trade")
        
        trade.status = "EXPIRED"
        trade.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(trade)
        
        # Publish expiration event
        publish_event(EventType.TRADE_EXPIRED, {
            "trade_id": trade.trade_id,
            "expired_at": trade.updated_at.isoformat()
        }, "trade")
        
        return trade
    
    @staticmethod
    def allocate_trade(
        db: Session,
        trade_id: str,
        allocations: Dict[str, int]
    ) -> Dict[str, Any]:
        """
        Allocate a trade to multiple accounts
        
        Args:
            db: Database session
            trade_id: Trade identifier
            allocations: Dictionary mapping account_id to quantity
            
        Returns:
            Allocation result summary
            
        Raises:
            TradeNotFoundError: If trade doesn't exist
            InvalidOrderError: If allocation is invalid
        """
        trade = TradeService.get_trade(db, trade_id)
        
        # Validate total allocated quantity matches trade quantity
        total_allocated = sum(allocations.values())
        if total_allocated != trade.qty:
            raise InvalidOrderError(
                f"Total allocated quantity ({total_allocated}) must equal trade quantity ({trade.qty})"
            )
        
        # Create allocation records
        allocation_records = []
        for account_id, qty in allocations.items():
            allocation = TradeAllocation(
                allocation_id=str(uuid.uuid4()),
                trade_id=trade_id,
                account_id=account_id,
                qty=qty,
                price=trade.price,
                created_at=datetime.utcnow()
            )
            db.add(allocation)
            allocation_records.append(allocation)
        
        db.commit()
        
        # Publish allocation event
        publish_event(EventType.TRADE_UPDATED, {
            "trade_id": trade_id,
            "action": "allocated",
            "allocations": len(allocations)
        }, "trade")
        
        return {
            "trade_id": trade_id,
            "allocations": len(allocation_records),
            "total_qty": total_allocated
        }
    
    @staticmethod
    def get_trade_allocations(db: Session, trade_id: str) -> List[TradeAllocation]:
        """
        Get all allocations for a trade
        
        Args:
            db: Database session
            trade_id: Trade identifier
            
        Returns:
            List of TradeAllocation instances
        """
        allocations = db.query(TradeAllocation).filter(
            TradeAllocation.trade_id == trade_id
        ).all()
        return allocations
