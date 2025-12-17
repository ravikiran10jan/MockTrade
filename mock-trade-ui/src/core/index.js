/**
 * Core Module - Main Entry Point
 * Central export point for all core functionality
 * 
 * Structure:
 * - api: HTTP client, API configuration, request helpers
 * - auth: Authentication context, protected routes
 * - security: Permissions, RBAC utilities, permission guards
 */

// API exports
export * from './api';

// Auth exports
export * from './auth';

// Security exports
export * from './security';
