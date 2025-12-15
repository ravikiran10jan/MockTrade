from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Prefer DATABASE_URL (Postgres) when provided, otherwise fall back to a local sqlite DB
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

logger.info("=" * 80)
logger.info("DATABASE CONFIGURATION")
logger.info(f"DATABASE_URL env var: {os.getenv('DATABASE_URL', 'NOT SET')}")

if not SQLALCHEMY_DATABASE_URL:
    # Local dev fallback so server can start without Postgres
    SQLALCHEMY_DATABASE_URL = "sqlite:///./dev.db"
    logger.warning("DATABASE: No DATABASE_URL set! Using SQLite: sqlite:///./dev.db")
    logger.warning("DATABASE: To use PostgreSQL, set: export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/mocktrade'")
    # SQLite needs a special connect arg for multithreaded apps
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    logger.info(f"DATABASE: Using PostgreSQL connection: {SQLALCHEMY_DATABASE_URL}")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

logger.info(f"Connecting to DB at: {SQLALCHEMY_DATABASE_URL}")
logger.info("=" * 80)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        logger.debug("Database session created")
        yield db
    except Exception as e:
        logger.error(f"Database session error: {str(e)}", exc_info=True)
        raise
    finally:
        db.close()
        logger.debug("Database session closed")
