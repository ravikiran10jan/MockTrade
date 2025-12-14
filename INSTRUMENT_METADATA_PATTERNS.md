# Instrument Metadata Patterns

This document shows recommended metadata_json structures for different instrument types.

## FX Spot

```json
{
  "symbol": "EURUSD",
  "name": "EUR/USD Spot",
  "asset_class": "FX",
  "instrument_type": "SPOT",
  "metadata": {
    "quote_convention": "EUR/USD",
    "trading_hours": "23:00-22:00 UTC",
    "settlement_type": "T+2",
    "decimal_places": 5,
    "point_value": 0.0001,
    "pip_value": 10
  }
}
```

## FX Forward (OTC)

```json
{
  "symbol": "EURUSD-3M",
  "name": "EUR/USD 3-Month Forward",
  "asset_class": "FX",
  "instrument_type": "OTC_FX_FWD",
  "metadata": {
    "quote_convention": "EUR/USD",
    "tenor": "3M",
    "settlement_date": "2025-03-14",
    "settlement_type": "Physical",
    "is_deliverable": true,
    "trading_hours": "Custom"
  }
}
```

## FX Futures (CME)

```json
{
  "symbol": "6EZ25",
  "name": "CME Euro FX Futures (Dec 2025)",
  "asset_class": "FX",
  "instrument_type": "FX_FUT",
  "metadata": {
    "exchange": "CME",
    "underlying": "EUR/USD",
    "contract_size": 125000,
    "contract_month": "DEC2025",
    "expiry_date": "2025-12-15",
    "multiplier": 0.0001,
    "tick_size": 0.0001,
    "tick_value": 12.50,
    "trading_hours": "Sun 17:00 - Fri 16:00 CT"
  }
}
```

## Equity Futures

```json
{
  "symbol": "ESZ25",
  "name": "E-mini S&P 500 (Dec 2025)",
  "asset_class": "EQUITY",
  "instrument_type": "FX_FUT",
  "metadata": {
    "exchange": "CME",
    "underlying_index": "S&P 500",
    "underlying_symbol": "^GSPC",
    "contract_month": "DEC2025",
    "expiry_date": "2025-12-19",
    "contract_size": 1,
    "multiplier": 50,
    "tick_size": 0.25,
    "tick_value": 12.50,
    "margin_initial": 15000,
    "margin_maintenance": 12000
  }
}
```

## Equity Stock

```json
{
  "symbol": "AAPL",
  "name": "Apple Inc",
  "asset_class": "EQUITY",
  "instrument_type": "STOCK",
  "metadata": {
    "exchange": "NASDAQ",
    "isin": "US0378331005",
    "cusip": "037833100",
    "sector": "Technology",
    "market_cap": 3000000000000,
    "currency": "USD",
    "trading_hours": "09:30-16:00 ET"
  }
}
```

## Interest Rate Future

```json
{
  "symbol": "ZBZ25",
  "name": "30-Year US Treasury Bond Futures (Dec 2025)",
  "asset_class": "FIXED_INCOME",
  "instrument_type": "FX_FUT",
  "metadata": {
    "exchange": "CBOT",
    "underlying": "30Y US Treasury Bond",
    "contract_size": 100000,
    "contract_month": "DEC2025",
    "expiry_date": "2025-12-21",
    "multiplier": 1000,
    "tick_size": 0.015625,
    "tick_value": 15.625,
    "is_deliverable": true,
    "conversion_factor_date": "2025-12-01"
  }
}
```

## Strategy (Spread)

```json
{
  "symbol": "ES_NQ_CALENDAR",
  "name": "ES-NQ Calendar Spread",
  "asset_class": "EQUITY",
  "instrument_type": "STRATEGY",
  "metadata": {
    "legs": [
      {
        "instrument_symbol": "ESZ25",
        "side": "LONG",
        "ratio": 1,
        "quantity": 1
      },
      {
        "instrument_symbol": "NQZ25",
        "side": "SHORT",
        "ratio": 1,
        "quantity": 1
      }
    ],
    "net_ratio": "1:1",
    "rebalance_frequency": "Monthly",
    "inception_date": "2025-01-01"
  }
}
```

## Strategy (Basket)

```json
{
  "symbol": "TECH_BASKET",
  "name": "Technology Sector Basket",
  "asset_class": "EQUITY",
  "instrument_type": "STRATEGY",
  "metadata": {
    "legs": [
      {"symbol": "AAPL", "side": "LONG", "weight": 0.30},
      {"symbol": "MSFT", "side": "LONG", "weight": 0.25},
      {"symbol": "NVDA", "side": "LONG", "weight": 0.25},
      {"symbol": "GOOG", "side": "LONG", "weight": 0.20}
    ],
    "total_weight": 1.0,
    "rebalance_frequency": "Quarterly",
    "inception_date": "2025-01-01"
  }
}
```

