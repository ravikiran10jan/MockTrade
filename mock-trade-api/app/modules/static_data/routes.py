# Static Data Module - Routes

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core import get_db
from app.modules.static_data import models, schemas
from app.core import publish_event, EventType
import uuid
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/static-data", tags=["Static Data"])

# ============= TRADER ROUTES =============

@router.post("/traders", response_model=schemas.TraderSchema)
def create_trader(
    trader: schemas.TraderCreateSchema,
    db: Session = Depends(get_db)
):
    """Create a new trader"""
    logger.info("=" * 80)
    logger.info("CREATE TRADER: Starting trader creation")
    logger.info(f"Input trader data: {trader.dict()}")

    try:
        trader_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        logger.info(f"Generated trader_id: {trader_id}")

        db_trader = models.Trader(
            trader_id=trader_id,
            created_at=now,
            updated_at=now,
            **trader.dict()
        )
        logger.info(f"Created Trader model object: {db_trader.__dict__}")

        db.add(db_trader)
        logger.info("Added trader to session")

        db.commit()
        logger.info("Committed transaction")

        db.refresh(db_trader)
        logger.info(f"Refreshed trader from DB: {db_trader.__dict__}")

        logger.info(f"CREATE TRADER: Successfully created trader {trader_id}")
        logger.info("=" * 80)

        return db_trader
    except Exception as e:
        logger.error(f"CREATE TRADER: ERROR - {str(e)}", exc_info=True)
        logger.error("=" * 80)
        db.rollback()
        # Check for integrity errors
        if "UNIQUE constraint failed" in str(e) or "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Trader with this ID already exists")
        raise

@router.get("/traders/{trader_id}", response_model=schemas.TraderSchema)
def get_trader(trader_id: str, db: Session = Depends(get_db)):
    """Get trader by ID"""
    logger.info(f"GET TRADER: Retrieving trader {trader_id}")

    trader = db.query(models.Trader).filter(
        models.Trader.trader_id == trader_id
    ).first()

    if not trader:
        logger.warning(f"GET TRADER: Trader {trader_id} not found")
        raise HTTPException(status_code=404, detail="Trader not found")

    logger.info(f"GET TRADER: Found trader {trader_id}")
    return trader

@router.get("/traders", response_model=list[schemas.TraderSchema])
def list_traders(db: Session = Depends(get_db)):
    """List all traders"""
    logger.info("LIST TRADERS: Listing all traders")

    try:
        traders = db.query(models.Trader).all()
        logger.info(f"LIST TRADERS: Found {len(traders)} traders")
        return traders
    except Exception as e:
        logger.error(f"LIST TRADERS: ERROR - {str(e)}", exc_info=True)
        raise

@router.put("/traders/{trader_id}", response_model=schemas.TraderSchema)
def update_trader(
    trader_id: str,
    trader: schemas.TraderCreateSchema,
    db: Session = Depends(get_db)
):
    """Update trader"""
    logger.info(f"UPDATE TRADER: Updating trader {trader_id}")
    logger.info(f"Update data: {trader.dict()}")

    try:
        db_trader = db.query(models.Trader).filter(
            models.Trader.trader_id == trader_id
        ).first()

        if not db_trader:
            logger.warning(f"UPDATE TRADER: Trader {trader_id} not found")
            raise HTTPException(status_code=404, detail="Trader not found")

        for key, value in trader.dict().items():
            setattr(db_trader, key, value)
            logger.info(f"Updated {key} = {value}")

        db.commit()
        db.refresh(db_trader)
        logger.info(f"UPDATE TRADER: Successfully updated trader {trader_id}")

        return db_trader
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"UPDATE TRADER: ERROR - {str(e)}", exc_info=True)
        db.rollback()
        raise

