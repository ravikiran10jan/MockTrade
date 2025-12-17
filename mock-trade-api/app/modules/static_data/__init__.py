"""
Static Data Module
Handles master data management for instruments, traders, accounts, brokers, and clearers.
"""

from app.modules.static_data.service import StaticDataService
from app.modules.static_data.routes import router

__all__ = ['StaticDataService', 'router']
