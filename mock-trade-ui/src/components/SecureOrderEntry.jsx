import React from "react";
import OrderEntry from './OrderEntry';
import PermissionGuard from './modules/PermissionGuard';

// Get user ID from environment or default to a test user
const USER_ID = import.meta.env.VITE_USER_ID || "0113468b-2781-420f-840a-b09436118f9d";

/**
 * Secure wrapper for OrderEntry that checks permissions before rendering
 */
function SecureOrderEntry(props) {
  return (
    <PermissionGuard
      userId={USER_ID}
      module="Order Entry"
      permission="READ_WRITE"
      fallback={
        <div style={{
          maxWidth: "1400px",
          backgroundColor: "#fff",
          borderRadius: "6px",
          padding: "20px",
          margin: "20px auto",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          border: "1px solid #e5e7eb",
          textAlign: "center"
        }}>
          <h2 style={{
            margin: "0 0 16px 0",
            fontSize: "15px",
            fontWeight: "700",
            color: "#1f2933"
          }}>
            Access Denied
          </h2>
          <p>You don't have permission to access the Order Entry module.</p>
          <p>Please contact your administrator to request appropriate permissions.</p>
        </div>
      }
    >
      <OrderEntry {...props} />
    </PermissionGuard>
  );
}

export default SecureOrderEntry;