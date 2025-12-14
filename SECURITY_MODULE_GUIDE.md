# Security Module - Role-Based Access Control (RBAC)

## Overview

The Security module provides comprehensive Role-Based Access Control (RBAC) for the MockTrade platform. It allows administrators to manage roles, permissions, modules, and user access levels with granular control over who can read and write to different parts of the application.

## Architecture

### Database Tables

#### 1. `role` - Role Definitions
```
role_id (PK)      - Unique identifier
role_name         - Name of the role (e.g., FO_USER, BO_USER, SUPPORT)
description       - Role description
status            - ACTIVE or INACTIVE
created_at        - Timestamp
```

**Default Roles:**
- **FO_USER** - Front Office User (Traders, Dealers)
  - Can create and manage orders
  - Can view and cancel/expire trades
  - Can view market data (read-only)

- **BO_USER** - Back Office User (Operations, Settlement)
  - Can manage static data (create/update/delete)
  - Can manage enrichment mappings
  - Can view trades (read-only)

- **SUPPORT** - Support User (Reporting, Monitoring)
  - Read-only access to all modules
  - Can view orders, trades, static data, market data, enrichment

#### 2. `permission` - Permission Types
```
permission_id     - Unique identifier
permission_name   - Permission name (READ, READ_WRITE)
description       - Permission description
status            - ACTIVE or INACTIVE
created_at        - Timestamp
```

**Default Permissions:**
- **READ** - Read-only access to view data
- **READ_WRITE** - Full read and write access to create/modify/delete data

#### 3. `module` - Application Modules
```
module_id         - Unique identifier
module_name       - Module name (e.g., OrderEntry, StaticData, MarketData)
description       - Module description
status            - ACTIVE or INACTIVE
created_at        - Timestamp
```

**Supported Modules:**
- OrderEntry
- StaticData
- MarketData
- Enrichment
- Trade
- Security (RBAC management itself)

#### 4. `role_permission_mapping` - Role-Permission Mapping
```
mapping_id        - Unique identifier
role_id (FK)      - References role table
module_id (FK)    - References module table
permission_id (FK) - References permission table
status            - ACTIVE or INACTIVE
created_at        - Timestamp
```

Maps roles to permissions for specific modules. For example:
- FO_USER + OrderEntry = READ_WRITE
- FO_USER + Trade = READ_WRITE
- BO_USER + StaticData = READ_WRITE
- SUPPORT + OrderEntry = READ

#### 5. `user_role` - User Role Assignment
```
user_role_id      - Unique identifier
user_id (FK)      - References trader table
role_id (FK)      - References role table
assigned_at       - When role was assigned
assigned_by       - Who assigned the role
status            - ACTIVE or INACTIVE
created_at        - Timestamp
```

## Default Role-Permission Matrix

| Role | OrderEntry | StaticData | MarketData | Enrichment | Trade | Security |
|------|-----------|-----------|-----------|-----------|-------|----------|
| **FO_USER** | RW | - | R | - | RW | - |
| **BO_USER** | - | RW | - | RW | R | - |
| **SUPPORT** | R | R | R | R | R | - |

Legend:
- RW = Read & Write
- R = Read only
- `-` = No access

## API Endpoints

### Roles Management

```bash
# Create a new role
POST /api/v1/security/roles
{
  "role_name": "CUSTOM_ROLE",
  "description": "Custom role for specific users",
  "status": "ACTIVE"
}

# List all roles
GET /api/v1/security/roles
GET /api/v1/security/roles?status=ACTIVE

# Get specific role
GET /api/v1/security/roles/{role_id}

# Update role
PUT /api/v1/security/roles/{role_id}
{
  "description": "Updated description",
  "status": "INACTIVE"
}

# Delete role
DELETE /api/v1/security/roles/{role_id}
```

### Permissions Management

```bash
# Create permission
POST /api/v1/security/permissions
{
  "permission_name": "ADMIN",
  "description": "Admin access",
  "status": "ACTIVE"
}

# List permissions
GET /api/v1/security/permissions
GET /api/v1/security/permissions?status=ACTIVE

# Get specific permission
GET /api/v1/security/permissions/{permission_id}

# Update permission
PUT /api/v1/security/permissions/{permission_id}
{
  "status": "INACTIVE"
}
```

### Modules Management

```bash
# Create module
POST /api/v1/security/modules
{
  "module_name": "CustomModule",
  "description": "Custom module for trading",
  "status": "ACTIVE"
}

# List modules
GET /api/v1/security/modules
GET /api/v1/security/modules?status=ACTIVE

# Get specific module
GET /api/v1/security/modules/{module_id}

# Update module
PUT /api/v1/security/modules/{module_id}
{
  "status": "INACTIVE"
}
```

### Role-Permission Mappings

```bash
# Create mapping
POST /api/v1/security/role-permissions
{
  "role_id": "role_fo_user",
  "module_id": "mod_order_entry",
  "permission_id": "perm_read_write",
  "status": "ACTIVE"
}

# List mappings with details
GET /api/v1/security/role-permissions
GET /api/v1/security/role-permissions?role_id=role_fo_user
GET /api/v1/security/role-permissions?module_id=mod_order_entry

# Update mapping
PUT /api/v1/security/role-permissions/{mapping_id}
{
  "permission_id": "perm_read",
  "status": "ACTIVE"
}

# Delete mapping
DELETE /api/v1/security/role-permissions/{mapping_id}
```

### User Role Management

