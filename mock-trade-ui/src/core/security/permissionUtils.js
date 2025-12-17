/**
 * Utility functions for permission checking
 */

const API_BASE = import.meta.env.VITE_API_BASE || '';

// We need to get the auth headers from localStorage since this is a utility function
// In a real application, we would pass the auth context down or use a service
const getAuthHeaders = () => {
  const token = localStorage.getItem('mocktrade_token');
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
};

/**
 * Check if a user has a specific permission for a module
 * @param {string} userId - The user ID
 * @param {string} moduleName - The module name
 * @param {string} permissionType - The permission type (READ or READ_WRITE)
 * @returns {Promise<boolean>} - True if user has permission, false otherwise
 */
export const checkUserPermission = async (userId, moduleName, permissionType) => {
  try {
    const response = await fetch(`${API_BASE}/api/v1/security/check-permission/${userId}/${moduleName}/${permissionType}`, {
      headers: getAuthHeaders()
    });
    if (response.ok) {
      const data = await response.json();
      return data.has_permission;
    }
    return false;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
};

/**
 * Check if a user has READ_WRITE permission for a module
 * @param {string} userId - The user ID
 * @param {string} moduleName - The module name
 * @returns {Promise<boolean>} - True if user has READ_WRITE permission, false otherwise
 */
export const canEditModule = async (userId, moduleName) => {
  return await checkUserPermission(userId, moduleName, 'READ_WRITE');
};

/**
 * Check if a user has READ permission for a module
 * @param {string} userId - The user ID
 * @param {string} moduleName - The module name
 * @returns {Promise<boolean>} - True if user has READ permission, false otherwise
 */
export const canViewModule = async (userId, moduleName) => {
  // If user has READ_WRITE, they automatically have READ permission
  const hasReadWrite = await checkUserPermission(userId, moduleName, 'READ_WRITE');
  if (hasReadWrite) return true;
  
  return await checkUserPermission(userId, moduleName, 'READ');
};

/**
 * Check if a user has any permission for a module
 * @param {string} userId - The user ID
 * @param {string} moduleName - The module name
 * @returns {Promise<boolean>} - True if user has any permission, false otherwise
 */
export const hasAnyPermission = async (userId, moduleName) => {
  const hasRead = await canViewModule(userId, moduleName);
  return hasRead;
};

export default {
  checkUserPermission,
  canEditModule,
  canViewModule,
  hasAnyPermission
};