## Option (Equity)

```json
{
  "symbol": "AAPL_240119C150",
  "name": "AAPL Jan 2024 Call 150",
  "asset_class": "EQUITY",
  "instrument_type": "OPTION",
  "metadata": {
    "underlying": "AAPL",
    "option_type": "CALL",
    "strike_price": 150.00,
    "expiry_date": "2024-01-19",
    "contract_size": 100,
    "style": "American",
    "exchange": "CBOE",
    "last_trading_date": "2024-01-18 16:00 ET"
  }
}
```

## Bond

```json
{
  "symbol": "US0378331005",
  "name": "US 10Y Treasury Note",
  "asset_class": "FIXED_INCOME",
  "instrument_type": "BOND",
  "metadata": {
    "issuer": "US Treasury",
    "coupon_rate": 4.125,
    "maturity_date": "2033-11-15",
    "face_value": 100,
    "settlement_type": "T+1",
    "accrued_interest_date": "2025-12-14",
    "duration": 7.5,
    "yield_to_maturity": 4.10
  }
}
```

## Cryptocurrency

```json
{
  "symbol": "BTC",
  "name": "Bitcoin",
  "asset_class": "DIGITAL_ASSET",
  "instrument_type": "CRYPTO",
  "metadata": {
    "blockchain": "Bitcoin",
    "decimals": 8,
    "min_order_size": 0.001,
    "trading_hours": "24/7",
    "exchanges": ["Coinbase", "Kraken", "Binance"],
    "address_format": "P2PKH/P2SH/Bech32"
  }
}
```

## Commodity (Future)

```json
{
  "symbol": "CLZ25",
  "name": "Crude Oil (Dec 2025)",
  "asset_class": "COMMODITY",
  "instrument_type": "FX_FUT",
  "metadata": {
    "exchange": "NYMEX",
    "underlying": "WTI Crude Oil",
    "contract_size": 1000,
    "unit": "barrels",
    "contract_month": "DEC2025",
    "expiry_date": "2025-11-20",
    "multiplier": 10,
    "tick_size": 0.01,
    "tick_value": 10,
    "trading_hours": "Sun 17:00 - Fri 16:00 CT"
  }
}
```

---

## Metadata Field Guidelines

### Recommended Common Fields (across types):
- `exchange` - Where traded (CME, NASDAQ, etc.)
- `underlying` - For derivatives
- `settlement_type` - Cash, Physical, T+N
- `trading_hours` - Hours available
- `contract_size` - Notional or units
- `multiplier` - For leverage calculation

### Product-Specific Fields:
- **Futures**: `expiry_date`, `contract_month`, `tick_size`, `tick_value`, `margin_*`
- **Options**: `strike_price`, `option_type` (CALL/PUT), `style` (American/European)
- **Bonds**: `coupon_rate`, `maturity_date`, `yield_to_maturity`
- **Strategies**: `legs` (array of components with weights/ratios)
- **FX**: `quote_convention`, `settlement_convention`, `pip_value`

### Keep Metadata Lean:
- Don't duplicate searchable fields (symbol, name) in metadata
- Store only product-specific or rarely-changing attributes
- Time-series data (prices, volumes) → separate tables, not metadata

---

## API Usage Examples

### Create FX Forward:
```bash
curl -X POST "http://localhost:8000/api/v1/static-data/instruments" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "EURUSD-3M",
    "name": "EUR/USD 3-Month Forward",
    "asset_class": "FX",
    "instrument_type": "OTC_FX_FWD",
    "metadata": {
      "tenor": "3M",
      "settlement_date": "2025-03-14",
      "settlement_type": "Physical"
    }
  }'
```

### Create Equity Basket Strategy:
```bash
curl -X POST "http://localhost:8000/api/v1/static-data/instruments" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "TECH_BASKET",
    "name": "Technology Sector Basket",
    "asset_class": "EQUITY",
    "instrument_type": "STRATEGY",
    "metadata": {
      "legs": [
        {"symbol": "AAPL", "weight": 0.30},
        {"symbol": "MSFT", "weight": 0.25},
        {"symbol": "NVDA", "weight": 0.25},
        {"symbol": "GOOG", "weight": 0.20}
      ]
    }
  }'
```

### Update Instrument Metadata:
```bash
curl -X PUT "http://localhost:8000/api/v1/static-data/instruments/{instrument_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ES",
    "name": "E-mini S&P 500",
    "asset_class": "FUTURE",
    "instrument_type": "FX_FUT",
    "metadata": {
      "exchange": "CME",
      "multiplier": 50,
      "expiry_date": "2025-12-19"
    }
  }'
```

---

These patterns should cover 90% of use cases. Extend as needed for your specific products!

