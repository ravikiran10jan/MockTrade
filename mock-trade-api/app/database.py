from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Require DATABASE_URL (Postgres) — do not fall back to SQLite
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

logger.info("=" * 80)
logger.info("DATABASE CONFIGURATION")
logger.info(f"DATABASE_URL env var: {os.getenv('DATABASE_URL', 'NOT SET')}")

if not SQLALCHEMY_DATABASE_URL:
    logger.error("DATABASE: No DATABASE_URL set! The application requires a PostgreSQL DATABASE_URL and will not start without it.")
    logger.error("Set the environment variable DATABASE_URL, for example:")
    logger.error("export DATABASE_URL='postgresql://postgres:mock1234@localhost:5432/mocktrade'")
    raise RuntimeError("Missing required environment variable: DATABASE_URL (Postgres connection string)")

# Create SQLAlchemy engine using the provided DATABASE_URL
logger.info(f"DATABASE: Using connection: {SQLALCHEMY_DATABASE_URL}")
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