@router.delete("/traders/{trader_id}")
def delete_trader(trader_id: str, db: Session = Depends(get_db)):
    """Delete trader"""
    logger.info(f"DELETE TRADER: Deleting trader {trader_id}")

    try:
        db_trader = db.query(models.Trader).filter(
            models.Trader.trader_id == trader_id
        ).first()

        if not db_trader:
            logger.warning(f"DELETE TRADER: Trader {trader_id} not found")
            raise HTTPException(status_code=404, detail="Trader not found")

        db.delete(db_trader)
        db.commit()
        logger.info(f"DELETE TRADER: Successfully deleted trader {trader_id}")

        return {"message": "Trader deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"DELETE TRADER: ERROR - {str(e)}", exc_info=True)
        db.rollback()
        raise

# ============= INSTRUMENT ROUTES =============

@router.post("/instruments", response_model=schemas.InstrumentSchema)
def create_instrument(
    instrument: schemas.InstrumentCreateSchema,
    db: Session = Depends(get_db)
):
    """Create a new instrument"""
    logger.info("=" * 80)
    logger.info("CREATE INSTRUMENT: Starting instrument creation")
    logger.info(f"Input instrument data: {instrument.dict()}")

    try:
        from datetime import datetime, timezone

        payload = instrument.dict()
        metadata = payload.pop('metadata', None)

        instrument_id = str(uuid.uuid4())
        logger.info(f"Generated instrument_id: {instrument_id}")

        db_instrument = models.Instrument(
            instrument_id=instrument_id,
            **payload,
            created_at=datetime.now(timezone.utc),
            metadata_json=metadata
        )
        logger.info(f"Created Instrument model object: {db_instrument.__dict__}")

        db.add(db_instrument)
        logger.info("Added instrument to session")

        db.commit()
        logger.info("Committed transaction")

        db.refresh(db_instrument)
        logger.info(f"Refreshed instrument from DB: {db_instrument.__dict__}")

        # Map metadata_json back to metadata field for response schema
        db_instrument.metadata = db_instrument.metadata_json

        publish_event(EventType.INSTRUMENT_CREATED, {
            "instrument_id": db_instrument.instrument_id,
            "symbol": db_instrument.symbol
        }, "static_data")

        logger.info(f"CREATE INSTRUMENT: Successfully created instrument {instrument_id}")
        logger.info("=" * 80)

        return db_instrument
    except Exception as e:
        logger.error(f"CREATE INSTRUMENT: ERROR - {str(e)}", exc_info=True)
        logger.error("=" * 80)
        db.rollback()
        # Check for integrity errors
        if "UNIQUE constraint failed" in str(e) or "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Instrument with this symbol already exists")
        raise

@router.get("/instruments/{instrument_id}", response_model=schemas.InstrumentSchema)
def get_instrument(instrument_id: str, db: Session = Depends(get_db)):
    """Get instrument by ID"""
    instrument = db.query(models.Instrument).filter(
        models.Instrument.instrument_id == instrument_id
    ).first()
    if not instrument:
        raise HTTPException(status_code=404, detail="Instrument not found")

    # Expose metadata_json as metadata for response model
    instrument.metadata = instrument.metadata_json

    return instrument

@router.get("/instruments", response_model=list[schemas.InstrumentSchema])
def list_instruments(db: Session = Depends(get_db)):
    """List all instruments"""
    instruments = db.query(models.Instrument).all()
    # Expose metadata_json as metadata for each row
    for inst in instruments:
        inst.metadata = inst.metadata_json
    return instruments

@router.put("/instruments/{instrument_id}", response_model=schemas.InstrumentSchema)
def update_instrument(
    instrument_id: str,
    instrument: schemas.InstrumentCreateSchema,
    db: Session = Depends(get_db)
):
    """Update instrument"""
    db_instrument = db.query(models.Instrument).filter(
        models.Instrument.instrument_id == instrument_id
    ).first()
    if not db_instrument:
        raise HTTPException(status_code=404, detail="Instrument not found")

    payload = instrument.dict()
    metadata = payload.pop('metadata', None)

    for key, value in payload.items():
        setattr(db_instrument, key, value)

    if metadata is not None:
        db_instrument.metadata_json = metadata

    db.commit()
    db.refresh(db_instrument)

    # Map metadata_json back to metadata field for response schema
    db_instrument.metadata = db_instrument.metadata_json

    return db_instrument

@router.delete("/instruments/{instrument_id}")
def delete_instrument(instrument_id: str, db: Session = Depends(get_db)):
    """Delete instrument (soft delete via status)"""
    db_instrument = db.query(models.Instrument).filter(
        models.Instrument.instrument_id == instrument_id
    ).first()
    if not db_instrument:
        raise HTTPException(status_code=404, detail="Instrument not found")

    db_instrument.status = "INACTIVE"
    db.commit()
    return {"message": "Instrument deleted"}

