/**
 * Security Module - API Service
 */

import { API_ENDPOINTS, apiFetch } from '../../../core/api';

export async function fetchRoles() {
  return await apiFetch(`${API_ENDPOINTS.SECURITY.BASE}/roles`);
}

export async function createRole(roleData) {
  return await apiFetch(`${API_ENDPOINTS.SECURITY.BASE}/roles`, {
    method: 'POST',
    body: JSON.stringify(roleData),
  });
}

export async function fetchPermissions() {
  return await apiFetch(`${API_ENDPOINTS.SECURITY.BASE}/permissions`);
}

export async function createPermission(permissionData) {
  return await apiFetch(`${API_ENDPOINTS.SECURITY.BASE}/permissions`, {
    method: 'POST',
    body: JSON.stringify(permissionData),
  });
}

export async function assignPermission(roleId, permissionId) {
  return await apiFetch(`${API_ENDPOINTS.SECURITY.BASE}/role-permissions`, {
    method: 'POST',
    body: JSON.stringify({ role_id: roleId, permission_id: permissionId }),
  });
}
