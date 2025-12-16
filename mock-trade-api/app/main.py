from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Log startup info
logger.info("=" * 80)
logger.info("MockTrade API Starting Up")
logger.info(f"Timestamp: {datetime.now()}")
logger.info(f"DATABASE_URL: {os.getenv('DATABASE_URL', 'Not Set - Using SQLite')}")
logger.info("=" * 80)

# Legacy routes (keep for backward compatibility)
from app.routes import order

# New module routes
from app.modules.static_data import routes as static_data_routes
from app.modules.market_data import routes as market_data_routes
from app.modules.enrichment import routes as enrichment_routes
from app.modules.trade import routes as trade_routes
from app.modules.security import routes as security_routes
from app.modules.auth import routes as auth_routes
from app.modules.trade_query import routes as trade_query_routes

app = FastAPI(
    title="MockTrade API",
    description="Modular Trading Platform API",
    version="1.0.0"
)

# Add logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"REQUEST: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        logger.info(f"RESPONSE: {request.method} {request.url.path} - Status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"REQUEST ERROR: {request.method} {request.url.path} - {str(e)}", exc_info=True)
        raise

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register legacy routes
logger.info("Registering legacy routes...")
app.include_router(order.router)

# Register new module routes
logger.info("Registering static_data routes...")
app.include_router(static_data_routes.router)
logger.info("Registering market_data routes...")
app.include_router(market_data_routes.router)
logger.info("Registering enrichment routes...")
app.include_router(enrichment_routes.router)
logger.info("Registering trade routes...")
app.include_router(trade_routes.router)
logger.info("Registering security routes...")
app.include_router(security_routes.router)
logger.info("Registering auth routes...")
app.include_router(auth_routes.router)
logger.info("Registering trade query routes...")
app.include_router(trade_query_routes.router)

logger.info("All routes registered successfully")

@app.get("/")
def root():
    logger.info("Root endpoint called")
    return {
        "message": "MockTrade API - Modular Trading Platform",
        "version": "1.0.0",
        "modules": [
            "orders (legacy)",
            "static-data",
            "market-data",
            "enrichment",
            "trades",
            "trade-query",
            "security"
        ]
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    logger.info("Health check endpoint called - status: healthy")
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
            },
            "trade_query": {
                "description": "Trade query and enrichment",
                "endpoints": [
                    "GET /api/v1/trade-query/enriched-trades",
                    "GET /api/v1/trade-query/enriched-orders"
                ]
            }
        }
    }

