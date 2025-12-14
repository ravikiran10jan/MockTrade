# MockTrade Module Development Guide

## Overview

MockTrade is built on a **modular, scalable architecture** designed to support complex trading workflows. Each module is independent but can communicate with others through well-defined APIs and events.

---

## Core Modules

### 1. **Static Data Module** ✅ IMPLEMENTED
**Location:** `app/modules/static_data/`

Manages all master data required by other modules.

**Entities:**
- `Instrument` - Trading instruments (bonds, futures, etc.)
- `Account` - Trading accounts
- `Broker` - Broker information
- `Trader` - Trader profiles

**Key Endpoints:**
```bash
# Instruments
POST   /api/v1/static-data/instruments
GET    /api/v1/static-data/instruments
GET    /api/v1/static-data/instruments/{instrument_id}
PUT    /api/v1/static-data/instruments/{instrument_id}
DELETE /api/v1/static-data/instruments/{instrument_id}

# Accounts
POST   /api/v1/static-data/accounts
GET    /api/v1/static-data/accounts
GET    /api/v1/static-data/accounts/{account_id}

# Brokers
POST   /api/v1/static-data/brokers
GET    /api/v1/static-data/brokers
GET    /api/v1/static-data/brokers/{broker_id}

# Traders
POST   /api/v1/static-data/traders
GET    /api/v1/static-data/traders
GET    /api/v1/static-data/traders/{trader_id}
```

**Example Request:**
```json
POST /api/v1/static-data/instruments
{
  "symbol": "ES",
  "exchange": "CME",
  "product_type": "FUTURE",
  "tick_size": "0.25",
  "tick_value": "12.5",
  "contract_multiplier": "50"
}
```

---

### 2. **Market Data Module** 🔧 SKELETON
**Location:** `app/modules/market_data/`

Maintains real-time market data and price quotes.

**Entities:**
- `MarketData` - Current market data (bid/ask/last) for instruments
- `PriceQuote` - Historical price quotes

**Key Endpoints:**
```bash
# Market Data
POST   /api/v1/market-data/market-data
GET    /api/v1/market-data/market-data/{instrument_id}

# Price Quotes
POST   /api/v1/market-data/quotes
GET    /api/v1/market-data/quotes/{instrument_id}
```

**Example Request:**
```json
POST /api/v1/market-data/market-data
{
  "instrument_id": "ES",
  "bid_price": 4000.50,
  "ask_price": 4000.75,
  "bid_qty": 100,
  "ask_qty": 100,
  "last_price": 4000.60
}
```

**TODO:**
- [ ] Market data ingestion from external feeds
- [ ] Price update streaming (WebSocket)
- [ ] Data validation and quality checks
- [ ] Historical data persistence

---

### 3. **Order Module** ✅ IMPLEMENTED (Legacy)
**Location:** `app/routes/order.py`

Original order management module. Being refactored into the modular structure.

**Features:**
- Create orders
- Cancel orders
- Simulate fill

**Endpoints:**
```bash
POST   /order/                       # Create order
GET    /order/                       # List orders
POST   /order/{order_id}/cancel      # Cancel order
POST   /order/{order_id}/simulate_fill  # Simulate fill
```

---

### 4. **Enrichment Module** 🔧 SKELETON
**Location:** `app/modules/enrichment/`

Enriches orders with market data, pricing, and risk metrics.

**Entities:**
- `EnrichedOrder` - Order with calculated metrics

**Key Endpoints:**
```bash
POST   /api/v1/enrichment/enrich-order/{order_id}
GET    /api/v1/enrichment/enrich-order/{order_id}
POST   /api/v1/enrichment/bulk-enrich
GET    /api/v1/enrichment/enrichment-metrics/{order_id}
```

**Enrichment Process:**
1. Order created → Enrichment triggered
2. Fetch market data for instrument
3. Calculate pricing metrics (mid, spread)
4. Calculate risk metrics (notional value, risk score)
5. Store enriched data
6. Publish `ENRICHMENT_COMPLETED` event

**TODO:**
- [ ] Implement pricing calculation logic
- [ ] Implement risk scoring algorithm
- [ ] Event subscription to OrderCreated
- [ ] Async enrichment processing

---

### 5. **Trade Module** 🔧 SKELETON
**Location:** `app/modules/trade/`

Manages filled orders as trades with full lifecycle.

**Entities:**
- `Trade` - Filled order with trade-specific fields
- `TradeAllocation` - Allocate trade to multiple accounts

**Key Endpoints:**
```bash
POST   /api/v1/trades/
GET    /api/v1/trades/
GET    /api/v1/trades/{trade_id}
POST   /api/v1/trades/{trade_id}/cancel
POST   /api/v1/trades/{trade_id}/expire
POST   /api/v1/trades/{trade_id}/allocate
GET    /api/v1/trades/{trade_id}/allocations
```

**Trade Lifecycle:**
```
Order Filled → Trade Created (ACTIVE)
                   ↓
                   ├─→ CANCELLED (user action)
                   ├─→ EXPIRED (expiry date reached)
                   └─→ SETTLED (settlement date)
```

**Example Request:**
```json
POST /api/v1/trades/
{
  "order_id": "uuid-123",
  "instrument_id": "ES",
  "side": "BUY",
  "qty": 10,
  "price": 4000.50,
  "trader_id": "trader-1",
  "account_id": "acc-001"
}
```

**Allocate Trade Example:**
```json
POST /api/v1/trades/trade-123/allocate
{
  "acc-001": 5,
  "acc-002": 5
}
```

