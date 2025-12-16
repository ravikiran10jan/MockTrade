from sqlalchemy.orm import Session
from app.models import OrderHdr, Trader, Account, Instrument
from app import schemas
from datetime import datetime
import uuid

def create_order(db: Session, order: dict):
    order_id = str(uuid.uuid4())
    db_order = OrderHdr(
        order_id=order_id,
        instrument_id=order['instrument'],
        side=order['side'].upper(),
        qty=order['qty'],
        limit_price=order['price'],
        type=order['type'].upper(),
        tif=order['tif'].upper(),
        trader_id=order['trader'],
        account_id=order['account'],
        status="NEW",
        created_at=datetime.utcnow()
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Lookup instrument symbol
    instrument_symbol = db_order.instrument_id
    if db_order.instrument_id:
        instrument = db.query(Instrument).filter(Instrument.instrument_id == db_order.instrument_id).first()
        if instrument:
            instrument_symbol = instrument.symbol
    
    # Lookup trader user_id
    trader_user_id = db_order.trader_id
    if db_order.trader_id:
        trader = db.query(Trader).filter(Trader.trader_id == db_order.trader_id).first()
        if trader:
            trader_user_id = trader.user_id
    
    # Lookup account code
    account_code = db_order.account_id
    if db_order.account_id:
        account = db.query(Account).filter(Account.account_id == db_order.account_id).first()
        if account:
            account_code = account.code

    return {
        "id": db_order.order_id,
        "instrument": instrument_symbol,
        "side": db_order.side,
        "qty": db_order.qty,
        "price": float(db_order.limit_price) if db_order.limit_price else None,
        "type": db_order.type,
        "tif": db_order.tif,
        "trader": trader_user_id,
        "account": account_code,
        "status": db_order.status,
        "created_at": str(db_order.created_at)
    }

def create_strategy_order(db: Session, strategy_order: dict):
    """
    Create a strategy order consisting of multiple legs.
    For simplicity, we'll create individual orders for each leg.
    """
    created_orders = []
    
    # Get the first trader for now (in a real app, you'd want to handle this properly)
    trader = db.query(Trader).first()
    if not trader:
        raise ValueError("No traders found in the system")
    
    # Create orders for each leg
    for i, leg in enumerate(strategy_order.get('legs', [])):
        order_id = str(uuid.uuid4())
        leg_side = leg.get('side', strategy_order.get('side', 'BUY')).upper()
        
        db_order = OrderHdr(
            order_id=order_id,
            instrument_id=strategy_order['underlying'],
            side=leg_side,
            qty=int(leg.get('quantity', strategy_order.get('quantity', 1))),
            limit_price=float(leg.get('price')) if leg.get('price') else None,
            type=leg.get('orderType', 'LIMIT').upper(),
            tif=strategy_order.get('timeInForce', 'DAY').upper(),
            trader_id=trader.trader_id,  # Use actual trader ID
            account_id=strategy_order['account'],
            status="NEW",
            created_at=datetime.utcnow()
        )
        db.add(db_order)
        db.commit()
        db.refresh(db_order)

        # Lookup instrument symbol
        instrument_symbol = db_order.instrument_id
        if db_order.instrument_id:
            instrument = db.query(Instrument).filter(Instrument.instrument_id == db_order.instrument_id).first()
            if instrument:
                instrument_symbol = instrument.symbol
        
        # Lookup trader user_id
        trader_user_id = db_order.trader_id
        if db_order.trader_id:
            trader_obj = db.query(Trader).filter(Trader.trader_id == db_order.trader_id).first()
            if trader_obj:
                trader_user_id = trader_obj.user_id
        
        # Lookup account code
        account_code = db_order.account_id
        if db_order.account_id:
            account = db.query(Account).filter(Account.account_id == db_order.account_id).first()
            if account:
                account_code = account.code

        created_orders.append({
            "id": db_order.order_id,
            "instrument": instrument_symbol,
            "side": db_order.side,
            "qty": db_order.qty,
            "price": float(db_order.limit_price) if db_order.limit_price else None,
            "type": db_order.type,
            "tif": db_order.tif,
            "trader": trader_user_id,
            "account": account_code,
            "status": db_order.status,
            "created_at": str(db_order.created_at),
            "strategy_leg": f"{strategy_order.get('strategyType', 'STRATEGY')}_{leg.get('type', 'LEG')}_{i+1}",
            "strike": leg.get('strike'),
            "leg_type": leg.get('type')
        })
    
    return created_orders

def get_orders(db: Session):
    orders = db.query(OrderHdr).all()
    result = []
    for o in orders:
        # Lookup instrument symbol
        instrument_symbol = o.instrument_id
        if o.instrument_id:
            instrument = db.query(Instrument).filter(Instrument.instrument_id == o.instrument_id).first()
            if instrument:
                instrument_symbol = instrument.symbol
        
        # Lookup trader user_id
        trader_user_id = o.trader_id
        if o.trader_id:
            trader = db.query(Trader).filter(Trader.trader_id == o.trader_id).first()
            if trader:
                trader_user_id = trader.user_id
        
        # Lookup account code
        account_code = o.account_id
        if o.account_id:
            account = db.query(Account).filter(Account.account_id == o.account_id).first()
            if account:
                account_code = account.code
        
        result.append({
            "id": o.order_id,
            "instrument": instrument_symbol,
            "side": o.side,
            "qty": o.qty,
            "price": float(o.limit_price) if o.limit_price else None,
            "type": o.type,
            "tif": o.tif,
            "trader": trader_user_id,
            "account": account_code,
            "status": o.status,
            "created_at": str(o.created_at)
        })
    return result


def update_order_status(db: Session, order_id: str, status: str):
    o = db.query(OrderHdr).filter(OrderHdr.order_id == order_id).first()
    if not o:
        return {"error": "not found"}
    o.status = status
    db.commit()
    db.refresh(o)
    return {"id": o.order_id, "status": o.status}


def simulate_fill(db: Session, order_id: str):
    o = db.query(OrderHdr).filter(OrderHdr.order_id == order_id).first()
    if not o:
        return {"error": "not found"}
    o.status = "FILLED"
    from datetime import datetime
    # Ensure model has filled_at column; set if present
    try:
        o.filled_at = datetime.utcnow()
    except Exception:
        pass
    db.commit()
    db.refresh(o)
    return {
        "id": o.order_id,
        "status": o.status,
        "filled_at": str(getattr(o, 'filled_at', ''))
    }