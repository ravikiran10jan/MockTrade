from sqlalchemy import Column, String, Integer, Float, Date, ForeignKey, DECIMAL, TIMESTAMP, JSON
from app.database import Base

# ---------------- Core Tables ---------------- #

class Instrument(Base):
    __tablename__ = "instrument"
    # Master instrument table with only the common fields for all product types.
    instrument_id = Column(String, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)  # human-friendly name
    asset_class = Column(String)  # e.g., FX, EQUITY, FUTURE, OTC
    instrument_type = Column(String)  # e.g., OTC_FX_FWD, FX_FUT, STRATEGY, SPOT, FUTURE
    status = Column(String, default="ACTIVE", index=True)
    created_at = Column(TIMESTAMP, nullable=False)

    # Flexible JSON metadata for product-type specific attributes
    # Examples: settlement_conventions, strategy_legs, futures_details, multiplier, tick_size, etc.
    metadata_json = Column(JSON, nullable=True)


# ============ INSTRUMENT SUBTYPES (1:1 Relationships) ============

class InstrumentOTC(Base):
    """
    OTC instrument details (1:1 with Instrument).
    For OTC products like FX forwards, swaps, options, etc.
    """
    __tablename__ = "instrument_otc"
    instrument_id = Column(String, ForeignKey("instrument.instrument_id"), primary_key=True)

    # Pricing & valuation
    forward_points_multiplier = Column(Float)  # For FX forwards (e.g., 10000)
    settlement_type = Column(String)  # e.g., "PHYSICAL", "CASH"
    settlement_day_offset = Column(Integer)  # T+N

    # Day count & accrual
    day_count_convention = Column(String)  # e.g., "ACT/365", "30/360"
    payment_frequency = Column(String)  # e.g., "QUARTERLY", "SEMI-ANNUAL"

    # Market calendars
    primary_calendar = Column(String)  # e.g., "US", "EUR", "GBP"
    secondary_calendar = Column(String)

    # Counterparty & clearing
    is_cleared = Column(String, default="N")  # Y/N, whether cleared or bilateral
    clearing_house = Column(String)  # e.g., "LCH", "CME Clearing"
    clearing_code = Column(String)
    bilateral_cpty = Column(String)  # For bilateral trades, counterparty code

    # Additional OTC-specific fields (JSON for extensibility)
    otc_details_json = Column(JSON, nullable=True)


class InstrumentETD(Base):
    """
    Exchange-Traded Derivative (ETD) instrument details (1:1 with Instrument).
    For futures, options traded on exchanges.
    """
    __tablename__ = "instrument_etd"
    instrument_id = Column(String, ForeignKey("instrument.instrument_id"), primary_key=True)

    # Exchange & listing
    exchange = Column(String, nullable=False)  # e.g., "CME", "LIFFE", "SGX"
    exchange_code = Column(String)  # Internal exchange identifier
    mic_code = Column(String)  # Market Identifier Code (ISO 10383)

    # Contract specifications
    contract_size = Column(DECIMAL)  # notional or number of units
    contract_multiplier = Column(Float)  # Multiplier for price (e.g., 50 for ES)
    tick_size = Column(DECIMAL)  # Minimum price increment
    tick_value = Column(DECIMAL)  # Monetary value of one tick

    # Contract months & expiry
    contract_months = Column(String)  # e.g., "HMUZ" (Mar, Jun, Sep, Dec)
    last_trade_day_rule = Column(String)  # e.g., "3 business days before 3rd Friday"
    last_trade_date_of_year = Column(Date)  # Fixed date or calculated

    # Margin & clearing
    margin_group = Column(String)  # e.g., "ES", "NQ" for SPAN margin group
    initial_margin = Column(DECIMAL)
    maintenance_margin = Column(DECIMAL)

    # Trading hours
    trading_hours = Column(String)  # e.g., "Sun 17:00 - Fri 16:00 CT"

    # Additional ETD-specific fields (JSON for extensibility)
    etd_details_json = Column(JSON, nullable=True)


class InstrumentStrategy(Base):
    """
    Strategy instrument details (1:1 with Instrument).
    For synthetic instruments combining multiple legs (spreads, baskets, etc).
    """
    __tablename__ = "instrument_strategy"
    instrument_id = Column(String, ForeignKey("instrument.instrument_id"), primary_key=True)

    # Strategy classification
    strategy_template = Column(String)  # e.g., "CALENDAR_SPREAD", "BUTTERFLY", "BASKET", "COLLAR"
    payoff_type = Column(String)  # e.g., "LINEAR", "CONVEX", "CUSTOM"

    # Rebalancing & management
    rebalance_frequency = Column(String)  # e.g., "DAILY", "WEEKLY", "MONTHLY", "NONE"
    rebalance_threshold = Column(Float)  # Tolerance % before rebalancing triggered

    # Pricing & valuation
    pricing_model = Column(String)  # e.g., "BLACK_SCHOLES", "MONTECARLO", "MARK_TO_MARKET"
    valuation_currency = Column(String)  # e.g., "USD"

    # Additional strategy details (JSON for extensibility)
    strategy_details_json = Column(JSON, nullable=True)


class StrategyLeg(Base):
    """
    Component legs of a strategy instrument.
    Links a strategy to its component instruments with ratios/weights.
    """
    __tablename__ = "strategy_leg"
    leg_id = Column(String, primary_key=True, index=True)
    strategy_id = Column(String, ForeignKey("instrument.instrument_id"), nullable=False, index=True)
    component_instrument_id = Column(String, ForeignKey("instrument.instrument_id"), nullable=False, index=True)

    # Leg details
    leg_sequence = Column(Integer)  # Order of legs in strategy (e.g., 1, 2, 3)
    side = Column(String)  # "LONG" or "SHORT"
    ratio = Column(DECIMAL)  # Ratio/weight (e.g., 1.0, 0.5, -2.0)
    quantity_type = Column(String)  # "RATIO" (ratio-based) or "ABSOLUTE" (fixed qty)

    # Optional: pricing adjustments per leg
    hedge_ratio = Column(Float)  # Separate from ratio if needed for adjustments

    # Additional leg details (JSON for extensibility)
    leg_details_json = Column(JSON, nullable=True)

    status = Column(String, default="ACTIVE")
    created_at = Column(TIMESTAMP)





class Account(Base):
    __tablename__ = "account"
    account_id = Column(String, primary_key=True, index=True)
    code = Column(String)
    name = Column(String)
    status = Column(String)
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

class Broker(Base):
    __tablename__ = "broker"
    broker_id = Column(String, primary_key=True, index=True)
    code = Column(String)
    name = Column(String)
    status = Column(String)
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

class Clearer(Base):
    __tablename__ = "clearer"
    clearer_id = Column(String, primary_key=True, index=True)
    code = Column(String)
    name = Column(String)
    leid = Column(String)  # Legal Entity Identifier
    status = Column(String)
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

class Trader(Base):
    __tablename__ = "trader"
    trader_id = Column(String, primary_key=True, index=True)
    user_id = Column(String)
    name = Column(String)
    desk = Column(String)
    status = Column(String, default="ACTIVE")
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

class OrderHdr(Base):
    __tablename__ = "order_hdr"
    order_id = Column(String, primary_key=True, index=True)
    instrument_id = Column(String, ForeignKey("instrument.instrument_id"))
    side = Column(String)
    qty = Column(Integer)
    limit_price = Column(DECIMAL)
    type = Column(String)
    tif = Column(String)
    trader_id = Column(String, ForeignKey("trader.trader_id"))
    account_id = Column(String, ForeignKey("account.account_id"))
    status = Column(String)
    created_at = Column(TIMESTAMP)

class TradeHdr(Base):
    __tablename__ = "trade_hdr"
    trade_id = Column(String, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("order_hdr.order_id"), nullable=True)
    instrument_id = Column(String, ForeignKey("instrument.instrument_id"))
    side = Column(String)
    qty = Column(Integer)
    price = Column(DECIMAL)
    trader_id = Column(String, ForeignKey("trader.trader_id"))
    exec_time = Column(TIMESTAMP)
    broker_id = Column(String, ForeignKey("broker.broker_id"))
    account_id = Column(String, ForeignKey("account.account_id"))
    status = Column(String)
    reversal_of_trade_id = Column(String)
    roll_group_id = Column(String)
    created_at = Column(TIMESTAMP)

