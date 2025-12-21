"""
WebSocket Connection Manager
Handles real-time communication for trade updates
"""
from typing import List, Dict
from fastapi import WebSocket, WebSocketDisconnect
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections and broadcasts"""
    
    def __init__(self):
        # Store active connections by channel
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, channel: str = "trades"):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        
        self.active_connections[channel].append(websocket)
        logger.info(f"Client connected to channel '{channel}'. Total connections: {len(self.active_connections[channel])}")
    
    def disconnect(self, websocket: WebSocket, channel: str = "trades"):
        """Remove a WebSocket connection"""
        if channel in self.active_connections:
            if websocket in self.active_connections[channel]:
                self.active_connections[channel].remove(websocket)
                logger.info(f"Client disconnected from channel '{channel}'. Total connections: {len(self.active_connections[channel])}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send a message to a specific WebSocket"""
        await websocket.send_text(message)
    
    async def broadcast(self, message: dict, channel: str = "trades"):
        """Broadcast a message to all connections in a channel"""
        if channel not in self.active_connections:
            logger.warning(f"No connections in channel '{channel}'")
            return
        
        message_text = json.dumps(message)
        disconnected = []
        
        for connection in self.active_connections[channel]:
            try:
                await connection.send_text(message_text)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection, channel)
    
    async def broadcast_trade_update(self, trade_data: dict, event_type: str = "trade_created"):
        """
        Broadcast trade update to all connected clients
        
        Args:
            trade_data: Trade data dictionary
            event_type: Type of event (trade_created, trade_updated, trade_cancelled, etc.)
        """
        message = {
            "type": event_type,
            "data": trade_data
        }
        await self.broadcast(message, channel="trades")
        logger.info(f"Broadcasted {event_type} to trades channel")


# Global instance
manager = ConnectionManager()
