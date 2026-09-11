import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { formatDateTime } from '../../utils/formatters';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  REQUEST:    { icon: '📋', color: '#1d4ed8', bg: '#eff6ff' },
  APPROVAL:   { icon: '✅', color: '#15803d', bg: '#f0fdf4' },
  REJECTION:  { icon: '❌', color: '#b91c1c', bg: '#fef2f2' },
  INVENTORY:  { icon: '📦', color: '#0d9488', bg: '#f0fdfa' },
  PROCUREMENT:{ icon: '🛒', color: '#a16207', bg: '#fefce8' },
  VEHICLE_SALE:{ icon: '🚗', color: '#7c3aed', bg: '#faf5ff' },
  SYSTEM:     { icon: '🔔', color: '#475569', bg: '#f8fafc' },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const params = filter === 'unread' ? '?unreadOnly=true' : '';
      const res = await api.get(`/notifications${params}`);
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNavigate = (notification: Notification) => {
    // Auto-navigate to the relevant page based on notification type
    if (notification.type === 'REQUEST' || notification.type === 'APPROVAL' ||
        notification.type === 'REJECTION' || notification.type === 'INVENTORY') {
      // Extract request number if present e.g. REQ-000001
      const match = notification.message.match(/REQ-\d+/);
      if (match) {
        // We can't directly navigate to the request by number, go to requests list
        navigate('/requests');
      }
    } else if (notification.type === 'VEHICLE_SALE') {
      navigate('/sales');
    } else if (notification.type === 'PROCUREMENT') {
      navigate('/reports');
    }
    if (!notification.isRead) handleMarkRead(notification.id);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
            Notifications
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            style={{
              padding: '8px 16px', borderRadius: 9,
              border: '1.5px solid #e2e8f0',
              background: '#fff', color: '#0d9488',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all .15s',
              opacity: markingAll ? 0.6 : 1,
            }}
          >
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 18px', borderRadius: 7, border: 'none',
              background: filter === f ? '#fff' : 'transparent',
              color: filter === f ? '#0f172a' : '#64748b',
              fontWeight: filter === f ? 600 : 400,
              fontSize: 13, cursor: 'pointer',
              boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all .15s',
            }}
          >
            {f === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <p style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>No notifications</p>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
              {filter === 'unread' ? 'You have no unread notifications.' : 'Nothing here yet.'}
            </p>
          </div>
        ) : (
          notifications.map((n, idx) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.SYSTEM;
            return (
              <div
                key={n.id}
                onClick={() => handleNavigate(n)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '16px 20px',
                  borderBottom: idx < notifications.length - 1 ? '1px solid #f1f5f9' : 'none',
                  background: n.isRead ? '#fff' : '#f8fffd',
                  cursor: 'pointer',
                  transition: 'background .12s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = n.isRead ? '#fff' : '#f8fffd')}
              >
                {/* Unread dot */}
                {!n.isRead && (
                  <span style={{
                    position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#14b8a6',
                  }} />
                )}

                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: cfg.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <p style={{ fontWeight: n.isRead ? 500 : 700, fontSize: 14, color: '#0f172a', margin: 0 }}>
                      {n.title}
                    </p>
                    <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1 }}>
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#475569', margin: '3px 0 6px', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5,
                      background: cfg.bg, color: cfg.color,
                    }}>
                      {n.type.replace('_', ' ')}
                    </span>
                    {!n.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                        style={{
                          fontSize: 11, color: '#0d9488', fontWeight: 600,
                          border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                        }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
