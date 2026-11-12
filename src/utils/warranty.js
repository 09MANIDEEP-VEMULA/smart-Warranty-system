// All dates are handled as local calendar dates (YYYY-MM-DD) to avoid timezone drift.
const pad = (n) => String(n).padStart(2, '0');

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISO = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const today = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};

export function addMonths(date, months) {
  const d = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(date.getDate(), lastDay));
  return d;
}

export const daysBetween = (a, b) => Math.round((b - a) / 86400000);

export const EXPIRING_DAYS = 30;

export function getWarranty(p) {
  const start = parseISO(p.purchaseDate);
  const expiry = addMonths(start, Number(p.warrantyMonths));
  const daysLeft = daysBetween(today(), expiry);
  const status = daysLeft < 0 ? 'expired' : daysLeft <= EXPIRING_DAYS ? 'expiring' : 'active';
  const total = Math.max(1, daysBetween(start, expiry));
  const used = Math.min(total, Math.max(0, daysBetween(start, today())));
  return { expiry, expiryISO: toISO(expiry), daysLeft, status, percent: Math.round((used / total) * 100) };
}

export const STATUS = {
  active: { label: 'Active' },
  expiring: { label: 'Expiring Soon' },
  expired: { label: 'Expired' },
};

export const fmtDate = (v) => {
  if (!v) return '—';
  const d = typeof v === 'string' ? parseISO(v.slice(0, 10)) : v;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const fmtMoney = (n) =>
  n === '' || n == null || isNaN(Number(n))
    ? '—'
    : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n));

export const daysText = (n) =>
  n === 0 ? 'Expires today' : n > 0 ? `${n} day${n === 1 ? '' : 's'} left` : `Expired ${-n} day${n === -1 ? '' : 's'} ago`;

export const timeAgo = (iso) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
};

export const CATEGORIES = ['Electronics', 'Mobile', 'Home Appliances', 'Accessories', 'Vehicles', 'Furniture', 'Other'];

// Notifications: warranties expiring within 30 days, plus ones that expired in the last 90 days.
export function buildNotifications(items) {
  const list = items
    .filter((p) => p.w.status === 'expiring' || (p.w.status === 'expired' && p.w.daysLeft >= -90))
    .map((p) => ({ key: `${p.id}:${p.w.expiryISO}`, product: p, w: p.w, urgent: p.w.status === 'expiring' && p.w.daysLeft <= 7 }));
  const soon = list.filter((n) => n.w.status === 'expiring').sort((a, b) => a.w.daysLeft - b.w.daysLeft);
  const gone = list.filter((n) => n.w.status === 'expired').sort((a, b) => b.w.daysLeft - a.w.daysLeft);
  return [...soon, ...gone];
}