```bash
# Assign role to user
POST /api/v1/security/user-roles
{
  "user_id": "trader_001",
  "role_id": "role_fo_user",
  "assigned_by": "admin_user",
  "status": "ACTIVE"
}

# List user role assignments
GET /api/v1/security/user-roles
GET /api/v1/security/user-roles?user_id=trader_001
GET /api/v1/security/user-roles?role_id=role_fo_user

# Get user's roles and permissions
GET /api/v1/security/user-roles/{user_id}
# Returns: User with all their roles and permissions across modules

# Update user role
PUT /api/v1/security/user-roles/{user_role_id}
{
  "role_id": "role_bo_user",
  "status": "ACTIVE"
}

# Remove role from user
DELETE /api/v1/security/user-roles/{user_role_id}
```

### Security Configuration & Verification

```bash
# Get complete security configuration
GET /api/v1/security/config
# Returns: All roles, permissions, modules, and mappings

# Check user permission for a module
GET /api/v1/security/check-permission/{user_id}/{module_name}/{permission_type}
# Example: GET /api/v1/security/check-permission/trader_001/OrderEntry/READ_WRITE
# Returns: { "has_permission": true, "user_id": "trader_001", ... }
```

## Frontend UI

The Security module provides a comprehensive UI with 5 tabs:

### 1. Roles Tab
- **Create Role**: Form to create new roles
- **Roles List**: Table showing all roles with status
- **Actions**: Delete roles

### 2. Permissions Tab
- **Create Permission**: Form to add new permissions
- **Permissions List**: Table showing all permissions with descriptions

### 3. Modules Tab
- **Create Module**: Form to register new modules
- **Modules List**: Table showing all available modules

### 4. Role-Permission Mappings Tab
- **Create Mapping**: Associate roles with permissions for specific modules
- **Mappings Table**: View all role-permission-module combinations
- **Granular Control**: Can specify different permissions for same role on different modules

### 5. User Roles Tab
- **Assign Role**: Dropdown-based UI to assign roles to users
- **User Role Assignments**: Table showing who has which roles
- **Permission Summary**: View complete permission matrix for selected user
- **Show modules they can access and permission level (READ vs READ_WRITE)**

## Usage Examples

### Example 1: Granting FO_USER Full OrderEntry Access

1. Go to **Role-Permission Mappings** tab
2. Select:
   - Role: FO_USER
   - Module: OrderEntry
   - Permission: READ_WRITE
3. Click "Create Mapping"

Now all users with FO_USER role can create and manage orders.

### Example 2: Creating Custom Support Role with Read-Only Market Data Access

1. Go to **Roles** tab → Create Role:
   - Role Name: MARKET_ANALYST
   - Description: Market data analyst with view-only access
   
2. Go to **Role-Permission Mappings** tab:
   - Role: MARKET_ANALYST
   - Module: MarketData
   - Permission: READ
   - Create Mapping

3. Go to **User Roles** tab:
   - Select user
   - Assign MARKET_ANALYST role

### Example 3: Auditing User Permissions

1. Go to **User Roles** tab
2. Select a user from the dropdown in "User Permission Summary" section
3. View complete permission matrix showing:
   - Which roles user has
   - Which modules they can access
   - What operations they can perform (READ/READ_WRITE)

## Permission Checking

To verify permissions programmatically:

```bash
curl "http://localhost:8000/api/v1/security/check-permission/trader_001/OrderEntry/READ_WRITE"

# Response:
{
  "has_permission": true,
  "user_id": "trader_001",
  "module_name": "OrderEntry",
  "permission_type": "READ_WRITE"
}
```

## Frontend Integration

The Security module can be integrated with other modules to enforce permissions:

```javascript
// Example: Check if user can create orders
const response = await fetch(
  `/api/v1/security/check-permission/${userId}/OrderEntry/READ_WRITE`
);
const { has_permission } = await response.json();

if (!has_permission) {
  // Hide create order button
  // Show read-only view
}
```

## Security Best Practices

1. **Principle of Least Privilege**: Assign only necessary permissions to roles
2. **Role Naming**: Use clear naming conventions (ROLE_NAME_TYPE)
3. **Regular Audits**: Review user role assignments periodically
4. **Status Management**: Deactivate roles/permissions instead of deleting
5. **Change Tracking**: Monitor who assigns/removes roles via assigned_by field
6. **Module Isolation**: New modules should be registered before permission assignment

## Data Migration

The security tables are created via migration:
```
/alembic/versions/add_security_rbac_tables.py
```

The migration automatically:
- Creates all 5 tables with proper indexes
- Inserts default 3 roles (FO_USER, BO_USER, SUPPORT)
- Inserts default 2 permissions (READ, READ_WRITE)
- Inserts default 6 modules (all application modules)
- Creates default role-permission mappings with standard access levels

## Performance Considerations

- All tables have proper indexes on foreign keys and frequently queried fields
- Permission checks are optimized with indexed lookups
- Role assignment lookups use indexed queries for fast resolution
- Consider caching permission checks in high-throughput scenarios

## Future Enhancements

1. **Time-based Roles**: Roles that expire on specific dates
2. **Conditional Permissions**: Permissions based on business conditions
3. **Role Hierarchies**: Parent-child role relationships
4. **Permission Inheritance**: Inherit permissions from parent roles
5. **Audit Trail**: Complete history of all RBAC changes
6. **Integration with AD/LDAP**: Sync roles from enterprise directory


