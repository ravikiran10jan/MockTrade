"""
Security Module - Models
Re-exports security-related models from the main models file.
"""

from app.models import Role, Permission, RolePermissionMapping

# Alias for consistency
RolePermission = RolePermissionMapping

__all__ = ['Role', 'Permission', 'RolePermission', 'RolePermissionMapping']
