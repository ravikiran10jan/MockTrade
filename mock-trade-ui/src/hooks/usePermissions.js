import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * Custom hook for checking user permissions
 * @returns {Object} Permission checking functions and state
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);

  /**
   * Check if user has a specific permission for a module
   * @param {string} moduleName - The module name
   * @param {string} permissionType - The permission type (READ or READ_WRITE)
   * @returns {Promise<boolean>} - True if user has permission, false otherwise
   */
  const checkPermission = useCallback(async (moduleName, permissionType) => {
    // For ADMIN users, always allow access regardless of module permissions
    if (user?.role === "ADMIN") return true;
    
    if (!user?.id) return false;
    
    try {
      const token = localStorage.getItem('mocktrade_token');
      if (!token) return false;
      
      const response = await fetch(`${API_BASE}/api/v1/security/check-permission/${user.id}/${moduleName}/${permissionType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.has_permission;
      }
      return false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }, [user]);

  /**
   * Check if user has READ_WRITE permission for a module
   * @param {string} moduleName - The module name
   * @returns {Promise<boolean>} - True if user has READ_WRITE permission, false otherwise
   */
  const canEditModule = useCallback(async (moduleName) => {
    // For ADMIN users, always allow editing regardless of module permissions
    if (user?.role === "ADMIN") return true;
    return await checkPermission(moduleName, 'READ_WRITE');
  }, [user, checkPermission]);

  /**
   * Check if user has READ permission for a module
   * @param {string} moduleName - The module name
   * @returns {Promise<boolean>} - True if user has READ permission, false otherwise
   */
  const canViewModule = useCallback(async (moduleName) => {
    // For ADMIN users, always allow viewing regardless of module permissions
    if (user?.role === "ADMIN") return true;
    
    // If user has READ_WRITE, they automatically have READ permission
    const hasReadWrite = await checkPermission(moduleName, 'READ_WRITE');
    if (hasReadWrite) return true;
    
    return await checkPermission(moduleName, 'READ');
  }, [user, checkPermission]);

  /**
   * Check if user has any permission for a module (READ or READ_WRITE)
   * @param {string} moduleName - The module name
   * @returns {Promise<boolean>} - True if user has any permission, false otherwise
   */
  const hasAnyPermission = useCallback(async (moduleName) => {
    // For ADMIN users, always allow access regardless of module permissions
    if (user?.role === "ADMIN") return true;
    return await canViewModule(moduleName);
  }, [user, canViewModule]);

  /**
   * Load all user permissions
   * @returns {Promise<Object>} - Object with module permissions
   */
  const loadUserPermissions = useCallback(async () => {
    // For ADMIN users, always allow access regardless of module permissions
    if (user?.role === "ADMIN") return {};
    
    if (!user?.id) return {};
    
    setLoading(true);
    try {
      // In a real application, you might want to fetch all permissions at once
      // For now, we'll just provide the checking functions
      const perms = {};
      setPermissions(perms);
      return perms;
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions({});
      return {};
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    checkPermission,
    canEditModule,
    canViewModule,
    hasAnyPermission,
    loadUserPermissions,
    permissions,
    loading
  };
};

export default usePermissions;