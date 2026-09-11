import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Request, VehicleSale } from '../../types';
import { formatDateTime, formatCurrency, formatStatus } from '../../utils/formatters';

/* ─── small helpers ─── */
const Badge = ({ label, bg, color }: { label: string; bg: string; color: string }) => (
  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: bg, color }}>{label}</span>
);

const STATUS_CFG: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: '#fefce8', color: '#a16207' },
  APPROVED:  { bg: '#f0fdf4', color: '#15803d' },
  REJECTED:  { bg: '#fef2f2', color: '#b91c1c' },
  FULFILLED: { bg: '#f0fdfa', color: '#0d9488' },
  COMPLETED: { bg: '#f0fdfa', color: '#0d9488' },
  CANCELLED: { bg: '#f8fafc', color: '#64748b' },
};

/* ─── Reject / Comment modal ─── */
function RejectModal({
  title, label, onConfirm, onCancel, loading,
}: {
  title: string; label: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.45)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{title}</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>{label}</p>
        <textarea
          value={reason} onChange={e => setReason(e.target.value)}
          placeholder="Enter reason…" rows={3}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
          onFocus={e => { e.target.style.borderColor = '#14b8a6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)'; }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={!reason.trim() || loading}
            style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 13, cursor: reason.trim() && !loading ? 'pointer' : 'not-allowed', opacity: reason.trim() && !loading ? 1 : 0.5 }}
          >
            {loading ? 'Submitting…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Approve with optional comment modal ─── */
function ApproveModal({
  title, onConfirm, onCancel, loading,
}: {
  title: string;
  onConfirm: (comment: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [comment, setComment] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.45)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{title}</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Optional: add a comment for the requester.</p>
        <textarea
          value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Comment (optional)…" rows={3}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
          onFocus={e => { e.target.style.borderColor = '#14b8a6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)'; }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(comment)}
            disabled={loading}
            style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#15803d,#22c55e)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Approving…' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ MAIN ═══════════════════ */
export default function ApprovalCenter() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'requests' | 'sales'>('requests');

  const [requests, setRequests] = useState<Request[]>([]);
  const [sales, setSales]       = useState<VehicleSale[]>([]);
  const [loading, setLoading]   = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal state
  const [approveTarget, setApproveTarget] = useState<{ id: string; type: 'request' | 'sale'; label: string } | null>(null);
  const [rejectTarget,  setRejectTarget]  = useState<{ id: string; type: 'request' | 'sale'; label: string } | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, sRes] = await Promise.allSettled([
        api.get('/requests', { params: { status: 'PENDING' } }),
        api.get('/sales',    { params: { status: 'PENDING' } }),
      ]);
      if (rRes.status === 'fulfilled') setRequests(rRes.value.data.data ?? []);
      if (sRes.status === 'fulfilled') setSales(sRes.value.data.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  /* ─── Actions ─── */
  const approveRequest = async (id: string, comment: string) => {
    setActionLoading(true);
    try {
      await api.post(`/requests/${id}/approve`, { comments: comment });
      setApproveTarget(null);
      fetch();
    } catch (e: any) { alert(e.response?.data?.message || 'Failed to approve'); }
    finally { setActionLoading(false); }
  };

  const rejectRequest = async (id: string, reason: string) => {
    setActionLoading(true);
    try {
      await api.post(`/requests/${id}/reject`, { reason });
      setRejectTarget(null);
      fetch();
    } catch (e: any) { alert(e.response?.data?.message || 'Failed to reject'); }
    finally { setActionLoading(false); }
  };

  const approveSale = async (id: string, comment: string) => {
    setActionLoading(true);
    try {
      await api.post(`/sales/${id}/approve`, { comments: comment });
      setApproveTarget(null);
      fetch();
    } catch (e: any) { alert(e.response?.data?.message || 'Failed to approve'); }
    finally { setActionLoading(false); }
  };

  const rejectSale = async (id: string, reason: string) => {
    setActionLoading(true);
    try {
      await api.post(`/sales/${id}/reject`, { reason });
      setRejectTarget(null);
      fetch();
    } catch (e: any) { alert(e.response?.data?.message || 'Failed to reject'); }
    finally { setActionLoading(false); }
  };

  const handleApproveConfirm = (comment: string) => {
    if (!approveTarget) return;
    if (approveTarget.type === 'request') approveRequest(approveTarget.id, comment);
    else approveSale(approveTarget.id, comment);
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectTarget) return;
    if (rejectTarget.type === 'request') rejectRequest(rejectTarget.id, reason);
    else rejectSale(rejectTarget.id, reason);
  };

  const total = requests.length + sales.length;

  return (
    <div>
      {/* Modals */}
      {approveTarget && (
        <ApproveModal
          title={`Approve ${approveTarget.label}`}
          onConfirm={handleApproveConfirm}
          onCancel={() => setApproveTarget(null)}
          loading={actionLoading}
        />
      )}
      {rejectTarget && (
        <RejectModal
          title={`Reject ${rejectTarget.label}`}
          label="Please provide a rejection reason."
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
          loading={actionLoading}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>Approval Center</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Review and approve pending requests and vehicle sales
          </p>
        </div>
        <button onClick={fetch}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Pending',    value: total,           color: '#d97706' },
          { label: 'Pending Requests', value: requests.length, color: '#1d4ed8' },
          { label: 'Pending Sales',    value: sales.length,    color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color, marginTop: 4 }}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {!loading && total === 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '60px 32px', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>All caught up!</p>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 6 }}>No pending approvals at this time.</p>
        </div>
      )}

      {!loading && total > 0 && (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
            {([
              { key: 'requests', label: `Requests (${requests.length})` },
              { key: 'sales',    label: `Vehicle Sales (${sales.length})` },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding: '7px 20px', borderRadius: 7, border: 'none', background: tab === t.key ? '#fff' : 'transparent', color: tab === t.key ? '#0f172a' : '#64748b', fontWeight: tab === t.key ? 700 : 500, fontSize: 13, cursor: 'pointer', boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all .15s', whiteSpace: 'nowrap' }}>
                {t.label}
                {tab === t.key && (t.key === 'requests' ? requests.length : sales.length) > 0 && (
                  <span style={{ marginLeft: 6, background: '#f97316', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 999 }}>
                    {t.key === 'requests' ? requests.length : sales.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ─── Requests tab ─── */}
          {tab === 'requests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {requests.length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No pending requests
                </div>
              ) : requests.map(req => {
                const sc = STATUS_CFG[req.status] ?? STATUS_CFG.PENDING;
                return (
                  <div key={req.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', borderLeft: '4px solid #f97316' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      {/* Left info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{req.requestNumber}</span>
                          <Badge label={formatStatus(req.type)} bg="#eff6ff" color="#1d4ed8" />
                          <Badge label={formatStatus(req.status)} bg={sc.bg} color={sc.color} />
                        </div>
                        <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>
                          <strong>{req.requestedBy.firstName} {req.requestedBy.lastName}</strong>
                          {req.requestedBy.department && <span style={{ color: '#94a3b8' }}> · {req.requestedBy.department.name}</span>}
                        </div>
                        {req.reason && (
                          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontStyle: 'italic' }}>"{req.reason}"</p>
                        )}
                        {/* Items summary */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                          {req.items.map(item => (
                            <span key={item.id} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#f1f5f9', color: '#475569', fontWeight: 500 }}>
                              {item.item.name} × {item.quantity} {item.item.unit}
                            </span>
                          ))}
                        </div>
                        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>Submitted {formatDateTime(req.createdAt)}</p>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                        <button
                          onClick={() => setApproveTarget({ id: req.id, type: 'request', label: req.requestNumber })}
                          style={{ padding: '9px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#15803d,#22c55e)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 8px rgba(21,128,61,0.25)' }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => setRejectTarget({ id: req.id, type: 'request', label: req.requestNumber })}
                          style={{ padding: '9px 16px', borderRadius: 9, border: '1.5px solid #fecaca', background: '#fff', color: '#dc2626', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                        >
                          ✕ Reject
                        </button>
                        <button
                          onClick={() => navigate(`/requests/${req.id}`)}
                          style={{ padding: '7px 16px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── Sales tab ─── */}
          {tab === 'sales' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sales.length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No pending sales
                </div>
              ) : sales.map(sale => {
                const sc = STATUS_CFG[sale.status] ?? STATUS_CFG.PENDING;
                return (
                  <div key={sale.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', borderLeft: '4px solid #7c3aed' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      {/* Left info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{sale.saleNumber}</span>
                          <Badge label={formatStatus(sale.status)} bg={sc.bg} color={sc.color} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginTop: 8 }}>
                          <div>
                            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle</p>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{sale.vehicle?.item?.name}</p>
                            <p style={{ fontSize: 12, color: '#64748b' }}>{sale.vehicle?.make} {sale.vehicle?.model} {sale.vehicle?.year}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</p>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{sale.client?.firstName} {sale.client?.lastName}</p>
                            {sale.client?.phone && <p style={{ fontSize: 12, color: '#64748b' }}>{sale.client.phone}</p>}
                          </div>
                          <div>
                            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sale Price</p>
                            <p style={{ fontSize: 15, fontWeight: 800, color: '#15803d' }}>{formatCurrency(Number(sale.salePrice))}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted By</p>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{sale.submittedBy?.firstName} {sale.submittedBy?.lastName}</p>
                            <p style={{ fontSize: 11, color: '#94a3b8' }}>{formatDateTime(sale.createdAt)}</p>
                          </div>
                        </div>
                        {sale.notes && (
                          <p style={{ fontSize: 12, color: '#64748b', marginTop: 8, fontStyle: 'italic' }}>"{sale.notes}"</p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                        <button
                          onClick={() => setApproveTarget({ id: sale.id, type: 'sale', label: sale.saleNumber })}
                          style={{ padding: '9px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#15803d,#22c55e)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 8px rgba(21,128,61,0.25)' }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => setRejectTarget({ id: sale.id, type: 'sale', label: sale.saleNumber })}
                          style={{ padding: '9px 16px', borderRadius: 9, border: '1.5px solid #fecaca', background: '#fff', color: '#dc2626', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                        >
                          ✕ Reject
                        </button>
                        <button
                          onClick={() => navigate(`/sales/${sale.id}`)}
                          style={{ padding: '7px 16px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
