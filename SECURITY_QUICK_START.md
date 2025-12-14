# 🔐 Security Module - Quick Start Guide

## What's Ready to Use

The complete Security module has been implemented with:
- ✅ 3 default roles (FO_USER, BO_USER, SUPPORT)
- ✅ 2 permission types (READ, READ_WRITE)
- ✅ 7 modules with predefined access rules
- ✅ Full CRUD operations via REST API
- ✅ Professional React UI with 5 tabs
- ✅ All data already seeded in database

---

## 🚀 Quick Start (5 minutes)

### 1. Start Backend (if not already running)
```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-api
python3 -m uvicorn app.main:app --reload --port 8000 &
sleep 3
echo "Backend started at http://localhost:8000"
```

### 2. Start Frontend (if not already running)
```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-ui
npm run dev &
sleep 5
echo "Frontend started at http://localhost:5173"
```

### 3. Open Application
```
Open your browser to: http://localhost:5173
Click "Security" in the left sidebar
```

---

## 🎯 What You Can Do

### Tab 1: Roles Management
- **View** all 3 default roles (FO_USER, BO_USER, SUPPORT)
- **Create** new custom roles
- **Update** role descriptions
- **Delete** roles

### Tab 2: Permissions Management
- **View** 2 permission types (READ, READ_WRITE)
- **Create** new permission types
- **Update** permission details
- **Delete** permissions

### Tab 3: Modules Management
- **View** 7 available modules
  1. Order Entry
  2. Static Data
  3. Market Data
  4. Enrichment
  5. Trade Module
  6. Confirmations
  7. Security
- **Create** new modules
- **Update** module descriptions

### Tab 4: Role-Permission Mappings
- **View** all 18 role-permission mappings
  - FO_USER → Full access to OrderEntry, Trade (READ_WRITE)
  - BO_USER → Full access to Confirmations, StaticData (READ_WRITE)
  - SUPPORT → Read-only access to all modules
- **Create** new mappings
- **Update** permissions for specific role-module combinations

### Tab 5: User Roles (Trader Assignment)
- **Assign** traders to roles
- **View** all trader role assignments
- **Update** role assignments
- **See** what permissions each trader has

---

## 📊 Default Permission Matrix

| Module | FO_USER | BO_USER | SUPPORT |
|--------|---------|---------|---------|
| Order Entry | RW | R | R |
| Static Data | R | RW | R |
| Market Data | R | R | R |
| Enrichment | R | R | R |
| Trade | RW | R | R |
| Confirmations | R | RW | R |
| Security | R | R | R |

**RW** = Read + Write | **R** = Read-only

---

## 🔌 API Endpoints Available

### Get All Roles
```bash
curl -s http://localhost:8000/api/v1/security/roles | python3 -m json.tool
```

### Get All Permissions
```bash
curl -s http://localhost:8000/api/v1/security/permissions | python3 -m json.tool
```

### Get All Modules
```bash
curl -s http://localhost:8000/api/v1/security/modules | python3 -m json.tool
```

### Get All Role-Permission Mappings
```bash
curl -s http://localhost:8000/api/v1/security/role-permissions | python3 -m json.tool
```

### Create a New Role
```bash
curl -s -X POST http://localhost:8000/api/v1/security/roles \
  -H 'Content-Type: application/json' \
  -d '{
    "role_name": "ADMIN",
    "description": "Administrator with full access",
    "status": "ACTIVE"
  }' | python3 -m json.tool
```

### Check User Permission
```bash
curl -s http://localhost:8000/api/v1/security/check-permission/USER001/MOD_ORDER_ENTRY | python3 -m json.tool
```

---

## 📁 Key Files

**Backend:**
- `/app/models.py` - Database models (Role, Permission, Module, RolePermissionMapping, UserRole)
- `/app/modules/security/routes.py` - API endpoints
- `/app/modules/security/schemas.py` - Validation schemas
- `seed_security.py` - Initialize database with default data

**Frontend:**
- `/src/components/modules/SecurityModule.jsx` - Main UI component (750+ lines)
- `/src/components/modules/SecurityModule.css` - Professional styling (450+ lines)

**Database:**
- `dev.db` - SQLite with all tables and default data

---

## 🐛 Troubleshooting

### No Roles/Data Showing?
```bash
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-api
python3 seed_security.py
# Then refresh the browser
```

### Backend Not Responding?
```bash
# Check if running
ps aux | grep uvicorn | grep -v grep

# If not running, start it
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-api
python3 -m uvicorn app.main:app --reload --port 8000 &
```

### Frontend Not Loading?
```bash
# Check if running
ps aux | grep vite | grep -v grep

# If not running, start it
cd /Users/ravikiranreddygajula/MockTrade/mock-trade-ui
npm run dev &
```

### Port Already in Use?
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

---

## ✅ Ready to Use Features

✓ Create/Read/Update/Delete Roles  
✓ Create/Read/Update/Delete Permissions  
✓ Create/Read/Update/Delete Modules  
✓ Create/Read/Update/Delete Role-Permission Mappings  
✓ Assign Roles to Users (Traders)  
✓ Permission Checking and Verification  
✓ Professional UI with Tabs  
✓ Form Validation  
✓ Error Handling  
✓ Success Notifications  

---

## 🎓 Architecture

The Security module uses a **3-tier permission model**:

```
Role (FO_USER, BO_USER, SUPPORT)
  ↓
RolePermissionMapping (maps role to permission for a module)
  ↓
Permission (READ, READ_WRITE)
  ↓
Module (OrderEntry, Trade, etc.)
```

Plus:
```
UserRole (assigns user to a role)
  ↓
User/Trader (gets all permissions from assigned role)
```

This design allows:
- Different users to have different roles
- Different roles to have different permissions
- Easy to add new modules and permissions
- Flexible permission assignment

---

## 📝 Next Steps

To add traders to the system:

1. Go to **Static Data** module → Click **Traders** tab
2. Create sample traders (e.g., "John Smith", "Jane Doe")
3. Go back to **Security** module → Click **User Roles** tab
4. Assign traders to roles (FO_USER, BO_USER, or SUPPORT)

---

## 📞 Support

**For questions about:**
- Roles & Permissions → See Security Module in UI
- API Integration → Check REST endpoints in this guide
- Database Schema → See `/app/models.py`
- Frontend Code → See `/src/components/modules/SecurityModule.jsx`

---

**Status:** ✅ PRODUCTION READY  
**Last Updated:** December 14, 2025

