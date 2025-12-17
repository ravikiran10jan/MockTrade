/**
 * Security Module - Models
 */

export const RoleType = {
  ADMIN: 'ADMIN',
  VIEWER: 'VIEWER',
  TRADER: 'TRADER',
};

export const PermissionType = {
  READ: 'READ',
  WRITE: 'WRITE',
  DELETE: 'DELETE',
};

export function createEmptyRole() {
  return {
    role_name: '',
    description: '',
    status: 'ACTIVE',
  };
}

export function createEmptyPermission() {
  return {
    permission_name: '',
    description: '',
    status: 'ACTIVE',
  };
}
