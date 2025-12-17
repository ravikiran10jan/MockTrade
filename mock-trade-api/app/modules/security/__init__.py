"""Security module for RBAC (Role-Based Access Control)"""

from app.modules.security.models import Role, Permission, RolePermission, RolePermissionMapping
from app.modules.security.schemas import (
    RoleSchema, PermissionSchema, RolePermissionMappingSchema,
    RoleCreate, PermissionCreate, RolePermissionMappingCreate
)
from app.modules.security.service import SecurityService
from app.modules.security.routes import router

# Aliases for consistency
RoleCreateSchema = RoleCreate
PermissionCreateSchema = PermissionCreate
RolePermissionSchema = RolePermissionMappingSchema

__all__ = [
    'Role',
    'Permission',
    'RolePermission',
    'RolePermissionMapping',
    'RoleSchema',
    'PermissionSchema',
    'RolePermissionSchema',
    'RolePermissionMappingSchema',
    'RoleCreate',
    'RoleCreateSchema',
    'PermissionCreate',
    'PermissionCreateSchema',
    'SecurityService',
    'router',
]