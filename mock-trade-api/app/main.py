from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Legacy routes (keep for backward compatibility)
from app.routes import order

# New module routes
from app.modules.static_data import routes as static_data_routes
from app.modules.market_data import routes as market_data_routes
from app.modules.enrichment import routes as enrichment_routes
from app.modules.trade import routes as trade_routes
from app.modules.security import routes as security_routes

app = FastAPI(
    title="MockTrade API",
    description="Modular Trading Platform API",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register legacy routes
app.include_router(order.router)

# Register new module routes
app.include_router(static_data_routes.router)
app.include_router(market_data_routes.router)
app.include_router(enrichment_routes.router)
app.include_router(trade_routes.router)
app.include_router(security_routes.router)

@app.get("/")
def root():
    return {
        "message": "MockTrade API - Modular Trading Platform",
        "version": "1.0.0",
        "modules": [
            "orders (legacy)",
            "static-data",
            "market-data",
            "enrichment",
            "trades",
            "security"
        ]
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/api/v1/modules")
def list_modules():
    """List available modules and their endpoints"""
    return {
        "modules": {
            "static_data": {
                "description": "Master data management",
                "endpoints": [
                    "POST /api/v1/static-data/instruments",
                    "GET /api/v1/static-data/instruments",
                    "POST /api/v1/static-data/accounts",
                    "GET /api/v1/static-data/accounts",
                    "POST /api/v1/static-data/brokers",
                    "GET /api/v1/static-data/brokers",
                    "POST /api/v1/static-data/traders",
                    "GET /api/v1/static-data/traders"
                ]
            },
            "market_data": {
                "description": "Market data and price feeds",
                "endpoints": [
                    "POST /api/v1/market-data/market-data",
                    "GET /api/v1/market-data/market-data/{instrument_id}",
                    "POST /api/v1/market-data/quotes",
                    "GET /api/v1/market-data/quotes/{instrument_id}"
                ]
            },
            "order": {
                "description": "Order management (legacy)",
                "endpoints": [
                    "POST /order/",
                    "GET /order/",
                    "POST /order/{order_id}/simulate_fill",
                    "POST /order/{order_id}/cancel"
                ]
            },
            "enrichment": {
                "description": "Order enrichment with market data and risk",
                "endpoints": [
                    "POST /api/v1/enrichment/enrich-order/{order_id}",
                    "GET /api/v1/enrichment/enrich-order/{order_id}",
                    "POST /api/v1/enrichment/bulk-enrich",
                    "GET /api/v1/enrichment/enrichment-metrics/{order_id}"
                ]
            },
            "trade": {
                "description": "Trade management and lifecycle",
                "endpoints": [
                    "POST /api/v1/trades/",
                    "GET /api/v1/trades/",
                    "GET /api/v1/trades/{trade_id}",
                    "POST /api/v1/trades/{trade_id}/cancel",
                    "POST /api/v1/trades/{trade_id}/expire",
                    "POST /api/v1/trades/{trade_id}/allocate"
                ]
            }
        }
    }

