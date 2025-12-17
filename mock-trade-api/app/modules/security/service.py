"""
Security Module - Service Layer
Contains business logic for RBAC (Roles, Permissions, Role-Permission mappings).
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

from app.core.exceptions import MockTradeException


class SecurityService:
    """Service class for security and RBAC business logic"""
    
    @staticmethod
    def list_roles(db: Session) -> List[Any]:
        """
        Get all roles with their permission counts
        
        Args:
            db: Database session
            
        Returns:
            List of roles with metadata
        """
        from app.modules.security.models import Role, RolePermission
        
        query = (
            db.query(
                Role,
                func.count(RolePermission.permission_id).label('permission_count')
            )
            .outerjoin(RolePermission, Role.role_id == RolePermission.role_id)
            .group_by(Role.role_id)
            .order_by(Role.role_name)
        )
        
        result = []
        for role, perm_count in query.all():
            role_dict = {
                "role_id": role.role_id,
                "role_name": role.role_name,
                "description": role.description,
                "is_active": role.is_active,
                "permission_count": perm_count
            }
            result.append(role_dict)
        
        return result
    
    @staticmethod
    def create_role(db: Session, role_name: str, description: str = None) -> Any:
        """
        Create a new role
        
        Args:
            db: Database session
            role_name: Name of the role
            description: Optional description
            
        Returns:
            Created Role instance
        """
        from app.modules.security.models import Role
        
        # Check if role already exists
        existing = db.query(Role).filter(Role.role_name == role_name).first()
        if existing:
            raise MockTradeException(f"Role '{role_name}' already exists")
        
        role = Role(
            role_id=str(uuid.uuid4()),
            role_name=role_name,
            description=description,
            is_active=True
        )
        
        db.add(role)
        db.commit()
        db.refresh(role)
        
        return role
    
    @staticmethod
    def update_role(db: Session, role_id: str, role_name: str = None, 
                   description: str = None, is_active: bool = None) -> Any:
        """
        Update a role
        
        Args:
            db: Database session
            role_id: Role identifier
            role_name: New role name (optional)
            description: New description (optional)
            is_active: New active status (optional)
            
        Returns:
            Updated Role instance
        """
        from app.modules.security.models import Role
        
        role = db.query(Role).filter(Role.role_id == role_id).first()
        if not role:
            raise MockTradeException(f"Role with ID '{role_id}' not found")
        
        if role_name is not None:
            role.role_name = role_name
        if description is not None:
            role.description = description
        if is_active is not None:
            role.is_active = is_active
        
        db.commit()
        db.refresh(role)
        
        return role
    
    @staticmethod
    def delete_role(db: Session, role_id: str) -> Dict[str, Any]:
        """
        Delete a role
        
        Args:
            db: Database session
            role_id: Role identifier
            
        Returns:
            Deletion status message
        """
        from app.modules.security.models import Role
        
        role = db.query(Role).filter(Role.role_id == role_id).first()
        if not role:
            raise MockTradeException(f"Role with ID '{role_id}' not found")
        
        db.delete(role)
        db.commit()
        
        return {"message": f"Role '{role.role_name}' deleted successfully"}
    
    @staticmethod
    def list_permissions(db: Session, module_name: str = None) -> List[Any]:
        """
        Get all permissions, optionally filtered by module
        
        Args:
            db: Database session
            module_name: Optional module name filter
            
        Returns:
            List of permissions
        """
        from app.modules.security.models import Permission
        
        query = db.query(Permission)
        
        if module_name:
            query = query.filter(Permission.module_name == module_name)
        
        return query.order_by(Permission.module_name, Permission.permission_name).all()
    
    @staticmethod
    def create_permission(db: Session, module_name: str, permission_name: str, 
                         description: str = None) -> Any:
        """
        Create a new permission
        
        Args:
            db: Database session
            module_name: Module name
            permission_name: Permission name (e.g., READ, WRITE)
            description: Optional description
            
        Returns:
            Created Permission instance
        """
        from app.modules.security.models import Permission
        
        # Check if permission already exists
        existing = db.query(Permission).filter(
            Permission.module_name == module_name,
            Permission.permission_name == permission_name
        ).first()
        
        if existing:
            raise MockTradeException(
                f"Permission '{permission_name}' for module '{module_name}' already exists"
            )
        
        permission = Permission(
            permission_id=str(uuid.uuid4()),
            module_name=module_name,
            permission_name=permission_name,
            description=description,
            is_active=True
        )
        
        db.add(permission)
        db.commit()
        db.refresh(permission)
        
        return permission
    
    @staticmethod
    def assign_permission_to_role(db: Session, role_id: str, permission_id: str) -> Any:
        """
        Assign a permission to a role
        
        Args:
            db: Database session
            role_id: Role identifier
            permission_id: Permission identifier
            
        Returns:
            Created RolePermission instance
        """
        from app.modules.security.models import Role, Permission, RolePermission
        
        # Verify role exists
        role = db.query(Role).filter(Role.role_id == role_id).first()
        if not role:
            raise MockTradeException(f"Role with ID '{role_id}' not found")
        
        # Verify permission exists
        permission = db.query(Permission).filter(Permission.permission_id == permission_id).first()
        if not permission:
            raise MockTradeException(f"Permission with ID '{permission_id}' not found")
        
        # Check if already assigned
        existing = db.query(RolePermission).filter(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id
        ).first()
        
        if existing:
            raise MockTradeException("Permission already assigned to this role")
        
        role_permission = RolePermission(
            role_permission_id=str(uuid.uuid4()),
            role_id=role_id,
            permission_id=permission_id
        )
        
        db.add(role_permission)
        db.commit()
        db.refresh(role_permission)
        
        return role_permission
    
    @staticmethod
    def remove_permission_from_role(db: Session, role_id: str, permission_id: str) -> Dict[str, Any]:
        """
        Remove a permission from a role
        
        Args:
            db: Database session
            role_id: Role identifier
            permission_id: Permission identifier
            
        Returns:
            Deletion status message
        """
        from app.modules.security.models import RolePermission
        
        role_permission = db.query(RolePermission).filter(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id
        ).first()
        
        if not role_permission:
            raise MockTradeException("Permission not assigned to this role")
        
        db.delete(role_permission)
        db.commit()
        
        return {"message": "Permission removed from role successfully"}
    
    @staticmethod
    def get_role_permissions(db: Session, role_id: str) -> List[Any]:
        """
        Get all permissions for a specific role
        
        Args:
            db: Database session
            role_id: Role identifier
            
        Returns:
            List of permissions for the role
        """
        from app.modules.security.models import Role, Permission, RolePermission
        
        role = db.query(Role).filter(Role.role_id == role_id).first()
        if not role:
            raise MockTradeException(f"Role with ID '{role_id}' not found")
        
        permissions = (
            db.query(Permission)
            .join(RolePermission, Permission.permission_id == RolePermission.permission_id)
            .filter(RolePermission.role_id == role_id)
            .order_by(Permission.module_name, Permission.permission_name)
            .all()
        )
        
        return permissions
    
    @staticmethod
    def check_user_permission(db: Session, user_id: str, module_name: str, 
                             permission_name: str) -> bool:
        """
        Check if a user has a specific permission
        
        Args:
            db: Database session
            user_id: User identifier
            module_name: Module name
            permission_name: Permission name
            
        Returns:
            True if user has permission, False otherwise
        """
        from app.modules.security.models import Permission, RolePermission
        
        # This is a placeholder - you'll need to implement user-role mapping
        # For now, return True for demo purposes
        # TODO: Implement proper user-role-permission checking
        
        permission = db.query(Permission).filter(
            Permission.module_name == module_name,
            Permission.permission_name == permission_name,
            Permission.is_active == True
        ).first()
        
        return permission is not None
