import { Link } from 'react-router-dom';
import { AlertTriangle, Armchair, Car, CheckCircle2, Home, Headphones, Info, Laptop, Package, Smartphone, X, XCircle } from 'lucide-react';
import { STATUS } from '../utils/warranty';
import { useApp } from '../context/AppContext';

const ICONS = { Electronics: Laptop, Mobile: Smartphone, 'Home Appliances': Home, Accessories: Headphones, Vehicles: Car, Furniture: Armchair, Other: Package };

export function ProductIcon({ category, size = 40 }) {
  const Icon = ICONS[category] || Package;
  return (
    <span className="picon" style={{ width: size, height: size }}>
      <Icon size={size * 0.5} />
    </span>
  );
}

export const StatusBadge = ({ status }) => (
  <span className={`badge ${status}`}>
    <i />
    {STATUS[status].label}
  </span>
);

export const ProgressBar = ({ percent, status }) => (
  <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
    <div className={`bar ${status}`} style={{ width: `${percent}%` }} />
  </div>
);

export function Modal({ open, title, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, title, message, confirmLabel = 'Delete', danger = true, onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="muted" style={{ marginTop: 0 }}>{message}</p>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onCancel}>Cancel</button>
        <button className={`btn ${danger ? 'danger' : 'primary'}`} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

export function InvoiceView({ invoice }) {
  if (!invoice) return null;
  if (invoice.type.startsWith('image/')) return <img className="invoice-img" src={invoice.data} alt={invoice.name} />;
  if (invoice.type === 'application/pdf') return <iframe className="invoice-pdf" src={invoice.data} title={invoice.name} />;
  return <p className="muted">Preview is not available for this file type.</p>;
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      <div className="page-actions">{children}</div>
    </div>
  );
}

export const Empty = ({ title, text, action }) => (
  <div className="empty">
    <Package size={30} />
    <h3>{title}</h3>
    <p className="muted">{text}</p>
    {action}
  </div>
);

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  const icon = { success: CheckCircle2, error: XCircle, info: Info, warn: AlertTriangle };
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => {
        const Icon = icon[t.type] || Info;
        return (
          <div key={t.id} className={`toast ${t.type}`}>
            <Icon size={18} />
            <span>{t.message}</span>
            <button onClick={() => dismissToast(t.id)} aria-label="Dismiss"><X size={14} /></button>
          </div>
        );
      })}
    </div>
  );
}

export const LinkBtn = ({ to, icon: Icon, children, kind = 'primary' }) => (
  <Link to={to} className={`btn ${kind}`}>
    {Icon && <Icon size={16} />}
    {children}
  </Link>
);
