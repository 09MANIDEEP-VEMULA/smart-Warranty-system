import { Link } from 'react-router-dom';
import { AlertTriangle, BellRing, CheckCheck, Clock, Info, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Empty, PageHeader, ProductIcon } from '../components/ui';
import { daysText, fmtDate } from '../utils/warranty';

export default function Notifications() {
  const { notifications, markRead, unreadCount, toast } = useApp();
  const first = notifications.find((n) => n.w.status === 'expiring');

  return (
    <>
      <PageHeader title="Notifications" subtitle={`${unreadCount} unread · ${notifications.length} total`}>
        <button className="btn ghost" onClick={() => { if (first) toast(`Test reminder created for ${first.product.brand} ${first.product.name}. No email or SMS is sent.`, 'info'); else toast('No expiring products to remind about.', 'info'); }}>
          <BellRing size={16} />Create test reminder
        </button>
        <button className="btn ghost" disabled={unreadCount === 0} onClick={() => markRead(notifications.map((n) => n.key))}>
          <CheckCheck size={16} />Mark all as read
        </button>
      </PageHeader>

      <div className="note"><Info size={16} />These are simulated in-app notifications. The prototype does not send real emails or SMS.</div>

      <div className="card flush animate-in">
        {notifications.length === 0 ? (
          <Empty title="You are all caught up" text="Warranties expiring within 30 days will appear here." />
        ) : (
          <ul className="notifs">
            {notifications.map((n) => {
              const expired = n.w.status === 'expired';
              const Icon = expired ? XCircle : n.urgent ? AlertTriangle : Clock;
              return (
                <li key={n.key} className={`notif ${n.read ? 'read' : ''}`} data-testid="notif">
                  <span className={`n-icon ${expired ? 'expired' : n.urgent ? 'urgent' : 'expiring'}`}><Icon size={18} /></span>
                  <ProductIcon category={n.product.category} size={36} />
                  <div className="grow">
                    <Link to={`/products/${n.product.id}`} className="n-title">{n.product.brand} {n.product.name}</Link>
                    <small>{expired ? 'Warranty expired on' : 'Warranty expires on'} {fmtDate(n.w.expiry)}</small>
                  </div>
                  <span className={`days ${n.w.status}`}>{daysText(n.w.daysLeft)}</span>
                  <span className={`tag ${expired ? 'expired' : n.urgent ? 'urgent' : 'expiring'}`}>{expired ? 'Expired' : n.urgent ? 'Urgent' : 'Reminder due'}</span>
                  <button className={`btn sm ${n.read ? 'ghost' : 'soft'}`} onClick={() => markRead([n.key], !n.read)}>{n.read ? 'Read' : 'Mark as read'}</button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
