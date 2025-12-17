import React, { useState, useEffect } from 'react';
import { useAuth } from '../../core/auth';
import './SecurityModule.css';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const SecurityModule = () => {
  const { getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [traders, setTraders] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [newRole, setNewRole] = useState({ role_name: '', description: '' });
  const [newPermission, setNewPermission] = useState({ permission_name: '', description: '' });
  const [newModule, setNewModule] = useState({ module_name: '', description: '' });
  const [newMapping, setNewMapping] = useState({ role_id: '', module_id: '', permission_id: '' });
  const [newUserRole, setNewUserRole] = useState({ user_id: '', role_id: '' });

  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');

    try {
      const [rolesRes, permsRes, modsRes, mappingsRes, traderRes, userRolesRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/security/roles`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/v1/security/permissions`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/v1/security/modules`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/v1/security/role-permissions`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/v1/static-data/traders`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/v1/security/user-roles`, { headers: getAuthHeaders() })
      ]);

      if (!rolesRes.ok) throw new Error('Failed to fetch roles');
      if (!permsRes.ok) throw new Error('Failed to fetch permissions');
      if (!modsRes.ok) throw new Error('Failed to fetch modules');
      if (!mappingsRes.ok) throw new Error('Failed to fetch role-permission mappings');
      if (!traderRes.ok) throw new Error('Failed to fetch traders');
      if (!userRolesRes.ok) throw new Error('Failed to fetch user roles');

      const rolesData = await rolesRes.json();
      const permsData = await permsRes.json();
      const modsData = await modsRes.json();
      const mappingsData = await mappingsRes.json();
      const traderData = await traderRes.json();
      const userRolesData = await userRolesRes.json();

      setRoles(rolesData);
      setPermissions(permsData);
      setModules(modsData);
      setRolePermissions(mappingsData);
      setTraders(traderData);
      setUserRoles(userRolesData);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Create Role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRole.role_name) {
      setError('Role name is required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/security/roles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newRole)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to create role');
      }

      const created = await response.json();
      setRoles([...roles, created]);
      setNewRole({ role_name: '', description: '' });
      setSuccess('Role created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Create Permission
  const handleCreatePermission = async (e) => {
    e.preventDefault();
    if (!newPermission.permission_name) {
      setError('Permission name is required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/security/permissions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newPermission)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to create permission');
      }

      const created = await response.json();
      setPermissions([...permissions, created]);
      setNewPermission({ permission_name: '', description: '' });
      setSuccess('Permission created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Create Module
  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModule.module_name) {
      setError('Module name is required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/security/modules`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newModule)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to create module');
      }

      const created = await response.json();
      setModules([...modules, created]);
      setNewModule({ module_name: '', description: '' });
      setSuccess('Module created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Create Role-Permission Mapping
  const handleCreateMapping = async (e) => {
    e.preventDefault();
    if (!newMapping.role_id || !newMapping.module_id || !newMapping.permission_id) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/security/role-permissions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newMapping)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to create mapping');
      }

      const created = await response.json();
      setRolePermissions([...rolePermissions, created]);
      setNewMapping({ role_id: '', module_id: '', permission_id: '' });
      setSuccess('Role-Permission mapping created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Assign Role to User
  const handleAssignUserRole = async (e) => {
    e.preventDefault();
    if (!newUserRole.user_id || !newUserRole.role_id) {
      setError('Both user and role are required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/security/user-roles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newUserRole)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to assign role');
      }

      const created = await response.json();
      setUserRoles([...userRoles, created]);
      setNewUserRole({ user_id: '', role_id: '' });
      setSuccess('Role assigned to user successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Role
  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/v1/security/roles/${roleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete role');

      setRoles(roles.filter(r => r.role_id !== roleId));
      setSuccess('Role deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete User Role
  const handleDeleteUserRole = async (userRoleId) => {
    if (!window.confirm('Are you sure you want to remove this role from the user?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/v1/security/user-roles/${userRoleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete user role');

      setUserRoles(userRoles.filter(ur => ur.user_role_id !== userRoleId));
      setSuccess('User role removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Get user permissions
  const handleSelectUser = async (userId) => {
    setSelectedUser(userId);

    try {
      const response = await fetch(`${API_BASE}/api/v1/security/user-roles/${userId}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setUserPermissions(data);
      }
    } catch {
      setError('Failed to fetch user permissions');
    }
  };

  // Check if user has specific permission for a module
  const checkUserPermission = async (userId, moduleName, permissionType) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/security/check-permission/${userId}/${moduleName}/${permissionType}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        return data.has_permission;
      }
      return false;
    } catch {
      return false;
    }
  };


  const getRoleName = (roleId) => {
    const role = roles.find(r => r.role_id === roleId);
    return role ? role.role_name : roleId;
  };

  const getTraderName = (traderId) => {
    const trader = traders.find(t => t.trader_id === traderId);
    return trader ? trader.name : traderId;
  };

  return (
    <div className="security-module">
      <div className="security-header">
        <h1>Security & Access Control</h1>
        <p>Manage roles, permissions, and user access</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            Roles
          </button>
          <button
            className={`tab ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissions')}
          >
            Permissions
          </button>
          <button
            className={`tab ${activeTab === 'modules' ? 'active' : ''}`}
            onClick={() => setActiveTab('modules')}
          >
            Modules
          </button>
          <button
            className={`tab ${activeTab === 'mappings' ? 'active' : ''}`}
            onClick={() => setActiveTab('mappings')}
          >
            Role-Permission Mappings
          </button>
          <button
            className={`tab ${activeTab === 'user-roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('user-roles')}
          >
            User Roles
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading...</div>}

      {/* ROLES TAB */}
      {activeTab === 'roles' && !loading && (
        <div className="tab-content">
          <div className="form-section">
            <h2>Create New Role</h2>
            <form onSubmit={handleCreateRole}>
              <div className="form-group">
                <label>Role Name</label>
                <input
                  type="text"
                  placeholder="e.g., FO_USER, BO_USER, SUPPORT"
                  value={newRole.role_name}
                  onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Role description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  rows="3"
                />
              </div>
              <button type="submit" className="btn btn-primary">Create Role</button>
            </form>
          </div>

          <div className="list-section">
            <h2>Roles</h2>
            {roles.length === 0 ? (
              <p className="empty-state">No roles found</p>
            ) : (
              <div className="scrollable-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Role Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.role_id}>
                        <td className="role-name">{role.role_name}</td>
                        <td>{role.description || '-'}</td>
                        <td>
                          <span className={`badge badge-${role.status.toLowerCase()}`}>
                            {role.status}
                          </span>
                        </td>
                        <td>{new Date(role.created_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => handleDeleteRole(role.role_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PERMISSIONS TAB */}
      {activeTab === 'permissions' && !loading && (
        <div className="tab-content">
          <div className="form-section">
            <h2>Create New Permission</h2>
            <form onSubmit={handleCreatePermission}>
              <div className="form-group">
                <label>Permission Name</label>
                <input
                  type="text"
                  placeholder="e.g., READ, READ_WRITE"
                  value={newPermission.permission_name}
                  onChange={(e) => setNewPermission({ ...newPermission, permission_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Permission description"
                  value={newPermission.description}
                  onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                  rows="3"
                />
              </div>
              <button type="submit" className="btn btn-primary">Create Permission</button>
            </form>
          </div>

          <div className="list-section">
            <h2>Permissions</h2>
            {permissions.length === 0 ? (
              <p className="empty-state">No permissions found</p>
            ) : (
              <div className="scrollable-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Permission Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((perm) => (
                      <tr key={perm.permission_id}>
                        <td className="permission-name">{perm.permission_name}</td>
                        <td>{perm.description || '-'}</td>
                        <td>
                          <span className={`badge badge-${perm.status.toLowerCase()}`}>
                            {perm.status}
                          </span>
                        </td>
                        <td>{new Date(perm.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULES TAB */}
      {activeTab === 'modules' && !loading && (
        <div className="tab-content">
          <div className="form-section">
            <h2>Create New Module</h2>
            <form onSubmit={handleCreateModule}>
              <div className="form-group">
                <label>Module Name</label>
                <input
                  type="text"
                  placeholder="e.g., OrderEntry, StaticData, MarketData"
                  value={newModule.module_name}
                  onChange={(e) => setNewModule({ ...newModule, module_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Module description"
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  rows="3"
                />
              </div>
              <button type="submit" className="btn btn-primary">Create Module</button>
            </form>
          </div>

          <div className="list-section">
            <h2>Modules</h2>
            {modules.length === 0 ? (
              <p className="empty-state">No modules found</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Module Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((mod) => (
                    <tr key={mod.module_id}>
                      <td className="module-name">{mod.module_name}</td>
                      <td>{mod.description || '-'}</td>
                      <td>
                        <span className={`badge badge-${mod.status.toLowerCase()}`}>
                          {mod.status}
                        </span>
                      </td>
                      <td>{new Date(mod.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ROLE-PERMISSION MAPPINGS TAB */}
      {activeTab === 'mappings' && !loading && (
        <div className="tab-content">
          <div className="form-section">
            <h2>Create Role-Permission Mapping</h2>
            <form onSubmit={handleCreateMapping}>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newMapping.role_id}
                    onChange={(e) => setNewMapping({ ...newMapping, role_id: e.target.value })}
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Module</label>
                  <select
                    value={newMapping.module_id}
                    onChange={(e) => setNewMapping({ ...newMapping, module_id: e.target.value })}
                  >
                    <option value="">Select Module</option>
                    {modules
                      .filter(mod => mod.module_name !== 'All')
                      .map((mod) => (
                        <option key={mod.module_id} value={mod.module_id}>
                          {mod.module_name}
                        </option>
                      ))}
                  </select>
                  <p className="form-help-text">Note: Select "All" module only for global permissions</p>
                </div>
                <div className="form-group">
                  <label>Permission</label>
                  <select
                    value={newMapping.permission_id}
                    onChange={(e) => setNewMapping({ ...newMapping, permission_id: e.target.value })}
                  >
                    <option value="">Select Permission</option>
                    {permissions.map((perm) => (
                      <option key={perm.permission_id} value={perm.permission_id}>
                        {perm.permission_name}
                      </option>
                    ))}
                  </select>
                  <div className="permission-explanation">
                    <p><strong>READ</strong>: View-only access</p>
                    <p><strong>READ_WRITE</strong>: Full access (view and edit)</p>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Create Mapping</button>
            </form>
          </div>

          <div className="list-section">
            <h2>Role-Permission Mappings</h2>
            {rolePermissions.length === 0 ? (
              <p className="empty-state">No mappings found</p>
            ) : (
              <div className="scrollable-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Module</th>
                      <th>Permission</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rolePermissions.map((mapping) => (
                      <tr key={mapping.mapping_id}>
                        <td>{mapping.role_name}</td>
                        <td>{mapping.module_name}</td>
                        <td>
                          <span className="permission-badge">{mapping.permission_name}</span>
                        </td>
                        <td>
                          <span className={`badge badge-${mapping.status.toLowerCase()}`}>
                            {mapping.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* USER ROLES TAB */}
      {activeTab === 'user-roles' && !loading && (
        <div className="tab-content">
          <div className="form-section">
            <h2>Assign Role to User</h2>
            <form onSubmit={handleAssignUserRole}>
              <div className="form-row">
                <div className="form-group">
                  <label>User (Trader)</label>
                  <select
                    value={newUserRole.user_id}
                    onChange={(e) => setNewUserRole({ ...newUserRole, user_id: e.target.value })}
                  >
                    <option value="">Select User</option>
                    {traders.map((trader) => (
                      <option key={trader.trader_id} value={trader.trader_id}>
                        {trader.name} ({trader.user_id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newUserRole.role_id}
                    onChange={(e) => setNewUserRole({ ...newUserRole, role_id: e.target.value })}
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Assign Role</button>
            </form>
          </div>

          <div className="list-section">
            <h2>User Role Assignments</h2>
            {userRoles.length === 0 ? (
              <p className="empty-state">No user role assignments found</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Assigned At</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userRoles.map((ur) => (
                    <tr key={ur.user_role_id}>
                      <td className="user-name">{getTraderName(ur.user_id)}</td>
                      <td className="role-name">{getRoleName(ur.role_id)}</td>
                      <td>{new Date(ur.assigned_at).toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-${ur.status.toLowerCase()}`}>
                          {ur.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDeleteUserRole(ur.user_role_id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* User Permission Summary */}
          <div className="list-section">
            <h2>User Permission Summary</h2>
            <div className="form-group">
              <label>Select User to View Permissions</label>
              <select onChange={(e) => handleSelectUser(e.target.value)}>
                <option value="">Select a user...</option>
                {traders.map((trader) => (
                  <option key={trader.trader_id} value={trader.trader_id}>
                    {trader.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedUser && userPermissions.length > 0 && (
              <div className="user-permissions-summary">
                <h3>{getTraderName(selectedUser)} Permissions</h3>
                <div className="permissions-grid">
                  <div className="module-grid-header">
                    <div className="module-name">Module</div>
                    <div className="permission-status">READ</div>
                    <div className="permission-status">READ_WRITE</div>
                  </div>
                  {modules
                    .filter(mod => mod.module_name !== 'All')
                    .map((module) => {
                      // Find permissions for this module across all user roles
                      const modulePermissions = userPermissions.flatMap(up => 
                        up.permissions.filter(p => p.module_name === module.module_name)
                      );
                      
                      const hasRead = modulePermissions.some(p => p.permission_name === 'READ');
                      const hasReadWrite = modulePermissions.some(p => p.permission_name === 'READ_WRITE');
                      
                      return (
                        <div key={module.module_id} className="module-permission-row">
                          <div className="module-name">{module.module_name}</div>
                          <div className="permission-status">
                            <span className={`permission-indicator ${hasRead ? 'has-permission' : 'no-permission'}`}>
                              {hasRead ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="permission-status">
                            <span className={`permission-indicator ${hasReadWrite ? 'has-permission' : 'no-permission'}`}>
                              {hasReadWrite ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            )}

            {selectedUser && userPermissions.length === 0 && (
              <p className="empty-state">No permissions assigned to this user</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityModule;