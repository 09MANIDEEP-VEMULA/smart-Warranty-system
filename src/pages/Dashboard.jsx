import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend
} from 'recharts';
import {
  AlertTriangle, Calendar, CheckCircle2, ChevronRight, Clock,
  Package, PackagePlus, Pencil, ShieldCheck, Timer, Trash2, XCircle, ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Empty, LinkBtn, PageHeader, ProductIcon, StatusBadge } from '../components/ui';
import { daysText, fmtDate, timeAgo } from '../utils/warranty';
import AnimatedCounter from '../components/AnimatedCounter';

const COLORS = { active: '#16A34A', expiring: '#F59E0B', expired: '#EF4444' };

export default function Dashboard() {
  const { items, activity, user } = useApp();

  const count = (s) => items.filter((p) => p.w.status === s).length;

  const stats = [
    { label: 'Total Products', value: items.length, icon: Package, tone: 'blue', to: '/products', hint: 'Registered items' },
    { label: 'Active Warranties', value: count('active'), icon: CheckCircle2, tone: 'green', to: '/products?status=active', hint: 'More than 30 days left' },
    { label: 'Expiring Soon', value: count('expiring'), icon: Clock, tone: 'amber', to: '/products?status=expiring', hint: 'Within next 30 days' },
    { label: 'Expired Warranties', value: count('expired'), icon: XCircle, tone: 'red', to: '/products?status=expired', hint: 'No longer covered' },
  ];

  const pie = [
    { key: 'active', name: 'Active', value: count('active') },
    { key: 'expiring', name: 'Expiring Soon', value: count('expiring') },
    { key: 'expired', name: 'Expired', value: count('expired') },
  ].filter((d) => d.value > 0);

  const cats = Object.entries(
    items.reduce((a, p) => ({ ...a, [p.category]: (a[p.category] || 0) + 1 }), {})
  ).map(([name, value]) => ({ name, value }));

  const recent = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const upcoming = items.filter((p) => p.w.status !== 'expired').sort((a, b) => a.w.daysLeft - b.w.daysLeft).slice(0, 5);
  const icons = { add: PackagePlus, edit: Pencil, delete: Trash2, alert: AlertTriangle };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';
  const formattedToday = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <>
      <div className="page-head animate-in">
        <div>
          <h1>{greeting}, {firstName}</h1>
          <p className="muted">Here's an overview of your product warranties.</p>
        </div>
        <div className="page-actions">
          <div className="date-badge">
            <Calendar size={15} style={{ color: 'var(--primary)' }} />
            <span>{formattedToday}</span>
          </div>
          <LinkBtn to="/products/new" icon={PackagePlus}>Add product</LinkBtn>
        </div>
      </div>

      {/* 4 Premium Metric Cards */}
      <div className="stats">
        {stats.map((s, i) => (
          <Link
            to={s.to}
            className={`stat ${s.tone} animate-in`}
            key={s.label}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <span className="stat-icon"><s.icon size={22} /></span>
            <div>
              <small>{s.label}</small>
              <AnimatedCounter end={s.value} className="stat-value" />
              <em>{s.hint}</em>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="quick-actions animate-in" style={{ animationDelay: '0.2s' }}>
        <Link to="/products/new" className="quick-card">
          <span className="quick-card-icon"><PackagePlus size={20} /></span>
          <div className="grow">
            <b>Register New Product</b>
            <small>Upload bill & track warranty</small>
          </div>
          <ArrowUpRight size={16} className="muted" />
        </Link>
        <Link to="/tracking" className="quick-card">
          <span className="quick-card-icon"><Timer size={20} /></span>
          <div className="grow">
            <b>Warranty Timeline Kanban</b>
            <small>Inspect remaining coverage</small>
          </div>
          <ArrowUpRight size={16} className="muted" />
        </Link>
        <Link to="/notifications" className="quick-card">
          <span className="quick-card-icon"><AlertTriangle size={20} /></span>
          <div className="grow">
            <b>Warranty Expiry Alerts</b>
            <small>{count('expiring')} items need renewal attention</small>
          </div>
          <ArrowUpRight size={16} className="muted" />
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid-2">
        <section className="card animate-in" style={{ animationDelay: '0.24s' }}>
          <div className="card-head">
            <div>
              <h3>Warranty status distribution</h3>
              <p className="muted small">Breakdown of current active, expiring and expired items</p>
            </div>
          </div>
          {items.length === 0 ? (
            <Empty title="No data yet" text="Add a product to see the status breakdown." />
          ) : (
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  >
                    {pie.map((d) => <Cell key={d.key} fill={COLORS[d.key]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 8px 20px -4px rgba(15,23,42,0.1)',
                      fontSize: 13,
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 10, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="card animate-in" style={{ animationDelay: '0.28s' }}>
          <div className="card-head">
            <div>
              <h3>Products by category</h3>
              <p className="muted small">Inventory distribution across product categories</p>
            </div>
          </div>
          {items.length === 0 ? (
            <Empty title="No data yet" text="Add a product to see the category breakdown." />
          ) : (
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cats} margin={{ top: 12, right: 12, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: '#F1F5F9' }}
                    contentStyle={{
                      background: '#FFFFFF',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 8px 20px -4px rgba(15,23,42,0.1)',
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="value" name="Products" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {/* 3 Columns Row: Recently added, upcoming expirations, recent activity */}
      <div className="grid-3">
        <section className="card animate-in" style={{ animationDelay: '0.32s' }}>
          <div className="card-head">
            <h3>Recently added</h3>
            <Link to="/products" className="link">View all</Link>
          </div>
          {recent.length === 0 ? (
            <Empty title="Nothing here yet" text="Products you add will show up here." />
          ) : (
            <ul className="list">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link to={`/products/${p.id}`} className="row-link">
                    <ProductIcon category={p.category} size={36} />
                    <div className="grow">
                      <b>{p.brand} {p.name}</b>
                      <small>{p.model}</small>
                    </div>
                    <StatusBadge status={p.w.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card animate-in" style={{ animationDelay: '0.36s' }}>
          <div className="card-head">
            <h3>Upcoming expirations</h3>
            <Link to="/tracking" className="link">Track all</Link>
          </div>
          {upcoming.length === 0 ? (
            <Empty title="All clear" text="No upcoming expirations in the next 30 days." />
          ) : (
            <ul className="list">
              {upcoming.map((p) => (
                <li key={p.id}>
                  <Link to={`/products/${p.id}`} className="row-link">
                    <ProductIcon category={p.category} size={36} />
                    <div className="grow">
                      <b>{p.brand} {p.name}</b>
                      <small>Expires {fmtDate(p.w.expiry)}</small>
                    </div>
                    <span className={`days ${p.w.status}`}>{daysText(p.w.daysLeft)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card animate-in" style={{ animationDelay: '0.4s' }}>
          <div className="card-head">
            <h3>Recent activity</h3>
          </div>
          {activity.length === 0 ? (
            <Empty title="No activity" text="Actions you take will be listed here." />
          ) : (
            <ul className="timeline">
              {activity.slice(0, 6).map((a) => {
                const Icon = icons[a.type] || ChevronRight;
                return (
                  <li key={a.id}>
                    <span className={`tl-icon ${a.type}`}><Icon size={14} /></span>
                    <div>
                      <b>{a.text}</b>
                      <small>{timeAgo(a.at)}</small>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
