# Trade Query Module - Routes

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import OrderHdr, Instrument, Trader, Account, PortfolioEnrichmentMapping
from app.modules.trade.models import Trade
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/v1/trade-query", tags=["Trade Query"])

class EnrichedTradeSchema(BaseModel):
    trade_id: str
    order_id: Optional[str]
    instrument_id: str
    instrument_symbol: str
    instrument_expiry_date: Optional[datetime]
    side: str
    qty: int
    price: float
    trader_id: str
    trader_name: Optional[str]
    account_id: str
    account_code: Optional[str]
    portfolio_name: Optional[str]
    status: str
    notional_value: Optional[float]
    commission: float
    pnl: Optional[float]
    unrealized_pnl: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/enriched-trades", response_model=List[EnrichedTradeSchema])
def get_enriched_trades(
    status: Optional[str] = None,
    trader_id: Optional[str] = None,
    account_id: Optional[str] = None,
    instrument_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get enriched trades with portfolio names and instrument expiry dates.
    Enriches trade data with:
    1. Portfolio name from portfolio enrichments based on trader + account
    2. Instrument expiry date from static data
    3. Human-readable names for traders and accounts
    """
    # Build base query
    query = db.query(Trade)
    
    # Apply filters
    if status:
        query = query.filter(TradeHdr.status == status)
    if trader_id:
        query = query.filter(TradeHdr.trader_id == trader_id)
    if account_id:
        query = query.filter(TradeHdr.account_id == account_id)
    if instrument_id:
        query = query.filter(TradeHdr.instrument_id == instrument_id)
    
    trades = query.all()
    
    # Enrich the trades
    enriched_trades = []
    for trade in trades:
        # Get instrument details
        instrument = db.query(Instrument).filter(Instrument.instrument_id == trade.instrument_id).first()
        instrument_symbol = instrument.symbol if instrument else trade.instrument_id
        instrument_expiry_date = instrument.expiry_date if instrument else None
        
        # Get trader details
        trader = db.query(Trader).filter(Trader.trader_id == trade.trader_id).first()
        trader_name = trader.name if trader else None
        
        # Get account details
        account = db.query(Account).filter(Account.account_id == trade.account_id).first()
        account_code = account.code if account else None
        
        # Get portfolio name from enrichment mapping
        portfolio_name = None
        if trade.trader_id and trade.account_id:
            portfolio_mapping = db.query(PortfolioEnrichmentMapping).filter(
                PortfolioEnrichmentMapping.trader_id == trade.trader_id,
                PortfolioEnrichmentMapping.account_id == trade.account_id,
                PortfolioEnrichmentMapping.active == "Y"
            ).first()
            if portfolio_mapping:
                portfolio_name = portfolio_mapping.portfolio
        
        # Calculate notional value
        notional_value = float(trade.qty * trade.price) if trade.qty and trade.price else None
        
        enriched_trades.append(EnrichedTradeSchema(
            trade_id=trade.trade_id,
            order_id=trade.order_id,
            instrument_id=trade.instrument_id,
            instrument_symbol=instrument_symbol,
            instrument_expiry_date=instrument_expiry_date,
            side=trade.side,
            qty=trade.qty,
            price=float(trade.price) if trade.price else 0.0,
            trader_id=trade.trader_id,
            trader_name=trader_name,
            account_id=trade.account_id,
            account_code=account_code,
            portfolio_name=portfolio_name,
            status=trade.status,
            notional_value=notional_value,
            commission=float(trade.commission) if trade.commission else 0.0,
            pnl=float(trade.pnl) if trade.pnl else None,
            unrealized_pnl=float(trade.unrealized_pnl) if trade.unrealized_pnl else None,
            created_at=trade.created_at
        ))
    
    return enriched_trades

@router.get("/enriched-orders", response_model=List[dict])
def get_enriched_orders(
    status: Optional[str] = None,
    trader_id: Optional[str] = None,
    account_id: Optional[str] = None,
    instrument_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get enriched orders with portfolio names and instrument expiry dates.
    Enriches order data with:
    1. Portfolio name from portfolio enrichments based on trader + account
    2. Instrument expiry date from static data
    3. Human-readable names for traders and accounts
    """
    # Build base query
    query = db.query(OrderHdr)
    
    # Apply filters
    if status:
        query = query.filter(OrderHdr.status == status)
    if trader_id:
        query = query.filter(OrderHdr.trader_id == trader_id)
    if account_id:
        query = query.filter(OrderHdr.account_id == account_id)
    if instrument_id:
        query = query.filter(OrderHdr.instrument_id == instrument_id)
    
    orders = query.all()
    
    # Enrich the orders
    enriched_orders = []
    for order in orders:
        # Get instrument details
        instrument = db.query(Instrument).filter(Instrument.instrument_id == order.instrument_id).first()
        instrument_symbol = instrument.symbol if instrument else order.instrument_id
        instrument_expiry_date = instrument.expiry_date if instrument else None
        
        # Get trader details
        trader = db.query(Trader).filter(Trader.trader_id == order.trader_id).first()
        trader_name = trader.name if trader else None
        
        # Get account details
        account = db.query(Account).filter(Account.account_id == order.account_id).first()
        account_code = account.code if account else None
        
        # Get portfolio name from enrichment mapping
        portfolio_name = None
        if order.trader_id and order.account_id:
            portfolio_mapping = db.query(PortfolioEnrichmentMapping).filter(
                PortfolioEnrichmentMapping.trader_id == order.trader_id,
                PortfolioEnrichmentMapping.account_id == order.account_id,
                PortfolioEnrichmentMapping.active == "Y"
            ).first()
            if portfolio_mapping:
                portfolio_name = portfolio_mapping.portfolio
        
        # Calculate notional value
        notional_value = float(order.qty * order.limit_price) if order.qty and order.limit_price else None
        
        enriched_orders.append({
            "order_id": order.order_id,
            "instrument_id": order.instrument_id,
            "instrument_symbol": instrument_symbol,
            "instrument_expiry_date": instrument_expiry_date,
            "side": order.side,
            "qty": order.qty,
            "price": float(order.limit_price) if order.limit_price else None,
            "type": order.type,
            "tif": order.tif,
            "trader_id": order.trader_id,
            "trader_name": trader_name,
            "account_id": order.account_id,
            "account_code": account_code,
            "portfolio_name": portfolio_name,
            "status": order.status,
            "notional_value": notional_value,
            "created_at": order.created_at
        })
    
    return enriched_orders