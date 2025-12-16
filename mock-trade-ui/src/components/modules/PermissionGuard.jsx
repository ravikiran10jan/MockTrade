import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Component that conditionally renders children based on user permissions
 * @param {Object} props - Component props
 * @param {string} props.module - The module name to check permissions for
 * @param {string} props.permission - The permission type to check (READ or READ_WRITE)
 * @param {React.ReactNode} props.children - Children to render if permission is granted
 * @param {React.ReactNode} props.fallback - Fallback to render if permission is denied
 * @returns {React.ReactNode} - Rendered component based on permission
 */
const PermissionGuard = ({ module, permission, children, fallback = null }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const { checkPermission } = usePermissions();

  useEffect(() => {
    const checkPerm = async () => {
      if (!module || !permission) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      try {
        const perm = await checkPermission(module, permission);
        setHasPermission(perm);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPerm();
  }, [module, permission, checkPermission]);

  if (loading) {
    return <div className="permission-loading">Checking permissions...</div>;
  }

  return hasPermission ? children : fallback;
};

export default PermissionGuard;