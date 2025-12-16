import React, { useState } from 'react';
import PermissionGuard from './PermissionGuard';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Demo component showing how to use the permission system
 */
const PermissionDemo = () => {
  const [userId, setUserId] = useState('');
  const [selectedModule, setSelectedModule] = useState('Order Entry');
  const { canEdit, canView, loading } = usePermissions(userId);

  const modules = [
    'Order Entry',
    'Enrichment',
    'Trade Query',
    'Confirmations',
    'Settlement Monitor',
    'Accounting',
    'Static Data',
    'Market Data',
    'Security'
  ];

  const handleCheckPermissions = async () => {
    if (!userId) return;
    
    const canEditResult = await canEdit(selectedModule);
    const canViewResult = await canView(selectedModule);
    
    console.log(`User ${userId} permissions for ${selectedModule}:`);
    console.log(`Can Edit: ${canEditResult}`);
    console.log(`Can View: ${canViewResult}`);
  };

  return (
    <div className="permission-demo">
      <h2>Permission System Demo</h2>
      
      <div className="form-group">
        <label>User ID:</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID"
        />
      </div>
      
      <div className="form-group">
        <label>Module:</label>
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
        >
          {modules.map((module) => (
            <option key={module} value={module}>{module}</option>
          ))}
        </select>
      </div>
      
      <button 
        onClick={handleCheckPermissions} 
        disabled={!userId || loading}
        className="btn btn-primary"
      >
        {loading ? 'Checking...' : 'Check Permissions'}
      </button>
      
      <div className="permission-results">
        <h3>Protected Content Examples:</h3>
        
        {/* Example of protecting content with READ permission */}
        <PermissionGuard
          userId={userId}
          module={selectedModule}
          permission="READ"
          fallback={<div className="permission-denied">You don't have permission to view this content</div>}
        >
          <div className="protected-content">
            <h4>View-Only Content</h4>
            <p>This content is visible to users with READ or READ_WRITE permissions.</p>
          </div>
        </PermissionGuard>
        
        {/* Example of protecting content with READ_WRITE permission */}
        <PermissionGuard
          userId={userId}
          module={selectedModule}
          permission="READ_WRITE"
          fallback={<div className="permission-denied">You need READ_WRITE permission to edit this content</div>}
        >
          <div className="protected-content editable">
            <h4>Editable Content</h4>
            <p>This content is only visible to users with READ_WRITE permissions.</p>
            <button className="btn btn-primary">Edit</button>
            <button className="btn btn-danger">Delete</button>
          </div>
        </PermissionGuard>
      </div>
    </div>
  );
};

export default PermissionDemo;