class TradeAllocation(Base):
    __tablename__ = "trade_allocation"
    allocation_id = Column(String, primary_key=True, index=True)
    trade_id = Column(String, ForeignKey("trade_hdr.trade_id"))
    account_id = Column(String, ForeignKey("account.account_id"))
    alloc_qty = Column(Integer)
    status = Column(String)

class SettlementPrice(Base):
    __tablename__ = "settlement_price"
    instrument_id = Column(String, ForeignKey("instrument.instrument_id"), primary_key=True)
    val_date = Column(Date, primary_key=True)
    settle_price = Column(DECIMAL)

class FinalSettlementPrice(Base):
    __tablename__ = "final_settlement_price"
    instrument_id = Column(String, ForeignKey("instrument.instrument_id"), primary_key=True)
    val_date = Column(Date, primary_key=True)
    final_price = Column(DECIMAL)

class PositionDaily(Base):
    __tablename__ = "position_daily"
    instrument_id = Column(String, ForeignKey("instrument.instrument_id"), primary_key=True)
    account_id = Column(String, ForeignKey("account.account_id"), primary_key=True)
    val_date = Column(Date, primary_key=True)
    net_qty = Column(Integer)
    open_qty = Column(Integer)
    close_qty = Column(Integer)

class VariationMargin(Base):
    __tablename__ = "variation_margin"
    vm_id = Column(String, primary_key=True, index=True)
    instrument_id = Column(String, ForeignKey("instrument.instrument_id"))
    account_id = Column(String, ForeignKey("account.account_id"))
    val_date = Column(Date)
    prev_settle = Column(DECIMAL)
    today_settle = Column(DECIMAL)
    net_qty = Column(Integer)
    contract_multiplier = Column(Integer)
    vm_amount = Column(DECIMAL)

class EodPnl(Base):
    __tablename__ = "eod_pnl"
    instrument_id = Column(String, ForeignKey("instrument.instrument_id"), primary_key=True)
    account_id = Column(String, ForeignKey("account.account_id"), primary_key=True)
    val_date = Column(Date, primary_key=True)
    realized_pnl = Column(DECIMAL)
    unrealized_pnl = Column(DECIMAL)
    total_pnl = Column(DECIMAL)

class AuditLog(Base):
    __tablename__ = "audit_log"
    audit_id = Column(String, primary_key=True, index=True)
    entity_type = Column(String)
    entity_id = Column(String)
    action = Column(String)
    user_id = Column(String)
    timestamp = Column(TIMESTAMP)
    before_json = Column(JSON)
    after_json = Column(JSON)
    comment = Column(String)

# ============ ENRICHMENT TABLES ============

class PortfolioEnrichmentMapping(Base):
    """Portfolio enrichment mappings - map trader accounts/instruments to internal portfolio codes"""
    __tablename__ = "portfolio_enrichment_mapping"
    rule_id = Column(Integer, primary_key=True, index=True)
    source_system = Column(String, index=True, nullable=False)  # BLBG, MUREX, SUMMIT
    trader_account_id = Column(String, index=True, nullable=False)
    instrument_code = Column(String, nullable=True)  # blank = any instrument
    portfolio_code = Column(String, nullable=False)
    comments = Column(String, nullable=True)
    active = Column(String, default="Y", index=True)  # Y/N flag
    created_at = Column(TIMESTAMP, nullable=False)


class TraderEnrichmentMapping(Base):
    """Trader enrichment mappings - map source system trader UUIDs to internal trader IDs"""
    __tablename__ = "trader_enrichment_mapping"
    rule_id = Column(Integer, primary_key=True, index=True)
    source_system = Column(String, index=True, nullable=False)  # BLBG, MUREX, SUMMIT
    source_trader_uuid = Column(String, index=True, nullable=False)
    internal_trader_id = Column(String, index=True, nullable=False)
    email = Column(String, nullable=False)
    active = Column(String, default="Y", index=True)  # Y/N flag
    created_at = Column(TIMESTAMP, nullable=False)