# ============= ACCOUNT ROUTES =============

@router.post("/accounts", response_model=schemas.AccountSchema)
def create_account(
    account: schemas.AccountCreateSchema,
    db: Session = Depends(get_db)
):
    """Create a new account"""
    logger.info("=" * 80)
    logger.info("CREATE ACCOUNT: Starting account creation")
    logger.info(f"Input account data: {account.dict()}")

    try:
        now = datetime.now(timezone.utc)
        db_account = models.Account(
            account_id=str(uuid.uuid4()),
            created_at=now,
            updated_at=now,
            **account.dict()
        )
        logger.info(f"Created Account model object with ID: {db_account.account_id}")

        db.add(db_account)
        db.commit()
        db.refresh(db_account)

        logger.info(f"CREATE ACCOUNT: Successfully created account {db_account.account_id}")
        logger.info("=" * 80)

        publish_event(EventType.ACCOUNT_CREATED, {
            "account_id": db_account.account_id,
            "code": db_account.code
        }, "static_data")

        return db_account
    except Exception as e:
        logger.error(f"CREATE ACCOUNT: ERROR - {str(e)}", exc_info=True)
        logger.error("=" * 80)
        db.rollback()
        raise

@router.get("/accounts/{account_id}", response_model=schemas.AccountSchema)
def get_account(account_id: str, db: Session = Depends(get_db)):
    """Get account by ID"""
    logger.info(f"GET ACCOUNT: Retrieving account {account_id}")

    try:
        account = db.query(models.Account).filter(
            models.Account.account_id == account_id
        ).first()
        if not account:
            logger.warning(f"GET ACCOUNT: Account {account_id} not found")
            raise HTTPException(status_code=404, detail="Account not found")

        logger.info(f"GET ACCOUNT: Found account {account_id}")
        return account
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"GET ACCOUNT: ERROR - {str(e)}", exc_info=True)
        raise

@router.get("/accounts", response_model=list[schemas.AccountSchema])
def list_accounts(db: Session = Depends(get_db)):
    """List all accounts"""
    logger.info("LIST ACCOUNTS: Listing all accounts")

    try:
        accounts = db.query(models.Account).all()
        logger.info(f"LIST ACCOUNTS: Found {len(accounts)} accounts")
        return accounts
    except Exception as e:
        logger.error(f"LIST ACCOUNTS: ERROR - {str(e)}", exc_info=True)
        raise

@router.put("/accounts/{account_id}", response_model=schemas.AccountSchema)
def update_account(
    account_id: str,
    account: schemas.AccountCreateSchema,
    db: Session = Depends(get_db)
):
    """Update account"""
    logger.info(f"UPDATE ACCOUNT: Updating account {account_id}")
    logger.info(f"Update data: {account.dict()}")

    try:
        db_account = db.query(models.Account).filter(
            models.Account.account_id == account_id
        ).first()
        if not db_account:
            logger.warning(f"UPDATE ACCOUNT: Account {account_id} not found")
            raise HTTPException(status_code=404, detail="Account not found")

        for key, value in account.dict().items():
            setattr(db_account, key, value)

        db_account.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_account)
        logger.info(f"UPDATE ACCOUNT: Successfully updated account {account_id}")

        return db_account
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"UPDATE ACCOUNT: ERROR - {str(e)}", exc_info=True)
        db.rollback()
        raise

