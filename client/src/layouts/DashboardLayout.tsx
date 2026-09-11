import { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../config/constants';
import api from '../utils/api';

const Ic = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
  </svg>
);

const P: Record<string, string> = {
  dashboard:   'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  inventory:   'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  vehicles:    'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1.5.5M13 16H3',
  requests:    'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  approvals:   'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  sales:       'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  users:       'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  departments: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  reports:     'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  audit:       'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  stock:       'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  logout:      'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  bell:        'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  menu:        'M4 6h16M4 12h16M4 18h16',
};

const ROLES: Record<string, { label: string; bg: string; color: string }> = {
  ADMIN:              { label: 'Admin',        bg: '#f0fdfa', color: '#0d9488' },
  STOREKEEPER:        { label: 'Storekeeper',  bg: '#f0fdfa', color: '#0d9488' },
  OPERATIONS_MANAGER: { label: 'Ops Manager',  bg: '#eff6ff', color: '#1d4ed8' },
  FINANCE:            { label: 'Finance',      bg: '#fefce8', color: '#a16207' },
  EMPLOYEE:           { label: 'Employee',     bg: '#f8fafc', color: '#475569' },
  PROCUREMENT:        { label: 'Procurement',  bg: '#fff7ed', color: '#c2410c' },
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const getNavItems = () => {
    const base = [
      { path: '/dashboard',   label: 'Dashboard',  icon: 'dashboard' },
      { path: '/inventory',   label: 'Inventory',  icon: 'inventory' },
      { path: '/vehicles',    label: 'Vehicles',   icon: 'vehicles'  },
      { path: '/requests',    label: 'Requests',   icon: 'requests'  },
    ];
    const extra: Record<string, any[]> = {
      [USER_ROLES.OPERATIONS_MANAGER]: [
        { path: '/approvals', label: 'Approvals', icon: 'approvals' },
        { path: '/reports',   label: 'Reports',   icon: 'reports'   },
      ],
      [USER_ROLES.FINANCE]: [
        { path: '/sales',   label: 'Vehicle Sales', icon: 'sales'   },
        { path: '/reports', label: 'Reports',       icon: 'reports' },
      ],
      [USER_ROLES.STOREKEEPER]: [
        { path: '/inventory', label: 'Stock Management', icon: 'stock' },
      ],
      [USER_ROLES.ADMIN]: [
        { path: '/approvals',   label: 'Approvals',     icon: 'approvals'   },
        { path: '/sales',       label: 'Vehicle Sales', icon: 'sales'       },
        { path: '/users',       label: 'Users',         icon: 'users'       },
        { path: '/departments', label: 'Departments',   icon: 'departments' },
        { path: '/reports',     label: 'Reports',       icon: 'reports'     },
        { path: '/audit',       label: 'Audit Logs',    icon: 'audit'       },
      ],
    };
    return [...base, ...(user ? extra[user.role] ?? [] : [])];
  };

  const navItems  = getNavItems();
  const pageLabel = navItems.find(i => isActive(i.path))?.label ?? 'Dashboard';
  const role      = ROLES[user?.role ?? ''] ?? ROLES.EMPLOYEE;
  const initials  = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;
  const W         = collapsed ? 64 : 236;

  // ── Unread notification count with 30s polling ──
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.data?.count ?? 0);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:"'Inter',-apple-system,sans-serif", background:'#f1f5f9' }}>

      {/* ══ SIDEBAR ══ */}
      <aside style={{
        position:'fixed', inset:'0 auto 0 0', zIndex:40, width:W,
        display:'flex', flexDirection:'column',
        background:'linear-gradient(180deg, #0f1f2e 0%, #162840 100%)',
        transition:'width .22s cubic-bezier(.4,0,.2,1)',
        overflow:'hidden',
        boxShadow:'4px 0 24px rgba(0,0,0,0.18)',
      }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding: collapsed ? '18px 13px' : '18px 16px', minHeight:64, borderBottom:'1px solid rgba(255,255,255,0.06)', overflow:'hidden' }}>
          <div style={{ width:36, height:36, borderRadius:9, background:'#14b8a6', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:17, flexShrink:0, boxShadow:'0 3px 10px rgba(20,184,166,0.4)' }}>T</div>
          {!collapsed && (
            <div style={{ overflow:'hidden' }}>
              <div style={{ color:'#f0f9ff', fontWeight:700, fontSize:15.5, whiteSpace:'nowrap', letterSpacing:'-0.2px' }}>Taxime</div>
              <div style={{ color:'#3a7a94', fontSize:10.5, whiteSpace:'nowrap' }}>Inventory System</div>
            </div>
          )}
        </div>

        {/* Nav section label */}
        {!collapsed && (
          <div style={{ padding:'14px 16px 4px', fontSize:10, fontWeight:700, color:'#2a5a74', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            Main Menu
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, padding:'6px 8px', overflowY:'auto' }}>
          {navItems.map(item => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} title={collapsed ? item.label : undefined}
                style={{
                  display:'flex', alignItems:'center',
                  gap:10, padding: collapsed ? '11px 13px' : '9px 11px',
                  borderRadius:8, marginBottom:2,
                  textDecoration:'none', overflow:'hidden',
                  background: active ? 'rgba(20,184,166,0.15)' : 'transparent',
                  color: active ? '#2dd4bf' : '#7aabb8',
                  fontWeight: active ? 600 : 400,
                  fontSize:13.5,
                  transition:'background .12s, color .12s',
                  position:'relative',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderLeft: active ? '2.5px solid #14b8a6' : '2.5px solid transparent',
                }}
                onMouseEnter={e => { if(!active){ (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color='#a0ccd8'; }}}
                onMouseLeave={e => { if(!active){ (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color='#7aabb8'; }}}
              >
                <span style={{ color: active ? '#14b8a6' : '#3a6a7a', display:'flex' }}>
                  <Ic d={P[item.icon]} size={17} />
                </span>
                {!collapsed && <span style={{ whiteSpace:'nowrap' }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ height:1, background:'rgba(255,255,255,0.05)', margin:'0 10px' }} />

        {/* User */}
        <div style={{ padding:'10px 8px 14px' }}>
          {!collapsed && (
            <div style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,0.04)', marginBottom:4 }}>
              <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, background:'linear-gradient(135deg,#0d9488,#14b8a6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:12 }}>{initials}</div>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ color:'#e0f2fe', fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.firstName} {user?.lastName}</div>
                <span style={{ fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:5, background:role.bg, color:role.color, display:'inline-block', marginTop:2 }}>{role.label}</span>
              </div>
            </div>
          )}
          <button onClick={logout} title={collapsed ? 'Sign Out' : undefined}
            style={{ display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'flex-start', gap:8, width:'100%', padding: collapsed ? '11px 13px' : '9px 11px', borderRadius:8, border:'none', cursor:'pointer', background:'transparent', color:'#3a6a7a', fontSize:13.5, fontWeight:500, transition:'all .12s', fontFamily:'inherit' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color='#f87171'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color='#3a6a7a'; }}
          >
            <Ic d={P.logout} size={17} />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div style={{ flex:1, marginLeft:W, transition:'margin-left .22s cubic-bezier(.4,0,.2,1)', display:'flex', flexDirection:'column', minHeight:'100vh' }}>

        {/* Topbar */}
        <header style={{ position:'sticky', top:0, zIndex:30, height:60, background:'#ffffff', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setCollapsed(!collapsed)}
              style={{ width:32, height:32, borderRadius:7, border:'1px solid #e2e8f0', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#64748b', transition:'all .12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#f0fdfa'; (e.currentTarget as HTMLElement).style.borderColor='#14b8a6'; (e.currentTarget as HTMLElement).style.color='#0d9488'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='#fff'; (e.currentTarget as HTMLElement).style.borderColor='#e2e8f0'; (e.currentTarget as HTMLElement).style.color='#64748b'; }}
            >
              <Ic d={P.menu} size={16} />
            </button>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>{pageLabel}</div>
              <div style={{ fontSize:11, color:'#94a3b8' }}>
                {new Date().toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric', year:'numeric' })}
              </div>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={() => { navigate('/notifications'); setUnreadCount(0); }}
              style={{ position:'relative', width:32, height:32, borderRadius:7, border:'1px solid #e2e8f0', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#64748b', transition:'all .12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#f0fdfa'; (e.currentTarget as HTMLElement).style.borderColor='#14b8a6'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='#fff'; (e.currentTarget as HTMLElement).style.borderColor='#e2e8f0'; }}
            >
              <Ic d={P.bell} size={16} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -5,
                  minWidth: 17, height: 17,
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  borderRadius: 999,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                  border: '2px solid #fff',
                  lineHeight: 1,
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 12px 4px 4px', borderRadius:8, border:'1px solid #e2e8f0', background:'#fff' }}>
              <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,#0d9488,#14b8a6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:11 }}>{initials}</div>
              <span style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{user?.firstName} {user?.lastName}</span>
              <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:5, background:role.bg, color:role.color }}>{role.label}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex:1, padding:24, background:'#f1f5f9' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
