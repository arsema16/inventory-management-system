import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { formatDateTime } from '../../utils/formatters';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details?: any;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  CREATE:          { bg: '#f0fdf4', color: '#15803d' },
  UPDATE:          { bg: '#eff6ff', color: '#1d4ed8' },
  DELETE:          { bg: '#fef2f2', color: '#b91c1c' },
  APPROVE:         { bg: '#f0fdfa', color: '#0d9488' },
  REJECT:          { bg: '#fef2f2', color: '#b91c1c' },
  FULFILL:         { bg: '#f0fdfa', color: '#0d9488' },
  RESTOCK:         { bg: '#f0fdf4', color: '#15803d' },
  COMPLETE:        { bg: '#f0fdfa', color: '#0d9488' },
  UPLOAD:          { bg: '#faf5ff', color: '#7c3aed' },
  CHANGE_PASSWORD: { bg: '#fefce8', color: '#a16207' },
};

const ENTITIES = ['All', 'Item', 'Vehicle', 'Request', 'VehicleSale', 'User', 'Department', 'Document'];
const ACTIONS  = ['All', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'FULFILL', 'RESTOCK', 'COMPLETE'];

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const LIMIT = 25;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (entityFilter !== 'All') params.entity = entityFilter;
      if (actionFilter !== 'All') params.action = actionFilter;
      const res = await api.get('/audit', { params });
      setLogs(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  }, [page, entityFilter, actionFilter]);

  useEffect(() => { setPage(1); }, [entityFilter, actionFilter]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>Audit Logs</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Full trail of every action in the system · {total} total records
          </p>
        </div>
        <button
          onClick={fetchLogs}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Entity</label>
          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#0f172a', cursor: 'pointer', outline: 'none' }}
          >
            {ENTITIES.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Action</label>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#0f172a', cursor: 'pointer', outline: 'none' }}
          >
            {ACTIONS.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Timestamp', 'User', 'Action', 'Entity', 'Entity ID'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => {
                  const ac = ACTION_COLORS[log.action] ?? { bg: '#f8fafc', color: '#475569' };
                  return (
                    <tr key={log.id} style={{ borderBottom: idx < logs.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background .1s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 12.5, color: '#475569', whiteSpace: 'nowrap' }}>
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                          {log.user.firstName} {log.user.lastName}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{log.user.role}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: ac.bg, color: ac.color, whiteSpace: 'nowrap' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#334155', fontWeight: 500 }}>
                        {log.entity}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
                        {log.entityId.slice(0, 8)}…
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Page {page} of {totalPages} · {total} records
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#cbd5e1' : '#475569' }}>
                ← Prev
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? '#cbd5e1' : '#475569' }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