@router.delete("/accounts/{account_id}")
def delete_account(account_id: str, db: Session = Depends(get_db)):
    """Delete account"""
    logger.info(f"DELETE ACCOUNT: Deleting account {account_id}")

    try:
        db_account = db.query(models.Account).filter(
            models.Account.account_id == account_id
        ).first()
        if not db_account:
            logger.warning(f"DELETE ACCOUNT: Account {account_id} not found")
            raise HTTPException(status_code=404, detail="Account not found")

        db.delete(db_account)
        db.commit()
        logger.info(f"DELETE ACCOUNT: Successfully deleted account {account_id}")

        return {"message": "Account deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"DELETE ACCOUNT: ERROR - {str(e)}", exc_info=True)
        db.rollback()
        raise

# ============= BROKER ROUTES =============

@router.post("/brokers", response_model=schemas.BrokerSchema)
def create_broker(
    broker: schemas.BrokerCreateSchema,
    db: Session = Depends(get_db)
):
    """Create a new broker"""
    logger.info("=" * 80)
    logger.info("CREATE BROKER: Starting broker creation")
    logger.info(f"Input broker data: {broker.dict()}")

    try:
        now = datetime.now(timezone.utc)
        db_broker = models.Broker(
            broker_id=str(uuid.uuid4()),
            created_at=now,
            updated_at=now,
            **broker.dict()
        )
        logger.info(f"Created Broker model object with ID: {db_broker.broker_id}")

        db.add(db_broker)
        db.commit()
        db.refresh(db_broker)

        logger.info(f"CREATE BROKER: Successfully created broker {db_broker.broker_id}")
        logger.info("=" * 80)

        return db_broker
    except Exception as e:
        logger.error(f"CREATE BROKER: ERROR - {str(e)}", exc_info=True)
        logger.error("=" * 80)
        db.rollback()
        raise

@router.get("/brokers/{broker_id}", response_model=schemas.BrokerSchema)
def get_broker(broker_id: str, db: Session = Depends(get_db)):
    """Get broker by ID"""
    broker = db.query(models.Broker).filter(
        models.Broker.broker_id == broker_id
    ).first()
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")
    return broker

@router.get("/brokers", response_model=list[schemas.BrokerSchema])
def list_brokers(db: Session = Depends(get_db)):
    """List all brokers"""
    return db.query(models.Broker).all()

@router.put("/brokers/{broker_id}", response_model=schemas.BrokerSchema)
def update_broker(
    broker_id: str,
    broker: schemas.BrokerCreateSchema,
    db: Session = Depends(get_db)
):
    """Update broker"""
    db_broker = db.query(models.Broker).filter(
        models.Broker.broker_id == broker_id
    ).first()
    if not db_broker:
        raise HTTPException(status_code=404, detail="Broker not found")

    for key, value in broker.dict().items():
        setattr(db_broker, key, value)

    db.commit()
    db.refresh(db_broker)
    return db_broker

@router.delete("/brokers/{broker_id}")
def delete_broker(broker_id: str, db: Session = Depends(get_db)):
    """Delete broker"""
    db_broker = db.query(models.Broker).filter(
        models.Broker.broker_id == broker_id
    ).first()
    if not db_broker:
        raise HTTPException(status_code=404, detail="Broker not found")

    db.delete(db_broker)
    db.commit()
    return {"message": "Broker deleted"}

# ============= TRADER ROUTES =============

@router.post("/traders", response_model=schemas.TraderSchema)
def create_trader(
    trader: schemas.TraderCreateSchema,
    db: Session = Depends(get_db)
):
    """Create a new trader"""
    db_trader = models.Trader(
        trader_id=str(uuid.uuid4()),
        **trader.dict()
    )
    db.add(db_trader)
    db.commit()
    db.refresh(db_trader)
    return db_trader

@router.get("/traders/{trader_id}", response_model=schemas.TraderSchema)
def get_trader(trader_id: str, db: Session = Depends(get_db)):
    """Get trader by ID"""
    trader = db.query(models.Trader).filter(
        models.Trader.trader_id == trader_id
    ).first()
    if not trader:
        raise HTTPException(status_code=404, detail="Trader not found")
    return trader

@router.get("/traders", response_model=list[schemas.TraderSchema])
def list_traders(db: Session = Depends(get_db)):
    """List all traders"""
    return db.query(models.Trader).all()

@router.put("/traders/{trader_id}", response_model=schemas.TraderSchema)
def update_trader(
    trader_id: str,
    trader: schemas.TraderCreateSchema,
    db: Session = Depends(get_db)
):
    """Update trader"""
    db_trader = db.query(models.Trader).filter(
        models.Trader.trader_id == trader_id
    ).first()
    if not db_trader:
        raise HTTPException(status_code=404, detail="Trader not found")

    for key, value in trader.dict().items():
        setattr(db_trader, key, value)

    db.commit()
    db.refresh(db_trader)
    return db_trader

@router.delete("/traders/{trader_id}")
def delete_trader(trader_id: str, db: Session = Depends(get_db)):
    """Delete trader"""
    db_trader = db.query(models.Trader).filter(
        models.Trader.trader_id == trader_id
    ).first()
    if not db_trader:
        raise HTTPException(status_code=404, detail="Trader not found")

    db.delete(db_trader)
    db.commit()
    return {"message": "Trader deleted"}


# ============= CLEARER ROUTES =============

@router.post("/clearers", response_model=schemas.ClearerSchema)
def create_clearer(
    clearer: schemas.ClearerCreateSchema,
    db: Session = Depends(get_db)
):
    """Create a new clearer"""
    db_clearer = models.Clearer(
        clearer_id=str(uuid.uuid4()),
        **clearer.dict()
    )
    db.add(db_clearer)
    db.commit()
    db.refresh(db_clearer)

    publish_event(EventType.ACCOUNT_CREATED, {
        "clearer_id": db_clearer.clearer_id,
        "code": db_clearer.code
    }, "static_data")

    return db_clearer

@router.get("/clearers/{clearer_id}", response_model=schemas.ClearerSchema)
def get_clearer(clearer_id: str, db: Session = Depends(get_db)):
    """Get clearer by ID"""
    clearer = db.query(models.Clearer).filter(
        models.Clearer.clearer_id == clearer_id
    ).first()
    if not clearer:
        raise HTTPException(status_code=404, detail="Clearer not found")
    return clearer

@router.get("/clearers", response_model=list[schemas.ClearerSchema])
def list_clearers(db: Session = Depends(get_db)):
    """List all clearers"""
    return db.query(models.Clearer).all()

@router.put("/clearers/{clearer_id}", response_model=schemas.ClearerSchema)
def update_clearer(
    clearer_id: str,
    clearer: schemas.ClearerCreateSchema,
    db: Session = Depends(get_db)
):
    """Update clearer"""
    db_clearer = db.query(models.Clearer).filter(
        models.Clearer.clearer_id == clearer_id
    ).first()
    if not db_clearer:
        raise HTTPException(status_code=404, detail="Clearer not found")

    for key, value in clearer.dict().items():
        setattr(db_clearer, key, value)

    db.commit()
    db.refresh(db_clearer)
    return db_clearer


@router.delete("/clearers/{clearer_id}")
def delete_clearer(clearer_id: str, db: Session = Depends(get_db)):
    """Delete clearer"""
    db_clearer = db.query(models.Clearer).filter(
        models.Clearer.clearer_id == clearer_id
    ).first()
    if not db_clearer:
        raise HTTPException(status_code=404, detail="Clearer not found")

    db.delete(db_clearer)
    db.commit()
    return {"message": "Clearer deleted"}


# ============= INSTRUMENT OTC SUBTYPE ROUTES =============

@router.post("/instruments/{instrument_id}/otc", response_model=schemas.InstrumentOTCSchema)
def create_otc_details(
    instrument_id: str,
    otc_data: schemas.InstrumentOTCCreateSchema,
    db: Session = Depends(get_db)
):
    """Create OTC details for an instrument"""
    # Verify instrument exists
    instrument = db.query(models.Instrument).filter(
        models.Instrument.instrument_id == instrument_id
    ).first()
    if not instrument:
        raise HTTPException(status_code=404, detail="Instrument not found")

    payload = otc_data.dict()
    payload['instrument_id'] = instrument_id

    db_otc = models.InstrumentOTC(**payload)
    db.add(db_otc)
    db.commit()
    db.refresh(db_otc)
    return db_otc

@router.get("/instruments/{instrument_id}/otc", response_model=schemas.InstrumentOTCSchema)
def get_otc_details(instrument_id: str, db: Session = Depends(get_db)):
    """Get OTC details for an instrument"""
    otc = db.query(models.InstrumentOTC).filter(
        models.InstrumentOTC.instrument_id == instrument_id
    ).first()
    if not otc:
        raise HTTPException(status_code=404, detail="OTC details not found")
    return otc

@router.put("/instruments/{instrument_id}/otc", response_model=schemas.InstrumentOTCSchema)
def update_otc_details(
    instrument_id: str,
    otc_data: schemas.InstrumentOTCCreateSchema,
    db: Session = Depends(get_db)
):
    """Update OTC details for an instrument"""
    otc = db.query(models.InstrumentOTC).filter(
        models.InstrumentOTC.instrument_id == instrument_id
    ).first()
    if not otc:
        raise HTTPException(status_code=404, detail="OTC details not found")

    payload = otc_data.dict()
    payload.pop('instrument_id', None)  # Don't update FK

    for key, value in payload.items():
        setattr(otc, key, value)

    db.commit()
    db.refresh(otc)
    return otc


# ============= INSTRUMENT ETD SUBTYPE ROUTES =============

@router.post("/instruments/{instrument_id}/etd", response_model=schemas.InstrumentETDSchema)
def create_etd_details(
    instrument_id: str,
    etd_data: schemas.InstrumentETDCreateSchema,
    db: Session = Depends(get_db)
):
    """Create ETD details for an instrument"""
    # Verify instrument exists
    instrument = db.query(models.Instrument).filter(
        models.Instrument.instrument_id == instrument_id
    ).first()
    if not instrument:
        raise HTTPException(status_code=404, detail="Instrument not found")

    payload = etd_data.dict()
    payload['instrument_id'] = instrument_id

    db_etd = models.InstrumentETD(**payload)
    db.add(db_etd)
    db.commit()
    db.refresh(db_etd)
    return db_etd

@router.get("/instruments/{instrument_id}/etd", response_model=schemas.InstrumentETDSchema)
def get_etd_details(instrument_id: str, db: Session = Depends(get_db)):
    """Get ETD details for an instrument"""
    etd = db.query(models.InstrumentETD).filter(
        models.InstrumentETD.instrument_id == instrument_id
    ).first()
    if not etd:
        raise HTTPException(status_code=404, detail="ETD details not found")
    return etd

@router.put("/instruments/{instrument_id}/etd", response_model=schemas.InstrumentETDSchema)
def update_etd_details(
    instrument_id: str,
    etd_data: schemas.InstrumentETDCreateSchema,
    db: Session = Depends(get_db)
):
    """Update ETD details for an instrument"""
    etd = db.query(models.InstrumentETD).filter(
        models.InstrumentETD.instrument_id == instrument_id
    ).first()
    if not etd:
        raise HTTPException(status_code=404, detail="ETD details not found")

    payload = etd_data.dict()
    payload.pop('instrument_id', None)  # Don't update FK

    for key, value in payload.items():
        setattr(etd, key, value)

    db.commit()
    db.refresh(etd)
    return etd


# ============= INSTRUMENT STRATEGY SUBTYPE ROUTES =============

@router.post("/instruments/{instrument_id}/strategy", response_model=schemas.InstrumentStrategySchema)
def create_strategy_details(
    instrument_id: str,
    strategy_data: schemas.InstrumentStrategyCreateSchema,
    db: Session = Depends(get_db)
):
    """Create Strategy details for an instrument"""
    # Verify instrument exists
    instrument = db.query(models.Instrument).filter(
        models.Instrument.instrument_id == instrument_id
    ).first()
    if not instrument:
        raise HTTPException(status_code=404, detail="Instrument not found")

    payload = strategy_data.dict()
    payload['instrument_id'] = instrument_id

    db_strategy = models.InstrumentStrategy(**payload)
    db.add(db_strategy)
    db.commit()
    db.refresh(db_strategy)
    return db_strategy

@router.get("/instruments/{instrument_id}/strategy", response_model=schemas.InstrumentStrategySchema)
def get_strategy_details(instrument_id: str, db: Session = Depends(get_db)):
    """Get Strategy details for an instrument"""
    strategy = db.query(models.InstrumentStrategy).filter(
        models.InstrumentStrategy.instrument_id == instrument_id
    ).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy details not found")
    return strategy

@router.put("/instruments/{instrument_id}/strategy", response_model=schemas.InstrumentStrategySchema)
def update_strategy_details(
    instrument_id: str,
    strategy_data: schemas.InstrumentStrategyCreateSchema,
    db: Session = Depends(get_db)
):
    """Update Strategy details for an instrument"""
    strategy = db.query(models.InstrumentStrategy).filter(
        models.InstrumentStrategy.instrument_id == instrument_id
    ).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy details not found")

    payload = strategy_data.dict()
    payload.pop('instrument_id', None)  # Don't update FK

    for key, value in payload.items():
        setattr(strategy, key, value)

    db.commit()
    db.refresh(strategy)
    return strategy


# ============= STRATEGY LEG ROUTES =============

@router.post("/strategies/{strategy_id}/legs", response_model=schemas.StrategyLegSchema)
def create_strategy_leg(
    strategy_id: str,
    leg_data: schemas.StrategyLegCreateSchema,
    db: Session = Depends(get_db)
):
    """Create a leg for a strategy instrument"""
    from datetime import datetime, timezone

    # Verify strategy instrument exists
    strategy = db.query(models.Instrument).filter(
        models.Instrument.instrument_id == strategy_id
    ).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy instrument not found")

    # Verify component instrument exists
    component = db.query(models.Instrument).filter(
        models.Instrument.instrument_id == leg_data.component_instrument_id
    ).first()
    if not component:
        raise HTTPException(status_code=404, detail="Component instrument not found")

    payload = leg_data.dict()
    payload['leg_id'] = str(uuid.uuid4())
    payload['strategy_id'] = strategy_id
    payload['created_at'] = datetime.now(timezone.utc)

    db_leg = models.StrategyLeg(**payload)
    db.add(db_leg)
    db.commit()
    db.refresh(db_leg)
    return db_leg

@router.get("/strategies/{strategy_id}/legs", response_model=list[schemas.StrategyLegSchema])
def list_strategy_legs(strategy_id: str, db: Session = Depends(get_db)):
    """List all legs for a strategy"""
    legs = db.query(models.StrategyLeg).filter(
        models.StrategyLeg.strategy_id == strategy_id,
        models.StrategyLeg.status == "ACTIVE"
    ).order_by(models.StrategyLeg.leg_sequence).all()
    return legs

@router.get("/strategies/{strategy_id}/legs/{leg_id}", response_model=schemas.StrategyLegSchema)
def get_strategy_leg(strategy_id: str, leg_id: str, db: Session = Depends(get_db)):
    """Get a specific leg of a strategy"""
    leg = db.query(models.StrategyLeg).filter(
        models.StrategyLeg.leg_id == leg_id,
        models.StrategyLeg.strategy_id == strategy_id
    ).first()
    if not leg:
        raise HTTPException(status_code=404, detail="Strategy leg not found")
    return leg

@router.put("/strategies/{strategy_id}/legs/{leg_id}", response_model=schemas.StrategyLegSchema)
def update_strategy_leg(
    strategy_id: str,
    leg_id: str,
    leg_data: schemas.StrategyLegCreateSchema,
    db: Session = Depends(get_db)
):
    """Update a strategy leg"""
    leg = db.query(models.StrategyLeg).filter(
        models.StrategyLeg.leg_id == leg_id,
        models.StrategyLeg.strategy_id == strategy_id
    ).first()
    if not leg:
        raise HTTPException(status_code=404, detail="Strategy leg not found")

    # Verify component instrument if changed
    if leg_data.component_instrument_id != leg.component_instrument_id:
        component = db.query(models.Instrument).filter(
            models.Instrument.instrument_id == leg_data.component_instrument_id
        ).first()
        if not component:
            raise HTTPException(status_code=404, detail="Component instrument not found")

    payload = leg_data.dict()

    for key, value in payload.items():
        if key != 'strategy_id':  # Don't update FK
            setattr(leg, key, value)

    db.commit()
    db.refresh(leg)
    return leg

@router.delete("/strategies/{strategy_id}/legs/{leg_id}")
def delete_strategy_leg(strategy_id: str, leg_id: str, db: Session = Depends(get_db)):
    """Delete (soft delete) a strategy leg"""
    leg = db.query(models.StrategyLeg).filter(
        models.StrategyLeg.leg_id == leg_id,
        models.StrategyLeg.strategy_id == strategy_id
    ).first()
    if not leg:
        raise HTTPException(status_code=404, detail="Strategy leg not found")

    leg.status = "DELETED"
    db.commit()
    return {"message": "Strategy leg deleted"}
