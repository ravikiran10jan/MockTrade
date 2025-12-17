"""
Shared Pydantic schemas and base models for common use across modules.
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class BaseSchema(BaseModel):
    """Base schema with common configuration"""
    class Config:
        from_attributes = True

class TimestampedSchema(BaseSchema):
    """Schema with created_at and updated_at timestamps"""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class PaginationRequest(BaseSchema):
    """Pagination parameters"""
    page: int = 1
    page_size: int = 50
    sort_by: Optional[str] = None
    sort_order: str = "asc"

class PaginationResponse(BaseSchema):
    """Pagination metadata"""
    total: int
    page: int
    page_size: int
    total_pages: int

class ApiResponse(BaseSchema):
    """Standard API response wrapper"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class FilterRequest(BaseSchema):
    """Base filter request"""
    filters: Dict[str, Any] = {}
    pagination: Optional[PaginationRequest] = None
