import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { USER_ROLES } from '../config/constants';

interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingRequests: number;
  approvedRequests: number;
  availableVehicles: number;
  totalVehicles: number;
  pendingSales: number;
  completedSalesTotal: number;
}

interface RecentRequest {
  id: string;
  requestNumber: string;
  status: string;
  type: string;
  createdAt: string;
  requestedBy: { firstName: string; lastName: string };
}

interface RecentNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: '#fefce8', color: '#a16207' },
  APPROVED:  { bg: '#f0fdf4', color: '#15803d' },
  REJECTED:  { bg: '#fef2f2', color: '#b91c1c' },
  FULFILLED: { bg: '#f0fdfa', color: '#0d9488' },
  COMPLETED: { bg: '#f0fdfa', color: '#0d9488' },
  CANCELLED: { bg: '#f8fafc', color: '#64748b' },
};

const ROLE_WELCOME: Record<string, string> = {
  [USER_ROLES.ADMIN]:              'Here\'s a full overview of the system.',
  [USER_ROLES.OPERATIONS_MANAGER]: 'Here are the pending approvals and activity.',
  [USER_ROLES.STOREKEEPER]:        'Here\'s the current stock and fulfilment status.',
  [USER_ROLES.FINANCE]:            'Here\'s the sales and financial overview.',
  [USER_ROLES.EMPLOYEE]:           'Here\'s the status of your requests.',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0, lowStockItems: 0, outOfStockItems: 0,
    pendingRequests: 0, approvedRequests: 0,
    availableVehicles: 0, totalVehicles: 0,
    pendingSales: 0, completedSalesTotal: 0,
  });
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const [itemsRes, requestsRes, vehiclesRes, notifRes] = await Promise.allSettled([
        api.get('/items'),
        api.get('/requests'),
        api.get('/vehicles'),
        api.get('/notifications?unreadOnly=false'),
      ]);

      // Items
      if (itemsRes.status === 'fulfilled') {
        const items = itemsRes.value.data.data ?? [];
        setStats(prev => ({
          ...prev,
          totalItems: items.length,
          lowStockItems: items.filter((i: any) => i.quantity > 0 && i.quantity <= i.minimumQty).length,
          outOfStockItems: items.filter((i: any) => i.quantity === 0).length,
        }));
      }

      // Requests
      if (requestsRes.status === 'fulfilled') {
        const requests = requestsRes.value.data.data ?? [];
        setStats(prev => ({
          ...prev,
          pendingRequests: requests.filter((r: any) => r.status === 'PENDING').length,
          approvedRequests: requests.filter((r: any) => r.status === 'APPROVED').length,
        }));
        // Sort by most recent
        const sorted = [...requests].sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentRequests(sorted.slice(0, 6));
      }

      // Vehicles
      if (vehiclesRes.status === 'fulfilled') {
        const vehicles = vehiclesRes.value.data.data ?? [];
        setStats(prev => ({
          ...prev,
          totalVehicles: vehicles.length,
          availableVehicles: vehicles.filter((v: any) => v.status === 'AVAILABLE').length,
        }));
      }

      // Sales (only finance/admin)
      if (user?.role === USER_ROLES.FINANCE || user?.role === USER_ROLES.ADMIN) {
        try {
          const salesRes = await api.get('/sales');
          const sales = salesRes.data.data ?? [];
          setStats(prev => ({
            ...prev,
            pendingSales: sales.filter((s: any) => s.status === 'PENDING').length,
            completedSalesTotal: sales
              .filter((s: any) => s.status === 'COMPLETED')
              .reduce((sum: number, s: any) => sum + Number(s.salePrice), 0),
          }));
        } catch { /* ignore */ }
      }

      // Recent notifications
      if (notifRes.status === 'fulfilled') {
        const notifs = notifRes.value.data.data ?? [];
        setRecentNotifications(notifs.slice(0, 5));
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30_000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const isManager = user?.role === USER_ROLES.OPERATIONS_MANAGER || user?.role === USER_ROLES.ADMIN;
  const isFinance  = user?.role === USER_ROLES.FINANCE || user?.role === USER_ROLES.ADMIN;
  const isStore    = user?.role === USER_ROLES.STOREKEEPER || user?.role === USER_ROLES.ADMIN;

  const StatCard = ({
    label, value, sub, color, icon, onClick, alert,
  }: {
    label: string; value: string | number; sub?: string;
    color?: string; icon: string; onClick?: () => void; alert?: boolean;
  }) => (
    <div
      onClick={onClick}
      style={{
        background: '#fff', border: `1px solid ${alert ? '#fecaca' : '#e2e8f0'}`,
        borderRadius: 14, padding: '20px 22px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all .15s', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12,
        boxShadow: alert ? '0 0 0 2px rgba(239,68,68,0.1)' : '0 1px 6px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
    >
      <div>
        <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: color ?? '#0f172a', marginTop: 4, letterSpacing: '-0.5px' }}>{loading ? '—' : value}</p>
        {sub && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{sub}</p>}
      </div>
      <div style={{ fontSize: 32, opacity: 0.85 }}>{icon}</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.firstName}!
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 5 }}>
            {ROLE_WELCOME[user?.role ?? ''] ?? 'Here\'s what\'s happening today.'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastUpdated && (
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => { setLoading(true); fetchDashboard(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 9,
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#475569', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#14b8a6'; (e.currentTarget as HTMLElement).style.color = '#0d9488'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats row 1 — always visible */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 16 }}>
        <StatCard label="Total Items" value={stats.totalItems} icon="📦" onClick={() => navigate('/inventory')} />
        <StatCard label="Low Stock" value={stats.lowStockItems} icon="⚠️" color="#d97706" alert={stats.lowStockItems > 0} onClick={() => navigate('/inventory')} />
        <StatCard label="Out of Stock" value={stats.outOfStockItems} icon="🚨" color="#dc2626" alert={stats.outOfStockItems > 0} onClick={() => navigate('/inventory')} />
        <StatCard label="Available Vehicles" value={`${stats.availableVehicles} / ${stats.totalVehicles}`} icon="🚗" onClick={() => navigate('/vehicles')} />
      </div>

      {/* Stats row 2 — role-specific */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Pending Requests" value={stats.pendingRequests} icon="📋" color="#d97706" alert={stats.pendingRequests > 0} onClick={() => navigate('/requests')} />
        <StatCard label="Approved (Awaiting Fulfil)" value={stats.approvedRequests} icon="✅" color="#0d9488" onClick={() => navigate('/requests')} />
        {isFinance && (
          <StatCard label="Pending Sales" value={stats.pendingSales} icon="💼" color="#7c3aed" onClick={() => navigate('/sales')} />
        )}
        {isFinance && (
          <StatCard label="Completed Sales" value={formatCurrency(stats.completedSalesTotal)} icon="💰" color="#15803d" onClick={() => navigate('/sales')} />
        )}
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>

        {/* Recent Requests */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Recent Requests</h2>
            <button onClick={() => navigate('/requests')} style={{ fontSize: 12, color: '#0d9488', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>
              View all →
            </button>
          </div>
          <div>
            {loading ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading...</div>
            ) : recentRequests.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No requests yet</div>
            ) : (
              recentRequests.map((req, idx) => {
                const sc = STATUS_COLORS[req.status] ?? STATUS_COLORS.CANCELLED;
                return (
                  <div
                    key={req.id}
                    onClick={() => navigate(`/requests/${req.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 20px', cursor: 'pointer',
                      borderBottom: idx < recentRequests.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background .1s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{req.requestNumber}</p>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {req.requestedBy.firstName} {req.requestedBy.lastName} · {req.type}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: sc.bg, color: sc.color }}>
                        {req.status}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Recent Notifications</h2>
            <button onClick={() => navigate('/notifications')} style={{ fontSize: 12, color: '#0d9488', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>
              View all →
            </button>
          </div>
          <div>
            {loading ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading...</div>
            ) : recentNotifications.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No notifications</div>
            ) : (
              recentNotifications.map((n, idx) => (
                <div
                  key={n.id}
                  onClick={() => navigate('/notifications')}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 20px', cursor: 'pointer',
                    background: n.isRead ? 'transparent' : '#f8fffd',
                    borderBottom: idx < recentNotifications.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.isRead ? 'transparent' : '#f8fffd'}
                >
                  {!n.isRead && (
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#14b8a6', flexShrink: 0, marginTop: 5 }} />
                  )}
                  {n.isRead && <span style={{ width: 7, flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: n.isRead ? 500 : 700, color: '#0f172a', margin: 0 }}>{n.title}</p>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{formatDateTime(n.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stock alerts — only for storekeeper/admin */}
        {isStore && stats.outOfStockItems + stats.lowStockItems > 0 && (
          <div style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: 14, overflow: 'hidden', boxShadow: '0 0 0 2px rgba(239,68,68,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #fee2e2', background: '#fff5f5' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#991b1b' }}>🚨 Stock Alerts</h2>
              <button onClick={() => navigate('/inventory')} style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>
                Manage →
              </button>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.outOfStockItems > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#fef2f2', borderRadius: 9, border: '1px solid #fecaca' }}>
                  <span style={{ fontSize: 13, color: '#991b1b', fontWeight: 600 }}>Out of Stock</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#dc2626' }}>{stats.outOfStockItems}</span>
                </div>
              )}
              {stats.lowStockItems > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#fefce8', borderRadius: 9, border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: 13, color: '#a16207', fontWeight: 600 }}>Low Stock</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#d97706' }}>{stats.lowStockItems}</span>
                </div>
              )}
              <button
                onClick={() => navigate('/inventory')}
                style={{ width: '100%', padding: '10px', borderRadius: 9, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 4 }}
              >
                View & Restock Items
              </button>
            </div>
          </div>
        )}

        {/* Pending approvals — only for managers */}
        {isManager && stats.pendingRequests > 0 && (
          <div style={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 14, overflow: 'hidden', boxShadow: '0 0 0 2px rgba(234,179,8,0.07)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #fef9c3', background: '#fefce8' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#92400e' }}>⏳ Awaiting Your Approval</h2>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 13, color: '#78350f' }}>
                <strong>{stats.pendingRequests}</strong> request{stats.pendingRequests > 1 ? 's are' : ' is'} waiting for approval.
              </p>
              <button
                onClick={() => navigate('/approvals')}
                style={{ width: '100%', padding: '10px', borderRadius: 9, border: 'none', background: '#d97706', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Go to Approvals →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
