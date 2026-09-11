import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const demos = [
    { role: 'Admin',       email: 'admin@taxime.com'   },
    { role: 'Storekeeper', email: 'store@taxime.com'   },
    { role: 'Finance',     email: 'finance@taxime.com' },
    { role: 'Operations',  email: 'ops@taxime.com'     },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── Left branding ── */}
      <div
        className="login-left"
        style={{
          width: '48%',
          background: 'linear-gradient(160deg, #0f1f2e 0%, #162840 60%, #0d1f2f 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow blobs */}
        <div style={{ position:'absolute', top:-80, right:-80, width:340, height:340, borderRadius:'50%', background:'radial-gradient(circle, rgba(20,184,166,0.12), transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-100, left:-60, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(20,184,166,0.08), transparent 70%)', pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:11, background:'#14b8a6', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:20, boxShadow:'0 4px 16px rgba(20,184,166,0.4)', flexShrink:0 }}>T</div>
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:19, letterSpacing:'-0.3px' }}>Taxime</div>
            <div style={{ color:'#5a8fa8', fontSize:11.5 }}>Inventory Management System</div>
          </div>
        </div>

        {/* Hero */}
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(20,184,166,0.12)', border:'1px solid rgba(20,184,166,0.25)', borderRadius:999, padding:'6px 14px', color:'#2dd4bf', fontSize:12, fontWeight:600, marginBottom:28 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#14b8a6', display:'inline-block', boxShadow:'0 0 0 3px rgba(20,184,166,0.25)' }} />
            Platform Active
          </div>

          <h2 style={{ color:'#f0f9ff', fontSize:38, fontWeight:800, lineHeight:1.22, letterSpacing:'-0.6px', marginBottom:16 }}>
            Operational control<br/>
            <span style={{ color:'#2dd4bf' }}>at every level.</span>
          </h2>
          <p style={{ color:'#7aabb8', fontSize:14.5, lineHeight:1.75, maxWidth:370 }}>
            Track inventory, manage your vehicle fleet, process procurement requests and sales — designed for logistics and operations teams.
          </p>

          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:28 }}>
            {['Real-time Stock Tracking','Role-Based Access','Restock Alerts','Full Audit Log','Vehicle Fleet','Sales Pipeline'].map(f => (
              <span key={f} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#a0c8d8', fontSize:12, padding:'5px 12px', borderRadius:999, fontWeight:500 }}>
                {f}
              </span>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:36 }}>
            {[{ v:'500+', l:'Items Tracked' },{ v:'1.2K', l:'Requests Handled' },{ v:'30+', l:'Active Users' }].map(s => (
              <div key={s.l} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'14px 10px' }}>
                <div style={{ color:'#fff', fontWeight:700, fontSize:22 }}>{s.v}</div>
                <div style={{ color:'#5a8fa8', fontSize:11, marginTop:3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position:'relative', zIndex:1, color:'#2a4a5a', fontSize:12 }}>© 2026 Taxime. All rights reserved.</div>
      </div>

      {/* ── Right form ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', padding:36 }}>
        <div style={{ width:'100%', maxWidth:420 }}>

          <div style={{ marginBottom:30 }}>
            <h1 style={{ fontSize:27, fontWeight:800, color:'#0f172a', letterSpacing:'-0.4px' }}>Welcome back</h1>
            <p style={{ color:'#64748b', fontSize:14, marginTop:6 }}>Sign in to your Taxime account to continue.</p>
          </div>

          {/* Form card */}
          <div style={{ background:'#fff', borderRadius:18, border:'1px solid #e2e8f0', padding:28, boxShadow:'0 4px 28px rgba(0,0,0,0.06)' }}>
            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div style={{ marginBottom:18 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#334155', marginBottom:6 }}>Email address</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', display:'flex' }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </span>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@taxime.com"
                    style={{ width:'100%', paddingLeft:36, paddingRight:14, paddingTop:11, paddingBottom:11, borderRadius:10, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#0f172a', fontSize:14, outline:'none', boxSizing:'border-box', transition:'border-color .15s, box-shadow .15s', fontFamily:'inherit' }}
                    onFocus={e => { e.target.style.borderColor='#14b8a6'; e.target.style.boxShadow='0 0 0 3px rgba(20,184,166,0.12)'; e.target.style.background='#fff'; }}
                    onBlur={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background='#f8fafc'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom:22 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#334155', marginBottom:6 }}>Password</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', display:'flex' }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                    style={{ width:'100%', paddingLeft:36, paddingRight:52, paddingTop:11, paddingBottom:11, borderRadius:10, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#0f172a', fontSize:14, outline:'none', boxSizing:'border-box', transition:'border-color .15s, box-shadow .15s', fontFamily:'inherit' }}
                    onFocus={e => { e.target.style.borderColor='#14b8a6'; e.target.style.boxShadow='0 0 0 3px rgba(20,184,166,0.12)'; e.target.style.background='#fff'; }}
                    onBlur={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background='#f8fafc'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', border:'none', background:'none', cursor:'pointer', color:'#94a3b8', fontSize:12, fontWeight:600, padding:'2px 4px' }}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'10px 14px', marginBottom:16, color:'#dc2626', fontSize:13 }}>
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width:'100%', padding:'12px', borderRadius:11, border:'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0d9488, #14b8a6)', color:'#fff', fontWeight:700, fontSize:15, boxShadow: loading ? 'none' : '0 4px 16px rgba(13,148,136,0.35)', transition:'all .2s', fontFamily:'inherit' }}
                onMouseEnter={e => { if(!loading){ (e.currentTarget as HTMLElement).style.transform='translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 6px 20px rgba(13,148,136,0.45)'; }}}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(13,148,136,0.35)'; }}
              >
                {loading
                  ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      <svg style={{ animation:'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4"/>
                        <path fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                      Signing in...
                    </span>
                  : 'Sign In →'
                }
              </button>
            </form>
          </div>

          {/* Demo credentials */}
          <div style={{ marginTop:14, background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'14px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Demo Accounts — click to fill</p>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {demos.map(c => (
                <button key={c.email} type="button"
                  onClick={() => { setEmail(c.email); setPassword('password123'); }}
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', borderRadius:8, border:'none', background:'transparent', cursor:'pointer', transition:'background .12s', fontFamily:'inherit' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='#f1f9f8'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}
                >
                  <span style={{ fontSize:12, fontWeight:700, padding:'2px 8px', borderRadius:6, background:'#f0fdfa', color:'#0d9488' }}>{c.role}</span>
                  <span style={{ fontSize:12, color:'#64748b' }}>{c.email}</span>
                </button>
              ))}
              <p style={{ fontSize:11, color:'#94a3b8', textAlign:'center', marginTop:6 }}>Password: <span style={{ fontFamily:'monospace', fontWeight:700, color:'#475569' }}>password123</span></p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1023px) { .login-left { display: none !important; } }
      `}</style>
    </div>
  );
}
