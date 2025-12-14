"""
MockTrade Application Architecture
===================================

Modular Design for a Trading Platform

MODULES:
1. Order Module (CURRENT) - Place orders on exchange
2. Enrichment Module - Enrich orders with market data, pricing, risk metrics
3. Trade Module - Manage filled orders (trades), cancellations, expirations
4. Static Data Module - Master data management (instruments, accounts, brokers, traders)
5. Market Data Module - Real-time market data feed and management
6. Blotter Module - Trading blotter/ledger view
7. Risk Module (FUTURE) - Risk monitoring and limits
8. Settlement Module (FUTURE) - Trade settlement and P&L

ARCHITECTURE PRINCIPLES:
- Each module has its own models, schemas, routes, and CRUD operations
- Shared services for cross-module concerns (database, events, logging)
- Clear API contracts between modules
- Event-driven communication between modules
- Database normalization with proper relationships

DIRECTORY STRUCTURE:

backend/
├── app/
│   ├── __init__.py
│   ├── main.py                          # App entry point
│   ├── database.py                      # Database connection
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                    # Configuration
│   │   ├── logger.py                    # Logging
│   │   ├── exceptions.py                # Custom exceptions
│   │   └── enums.py                     # Enums (OrderStatus, TradeStatus, etc.)
│   │
│   ├── shared/
│   │   ├── __init__.py
│   │   ├── models.py                    # Base models, abstract classes
│   │   ├── schemas.py                   # Common schemas
│   │   └── services.py                  # Shared services (event bus, cache, etc.)
│   │
│   ├── modules/
│   │   ├── __init__.py
│   │   │
│   │   ├── static_data/                 # Static Data Module
│   │   │   ├── __init__.py
│   │   │   ├── models.py                # Instrument, Account, Broker, Trader
│   │   │   ├── schemas.py               # Request/Response schemas
│   │   │   ├── crud.py                  # Database operations
│   │   │   └── routes.py                # API endpoints
│   │   │
│   │   ├── order/                       # Order Module
│   │   │   ├── __init__.py
│   │   │   ├── models.py                # Order model
│   │   │   ├── schemas.py               # Request/Response schemas
│   │   │   ├── crud.py                  # Database operations
│   │   │   ├── routes.py                # API endpoints
│   │   │   └── services.py              # Business logic
│   │   │
│   │   ├── market_data/                 # Market Data Module
│   │   │   ├── __init__.py
│   │   │   ├── models.py                # MarketData, PriceQuote models
│   │   │   ├── schemas.py
│   │   │   ├── crud.py
│   │   │   ├── routes.py
│   │   │   └── services.py              # Market data ingestion logic
│   │   │
│   │   ├── enrichment/                  # Enrichment Module
│   │   │   ├── __init__.py
│   │   │   ├── models.py                # EnrichedOrder model
│   │   │   ├── schemas.py
│   │   │   ├── crud.py
│   │   │   ├── routes.py
│   │   │   └── services.py              # Enrichment logic (pricing, risk, etc.)
│   │   │
│   │   ├── trade/                       # Trade Module
│   │   │   ├── __init__.py
│   │   │   ├── models.py                # Trade model (extends Order)
│   │   │   ├── schemas.py
│   │   │   ├── crud.py
│   │   │   ├── routes.py
│   │   │   └── services.py              # Trade lifecycle (fill, cancel, expire)
│   │   │
│   │   └── blotter/                     # Blotter Module (future)
│   │       ├── __init__.py
│   │       ├── models.py
│   │       ├── schemas.py
│   │       ├── crud.py
│   │       ├── routes.py
│   │       └── services.py
│   │
│   └── alembic/                         # Database migrations

frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── services/
│   │   ├── api.js                       # Centralized API client
│   │   ├── eventBus.js                  # Event system
│   │   └── cache.js                     # Client-side cache
│   │
│   ├── modules/
│   │   ├── static-data/                 # Static Data Module UI
│   │   │   ├── StaticDataDashboard.jsx
│   │   │   ├── InstrumentManager.jsx
│   │   │   ├── AccountManager.jsx
│   │   │   ├── BrokerManager.jsx
│   │   │   └── styles/
│   │   │
│   │   ├── order/                       # Order Module UI
│   │   │   ├── OrderEntry.jsx
│   │   │   ├── OrderList.jsx
│   │   │   └── styles/
│   │   │
│   │   ├── market-data/                 # Market Data Module UI
│   │   │   ├── MarketDataDashboard.jsx
│   │   │   ├── PriceFeed.jsx
│   │   │   └── styles/
│   │   │
│   │   ├── enrichment/                  # Enrichment Module UI
│   │   │   ├── EnrichmentDashboard.jsx
│   │   │   └── styles/
│   │   │
│   │   └── trade/                       # Trade Module UI
│   │       ├── TradeBlotter.jsx
│   │       ├── TradeDetails.jsx
│   │       ├── TradeActions.jsx
│   │       └── styles/
│   │
│   └── shared/
│       ├── components/
│       │   ├── DataTable.jsx
│       │   ├── Modal.jsx
│       │   ├── FormBuilder.jsx
│       │   └── NotificationCenter.jsx
│       │
│       ├── hooks/
│       │   ├── useApi.js
│       │   ├── useEventBus.js
│       │   └── usePagination.js
│       │
│       └── utils/
│           ├── formatters.js
│           ├── validators.js
│           └── constants.js


KEY DESIGN DECISIONS:

1. MODULE INDEPENDENCE:
   - Each module can be developed/tested independently
   - Modules expose clear API contracts (routes)
   - Shared models in database, but isolated business logic

2. DATA FLOW:
   Frontend UI → Module Routes → Module Services → CRUD/Database
   
3. INTER-MODULE COMMUNICATION:
   - Via API calls (REST endpoints)
   - Via event bus (async events: OrderCreated, OrderFilled, TradeUpdated, etc.)
   - Via shared database (normalized relationships)

4. SCALABILITY:
   - Easy to add new modules: just create new folder under modules/
   - Modules can be independently scaled/deployed
   - Shared services isolated for reuse
   - Clear separation of concerns

5. TESTING:
   - Unit tests per module service
   - Integration tests between modules
   - Frontend unit tests per component

"""

