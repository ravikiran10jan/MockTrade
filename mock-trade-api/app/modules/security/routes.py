"""Security module routes for RBAC management"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database import get_db
from app.models import (
    Role, Permission, Module, RolePermissionMapping, UserRole, Trader
)
from app.modules.security.schemas import (
    RoleCreate, RoleUpdate, RoleSchema,
    PermissionCreate, PermissionUpdate, PermissionSchema,
    ModuleCreate, ModuleUpdate, ModuleSchema,
    RolePermissionMappingCreate, RolePermissionMappingUpdate, RolePermissionMappingSchema,
    RolePermissionDetailSchema,
    UserRoleCreate, UserRoleUpdate, UserRoleSchema,
    UserRoleDetailSchema, RolePermissionDetailSchema,
    SecurityConfigSchema, UserSecurityContextSchema
)
from app.modules.auth.middleware import get_current_user

router = APIRouter(prefix="/api/v1/security", tags=["security"])


# ============ ROLES ENDPOINTS ============

@router.post("/roles", response_model=RoleSchema)
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    """Create a new role"""
    # Check if role already exists
    existing = db.query(Role).filter(Role.role_name == role.role_name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Role '{role.role_name}' already exists")

    db_role = Role(
        role_id=str(uuid.uuid4()),
        role_name=role.role_name,
        description=role.description,
        status=role.status,
        created_at=datetime.now()
    )
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role


@router.get("/roles", response_model=list[RoleSchema])
def list_roles(status: str = None, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """List all roles, optionally filtered by status"""
    query = db.query(Role)
    if status:
        query = query.filter(Role.status == status)
    return query.all()


@router.get("/roles/{role_id}", response_model=RoleSchema)
def get_role(role_id: str, db: Session = Depends(get_db)):
    """Get a specific role by ID"""
    role = db.query(Role).filter(Role.role_id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.put("/roles/{role_id}", response_model=RoleSchema)
def update_role(role_id: str, role_update: RoleUpdate, db: Session = Depends(get_db)):
    """Update a role"""
    db_role = db.query(Role).filter(Role.role_id == role_id).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")

    if role_update.description is not None:
        db_role.description = role_update.description
    if role_update.status is not None:
        db_role.status = role_update.status

    db.commit()
    db.refresh(db_role)
    return db_role


@router.delete("/roles/{role_id}")
def delete_role(role_id: str, db: Session = Depends(get_db)):
    """Delete a role"""
    db_role = db.query(Role).filter(Role.role_id == role_id).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Also delete role permission mappings and user roles
    db.query(RolePermissionMapping).filter(RolePermissionMapping.role_id == role_id).delete()
    db.query(UserRole).filter(UserRole.role_id == role_id).delete()
    db.delete(db_role)
    db.commit()

    return {"message": "Role deleted successfully"}


# ============ PERMISSIONS ENDPOINTS ============

@router.post("/permissions", response_model=PermissionSchema)
def create_permission(permission: PermissionCreate, db: Session = Depends(get_db)):
    """Create a new permission"""
    # Check if permission already exists
    existing = db.query(Permission).filter(Permission.permission_name == permission.permission_name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Permission '{permission.permission_name}' already exists")

    db_permission = Permission(
        permission_id=str(uuid.uuid4()),
        permission_name=permission.permission_name,
        description=permission.description,
        status=permission.status,
        created_at=datetime.now()
    )
    db.add(db_permission)
    db.commit()
    db.refresh(db_permission)
    return db_permission


@router.get("/permissions", response_model=list[PermissionSchema])
def list_permissions(status: str = None, db: Session = Depends(get_db)):
    """List all permissions, optionally filtered by status"""
    query = db.query(Permission)
    if status:
        query = query.filter(Permission.status == status)
    return query.all()


@router.get("/permissions/{permission_id}", response_model=PermissionSchema)
def get_permission(permission_id: str, db: Session = Depends(get_db)):
    """Get a specific permission by ID"""
    permission = db.query(Permission).filter(Permission.permission_id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    return permission


@router.put("/permissions/{permission_id}", response_model=PermissionSchema)
def update_permission(permission_id: str, permission_update: PermissionUpdate, db: Session = Depends(get_db)):
    """Update a permission"""
    db_permission = db.query(Permission).filter(Permission.permission_id == permission_id).first()
    if not db_permission:
        raise HTTPException(status_code=404, detail="Permission not found")

    if permission_update.description is not None:
        db_permission.description = permission_update.description
    if permission_update.status is not None:
        db_permission.status = permission_update.status

    db.commit()
    db.refresh(db_permission)
    return db_permission


# ============ MODULES ENDPOINTS ============

@router.post("/modules", response_model=ModuleSchema)
def create_module(module: ModuleCreate, db: Session = Depends(get_db)):
    """Create a new module"""
    # Check if module already exists
    existing = db.query(Module).filter(Module.module_name == module.module_name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Module '{module.module_name}' already exists")

    db_module = Module(
        module_id=str(uuid.uuid4()),
        module_name=module.module_name,
        description=module.description,
        status=module.status,
        created_at=datetime.now()
    )
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module


@router.get("/modules", response_model=list[ModuleSchema])
def list_modules(status: str = None, db: Session = Depends(get_db)):
    """List all modules, optionally filtered by status"""
    query = db.query(Module)
    if status:
        query = query.filter(Module.status == status)
    return query.all()


@router.get("/modules/{module_id}", response_model=ModuleSchema)
def get_module(module_id: str, db: Session = Depends(get_db)):
    """Get a specific module by ID"""
    module = db.query(Module).filter(Module.module_id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@router.put("/modules/{module_id}", response_model=ModuleSchema)
def update_module(module_id: str, module_update: ModuleUpdate, db: Session = Depends(get_db)):
    """Update a module"""
    db_module = db.query(Module).filter(Module.module_id == module_id).first()
    if not db_module:
        raise HTTPException(status_code=404, detail="Module not found")

    if module_update.description is not None:
        db_module.description = module_update.description
    if module_update.status is not None:
        db_module.status = module_update.status

    db.commit()
    db.refresh(db_module)
    return db_module


# ============ ROLE PERMISSION MAPPING ENDPOINTS ============

@router.post("/role-permissions", response_model=RolePermissionMappingSchema)
def create_role_permission(mapping: RolePermissionMappingCreate, db: Session = Depends(get_db)):
    """Create a role-permission mapping for a module"""
    # Validate role, module, and permission exist
    role = db.query(Role).filter(Role.role_id == mapping.role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    module = db.query(Module).filter(Module.module_id == mapping.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    permission = db.query(Permission).filter(Permission.permission_id == mapping.permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")

    # Check if mapping already exists
    existing = db.query(RolePermissionMapping).filter(
        and_(
            RolePermissionMapping.role_id == mapping.role_id,
            RolePermissionMapping.module_id == mapping.module_id
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="This role-module mapping already exists")

    db_mapping = RolePermissionMapping(
        mapping_id=str(uuid.uuid4()),
        role_id=mapping.role_id,
        module_id=mapping.module_id,
        permission_id=mapping.permission_id,
        status=mapping.status,
        created_at=datetime.now()
    )
    db.add(db_mapping)
    db.commit()
    db.refresh(db_mapping)
    return db_mapping


@router.get("/role-permissions", response_model=list[RolePermissionDetailSchema])
def list_role_permissions(role_id: str = None, module_id: str = None, db: Session = Depends(get_db)):
    """List role-permission mappings with details"""
    query = db.query(
        RolePermissionMapping.mapping_id,
        Role.role_name,
        Module.module_name,
        Permission.permission_name,
        RolePermissionMapping.status
    ).join(Role, RolePermissionMapping.role_id == Role.role_id).join(
        Module, RolePermissionMapping.module_id == Module.module_id
    ).join(Permission, RolePermissionMapping.permission_id == Permission.permission_id)

    if role_id:
        query = query.filter(RolePermissionMapping.role_id == role_id)
    if module_id:
        query = query.filter(RolePermissionMapping.module_id == module_id)

    results = query.all()
    return [
        RolePermissionDetailSchema(
            mapping_id=r[0],
            role_name=r[1],
            module_name=r[2],
            permission_name=r[3],
            status=r[4]
        )
        for r in results
    ]


@router.put("/role-permissions/{mapping_id}", response_model=RolePermissionMappingSchema)
def update_role_permission(mapping_id: str, mapping_update: RolePermissionMappingUpdate, db: Session = Depends(get_db)):
    """Update a role-permission mapping"""
    db_mapping = db.query(RolePermissionMapping).filter(RolePermissionMapping.mapping_id == mapping_id).first()
    if not db_mapping:
        raise HTTPException(status_code=404, detail="Mapping not found")

    if mapping_update.permission_id is not None:
        # Validate permission exists
        permission = db.query(Permission).filter(Permission.permission_id == mapping_update.permission_id).first()
        if not permission:
            raise HTTPException(status_code=404, detail="Permission not found")
        db_mapping.permission_id = mapping_update.permission_id

    if mapping_update.status is not None:
        db_mapping.status = mapping_update.status

    db.commit()
    db.refresh(db_mapping)
    return db_mapping


@router.delete("/role-permissions/{mapping_id}")
def delete_role_permission(mapping_id: str, db: Session = Depends(get_db)):
    """Delete a role-permission mapping"""
    db_mapping = db.query(RolePermissionMapping).filter(RolePermissionMapping.mapping_id == mapping_id).first()
    if not db_mapping:
        raise HTTPException(status_code=404, detail="Mapping not found")

    db.delete(db_mapping)
    db.commit()
    return {"message": "Role-permission mapping deleted successfully"}


# ============ USER ROLE ENDPOINTS ============

@router.post("/user-roles", response_model=UserRoleSchema)
def assign_user_role(user_role: UserRoleCreate, db: Session = Depends(get_db)):
    """Assign a role to a user"""
    # Validate user and role exist
    user = db.query(Trader).filter(Trader.trader_id == user_role.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = db.query(Role).filter(Role.role_id == user_role.role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    db_user_role = UserRole(
        user_role_id=str(uuid.uuid4()),
        user_id=user_role.user_id,
        role_id=user_role.role_id,
        assigned_at=datetime.now(),
        assigned_by=user_role.assigned_by,
        status=user_role.status,
        created_at=datetime.now()
    )
    db.add(db_user_role)
    db.commit()
    db.refresh(db_user_role)
    return db_user_role


@router.get("/user-roles", response_model=list[UserRoleSchema])
def list_user_roles(user_id: str = None, role_id: str = None, db: Session = Depends(get_db)):
    """List user role assignments"""
    query = db.query(UserRole)
    if user_id:
        query = query.filter(UserRole.user_id == user_id)
    if role_id:
        query = query.filter(UserRole.role_id == role_id)
    return query.all()


@router.get("/user-roles/{user_id}", response_model=list[UserRoleDetailSchema])
def get_user_security_context(user_id: str, db: Session = Depends(get_db)):
    """Get user's roles and permissions"""
    user = db.query(Trader).filter(Trader.trader_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get user roles
    user_roles = db.query(UserRole).filter(
        and_(UserRole.user_id == user_id, UserRole.status == "ACTIVE")
    ).all()

    result = []
    for ur in user_roles:
        role = db.query(Role).filter(Role.role_id == ur.role_id).first()
        if role:
            # Get role permissions
            perms = db.query(
                RolePermissionMapping.mapping_id,
                Role.role_name,
                Module.module_name,
                Permission.permission_name,
                RolePermissionMapping.status
            ).join(Role, RolePermissionMapping.role_id == Role.role_id).join(
                Module, RolePermissionMapping.module_id == Module.module_id
            ).join(Permission, RolePermissionMapping.permission_id == Permission.permission_id).filter(
                and_(
                    RolePermissionMapping.role_id == ur.role_id,
                    RolePermissionMapping.status == "ACTIVE"
                )
            ).all()

            result.append(UserRoleDetailSchema(
                user_id=user_id,
                user_name=user.name,
                role_id=ur.role_id,
                role_name=role.role_name,
                permissions=[
                    RolePermissionDetailSchema(
                        mapping_id=p[0],
                        role_name=p[1],
                        module_name=p[2],
                        permission_name=p[3],
                        status=p[4]
                    )
                    for p in perms
                ]
            ))

    return result


@router.put("/user-roles/{user_role_id}", response_model=UserRoleSchema)
def update_user_role(user_role_id: str, user_role_update: UserRoleUpdate, db: Session = Depends(get_db)):
    """Update user role assignment"""
    db_user_role = db.query(UserRole).filter(UserRole.user_role_id == user_role_id).first()
    if not db_user_role:
        raise HTTPException(status_code=404, detail="User role assignment not found")

    if user_role_update.role_id is not None:
        role = db.query(Role).filter(Role.role_id == user_role_update.role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        db_user_role.role_id = user_role_update.role_id

    if user_role_update.status is not None:
        db_user_role.status = user_role_update.status

    db.commit()
    db.refresh(db_user_role)
    return db_user_role


@router.delete("/user-roles/{user_role_id}")
def remove_user_role(user_role_id: str, db: Session = Depends(get_db)):
    """Remove a role from a user"""
    db_user_role = db.query(UserRole).filter(UserRole.user_role_id == user_role_id).first()
    if not db_user_role:
        raise HTTPException(status_code=404, detail="User role assignment not found")

    db.delete(db_user_role)
    db.commit()
    return {"message": "User role removed successfully"}


# ============ SECURITY CONFIGURATION ENDPOINTS ============

@router.get("/config", response_model=SecurityConfigSchema)
def get_security_config(db: Session = Depends(get_db)):
    """Get complete security configuration (roles, permissions, modules, mappings)"""
    roles = db.query(Role).filter(Role.status == "ACTIVE").all()
    permissions = db.query(Permission).filter(Permission.status == "ACTIVE").all()
    modules = db.query(Module).filter(Module.status == "ACTIVE").all()
    mappings = db.query(RolePermissionMapping).filter(RolePermissionMapping.status == "ACTIVE").all()

    return SecurityConfigSchema(
        roles=roles,
        permissions=permissions,
        modules=modules,
        role_permission_mappings=mappings
    )


@router.get("/check-permission/{user_id}/{module_name}/{permission_type}")
def check_user_permission(user_id: str, module_name: str, permission_type: str, db: Session = Depends(get_db)):
    """Check if a user has a specific permission for a module"""
    # Get user's active roles
    user_roles = db.query(UserRole.role_id).filter(
        and_(UserRole.user_id == user_id, UserRole.status == "ACTIVE")
    ).all()

    if not user_roles:
        return {"has_permission": False, "message": "User has no active roles"}

    role_ids = [ur[0] for ur in user_roles]

    # Get module ID
    module = db.query(Module).filter(Module.module_name == module_name).first()
    if not module:
        return {"has_permission": False, "message": "Module not found"}

    # Get permission ID
    permission = db.query(Permission).filter(Permission.permission_name == permission_type).first()
    if not permission:
        return {"has_permission": False, "message": "Permission type not found"}

    # Check if any of user's roles has the required permission
    # First check for direct module permission
    mapping = db.query(RolePermissionMapping).filter(
        and_(
            RolePermissionMapping.role_id.in_(role_ids),
            RolePermissionMapping.module_id == module.module_id,
            RolePermissionMapping.permission_id == permission.permission_id,
            RolePermissionMapping.status == "ACTIVE"
        )
    ).first()
    
    # If no direct permission, check for "All" module permission
    if not mapping:
        # Get the "All" module
        all_module = db.query(Module).filter(Module.module_name == "All").first()
        if all_module:
            # Check if user has permission for "All" module
            mapping = db.query(RolePermissionMapping).filter(
                and_(
                    RolePermissionMapping.role_id.in_(role_ids),
                    RolePermissionMapping.module_id == all_module.module_id,
                    RolePermissionMapping.permission_id == permission.permission_id,
                    RolePermissionMapping.status == "ACTIVE"
                )
            ).first()
    
    # Also check if user has READ_WRITE permission but requesting READ (READ_WRITE includes READ)
    if not mapping and permission_type == "READ":
        # Check for direct READ_WRITE permission
        read_write_perm = db.query(Permission).filter(Permission.permission_name == "READ_WRITE").first()
        if read_write_perm:
            mapping = db.query(RolePermissionMapping).filter(
                and_(
                    RolePermissionMapping.role_id.in_(role_ids),
                    RolePermissionMapping.module_id == module.module_id,
                    RolePermissionMapping.permission_id == read_write_perm.permission_id,
                    RolePermissionMapping.status == "ACTIVE"
                )
            ).first()
            
            # If no direct permission, check for "All" module READ_WRITE permission
            if not mapping:
                # Get the "All" module
                all_module = db.query(Module).filter(Module.module_name == "All").first()
                if all_module:
                    # Check if user has READ_WRITE permission for "All" module
                    mapping = db.query(RolePermissionMapping).filter(
                        and_(
                            RolePermissionMapping.role_id.in_(role_ids),
                            RolePermissionMapping.module_id == all_module.module_id,
                            RolePermissionMapping.permission_id == read_write_perm.permission_id,
                            RolePermissionMapping.status == "ACTIVE"
                        )
                    ).first()
    
    has_permission = mapping is not None
    return {
        "has_permission": has_permission,
        "user_id": user_id,
        "module_name": module_name,
        "permission_type": permission_type
    }


