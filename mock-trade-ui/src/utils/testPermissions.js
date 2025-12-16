/**
 * Test script for verifying permission enforcement
 */

import { checkUserPermission, canEditModule, canViewModule, hasAnyPermission } from './permissionUtils';

// Test user (Ravi with SUPPORT role)
const TEST_USER_ID = "0113468b-2781-420f-840a-b09436118f9d";

// Available modules
const MODULES = [
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

/**
 * Test all permissions for a user
 */
async function testAllPermissions() {
  console.log('=== Permission Testing Report ===');
  console.log(`User ID: ${TEST_USER_ID}`);
  console.log('');

  for (const module of MODULES) {
    console.log(`--- Module: ${module} ---`);
    
    // Test READ permission
    const canRead = await canViewModule(TEST_USER_ID, module);
    console.log(`READ permission: ${canRead ? 'GRANTED' : 'DENIED'}`);
    
    // Test READ_WRITE permission
    const canWrite = await canEditModule(TEST_USER_ID, module);
    console.log(`READ_WRITE permission: ${canWrite ? 'GRANTED' : 'DENIED'}`);
    
    // Test specific permission checks
    const hasRead = await checkUserPermission(TEST_USER_ID, module, 'READ');
    const hasReadWrite = await checkUserPermission(TEST_USER_ID, module, 'READ_WRITE');
    
    console.log(`Direct READ check: ${hasRead ? 'YES' : 'NO'}`);
    console.log(`Direct READ_WRITE check: ${hasReadWrite ? 'YES' : 'NO'}`);
    
    // Test hasAnyPermission
    const hasAny = await hasAnyPermission(TEST_USER_ID, module);
    console.log(`Any permission: ${hasAny ? 'YES' : 'NO'}`);
    
    console.log('');
  }
  
  console.log('=== End of Report ===');
}

/**
 * Test specific scenarios
 */
async function testScenarios() {
  console.log('\n=== Scenario Testing ===');
  
  // Test with a user that doesn't exist
  console.log('--- Testing with non-existent user ---');
  const nonExistentUser = "invalid-user-id";
  const result = await canViewModule(nonExistentUser, 'Order Entry');
  console.log(`Non-existent user can view Order Entry: ${result ? 'YES' : 'NO'}`);
  
  // Test with invalid module
  console.log('--- Testing with invalid module ---');
  const invalidModuleResult = await canViewModule(TEST_USER_ID, 'Invalid Module');
  console.log(`User can view Invalid Module: ${invalidModuleResult ? 'YES' : 'NO'}`);
  
  // Test with invalid permission type
  console.log('--- Testing with invalid permission type ---');
  try {
    const invalidPermResult = await checkUserPermission(TEST_USER_ID, 'Order Entry', 'INVALID_PERM');
    console.log(`User has INVALID_PERM on Order Entry: ${invalidPermResult ? 'YES' : 'NO'}`);
  } catch (error) {
    console.log(`Error with invalid permission type: ${error.message}`);
  }
  
  console.log('=== End of Scenario Testing ===\n');
}

// Run tests
async function runTests() {
  try {
    await testAllPermissions();
    await testScenarios();
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Export for use in other modules
export {
  testAllPermissions,
  testScenarios,
  runTests
};

// Run if called directly
if (typeof window === 'undefined') {
  // Node.js environment
  runTests();
}

export default {
  testAllPermissions,
  testScenarios,
  runTests
};