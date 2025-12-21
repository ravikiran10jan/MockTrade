"""
Trade Module - Service Layer
Contains business logic for trade operations, separated from HTTP routing.
"""

from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import asyncio

from app.core import publish_event, EventType
from app.core.exceptions import TradeNotFoundError, InvalidOrderError
from app.modules.trade.models import Trade, TradeAllocation, TradeAuditTrail
from app.modules.trade.schemas import TradeCreateSchema
from app.core.websocket import manager
import logging

logger = logging.getLogger(__name__)


class TradeService:
    """Service class for trade business logic"""
    
    @staticmethod
    def _broadcast_trade_update(trade: Trade, event_type: str):
        """
        Broadcast trade update via WebSocket (non-blocking)
        
        Args:
            trade: Trade instance
            event_type: Event type (trade_created, trade_cancelled, etc.)
        """
        try:
            # Get enriched trade data for broadcast
            trade_data = {
                "trade_id": trade.trade_id,
                "order_id": trade.order_id,
                "instrument_id": trade.instrument_id,
                "side": trade.side,
                "qty": trade.qty,
                "price": float(trade.price) if trade.price else None,
                "trader_id": trade.trader_id,
                "account_id": trade.account_id,
                "status": trade.status,
                "notional_value": float(trade.notional_value) if trade.notional_value else None,
                "created_at": trade.created_at.isoformat() if trade.created_at else None,
                "updated_at": trade.updated_at.isoformat() if trade.updated_at else None,
            }
            
            # Run in event loop (non-blocking)
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            if loop.is_running():
                # If loop is already running, schedule the coroutine
                asyncio.create_task(manager.broadcast_trade_update(trade_data, event_type))
            else:
                # If not running, run it
                loop.run_until_complete(manager.broadcast_trade_update(trade_data, event_type))
            
            logger.info(f"Broadcasted {event_type} for trade {trade.trade_id}")
        except Exception as e:
            # Don't fail the trade operation if WebSocket broadcast fails
            logger.error(f"Failed to broadcast trade update: {e}")
    
    @staticmethod
    def _create_audit_entry(
        db: Session,
        trade_id: str,
        event_type: str,
        event_description: str = None,
        old_status: str = None,
        new_status: str = None,
        changed_by: str = None,
        metadata: Dict[str, Any] = None
    ) -> TradeAuditTrail:
        """
        Create an audit trail entry for a trade event
        
        Args:
            db: Database session
            trade_id: Trade identifier
            event_type: Type of event (CREATED, CANCELLED, EXPIRED, etc.)
            event_description: Human-readable description of the event
            old_status: Previous status (if status changed)
            new_status: New status (if status changed)
            changed_by: User/Trader ID who made the change
            metadata: Additional context data
            
        Returns:
            Created TradeAuditTrail instance
        """
        audit_entry = TradeAuditTrail(
            audit_id=str(uuid.uuid4()),
            trade_id=trade_id,
            event_type=event_type,
            event_description=event_description,
            old_status=old_status,
            new_status=new_status,
            changed_by=changed_by,
            event_metadata=metadata,
            created_at=datetime.utcnow()
        )
        
        db.add(audit_entry)
        return audit_entry
    
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
        
        # Create audit trail entry
        TradeService._create_audit_entry(
            db=db,
            trade_id=db_trade.trade_id,
            event_type="CREATED",
            event_description="Trade created",
            old_status=None,
            new_status="ACTIVE",
            changed_by=trade_data.trader_id,
            metadata={
                "instrument_id": trade_data.instrument_id,
                "qty": trade_data.qty,
                "price": trade_data.price,
                "side": trade_data.side,
                "notional_value": notional_value
            }
        )
        db.commit()
        
        # Publish event for other modules to consume
        publish_event(EventType.TRADE_CREATED, {
            "trade_id": db_trade.trade_id,
            "order_id": db_trade.order_id,
            "instrument_id": db_trade.instrument_id,
            "qty": db_trade.qty,
            "price": db_trade.price,
            "side": db_trade.side
        }, "trade")
        
        # Broadcast via WebSocket for real-time updates
        TradeService._broadcast_trade_update(db_trade, "trade_created")
        
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
    def cancel_trade(db: Session, trade_id: str, reason: str = "User requested", changed_by: str = None) -> Trade:
        """
        Cancel a trade
        
        Args:
            db: Database session
            trade_id: Trade identifier
            reason: Cancellation reason
            changed_by: Trader ID who cancelled the trade
            
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
        
        # Create audit trail entry
        TradeService._create_audit_entry(
            db=db,
            trade_id=trade.trade_id,
            event_type="CANCELLED",
            event_description=f"Trade cancelled: {reason}",
            old_status="ACTIVE",
            new_status="CANCELLED",
            changed_by=changed_by or trade.trader_id,
            metadata={"cancellation_reason": reason}
        )
        
        db.commit()
        db.refresh(trade)
        
        # Publish cancellation event
        publish_event(EventType.TRADE_CANCELLED, {
            "trade_id": trade.trade_id,
            "reason": reason,
            "cancelled_at": trade.updated_at.isoformat()
        }, "trade")
        
        # Broadcast via WebSocket for real-time updates
        TradeService._broadcast_trade_update(trade, "trade_cancelled")
        
        return trade
    
    @staticmethod
    def expire_trade(db: Session, trade_id: str, changed_by: str = None) -> Trade:
        """
        Mark a trade as expired
        
        Args:
            db: Database session
            trade_id: Trade identifier
            changed_by: Trader ID who expired the trade
            
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
        
        # Create audit trail entry
        TradeService._create_audit_entry(
            db=db,
            trade_id=trade.trade_id,
            event_type="EXPIRED",
            event_description="Trade expired",
            old_status="ACTIVE",
            new_status="EXPIRED",
            changed_by=changed_by or trade.trader_id
        )
        
        db.commit()
        db.refresh(trade)
        
        # Publish expiration event
        publish_event(EventType.TRADE_EXPIRED, {
            "trade_id": trade.trade_id,
            "expired_at": trade.updated_at.isoformat()
        }, "trade")
        
        # Broadcast via WebSocket for real-time updates
        TradeService._broadcast_trade_update(trade, "trade_expired")
        
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
        
        # Create audit trail entry
        TradeService._create_audit_entry(
            db=db,
            trade_id=trade_id,
            event_type="ALLOCATED",
            event_description=f"Trade allocated to {len(allocations)} account(s)",
            metadata={
                "allocations": [
                    {"account_id": acc_id, "qty": qty}
                    for acc_id, qty in allocations.items()
                ],
                "total_accounts": len(allocations)
            }
        )
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
    
    @staticmethod
    def undo_trade_action(db: Session, trade_id: str, changed_by: str = None) -> Trade:
        """
        Undo the last trade action (Cancel or Expire) and restore to ACTIVE
        
        Args:
            db: Database session
            trade_id: Trade identifier
            changed_by: Trader ID who performed the undo
            
        Returns:
            Updated Trade instance
            
        Raises:
            TradeNotFoundError: If trade doesn't exist
            InvalidOrderError: If trade cannot be undone
        """
        trade = TradeService.get_trade(db, trade_id)
        
        # Only allow undo for CANCELLED or EXPIRED trades
        if trade.status not in ["CANCELLED", "EXPIRED"]:
            raise InvalidOrderError(f"Cannot undo {trade.status} trade. Only CANCELLED or EXPIRED trades can be undone.")
        
        old_status = trade.status
        trade.status = "ACTIVE"
        trade.cancellation_reason = None  # Clear cancellation reason
        trade.updated_at = datetime.utcnow()
        
        # Create audit trail entry for undo action
        TradeService._create_audit_entry(
            db=db,
            trade_id=trade.trade_id,
            event_type="UNDO",
            event_description=f"Undone {old_status} action - restored to ACTIVE",
            old_status=old_status,
            new_status="ACTIVE",
            changed_by=changed_by or trade.trader_id,
            metadata={"undone_from": old_status}
        )
        
        db.commit()
        db.refresh(trade)
        
        # Publish undo event
        publish_event(EventType.TRADE_UPDATED, {
            "trade_id": trade.trade_id,
            "action": "undo",
            "old_status": old_status,
            "new_status": "ACTIVE"
        }, "trade")
        
        # Broadcast via WebSocket for real-time updates
        TradeService._broadcast_trade_update(trade, "trade_updated")
        
        return trade
    
    @staticmethod
    def get_trade_audit_trail(db: Session, trade_id: str) -> List[Dict[str, Any]]:
        """
        Get audit trail for a trade with enriched trader information
        
        Args:
            db: Database session
            trade_id: Trade identifier
            
        Returns:
            List of enriched audit trail entries with user_id instead of trader_id
        """
        from app.models import Trader
        
        # Query audit trail with trader join to get user_id
        audit_entries = db.query(
            TradeAuditTrail,
            Trader.user_id
        ).outerjoin(
            Trader, TradeAuditTrail.changed_by == Trader.trader_id
        ).filter(
            TradeAuditTrail.trade_id == trade_id
        ).order_by(TradeAuditTrail.created_at.asc()).all()
        
        # Enrich audit trail entries with user_id
        enriched_trail = []
        for audit_entry, user_id in audit_entries:
            entry_dict = {
                "audit_id": audit_entry.audit_id,
                "trade_id": audit_entry.trade_id,
                "event_type": audit_entry.event_type,
                "event_description": audit_entry.event_description,
                "old_status": audit_entry.old_status,
                "new_status": audit_entry.new_status,
                "changed_by": user_id or audit_entry.changed_by,  # Use user_id if available, fallback to trader_id
                "event_metadata": audit_entry.event_metadata,
                "created_at": audit_entry.created_at
            }
            enriched_trail.append(entry_dict)
        
        return enriched_trail