**TODO:**
- [ ] Complete trade allocation logic
- [ ] Trade cancellation with P&L recalculation
- [ ] Trade expiry scheduling
- [ ] P&L calculation
- [ ] Settlement integration

---

## Module Communication Patterns

### 1. **Event-Driven (Async)**

Modules publish events that other modules subscribe to.

**Example: Order → Enrichment → Trade**
```python
# Order Module publishes
publish_event(EventType.ORDER_CREATED, {...}, "order")

# Enrichment Module subscribes
event_bus.subscribe(EventType.ORDER_CREATED, enrich_order_handler)

# Trade Module subscribes
event_bus.subscribe(EventType.ORDER_FILLED, create_trade_handler)
```

**Available Events:**
```python
EventType.ORDER_CREATED
EventType.ORDER_FILLED
EventType.ORDER_CANCELLED
EventType.TRADE_CREATED
EventType.TRADE_CANCELLED
EventType.TRADE_EXPIRED
EventType.MARKET_DATA_UPDATED
EventType.ENRICHMENT_COMPLETED
EventType.INSTRUMENT_CREATED
EventType.ACCOUNT_CREATED
```

### 2. **Direct API Calls (Sync)**

Call endpoints from one module to another.

```python
# Trade module creating enriched order
response = requests.get(
    "http://localhost:8000/api/v1/enrichment/enrichment-metrics/{order_id}"
)
```

### 3. **Shared Database**

All modules use the same database with foreign key relationships.

```
Instrument ← Market Data
Instrument ← Enriched Order ← Order
Instrument ← Trade
```

---

## Adding a New Module

### Step 1: Create Module Directory
```bash
mkdir -p app/modules/your_module
touch app/modules/your_module/__init__.py
```

### Step 2: Create Required Files
```bash
# Models
app/modules/your_module/models.py

# Schemas
app/modules/your_module/schemas.py

# CRUD operations
app/modules/your_module/crud.py

# Routes
app/modules/your_module/routes.py

# Services (business logic)
app/modules/your_module/services.py
```

### Step 3: Implement Models
```python
# models.py
from app.database import Base
from sqlalchemy import Column, String, DateTime
from datetime import datetime

class YourEntity(Base):
    __tablename__ = "your_entity"
    id = Column(String, primary_key=True)
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
```

### Step 4: Implement Schemas
```python
# schemas.py
from app.shared.schemas import TimestampedSchema

class YourEntitySchema(TimestampedSchema):
    id: str
    name: str
```

### Step 5: Implement Routes
```python
# routes.py
from fastapi import APIRouter
from app.database import get_db
from app.modules.your_module import models, schemas

router = APIRouter(prefix="/api/v1/your-module", tags=["Your Module"])

@router.post("/entities", response_model=schemas.YourEntitySchema)
def create_entity(entity: schemas.YourEntitySchema, db: Session = Depends(get_db)):
    # Implementation
    pass
```

### Step 6: Register in main.py
```python
# main.py
from app.modules.your_module import routes as your_module_routes

app.include_router(your_module_routes.router)
```

### Step 7: Subscribe to Events (Optional)
```python
# services.py
from app.shared.services import event_bus, EventType

def on_order_created(event):
    # Your module's reaction to order creation
    pass

event_bus.subscribe(EventType.ORDER_CREATED, on_order_created)
```

---

## Testing Modules

### Unit Testing
```python
# tests/modules/your_module/test_routes.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_entity():
    response = client.post("/api/v1/your-module/entities", json={
        "name": "test"
    })
    assert response.status_code == 200
```

### Integration Testing
```python
# Test workflow across modules
def test_order_to_trade_workflow():
    # 1. Create static data
    # 2. Create order
    # 3. Verify enrichment
    # 4. Create trade
    # 5. Allocate trade
    pass
```

---

## Current Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React)                       │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              FastAPI Main Application                    │
│                  (app/main.py)                           │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    ┌───────────┐  ┌───────────┐  ┌──────────────┐
    │  Static   │  │  Market   │  │  Enrichment  │
    │   Data    │  │   Data    │  │   Module     │
    │ Module    │  │ Module    │  └──────────────┘
    └───┬───────┘  └───┬───────┘         │
        │              │                 │
        │              │  ┌──────────────┘
        │              │  │
        └──────┬───────┴──┘
               ▼
        ┌──────────────┐
        │   Trade      │
        │   Module     │
        └──────────────┘
               │
               ▼
        ┌──────────────┐
        │  PostgreSQL  │
        │   Database   │
        └──────────────┘

Events Flow:
StaticData → Order → Enrichment → Trade
   ↑          ↓         ↓          ↓
└──────────────Event Bus──────────────┘
```

---

## Next Steps (Roadmap)

- [ ] **Implement Market Data** ingestion and streaming
- [ ] **Complete Enrichment** logic with real pricing/risk calculations
- [ ] **Complete Trade** module with allocations and settlement
- [ ] **Risk Module** - position monitoring, limit checks
- [ ] **Settlement Module** - P&L calculation, settlement process
- [ ] **Blotter UI** - real-time trading dashboard
- [ ] **WebSocket Support** - real-time updates to frontend
- [ ] **Database Migrations** - Alembic migrations for each module
- [ ] **Message Queue** - Kafka/RabbitMQ for scalable event processing
- [ ] **Caching** - Redis for performance optimization

---

## Questions?

Refer to:
- `ARCHITECTURE.md` - High-level design
- Module `routes.py` files - API contract
- Module `models.py` files - Data structure
- `app/shared/services.py` - Event bus usage


