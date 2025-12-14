# Custom Exceptions for MockTrade

class MockTradeException(Exception):
    """Base exception for MockTrade"""
    pass

class OrderNotFoundError(MockTradeException):
    """Order not found"""
    pass

class TradeNotFoundError(MockTradeException):
    """Trade not found"""
    pass

class InstrumentNotFoundError(MockTradeException):
    """Instrument not found"""
    pass

class AccountNotFoundError(MockTradeException):
    """Account not found"""
    pass

class InvalidOrderError(MockTradeException):
    """Invalid order data"""
    pass

class OrderAlreadyFilledError(MockTradeException):
    """Cannot modify filled order"""
    pass

class InsufficientQuantityError(MockTradeException):
    """Insufficient quantity for operation"""
    pass

class MarketDataNotAvailableError(MockTradeException):
    """Market data not available"""
    pass

class EnrichmentError(MockTradeException):
    """Error during enrichment process"""
    pass

