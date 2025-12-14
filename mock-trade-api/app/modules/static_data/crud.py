# Static Data Module - CRUD operations
# Stub file - CRUD logic can be expanded here
from sqlalchemy.orm import Session
from app.modules.static_data import models

class InstrumentCRUD:
    @staticmethod
    def get_by_symbol(db: Session, symbol: str):
        return db.query(models.Instrument).filter(models.Instrument.symbol == symbol).first()

class AccountCRUD:
    @staticmethod
    def get_by_code(db: Session, code: str):
        return db.query(models.Account).filter(models.Account.code == code).first()

class BrokerCRUD:
    @staticmethod
    def get_by_code(db: Session, code: str):
        return db.query(models.Broker).filter(models.Broker.code == code).first()

class TraderCRUD:
    @staticmethod
    def get_by_user_id(db: Session, user_id: str):
        return db.query(models.Trader).filter(models.Trader.user_id == user_id).first()

