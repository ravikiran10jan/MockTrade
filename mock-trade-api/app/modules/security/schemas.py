"""Schemas for Security module - RBAC"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# ============ ROLE SCHEMAS ============

class RoleCreate(BaseModel):
    role_name: str  # FO_USER, BO_USER, SUPPORT
    description: Optional[str] = None
    status: str = "ACTIVE"


class RoleUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[str] = None


class RoleSchema(BaseModel):
    role_id: str
    role_name: str
    description: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============ PERMISSION SCHEMAS ============

class PermissionCreate(BaseModel):
    permission_name: str  # READ, READ_WRITE
    description: Optional[str] = None
    status: str = "ACTIVE"


class PermissionUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[str] = None


class PermissionSchema(BaseModel):
    permission_id: str
    permission_name: str
    description: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============ MODULE SCHEMAS ============

class ModuleCreate(BaseModel):
    module_name: str  # OrderEntry, StaticData, MarketData, Enrichment, Trade, Security
    description: Optional[str] = None
    status: str = "ACTIVE"


class ModuleUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[str] = None


class ModuleSchema(BaseModel):
    module_id: str
    module_name: str
    description: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============ ROLE PERMISSION MAPPING SCHEMAS ============

class RolePermissionMappingCreate(BaseModel):
    role_id: str
    module_id: str
    permission_id: str
    status: str = "ACTIVE"


class RolePermissionMappingUpdate(BaseModel):
    permission_id: Optional[str] = None
    status: Optional[str] = None


class RolePermissionMappingSchema(BaseModel):
    mapping_id: str
    role_id: str
    module_id: str
    permission_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class RolePermissionDetailSchema(BaseModel):
    """Role with all its permissions across modules"""
    mapping_id: str
    role_name: str
    module_name: str
    permission_name: str
    status: str

    class Config:
        from_attributes = True


# ============ USER ROLE SCHEMAS ============

class UserRoleCreate(BaseModel):
    user_id: str
    role_id: str
    assigned_by: Optional[str] = None
    status: str = "ACTIVE"


class UserRoleUpdate(BaseModel):
    role_id: Optional[str] = None
    status: Optional[str] = None


class UserRoleSchema(BaseModel):
    user_role_id: str
    user_id: str
    role_id: str
    assigned_at: datetime
    assigned_by: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserRoleDetailSchema(BaseModel):
    """User with their role and permissions"""
    user_id: str
    user_name: str
    role_id: str
    role_name: str
    permissions: List[RolePermissionDetailSchema]

    class Config:
        from_attributes = True


# ============ SECURITY CONFIG SCHEMAS ============

class SecurityConfigSchema(BaseModel):
    """Response for security configuration with all roles, permissions, and mappings"""
    roles: List[RoleSchema]
    permissions: List[PermissionSchema]
    modules: List[ModuleSchema]
    role_permission_mappings: List[RolePermissionMappingSchema]


class UserSecurityContextSchema(BaseModel):
    """Security context for a user showing their roles and permissions"""
    user_id: str
    user_name: str
    roles: List[str]
    permissions_by_module: dict  # {module_name: [permissions]}
    can_access: dict  # {module_name: bool}
    can_edit: dict  # {module_name: bool}


