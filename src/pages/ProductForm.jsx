import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  CalendarCheck, FileText, Package, Receipt, ShieldCheck,
  Sparkles, UploadCloud, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InvoiceView, Modal, PageHeader, StatusBadge } from '../components/ui';
import { CATEGORIES, addMonths, daysText, fmtDate, getWarranty, parseISO, toISO, today } from '../utils/warranty';

const MAX_BYTES = 1.5 * 1024 * 1024;
const blank = {
  name: '', brand: '', model: '', serial: '', category: '',
  purchaseDate: '', warrantyMonths: '', seller: '', price: '', invoice: null
};

function Field({ err, k, label, children, required }) {
  return (
    <label className={`field ${err[k] ? 'invalid' : ''}`}>
      <span>{label}{required && <i className="req"> *</i>}</span>
      {children}
      {err[k] && <small className="err">{err[k]}</small>}
    </label>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const { items, addProduct, updateProduct } = useApp();
  const nav = useNavigate();
  const editing = !!id;
  const existing = editing ? items.find((p) => p.id === id) : null;
  const [f, setF] = useState(() => (existing ? { ...blank, ...existing, price: existing.price ?? '' } : blank));
  const [err, setErr] = useState({});
  const [preview, setPreview] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);

  if (editing && !existing) return <Navigate to="/products" replace />;

  const set = (k, v) => {
    setF((s) => ({ ...s, [k]: v }));
    setErr((e) => ({ ...e, [k]: undefined, file: undefined }));
  };
  const todayISO = toISO(today());

  const validate = () => {
    const e = {};
    ['name', 'brand', 'model', 'seller'].forEach((k) => {
      if (!String(f[k]).trim()) e[k] = 'This field is required.';
    });
    if (!f.category) e.category = 'Choose a category.';
    if (!f.purchaseDate) e.purchaseDate = 'Select the purchase date.';
    else if (isNaN(parseISO(f.purchaseDate)) || parseISO(f.purchaseDate).getFullYear() < 2000) {
      e.purchaseDate = 'Enter a valid date (year 2000 or later).';
    } else if (f.purchaseDate > todayISO) {
      e.purchaseDate = 'Purchase date cannot be in the future.';
    }
    const m = Number(f.warrantyMonths);
    if (f.warrantyMonths === '') e.warrantyMonths = 'Enter the warranty duration in months.';
    else if (!Number.isInteger(m) || m < 1 || m > 120) e.warrantyMonths = 'Enter a whole number from 1 to 120.';
    if (f.price !== '' && (isNaN(Number(f.price)) || Number(f.price) < 0)) e.price = 'Enter a valid amount.';
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErr(e);
    if (Object.keys(e).length) {
      document.querySelector('.field.invalid')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    const data = {
      name: f.name.trim(), brand: f.brand.trim(), model: f.model.trim(), serial: f.serial.trim(),
      category: f.category, purchaseDate: f.purchaseDate, warrantyMonths: Number(f.warrantyMonths),
      seller: f.seller.trim(), price: f.price === '' ? '' : Number(f.price), invoice: f.invoice,
    };
    if (editing) {
      updateProduct(id, data);
      nav(`/products/${id}`);
    } else {
      const newId = addProduct(data);
      nav('/products', { state: { highlight: newId } });
    }
  };

  const takeFile = (file) => {
    if (!file) return;
    const ok = file.type.startsWith('image/') || file.type === 'application/pdf';
    if (!ok) return setErr((e) => ({ ...e, file: 'Upload an image (JPG, PNG) or a PDF.' }));
    if (file.size > MAX_BYTES) return setErr((e) => ({ ...e, file: 'File is larger than 1.5 MB. Choose a smaller file.' }));
    const r = new FileReader();
    r.onload = () => { set('invoice', { name: file.name, type: file.type, size: file.size, data: r.result }); };
    r.onerror = () => setErr((e) => ({ ...e, file: 'Could not read that file.' }));
    r.readAsDataURL(file);
  };

  const fillSample = () => {
    const d = today();
    d.setDate(d.getDate() - 25);
    setF({
      ...blank,
      name: 'Smart Watch',
      brand: 'Apple',
      model: 'Watch Series 9 GPS',
      serial: 'APL-W9-88102',
      category: 'Electronics',
      purchaseDate: toISO(d),
      warrantyMonths: '12',
      seller: 'Apple Store Online',
      price: '41900',
      invoice: null
    });
    setErr({});
  };

  const live = f.purchaseDate && f.warrantyMonths !== '' && Number.isInteger(Number(f.warrantyMonths)) && Number(f.warrantyMonths) > 0 && f.purchaseDate <= '9999'
    ? getWarranty({ purchaseDate: f.purchaseDate, warrantyMonths: Number(f.warrantyMonths) }) : null;

  return (
    <>
      <PageHeader
        title={editing ? 'Edit Product' : 'Add New Product'}
        subtitle={editing ? 'Update the specifications, purchase or warranty details.' : 'Register a new product to monitor its warranty period.'}
      >
        {!editing && (
          <button type="button" className="btn ghost" onClick={fillSample}>
            <Sparkles size={16} />Fill sample product
          </button>
        )}
      </PageHeader>

      <form className="form-grid animate-in" onSubmit={submit} noValidate>
        <section className="card form-card">
          {/* Section 1: Product Information */}
          <div className="form-section-title">
            <Package size={17} style={{ color: 'var(--primary)' }} />
            <span>Product Information</span>
          </div>
          <div className="cols-2">
            <Field err={err} k="name" label="Product Name" required>
              <input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Laptop, Smartphone, Refrigerator" />
            </Field>
            <Field err={err} k="brand" label="Brand" required>
              <input value={f.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Sony, Apple, Samsung" />
            </Field>
            <Field err={err} k="model" label="Model Number" required>
              <input value={f.model} onChange={(e) => set('model', e.target.value)} placeholder="e.g. Bravia KD-43X75L" />
            </Field>
            <Field err={err} k="serial" label="Serial Number">
              <input value={f.serial} onChange={(e) => set('serial', e.target.value)} placeholder="e.g. SN-882941-X (Optional)" />
            </Field>
            <Field err={err} k="category" label="Category" required>
              <select value={f.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          {/* Section 2: Purchase Information */}
          <div className="form-section-title mt">
            <Receipt size={17} style={{ color: 'var(--primary)' }} />
            <span>Purchase Information</span>
          </div>
          <div className="cols-2">
            <Field err={err} k="purchaseDate" label="Purchase Date" required>
              <input type="date" max={todayISO} value={f.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} />
            </Field>
            <Field err={err} k="seller" label="Seller / Store Name" required>
              <input value={f.seller} onChange={(e) => set('seller', e.target.value)} placeholder="e.g. Amazon India, Croma, Reliance Digital" />
            </Field>
            <Field err={err} k="price" label="Purchase Price (₹)">
              <input type="number" min="0" value={f.price} onChange={(e) => set('price', e.target.value)} placeholder="e.g. 54990 (Optional)" />
            </Field>
          </div>

          {/* Section 3: Warranty Information */}
          <div className="form-section-title mt">
            <ShieldCheck size={17} style={{ color: 'var(--primary)' }} />
            <span>Warranty Information</span>
          </div>
          <div className="cols-2">
            <Field err={err} k="warrantyMonths" label="Warranty Duration (Months)" required>
              <input
                type="number"
                min="1"
                max="120"
                value={f.warrantyMonths}
                onChange={(e) => set('warrantyMonths', e.target.value)}
                placeholder="e.g. 12, 24, 36"
              />
              <div className="chips">
                {[6, 12, 24, 36].map((m) => (
                  <button
                    type="button"
                    key={m}
                    className={`chip ${Number(f.warrantyMonths) === m ? 'on' : ''}`}
                    onClick={() => set('warrantyMonths', String(m))}
                  >
                    {m} mo
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* Section 4: Invoice Upload */}
          <div className="form-section-title mt">
            <FileText size={17} style={{ color: 'var(--primary)' }} />
            <span>Invoice & Bill Attachment</span>
          </div>
          {f.invoice ? (
            <div className="file-chip">
              <FileText size={20} style={{ color: 'var(--primary)' }} />
              <div className="grow">
                <b>{f.invoice.name}</b>
                <small>{(f.invoice.size / 1024).toFixed(0)} KB</small>
              </div>
              <button type="button" className="btn ghost sm" onClick={() => setPreview(true)}>Preview</button>
              <button type="button" className="icon-btn" aria-label="Remove invoice" onClick={() => set('invoice', null)}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              className={`drop ${drag ? 'over' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); takeFile(e.dataTransfer.files[0]); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileRef.current?.click()}
            >
              <UploadCloud size={28} style={{ color: 'var(--primary)' }} />
              <b>Upload Purchase Invoice</b>
              <small>Drop your PDF or image here, or click to browse. Max size: 1.5 MB.</small>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            hidden
            data-testid="invoice-input"
            onChange={(e) => { takeFile(e.target.files[0]); e.target.value = ''; }}
          />
          {err.file && <small className="err">{err.file}</small>}
        </section>

        {/* Sticky Sidebar Summary */}
        <aside className="side-col">
          <section className="card summary">
            <h3>Warranty Summary</h3>
            {live ? (
              <>
                <div className="calc">
                  <CalendarCheck size={20} />
                  <div>
                    <small>Calculated Expiry Date</small>
                    <strong data-testid="expiry-preview">{fmtDate(live.expiry)}</strong>
                  </div>
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="muted small">Status:</span>
                  <StatusBadge status={live.status} />
                </div>
                <p className={`days ${live.status}`} style={{ marginTop: 8 }}>
                  {live.status === 'expired' ? 'Already expired — ' : ''}{daysText(live.daysLeft)}
                </p>
                <p className="muted small" style={{ marginTop: 6 }}>
                  Purchase date + {Number(f.warrantyMonths)} month{Number(f.warrantyMonths) === 1 ? '' : 's'} coverage.
                </p>
              </>
            ) : (
              <p className="muted small" style={{ marginTop: 8 }}>
                Select purchase date and enter duration in months to preview the calculated expiry schedule.
              </p>
            )}
          </section>

          <div className="btn-stack">
            <button className="btn primary block" type="submit" style={{ padding: '11px 18px' }}>
              {editing ? 'Save Changes' : 'Register Product'}
            </button>
            <Link className="btn ghost block" to={editing ? `/products/${id}` : '/products'} style={{ padding: '11px 18px' }}>
              Cancel
            </Link>
          </div>
        </aside>
      </form>

      <Modal open={preview} title={f.invoice?.name || 'Invoice Preview'} onClose={() => setPreview(false)} wide>
        <InvoiceView invoice={f.invoice} />
      </Modal>
    </>
  );
}
