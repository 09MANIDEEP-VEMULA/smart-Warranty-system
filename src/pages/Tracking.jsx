import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, ProductIcon, ProgressBar, StatusBadge } from '../components/ui';
import { daysText, fmtDate } from '../utils/warranty';

const COLS = [
  { key: 'active', title: 'Active', icon: CheckCircle2, note: 'More than 30 days of cover left' },
  { key: 'expiring', title: 'Expiring Soon', icon: Clock, note: 'Expires within the next 30 days' },
  { key: 'expired', title: 'Expired', icon: XCircle, note: 'Warranty period has ended' },
];

export default function Tracking() {
  const { items } = useApp();
  return (
    <>
      <PageHeader title="Warranty Tracking" subtitle="Status is calculated from today’s date. Expiring Soon means 30 days or fewer remain." />
      <div className="track-cols animate-in">
        {COLS.map((c, i) => {
          const list = items.filter((p) => p.w.status === c.key).sort((a, b) => (c.key === 'expired' ? b.w.daysLeft - a.w.daysLeft : a.w.daysLeft - b.w.daysLeft));
          return (
            <section className={`track-col ${c.key}`} key={c.key} data-testid={`col-${c.key}`} style={{ animationDelay: `${i * 0.08}s` }}>
              <header>
                <span className="stat-icon"><c.icon size={18} /></span>
                <div><h3>{c.title}</h3><small>{c.note}</small></div>
                <em className="pill">{list.length}</em>
              </header>
              {list.length === 0 && <p className="muted small pad">No products in this group.</p>}
              {list.map((p) => (
                <Link to={`/products/${p.id}`} className="track-card" key={p.id}>
                  <div className="tc-top">
                    <ProductIcon category={p.category} size={34} />
                    <div className="grow"><b>{p.brand} {p.name}</b><small>{p.model}</small></div>
                  </div>
                  <ProgressBar percent={p.w.percent} status={p.w.status} />
                  <div className="tc-foot">
                    <span>{fmtDate(p.w.expiry)}</span>
                    <span className={`days ${p.w.status}`}>{daysText(p.w.daysLeft)}</span>
                  </div>
                </Link>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
