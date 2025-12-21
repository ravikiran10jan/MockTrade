/**
 * Trade Audit Trail Modal Component
 * Displays the lifecycle events and history for a specific trade
 */

import React, { useState, useEffect } from 'react';
import { fetchTradeAuditTrail } from '../services/tradeQueryApi';

const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const EVENT_TYPE_COLORS = {
  CREATED: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  CANCELLED: { bg: '#fee2e2', text: '#7f1d1d', border: '#fecaca' },
  EXPIRED: { bg: '#fef3c7', text: '#78350f', border: '#fde68a' },
  ALLOCATED: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  SETTLED: { bg: '#e9d5ff', text: '#581c87', border: '#d8b4fe' },
  UNDO: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
};

function TradeAuditTrailModal({ tradeId, onClose }) {
  const [auditTrail, setAuditTrail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAuditTrail();
  }, [tradeId]);

  const loadAuditTrail = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTradeAuditTrail(tradeId);
      setAuditTrail(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading audit trail:', err);
      setError('Failed to load audit trail');
      setAuditTrail([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getEventTypeColor = (eventType) => {
    return EVENT_TYPE_COLORS[eventType] || { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: FONT_FAMILY,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2933' }}>
              Trade Audit Trail
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              Trade ID: {String(tradeId).substring(0, 12)}...
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: '13px' }}>
              Loading audit trail...
            </div>
          ) : error ? (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#fee2e2',
                color: '#7f1d1d',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              {error}
            </div>
          ) : auditTrail.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: '13px' }}>
              No audit trail entries found
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Timeline line */}
              <div
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '20px',
                  bottom: '20px',
                  width: '2px',
                  backgroundColor: '#e5e7eb',
                }}
              />

              {/* Audit trail entries */}
              {auditTrail.map((entry, index) => {
                const colors = getEventTypeColor(entry.event_type);
                return (
                  <div
                    key={entry.audit_id}
                    style={{
                      position: 'relative',
                      paddingLeft: '50px',
                      paddingBottom: index < auditTrail.length - 1 ? '24px' : '0',
                    }}
                  >
                    {/* Timeline dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '0',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: colors.bg,
                        border: `2px solid ${colors.border}`,
                        zIndex: 1,
                      }}
                    />

                    {/* Event card */}
                    <div
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                      }}
                    >
                      {/* Event header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '3px',
                            fontSize: '10px',
                            fontWeight: '700',
                            backgroundColor: colors.bg,
                            color: colors.text,
                            border: `1px solid ${colors.border}`,
                          }}
                        >
                          {entry.event_type}
                        </span>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>
                          {formatDateTime(entry.created_at)}
                        </span>
                      </div>

                      {/* Event description */}
                      {entry.event_description && (
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#1f2933', fontWeight: '500' }}>
                          {entry.event_description}
                        </p>
                      )}

                      {/* Status change */}
                      {entry.old_status && entry.new_status && (
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>
                          Status: <span style={{ fontWeight: '600' }}>{entry.old_status}</span> →{' '}
                          <span style={{ fontWeight: '600' }}>{entry.new_status}</span>
                        </div>
                      )}

                      {/* Changed by */}
                      {entry.changed_by && (
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>
                          Changed by: <span style={{ fontWeight: '600' }}>{entry.changed_by}</span>
                        </div>
                      )}

                      {/* Metadata */}
                      {entry.event_metadata && Object.keys(entry.event_metadata).length > 0 && (
                        <details style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
                          <summary
                            style={{
                              cursor: 'pointer',
                              fontWeight: '600',
                              color: '#4b5563',
                              userSelect: 'none',
                            }}
                          >
                            Details
                          </summary>
                          <pre
                            style={{
                              marginTop: '8px',
                              padding: '8px',
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '3px',
                              fontSize: '10px',
                              overflowX: 'auto',
                            }}
                          >
                            {JSON.stringify(entry.event_metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: FONT_FAMILY,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TradeAuditTrailModal;
