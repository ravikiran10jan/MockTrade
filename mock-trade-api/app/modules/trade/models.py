# Trade Module - Models
# Use existing TradeAllocation from app/models.py, define new Trade model

from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON
from app.core import Base
from app.models import TradeAllocation  # Existing model
from datetime import datetime

class Trade(Base):
    """
    Trade model - NEW model for trade-specific data
    Stores filled order details with trade lifecycle
    """
    __tablename__ = "trade"
    trade_id = Column(String, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("order_hdr.order_id"), nullable=True)
    instrument_id = Column(String, ForeignKey("instrument.instrument_id"))

    # Trade Details
    side = Column(String)  # BUY or SELL
    qty = Column(Integer)
    price = Column(Float)
    exec_time = Column(DateTime, default=datetime.utcnow)

    # Trade Participants
    trader_id = Column(String, ForeignKey("trader.trader_id"))
    broker_id = Column(String, ForeignKey("broker.broker_id"), nullable=True)
    account_id = Column(String, ForeignKey("account.account_id"))

    # Trade Status and Lifecycle
    status = Column(String, default="ACTIVE")  # ACTIVE, CANCELLED, EXPIRED, SETTLED
    cancellation_reason = Column(String, nullable=True)
    expiry_date = Column(DateTime, nullable=True)

    # Trade Metrics
    notional_value = Column(Float, nullable=True)  # qty * price
    commission = Column(Float, default=0)
    pnl = Column(Float, nullable=True)  # Realized P&L
    unrealized_pnl = Column(Float, nullable=True)

    # Additional Metadata
    trade_metadata = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TradeAuditTrail(Base):
    """
    Trade Audit Trail model
    Stores lifecycle events for trade auditing and compliance
    """
    __tablename__ = "trade_audit_trail"
    
    audit_id = Column(String, primary_key=True, index=True)
    trade_id = Column(String, ForeignKey("trade.trade_id"), nullable=False, index=True)
    
    # Event Information
    event_type = Column(String, nullable=False)  # CREATED, CANCELLED, EXPIRED, ALLOCATED, SETTLED
    event_description = Column(String, nullable=True)
    
    # Status Change Tracking
    old_status = Column(String, nullable=True)
    new_status = Column(String, nullable=True)
    
    # User Tracking
    changed_by = Column(String, nullable=True)  # user_id or trader_id who made the change
    
    # Additional Event Data
    event_metadata = Column(JSON, nullable=True)  # Store additional context (reason, allocations, etc.)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

# Re-export for convenience
__all__ = ['Trade', 'TradeAllocation', 'TradeAuditTrail']


