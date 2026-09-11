import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Request } from '../../types';
import { formatDateTime, formatStatus } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../config/constants';

const STATUS_CFG: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: '#fefce8', color: '#a16207' },
  APPROVED:  { bg: '#f0fdf4', color: '#15803d' },
  REJECTED:  { bg: '#fef2f2', color: '#b91c1c' },
  FULFILLED: { bg: '#f0fdfa', color: '#0d9488' },
  CANCELLED: { bg: '#f8fafc', color: '#64748b' },
};

const TYPE_CFG: Record<string, { bg: string; color: string }> = {
  INVENTORY:   { bg: '#f0fdfa', color: '#0d9488' },
  VEHICLE:     { bg: '#eff6ff', color: '#1d4ed8' },
  PROCUREMENT: { bg: '#faf5ff', color: '#7c3aed' },
  OTHER:       { bg: '#f8fafc', color: '#475569' },
};

export default function RequestList() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isManager   = user?.role === USER_ROLES.OPERATIONS_MANAGER || user?.role === USER_ROLES.ADMIN;
  const isStorekeeper = user?.role === USER_ROLES.STOREKEEPER;
  // Storekeepers see approved requests (to fulfil); managers see all; employees see only their own
  const canSeeAll   = isManager || isStorekeeper;

  const [requests, setRequests]     = useState<Request[]>([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState(isStorekeeper ? 'APPROVED' : '');
  const [typeFilter, setTypeFilter]     = useState('');
  const [search, setSearch]             = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter)   params.type   = typeFilter;
      // Employees only see their own
      if (!canSeeAll)   params.requestedById = user?.id;
      const res = await api.get('/requests', { params });
      setRequests(res.data.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, canSeeAll, user?.id]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleDelete = async (req: Request, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete request ${req.requestNumber}?`)) return;
    try {
      await api.delete(`/requests/${req.id}`);
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  // Client-side search on number / requester name
  const filtered = requests.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.requestNumber.toLowerCase().includes(q) ||
      `${r.requestedBy.firstName} ${r.requestedBy.lastName}`.toLowerCase().includes(q)
    );
  });

  const counts = {
    total:     requests.length,
    pending:   requests.filter(r => r.status === 'PENDING').length,
    approved:  requests.filter(r => r.status === 'APPROVED').length,
    fulfilled: requests.filter(r => r.status === 'FULFILLED').length,
    rejected:  requests.filter(r => r.status === 'REJECTED').length,
  };

  const Stat = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 800, color, marginTop: 4 }}>{loading ? '—' : value}</p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
            {canSeeAll ? 'All Requests' : 'My Requests'}
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            {isManager    && 'View and manage all inventory requests across the system'}
            {isStorekeeper && 'Requests approved and waiting for fulfilment'}
            {!canSeeAll    && 'Track the status of your submitted requests'}
          </p>
        </div>
        <button
          onClick={() => navigate('/requests/new')}
          style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0d9488,#14b8a6)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 3px 10px rgba(13,148,136,0.28)' }}
        >
          + New Request
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        <Stat label="Total"     value={counts.total}     color="#0f172a" />
        <Stat label="Pending"   value={counts.pending}   color="#d97706" />
        <Stat label="Approved"  value={counts.approved}  color="#15803d" />
        <Stat label="Fulfilled" value={counts.fulfilled} color="#0d9488" />
        <Stat label="Rejected"  value={counts.rejected}  color="#dc2626" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by number or name…"
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        {/* Type */}
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: 13, color: '#0f172a', cursor: 'pointer', outline: 'none' }}>
          <option value="">All Types</option>
          <option value="INVENTORY">Inventory</option>
          <option value="VEHICLE">Vehicle</option>
          <option value="PROCUREMENT">Procurement</option>
          <option value="OTHER">Other</option>
        </select>
        {/* Status */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: 13, color: '#0f172a', cursor: 'pointer', outline: 'none' }}>
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="FULFILLED">Fulfilled</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Request #', 'Type', canSeeAll ? 'Requested By' : null, 'Items', 'Status', 'Created', 'Actions']
                  .filter(Boolean).map(h => (
                  <th key={h as string} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  {search ? 'No requests match your search' : 'No requests found'}
                </td></tr>
              ) : filtered.map((req, idx) => {
                const sc  = STATUS_CFG[req.status]  ?? STATUS_CFG.CANCELLED;
                const tc  = TYPE_CFG[req.type]       ?? TYPE_CFG.OTHER;
                return (
                  <tr key={req.id}
                    onClick={() => navigate(`/requests/${req.id}`)}
                    style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', transition: 'background .1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {req.requestNumber}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: tc.bg, color: tc.color }}>
                        {formatStatus(req.type)}
                      </span>
                    </td>
                    {canSeeAll && (
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{req.requestedBy.firstName} {req.requestedBy.lastName}</div>
                        {req.requestedBy.department && (
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{req.requestedBy.department.name}</div>
                        )}
                      </td>
                    )}
                    <td style={{ padding: '13px 16px', fontSize: 13, color: '#475569' }}>
                      {req.items.length} item{req.items.length !== 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: sc.bg, color: sc.color }}>
                        {formatStatus(req.status)}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {formatDateTime(req.createdAt)}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/requests/${req.id}`)}
                          style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#0d9488,#14b8a6)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                          View
                        </button>
                        {req.status === 'PENDING' && (user?.id === req.requestedById || isManager) && (
                          <button
                            onClick={e => handleDelete(req, e)}
                            style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#94a3b8' }}>
            Showing {filtered.length} of {requests.length} requests
          </div>
        )}
      </div>
    </div>
  );
}