class BrokerEnrichmentMapping(Base):
    """Broker enrichment mappings - map source system + account to broker details"""
    __tablename__ = "broker_enrichment_mapping"
    rule_id = Column(Integer, primary_key=True, index=True)
    source_system = Column(String, index=True, nullable=False)  # BLBG, MUREX, SUMMIT
    account_name = Column(String, index=True, nullable=False)
    broker = Column(String, nullable=False)
    broker_leid = Column(String, nullable=False)  # Legal Entity Identifier
    comments = Column(String, nullable=True)
    active = Column(String, default="Y", index=True)  # Y/N flag
    created_at = Column(TIMESTAMP, nullable=False)


class ClearerEnrichmentMapping(Base):
    """Clearer enrichment mappings - map source system + account to clearer details"""
    __tablename__ = "clearer_enrichment_mapping"
    rule_id = Column(Integer, primary_key=True, index=True)
    source_system = Column(String, index=True, nullable=False)  # BLBG, MUREX, SUMMIT
    account_name = Column(String, index=True, nullable=False)
    clearer = Column(String, nullable=False)
    clearer_leid = Column(String, nullable=False)  # Legal Entity Identifier
    comments = Column(String, nullable=True)
    active = Column(String, default="Y", index=True)  # Y/N flag
    created_at = Column(TIMESTAMP, nullable=False)


# ============ SECURITY & RBAC TABLES ============

class Role(Base):
    """Role definitions for role-based access control"""
    __tablename__ = "role"
    role_id = Column(String, primary_key=True, index=True)
    role_name = Column(String, unique=True, nullable=False, index=True)  # FO_USER, BO_USER, SUPPORT
    description = Column(String, nullable=True)
    status = Column(String, default="ACTIVE", index=True)  # ACTIVE, INACTIVE
    created_at = Column(TIMESTAMP, nullable=False)


class Permission(Base):
    """Permission definitions"""
    __tablename__ = "permission"
    permission_id = Column(String, primary_key=True, index=True)
    permission_name = Column(String, unique=True, nullable=False, index=True)  # READ, READ_WRITE
    description = Column(String, nullable=True)
    status = Column(String, default="ACTIVE", index=True)  # ACTIVE, INACTIVE
    created_at = Column(TIMESTAMP, nullable=False)


class Module(Base):
    """Module/Feature definitions that can have permissions"""
    __tablename__ = "module"
    module_id = Column(String, primary_key=True, index=True)
    module_name = Column(String, unique=True, nullable=False, index=True)  # OrderEntry, StaticData, MarketData, etc
    description = Column(String, nullable=True)
    status = Column(String, default="ACTIVE", index=True)  # ACTIVE, INACTIVE
    created_at = Column(TIMESTAMP, nullable=False)


class RolePermissionMapping(Base):
    """Maps roles to permissions for specific modules"""
    __tablename__ = "role_permission_mapping"
    mapping_id = Column(String, primary_key=True, index=True)
    role_id = Column(String, ForeignKey("role.role_id"), nullable=False, index=True)
    module_id = Column(String, ForeignKey("module.module_id"), nullable=False, index=True)
    permission_id = Column(String, ForeignKey("permission.permission_id"), nullable=False, index=True)
    status = Column(String, default="ACTIVE", index=True)  # ACTIVE, INACTIVE
    created_at = Column(TIMESTAMP, nullable=False)


class UserRole(Base):
    """Maps users (traders) to roles"""
    __tablename__ = "user_role"
    user_role_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("trader.trader_id"), nullable=False, index=True)
    role_id = Column(String, ForeignKey("role.role_id"), nullable=False, index=True)
    assigned_at = Column(TIMESTAMP, nullable=False)
    assigned_by = Column(String, nullable=True)  # User ID of who assigned this role
    status = Column(String, default="ACTIVE", index=True)  # ACTIVE, INACTIVE
    created_at = Column(TIMESTAMP, nullable=False)

