import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Higher-order component that wraps modules with permission checking
 * @param {React.Component} WrappedComponent - The component to wrap
 * @param {string} moduleName - The name of the module
 * @returns {React.Component} - Wrapped component with permission checking
 */
const withModulePermission = (WrappedComponent, moduleName) => {
  return (props) => {
    const { canViewModule, canEditModule } = usePermissions();
    const [hasViewPermission, setHasViewPermission] = useState(false);
    const [hasEditPermission, setHasEditPermission] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
      const checkPermissions = async () => {
        try {
          const canView = await canViewModule(moduleName);
          const canEdit = await canEditModule(moduleName);
          
          setHasViewPermission(canView);
          setHasEditPermission(canEdit);
          
          if (!canView) {
            setMessage(`You don't have permission to access the ${moduleName} module.`);
          } else if (!canEdit) {
            setMessage(`You have read-only access to the ${moduleName} module.`);
          }
        } catch (error) {
          console.error('Error checking permissions:', error);
          setMessage("Error checking permissions. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      checkPermissions();
    }, [canViewModule, canEditModule]);

    if (loading) {
      return (
        <div style={{ padding: "20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
          <div style={{
            padding: "15px",
            backgroundColor: "#eff6ff",
            border: "1px solid #dbeafe",
            borderRadius: "6px",
            color: "#1e40af"
          }}>
            Checking permissions...
          </div>
        </div>
      );
    }

    if (!hasViewPermission) {
      return (
        <div style={{ padding: "20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
          <div style={{
            padding: "15px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            color: "#7f1d1d"
          }}>
            {message || `You don't have permission to access the ${moduleName} module.`}
          </div>
        </div>
      );
    }

    // Pass permission props to the wrapped component
    return (
      <WrappedComponent 
        {...props} 
        hasViewPermission={hasViewPermission}
        hasEditPermission={hasEditPermission}
        permissionMessage={message}
      />
    );
  };
};

export default withModulePermission;