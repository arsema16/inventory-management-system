import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

/* ─── Types ─── */
interface RequestItem { status: string; type: string; createdAt: string; fulfilledAt?: string; requestedBy: { department?: { name: string } } }
interface SaleItem    { status: string; salePrice: number; createdAt: string; completedAt?: string; vehicle: { make: string; model: string } }
interface InventoryItem { name: string; sku: string; quantity: number; minimumQty: number; status: string; type: string }

type Period = '7d' | '30d' | '90d' | 'all';

const PERIOD_LABELS: Record<Period, string> = { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', all: 'All time' };

function cutoff(period: Period): Date | null {
  if (period === 'all') return null;
  const d = new Date();
  if (period === '7d')  d.setDate(d.getDate() - 7);
  if (period === '30d') d.setDate(d.getDate() - 30);
  if (period === '90d') d.setDate(d.getDate() - 90);
  return d;
}

function inPeriod(dateStr: string, period: Period) {
  const c = cutoff(period);
  if (!c) return true;
  return new Date(dateStr) >= c;
}

/* ─── Small components ─── */
const KPI = ({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) => (
  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</p>
    <p style={{ fontSize: 26, fontWeight: 800, color: color ?? '#0f172a', letterSpacing: '-0.5px' }}>{value}</p>
    {sub && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{sub}</p>}
  </div>
);

const Bar = ({ pct, color }: { pct: number; color: string }) => (
  <div style={{ background: '#f1f5f9', borderRadius: 99, height: 7, overflow: 'hidden', flex: 1 }}>
    <div style={{ width: `${Math.min(100, pct)}%`, background: color, height: '100%', borderRadius: 99, transition: 'width .5s' }} />
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', marginBottom: 20 }}>
    <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h2>
    </div>
    <div style={{ padding: 20 }}>{children}</div>
  </div>
);

/* ─── Main ─── */
export default function ReportsList() {
  const [period, setPeriod]       = useState<Period>('30d');
  const [requests, setRequests]   = useState<RequestItem[]>([]);
  const [sales, setSales]         = useState<SaleItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, sRes, iRes] = await Promise.allSettled([
        api.get('/requests'),
        api.get('/sales'),
        api.get('/items'),
      ]);
      if (rRes.status === 'fulfilled') setRequests(rRes.value.data.data ?? []);
      if (sRes.status === 'fulfilled') setSales(sRes.value.data.data ?? []);
      if (iRes.status === 'fulfilled') setInventory(iRes.value.data.data ?? []);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ─── Filtered by period ─── */
  const R = requests.filter(r => inPeriod(r.createdAt, period));
  const S = sales.filter(s => inPeriod(s.createdAt, period));

  /* Request stats */
  const rTotal     = R.length;
  const rFulfilled = R.filter(r => r.status === 'FULFILLED').length;
  const rRejected  = R.filter(r => r.status === 'REJECTED').length;
  const rPending   = R.filter(r => r.status === 'PENDING').length;
  const rApproved  = R.filter(r => r.status === 'APPROVED').length;
  const rFulfilRate = rTotal ? Math.round((rFulfilled / rTotal) * 100) : 0;
  const rRejRate    = rTotal ? Math.round((rRejected  / rTotal) * 100) : 0;

  /* Avg fulfilment time (days) */
  const fulfilTimes = R.filter(r => r.status === 'FULFILLED' && r.fulfilledAt)
    .map(r => (new Date(r.fulfilledAt!).getTime() - new Date(r.createdAt).getTime()) / 86400000);
  const avgFulfilDays = fulfilTimes.length
    ? (fulfilTimes.reduce((a, b) => a + b, 0) / fulfilTimes.length).toFixed(1)
    : '—';

  /* Requests by type */
  const byType: Record<string, number> = {};
  R.forEach(r => { byType[r.type] = (byType[r.type] ?? 0) + 1; });

  /* Requests by department */
  const byDept: Record<string, number> = {};
  R.forEach(r => {
    const d = r.requestedBy?.department?.name ?? 'No Department';
    byDept[d] = (byDept[d] ?? 0) + 1;
  });

  /* Sales stats */
  const sTotal     = S.length;
  const sCompleted = S.filter(s => s.status === 'COMPLETED').length;
  const sRevenue   = S.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + Number(s.salePrice), 0);
  const sConvRate  = sTotal ? Math.round((sCompleted / sTotal) * 100) : 0;
  const avgSaleVal = sCompleted ? sRevenue / sCompleted : 0;

  /* Top selling vehicles */
  const byVehicle: Record<string, number> = {};
  S.filter(s => s.status === 'COMPLETED').forEach(s => {
    const k = `${s.vehicle.make} ${s.vehicle.model}`;
    byVehicle[k] = (byVehicle[k] ?? 0) + 1;
  });
  const topVehicles = Object.entries(byVehicle).sort((a, b) => b[1] - a[1]).slice(0, 5);

  /* Inventory health */
  const iTotal   = inventory.length;
  const iLow     = inventory.filter(i => i.quantity > 0 && i.quantity <= i.minimumQty).length;
  const iOut     = inventory.filter(i => i.quantity === 0).length;
  const iHealthy = iTotal - iLow - iOut;

  /* Most requested items from requests — approximation using request types */
  const stockByStatus: Record<string, number> = {};
  inventory.forEach(i => { stockByStatus[i.status] = (stockByStatus[i.status] ?? 0) + 1; });

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading report data…</div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>Reports & Analytics</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Historical trends and performance analysis
            {lastUpdated && ` · ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Period selector */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 9, padding: 3 }}>
            {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: period === p ? '#fff' : 'transparent', color: period === p ? '#0f172a' : '#64748b', fontWeight: period === p ? 700 : 400, fontSize: 12, cursor: 'pointer', boxShadow: period === p ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all .15s' }}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <button onClick={fetchAll}
            style={{ padding: '7px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            ↺ Refresh
          </button>
        </div>
      </div>

      {/* ══ REQUESTS SECTION ══ */}
      <div style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Requests — {PERIOD_LABELS[period]}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
          <KPI label="Total Requests"     value={rTotal} />
          <KPI label="Fulfilment Rate"    value={`${rFulfilRate}%`} color="#0d9488" sub={`${rFulfilled} fulfilled`} />
          <KPI label="Rejection Rate"     value={`${rRejRate}%`}    color="#dc2626" sub={`${rRejected} rejected`} />
          <KPI label="Avg Fulfil Time"    value={avgFulfilDays === '—' ? '—' : `${avgFulfilDays}d`} sub="from submit to fulfil" />
          <KPI label="Pending / Approved" value={`${rPending} / ${rApproved}`} color="#d97706" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* By type */}
        <Section title="Requests by Type">
          {Object.keys(byType).length === 0
            ? <p style={{ color: '#94a3b8', fontSize: 13 }}>No data for this period</p>
            : Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#475569', width: 120, flexShrink: 0 }}>{type}</span>
                <Bar pct={(count / rTotal) * 100} color="#0d9488" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', width: 28, textAlign: 'right' }}>{count}</span>
              </div>
            ))
          }
        </Section>

        {/* By department */}
        <Section title="Requests by Department">
          {Object.keys(byDept).length === 0
            ? <p style={{ color: '#94a3b8', fontSize: 13 }}>No data for this period</p>
            : Object.entries(byDept).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
              <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#475569', width: 140, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dept}</span>
                <Bar pct={(count / rTotal) * 100} color="#6366f1" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', width: 28, textAlign: 'right' }}>{count}</span>
              </div>
            ))
          }
        </Section>
      </div>

      {/* ══ SALES SECTION ══ */}
      <div style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Vehicle Sales — {PERIOD_LABELS[period]}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
          <KPI label="Total Sales"      value={sTotal} />
          <KPI label="Completed"        value={sCompleted} color="#15803d" />
          <KPI label="Conversion Rate"  value={`${sConvRate}%`} color="#15803d" sub="completed vs total" />
          <KPI label="Total Revenue"    value={formatCurrency(sRevenue)} color="#0d9488" />
          <KPI label="Avg Sale Value"   value={sCompleted ? formatCurrency(avgSaleVal) : '—'} sub="per completed sale" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
        <Section title="Top Selling Vehicle Models">
          {topVehicles.length === 0
            ? <p style={{ color: '#94a3b8', fontSize: 13 }}>No completed sales in this period</p>
            : topVehicles.map(([model, count]) => (
              <div key={model} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#475569', width: 160, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{model}</span>
                <Bar pct={(count / (topVehicles[0]?.[1] ?? 1)) * 100} color="#7c3aed" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', width: 28, textAlign: 'right' }}>{count}</span>
              </div>
            ))
          }
        </Section>

        <Section title="Sales Pipeline Breakdown">
          {sTotal === 0
            ? <p style={{ color: '#94a3b8', fontSize: 13 }}>No sales in this period</p>
            : (['PENDING','APPROVED','COMPLETED','REJECTED','CANCELLED'] as const).map(st => {
              const cnt = S.filter(s => s.status === st).length;
              if (cnt === 0) return null;
              const colorMap: Record<string, string> = { PENDING:'#d97706', APPROVED:'#1d4ed8', COMPLETED:'#15803d', REJECTED:'#dc2626', CANCELLED:'#94a3b8' };
              return (
                <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: '#475569', width: 90, flexShrink: 0 }}>{st}</span>
                  <Bar pct={(cnt / sTotal) * 100} color={colorMap[st]} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', width: 28, textAlign: 'right' }}>{cnt}</span>
                </div>
              );
            })
          }
        </Section>
      </div>

      {/* ══ INVENTORY SECTION ══ (static — not time-filtered, current snapshot) */}
      <div style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Inventory Health — Current Snapshot
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
          <KPI label="Total Items"   value={iTotal} />
          <KPI label="Healthy Stock" value={iHealthy} color="#15803d" sub={`${iTotal ? Math.round((iHealthy/iTotal)*100) : 0}% of items`} />
          <KPI label="Low Stock"     value={iLow}     color="#d97706" sub="below minimum qty" />
          <KPI label="Out of Stock"  value={iOut}     color="#dc2626" sub="needs restock" />
        </div>
      </div>

      <Section title="Stock Health Overview">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Healthy', count: iHealthy, color: '#15803d' },
            { label: 'Low Stock', count: iLow, color: '#d97706' },
            { label: 'Out of Stock', count: iOut, color: '#dc2626' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#475569', width: 100, flexShrink: 0 }}>{row.label}</span>
              <Bar pct={iTotal ? (row.count / iTotal) * 100 : 0} color={row.color} />
              <span style={{ fontSize: 13, fontWeight: 700, color: row.color, width: 36, textAlign: 'right' }}>{row.count}</span>
              <span style={{ fontSize: 12, color: '#94a3b8', width: 36 }}>{iTotal ? Math.round((row.count / iTotal) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
