# Static Data Module - Schemas

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime, date
from app.core import BaseSchema, TimestampedSchema

class InstrumentSchema(BaseSchema):
    """Response schema for Instrument"""
    instrument_id: str
    symbol: str
    name: str
    asset_class: Optional[str] = None
    instrument_type: Optional[str] = None
    status: str = "ACTIVE"
    expiry_date: Optional[date] = None
    last_trading_date: Optional[date] = None
    created_at: Optional[datetime] = None
    # Metadata is returned from metadata_json column for backward compatibility
    metadata: Optional[Dict[str, Any]] = None

class InstrumentCreateSchema(BaseSchema):
    """Create/Update schema for Instrument"""
    symbol: str
    name: str
    asset_class: Optional[str] = None
    instrument_type: Optional[str] = None
    status: str = "ACTIVE"
    expiry_date: Optional[date] = None
    last_trading_date: Optional[date] = None
    # Client sends metadata; backend maps to metadata_json column
    metadata: Optional[Dict[str, Any]] = None


# ============ INSTRUMENT SUBTYPE SCHEMAS ============

class InstrumentOTCCreateSchema(BaseSchema):
    """Create/Update schema for OTC instrument details"""
    instrument_id: str  # Required, links to instrument
    forward_points_multiplier: Optional[float] = None
    settlement_type: Optional[str] = None  # e.g., PHYSICAL, CASH
    settlement_day_offset: Optional[int] = None  # T+N
    day_count_convention: Optional[str] = None  # ACT/365, 30/360
    payment_frequency: Optional[str] = None  # QUARTERLY, SEMI-ANNUAL
    primary_calendar: Optional[str] = None  # US, EUR, GBP
    secondary_calendar: Optional[str] = None
    is_cleared: str = "N"  # Y or N
    clearing_house: Optional[str] = None  # LCH, CME Clearing
    clearing_code: Optional[str] = None
    bilateral_cpty: Optional[str] = None
    otc_details_json: Optional[Dict[str, Any]] = None

class InstrumentOTCSchema(InstrumentOTCCreateSchema):
    """Response schema for OTC instrument details"""
    pass


class InstrumentETDCreateSchema(BaseSchema):
    """Create/Update schema for ETD instrument details"""
    instrument_id: str  # Required, links to instrument
    exchange: str  # Required: CME, LIFFE, SGX
    exchange_code: Optional[str] = None
    mic_code: Optional[str] = None
    contract_size: Optional[float] = None
    contract_multiplier: Optional[float] = None  # e.g., 50 for ES
    tick_size: Optional[float] = None
    tick_value: Optional[float] = None
    contract_months: Optional[str] = None  # HMUZ for Mar, Jun, Sep, Dec
    last_trade_day_rule: Optional[str] = None
    last_trade_date_of_year: Optional[date] = None
    margin_group: Optional[str] = None
    initial_margin: Optional[float] = None
    maintenance_margin: Optional[float] = None
    trading_hours: Optional[str] = None
    etd_details_json: Optional[Dict[str, Any]] = None

class InstrumentETDSchema(InstrumentETDCreateSchema):
    """Response schema for ETD instrument details"""
    pass


class StrategyLegSchema(BaseSchema):
    """Schema for a single leg of a strategy"""
    leg_id: str
    strategy_id: str
    component_instrument_id: str
    leg_sequence: Optional[int] = None
    side: Optional[str] = None  # LONG or SHORT
    ratio: Optional[float] = None
    quantity_type: Optional[str] = None  # RATIO or ABSOLUTE
    hedge_ratio: Optional[float] = None
    leg_details_json: Optional[Dict[str, Any]] = None
    status: str = "ACTIVE"
    created_at: Optional[datetime] = None

class StrategyLegCreateSchema(BaseSchema):
    """Create/Update schema for strategy leg"""
    strategy_id: str
    component_instrument_id: str
    leg_sequence: Optional[int] = None
    side: Optional[str] = None
    ratio: Optional[float] = None
    quantity_type: Optional[str] = None
    hedge_ratio: Optional[float] = None
    leg_details_json: Optional[Dict[str, Any]] = None
    status: str = "ACTIVE"


class InstrumentStrategyCreateSchema(BaseSchema):
    """Create/Update schema for Strategy instrument details"""
    instrument_id: str  # Required, links to instrument
    strategy_template: Optional[str] = None  # CALENDAR_SPREAD, BUTTERFLY, BASKET, COLLAR
    payoff_type: Optional[str] = None  # LINEAR, CONVEX, CUSTOM
    rebalance_frequency: Optional[str] = None  # DAILY, WEEKLY, MONTHLY, NONE
    rebalance_threshold: Optional[float] = None  # % tolerance
    pricing_model: Optional[str] = None  # BLACK_SCHOLES, MONTECARLO, MARK_TO_MARKET
    valuation_currency: Optional[str] = None
    strategy_details_json: Optional[Dict[str, Any]] = None

class InstrumentStrategySchema(InstrumentStrategyCreateSchema):
    """Response schema for Strategy instrument details"""
    pass


# ============ COMPOSITE SCHEMAS ============

class InstrumentDetailedSchema(InstrumentSchema):
    """Detailed instrument response including subtype details"""
    otc_details: Optional[InstrumentOTCSchema] = None
    etd_details: Optional[InstrumentETDSchema] = None
    strategy_details: Optional[InstrumentStrategySchema] = None
    strategy_legs: Optional[list[StrategyLegSchema]] = None

class AccountSchema(TimestampedSchema):
    account_id: str
    code: str
    name: str
    status: str = "ACTIVE"

class AccountCreateSchema(BaseSchema):
    code: str
    name: str
    status: str = "ACTIVE"

class BrokerSchema(TimestampedSchema):
    broker_id: str
    code: str
    name: str
    status: str = "ACTIVE"

class BrokerCreateSchema(BaseSchema):
    code: str
    name: str
    status: str = "ACTIVE"

class ClearerSchema(TimestampedSchema):
    clearer_id: str
    code: str
    name: str
    leid: str
    status: str = "ACTIVE"

class ClearerCreateSchema(BaseSchema):
    code: str
    name: str
    leid: str
    status: str = "ACTIVE"

class TraderSchema(TimestampedSchema):
    trader_id: str
    user_id: str
    name: str
    desk: str
    status: str = "ACTIVE"

class TraderCreateSchema(BaseSchema):
    user_id: str
    name: str
    desk: str
    status: str = "ACTIVE"
