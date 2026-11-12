import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Eye, FileText, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfirmModal, InvoiceView, Modal, ProductIcon, ProgressBar, StatusBadge } from '../components/ui';
import { daysText, fmtDate, fmtMoney } from '../utils/warranty';

const Info = ({ label, value }) => (
  <div className="info"><small>{label}</small><b>{value || '—'}</b></div>
);

export default function ProductDetails() {
  const { id } = useParams();
  const { items, deleteProduct } = useApp();
  const nav = useNavigate();
  const [del, setDel] = useState(false);
  const [view, setView] = useState(false);
  const p = items.find((x) => x.id === id);
  if (!p) return <Navigate to="/products" replace />;
  const { w } = p;

  return (
    <>
      <Link to="/products" className="back"><ArrowLeft size={16} />Back to products</Link>
      <div className="detail-head card animate-in">
        <ProductIcon category={p.category} size={56} />
        <div className="grow">
          <h1>{p.brand} {p.name}</h1>
          <p className="muted">{p.model} · {p.category}</p>
        </div>
        <StatusBadge status={w.status} />
        <div className="actions">
          <Link className="btn ghost" to={`/products/${p.id}/edit`}><Pencil size={16} />Edit</Link>
          <button className="btn danger-ghost" onClick={() => setDel(true)}><Trash2 size={16} />Delete</button>
        </div>
      </div>

      <div className="grid-detail animate-in" style={{ animationDelay: '0.1s' }}>
        <section className="card">
          <h3>Product information</h3>
          <div className="info-grid">
            <Info label="Product name" value={p.name} />
            <Info label="Brand" value={p.brand} />
            <Info label="Model number" value={p.model} />
            <Info label="Serial number" value={p.serial} />
            <Info label="Category" value={p.category} />
            <Info label="Purchase price" value={fmtMoney(p.price)} />
            <Info label="Seller / store" value={p.seller} />
            <Info label="Purchase date" value={fmtDate(p.purchaseDate)} />
          </div>
        </section>

        <section className="card">
          <h3>Warranty</h3>
          <div className="info-grid one">
            <Info label="Warranty duration" value={`${p.warrantyMonths} months`} />
            <Info label="Warranty expiry date" value={fmtDate(w.expiry)} />
            <Info label="Warranty status" value={<StatusBadge status={w.status} />} />
          </div>
          <div className="cover">
            <div className="cover-row"><span>Coverage used</span><b>{w.percent}%</b></div>
            <ProgressBar percent={w.percent} status={w.status} />
            <p className={`days ${w.status}`}>{daysText(w.daysLeft)}</p>
          </div>
        </section>

        <section className="card span-2">
          <h3>Invoice</h3>
          {p.invoice ? (
            <div className="file-chip">
              <FileText size={20} />
              <div className="grow"><b>{p.invoice.name}</b><small>{(p.invoice.size / 1024).toFixed(0)} KB</small></div>
              <button className="btn ghost sm" onClick={() => setView(true)}><Eye size={15} />Preview</button>
              <a className="btn ghost sm" href={p.invoice.data} download={p.invoice.name}><Download size={15} />Download</a>
            </div>
          ) : (
            <p className="muted">No invoice uploaded. <Link className="link" to={`/products/${p.id}/edit`}>Add one by editing this product.</Link></p>
          )}
        </section>
      </div>

      <Modal open={view} title={p.invoice?.name || 'Invoice'} onClose={() => setView(false)} wide><InvoiceView invoice={p.invoice} /></Modal>
      <ConfirmModal
        open={del}
        title="Delete product?"
        message={`${p.brand} ${p.name} and its invoice will be removed. This cannot be undone.`}
        onConfirm={() => { deleteProduct(p.id); nav('/products', { replace: true }); }}
        onCancel={() => setDel(false)}
      />
    </>
  );
}
