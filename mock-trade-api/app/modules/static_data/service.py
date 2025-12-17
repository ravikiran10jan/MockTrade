"""
Static Data Module - Service Layer
Handles business logic for managing master data (instruments, traders, accounts, etc.)
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid
import logging

from app.core import publish_event, EventType
from app.core.exceptions import InvalidOrderError
from app.modules.static_data.models import Instrument, Trader, Account, Broker, Clearer
from app.modules.static_data.schemas import (
    InstrumentCreateSchema,
    TraderCreateSchema,
    AccountCreateSchema,
    BrokerCreateSchema,
    ClearerCreateSchema
)

logger = logging.getLogger(__name__)


class StaticDataService:
    """Service for static data management operations"""
    
    # ============= TRADER SERVICES =============
    
    @staticmethod
    def create_trader(db: Session, trader_data: TraderCreateSchema) -> Trader:
        """Create a new trader"""
        trader_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        db_trader = Trader(
            trader_id=trader_id,
            created_at=now,
            updated_at=now,
            **trader_data.dict()
        )
        
        db.add(db_trader)
        db.commit()
        db.refresh(db_trader)
        
        logger.info(f"Created trader {trader_id}")
        return db_trader
    
    @staticmethod
    def get_trader(db: Session, trader_id: str) -> Optional[Trader]:
        """Get trader by ID"""
        return db.query(Trader).filter(Trader.trader_id == trader_id).first()
    
    @staticmethod
    def list_traders(db: Session) -> List[Trader]:
        """List all traders"""
        return db.query(Trader).all()
    
    @staticmethod
    def update_trader(db: Session, trader_id: str, trader_data: TraderCreateSchema) -> Trader:
        """Update trader"""
        db_trader = StaticDataService.get_trader(db, trader_id)
        if not db_trader:
            raise InvalidOrderError(f"Trader {trader_id} not found")
        
        for key, value in trader_data.dict().items():
            setattr(db_trader, key, value)
        
        db_trader.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_trader)
        
        logger.info(f"Updated trader {trader_id}")
        return db_trader
    
    @staticmethod
    def delete_trader(db: Session, trader_id: str) -> Dict[str, str]:
        """Delete trader"""
        db_trader = StaticDataService.get_trader(db, trader_id)
        if not db_trader:
            raise InvalidOrderError(f"Trader {trader_id} not found")
        
        db.delete(db_trader)
        db.commit()
        
        logger.info(f"Deleted trader {trader_id}")
        return {"message": "Trader deleted"}
    
    # ============= INSTRUMENT SERVICES =============
    
    @staticmethod
    def create_instrument(db: Session, instrument_data: InstrumentCreateSchema) -> Instrument:
        """Create a new instrument"""
        payload = instrument_data.dict()
        metadata = payload.pop('metadata', None)
        
        instrument_id = str(uuid.uuid4())
        
        db_instrument = Instrument(
            instrument_id=instrument_id,
            **payload,
            created_at=datetime.now(timezone.utc),
            metadata_json=metadata
        )
        
        db.add(db_instrument)
        db.commit()
        db.refresh(db_instrument)
        
        # Map metadata_json back to metadata for response
        db_instrument.metadata = db_instrument.metadata_json
        
        # Publish event
        publish_event(EventType.INSTRUMENT_CREATED, {
            "instrument_id": db_instrument.instrument_id,
            "symbol": db_instrument.symbol
        }, "static_data")
        
        logger.info(f"Created instrument {instrument_id} ({db_instrument.symbol})")
        return db_instrument
    
    @staticmethod
    def get_instrument(db: Session, instrument_id: str) -> Optional[Instrument]:
        """Get instrument by ID"""
        instrument = db.query(Instrument).filter(Instrument.instrument_id == instrument_id).first()
        if instrument:
            instrument.metadata = instrument.metadata_json
        return instrument
    
    @staticmethod
    def list_instruments(
        db: Session,
        asset_class: Optional[str] = None,
        instrument_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Instrument]:
        """List instruments with optional filters"""
        query = db.query(Instrument)
        
        if asset_class:
            query = query.filter(Instrument.asset_class == asset_class)
        if instrument_type:
            query = query.filter(Instrument.instrument_type == instrument_type)
        if status:
            query = query.filter(Instrument.status == status)
        
        instruments = query.all()
        
        # Map metadata_json to metadata for each instrument
        for inst in instruments:
            inst.metadata = inst.metadata_json
        
        return instruments
    
    @staticmethod
    def update_instrument(db: Session, instrument_id: str, instrument_data: InstrumentCreateSchema) -> Instrument:
        """Update instrument"""
        db_instrument = StaticDataService.get_instrument(db, instrument_id)
        if not db_instrument:
            raise InvalidOrderError(f"Instrument {instrument_id} not found")
        
        payload = instrument_data.dict()
        metadata = payload.pop('metadata', None)
        
        for key, value in payload.items():
            setattr(db_instrument, key, value)
        
        if metadata is not None:
            db_instrument.metadata_json = metadata
        
        db.commit()
        db.refresh(db_instrument)
        
        db_instrument.metadata = db_instrument.metadata_json
        
        logger.info(f"Updated instrument {instrument_id}")
        return db_instrument
    
    @staticmethod
    def delete_instrument(db: Session, instrument_id: str) -> Dict[str, str]:
        """Delete instrument"""
        db_instrument = StaticDataService.get_instrument(db, instrument_id)
        if not db_instrument:
            raise InvalidOrderError(f"Instrument {instrument_id} not found")
        
        db.delete(db_instrument)
        db.commit()
        
        logger.info(f"Deleted instrument {instrument_id}")
        return {"message": "Instrument deleted"}
    
    # ============= ACCOUNT SERVICES =============
    
    @staticmethod
    def create_account(db: Session, account_data: AccountCreateSchema) -> Account:
        """Create a new account"""
        account_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        db_account = Account(
            account_id=account_id,
            created_at=now,
            updated_at=now,
            **account_data.dict()
        )
        
        db.add(db_account)
        db.commit()
        db.refresh(db_account)
        
        # Publish event
        publish_event(EventType.ACCOUNT_CREATED, {
            "account_id": db_account.account_id,
            "code": db_account.code
        }, "static_data")
        
        logger.info(f"Created account {account_id} ({db_account.code})")
        return db_account
    
    @staticmethod
    def get_account(db: Session, account_id: str) -> Optional[Account]:
        """Get account by ID"""
        return db.query(Account).filter(Account.account_id == account_id).first()
    
    @staticmethod
    def list_accounts(db: Session, status: Optional[str] = None) -> List[Account]:
        """List accounts with optional status filter"""
        query = db.query(Account)
        if status:
            query = query.filter(Account.status == status)
        return query.all()
    
    @staticmethod
    def update_account(db: Session, account_id: str, account_data: AccountCreateSchema) -> Account:
        """Update account"""
        db_account = StaticDataService.get_account(db, account_id)
        if not db_account:
            raise InvalidOrderError(f"Account {account_id} not found")
        
        for key, value in account_data.dict().items():
            setattr(db_account, key, value)
        
        db_account.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_account)
        
        logger.info(f"Updated account {account_id}")
        return db_account
    
    @staticmethod
    def delete_account(db: Session, account_id: str) -> Dict[str, str]:
        """Delete account"""
        db_account = StaticDataService.get_account(db, account_id)
        if not db_account:
            raise InvalidOrderError(f"Account {account_id} not found")
        
        db.delete(db_account)
        db.commit()
        
        logger.info(f"Deleted account {account_id}")
        return {"message": "Account deleted"}
    
    # ============= BROKER SERVICES =============
    
    @staticmethod
    def create_broker(db: Session, broker_data: BrokerCreateSchema) -> Broker:
        """Create a new broker"""
        broker_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        db_broker = Broker(
            broker_id=broker_id,
            created_at=now,
            updated_at=now,
            **broker_data.dict()
        )
        
        db.add(db_broker)
        db.commit()
        db.refresh(db_broker)
        
        logger.info(f"Created broker {broker_id} ({db_broker.code})")
        return db_broker
    
    @staticmethod
    def get_broker(db: Session, broker_id: str) -> Optional[Broker]:
        """Get broker by ID"""
        return db.query(Broker).filter(Broker.broker_id == broker_id).first()
    
    @staticmethod
    def list_brokers(db: Session) -> List[Broker]:
        """List all brokers"""
        return db.query(Broker).all()
    
    @staticmethod
    def update_broker(db: Session, broker_id: str, broker_data: BrokerCreateSchema) -> Broker:
        """Update broker"""
        db_broker = StaticDataService.get_broker(db, broker_id)
        if not db_broker:
            raise InvalidOrderError(f"Broker {broker_id} not found")
        
        for key, value in broker_data.dict().items():
            setattr(db_broker, key, value)
        
        db_broker.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_broker)
        
        logger.info(f"Updated broker {broker_id}")
        return db_broker
    
    @staticmethod
    def delete_broker(db: Session, broker_id: str) -> Dict[str, str]:
        """Delete broker"""
        db_broker = StaticDataService.get_broker(db, broker_id)
        if not db_broker:
            raise InvalidOrderError(f"Broker {broker_id} not found")
        
        db.delete(db_broker)
        db.commit()
        
        logger.info(f"Deleted broker {broker_id}")
        return {"message": "Broker deleted"}
    
    # ============= CLEARER SERVICES =============
    
    @staticmethod
    def create_clearer(db: Session, clearer_data: ClearerCreateSchema) -> Clearer:
        """Create a new clearer"""
        clearer_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        db_clearer = Clearer(
            clearer_id=clearer_id,
            created_at=now,
            updated_at=now,
            **clearer_data.dict()
        )
        
        db.add(db_clearer)
        db.commit()
        db.refresh(db_clearer)
        
        logger.info(f"Created clearer {clearer_id} ({db_clearer.code})")
        return db_clearer
    
    @staticmethod
    def get_clearer(db: Session, clearer_id: str) -> Optional[Clearer]:
        """Get clearer by ID"""
        return db.query(Clearer).filter(Clearer.clearer_id == clearer_id).first()
    
    @staticmethod
    def list_clearers(db: Session) -> List[Clearer]:
        """List all clearers"""
        return db.query(Clearer).all()
    
    @staticmethod
    def update_clearer(db: Session, clearer_id: str, clearer_data: ClearerCreateSchema) -> Clearer:
        """Update clearer"""
        db_clearer = StaticDataService.get_clearer(db, clearer_id)
        if not db_clearer:
            raise InvalidOrderError(f"Clearer {clearer_id} not found")
        
        for key, value in clearer_data.dict().items():
            setattr(db_clearer, key, value)
        
        db_clearer.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_clearer)
        
        logger.info(f"Updated clearer {clearer_id}")
        return db_clearer
    
    @staticmethod
    def delete_clearer(db: Session, clearer_id: str) -> Dict[str, str]:
        """Delete clearer"""
        db_clearer = StaticDataService.get_clearer(db, clearer_id)
        if not db_clearer:
            raise InvalidOrderError(f"Clearer {clearer_id} not found")
        
        db.delete(db_clearer)
        db.commit()
        
        logger.info(f"Deleted clearer {clearer_id}")
        return {"message": "Clearer deleted"}
    
    # Note: Portfolio service methods removed - Portfolio is managed through enrichment module
