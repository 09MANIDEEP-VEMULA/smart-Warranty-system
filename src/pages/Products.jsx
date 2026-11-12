import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, PackagePlus, Pencil, Search, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfirmModal, Empty, LinkBtn, PageHeader, ProductIcon, StatusBadge } from '../components/ui';
import { CATEGORIES, fmtDate } from '../utils/warranty';

export default function Products() {
  const { items, deleteProduct } = useApp();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const highlight = useLocation().state?.highlight;
  const [toDelete, setToDelete] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const q = params.get('q') || '';
  const status = params.get('status') || '';
  const category = params.get('category') || '';

  const set = (k, v) => {
    const n = new URLSearchParams(params);
    v ? n.set(k, v) : n.delete(k);
    setParams(n, { replace: true });
  };

  const term = q.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    return items.filter((p) =>
      (!term || [p.name, p.brand, p.model, p.serial, p.seller].some((f) => (f || '').toLowerCase().includes(term))) &&
      (!status || p.w.status === status) &&
      (!category || p.category === category)
    );
  }, [items, term, status, category]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const rows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let valA, valB;
      if (sortField === 'name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
      else if (sortField === 'brand') { valA = a.brand.toLowerCase(); valB = b.brand.toLowerCase(); }
      else if (sortField === 'model') { valA = a.model.toLowerCase(); valB = b.model.toLowerCase(); }
      else if (sortField === 'purchaseDate') { valA = a.purchaseDate; valB = b.purchaseDate; }
      else if (sortField === 'expiry') { valA = a.w.expiryISO; valB = b.w.expiryISO; }
      else if (sortField === 'status') { valA = a.w.status; valB = b.w.status; }
      else { valA = a.name; valB = b.name; }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortField, sortDir]);

  const filtered = term || status || category;

  const renderSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown size={13} style={{ opacity: 0.4 }} />;
    return sortDir === 'asc' ? <ArrowUp size={13} style={{ color: 'var(--primary)' }} /> : <ArrowDown size={13} style={{ color: 'var(--primary)' }} />;
  };

  return (
    <>
      <PageHeader title="My Products" subtitle={`${items.length} registered product${items.length === 1 ? '' : 's'} in total`}>
        <LinkBtn to="/products/new" icon={PackagePlus}>Add product</LinkBtn>
      </PageHeader>

      <div className="card flush animate-in">
        <div className="toolbar">
          <div className="input-wrap grow">
            <Search size={16} />
            <input
              value={q}
              onChange={(e) => set('q', e.target.value)}
              placeholder="Search by name, brand, model or serial number…"
              aria-label="Search product list"
            />
          </div>
          <select value={status} onChange={(e) => set('status', e.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
          <select value={category} onChange={(e) => set('category', e.target.value)} aria-label="Filter by category">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          {filtered && (
            <button className="btn ghost sm" onClick={() => setParams({}, { replace: true })}>
              <X size={14} />Clear filters
            </button>
          )}
        </div>

        {rows.length === 0 ? (
          <Empty
            title={filtered ? 'No products match your filters' : 'No products yet'}
            text={filtered ? 'Try adjusting your search terms or clearing the selected filters.' : 'Add your first product to start tracking its warranty schedule.'}
            action={!filtered && <LinkBtn to="/products/new" icon={PackagePlus}>Add product</LinkBtn>}
          />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('name')}>
                      <span className="th-content">Product Name {renderSortIcon('name')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('brand')}>
                      <span className="th-content">Brand {renderSortIcon('brand')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('model')}>
                      <span className="th-content">Model {renderSortIcon('model')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('purchaseDate')}>
                      <span className="th-content">Purchase Date {renderSortIcon('purchaseDate')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('expiry')}>
                      <span className="th-content">Warranty Expiry {renderSortIcon('expiry')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('status')}>
                      <span className="th-content">Status {renderSortIcon('status')}</span>
                    </th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className={highlight === p.id ? 'flash' : ''} data-testid={`row-${p.id}`}>
                      <td>
                        <Link to={`/products/${p.id}`} className="cell-product">
                          <ProductIcon category={p.category} size={34} />
                          <span>
                            <b>{p.name}</b>
                            <small>{p.category}</small>
                          </span>
                        </Link>
                      </td>
                      <td>{p.brand}</td>
                      <td>{p.model}</td>
                      <td>{fmtDate(p.purchaseDate)}</td>
                      <td>{fmtDate(p.w.expiry)}</td>
                      <td><StatusBadge status={p.w.status} /></td>
                      <td>
                        <div className="actions">
                          <button
                            className="icon-btn"
                            title="View details"
                            aria-label={`View ${p.name}`}
                            onClick={() => nav(`/products/${p.id}`)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="icon-btn"
                            title="Edit product"
                            aria-label={`Edit ${p.name}`}
                            onClick={() => nav(`/products/${p.id}/edit`)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-btn del"
                            title="Delete product"
                            aria-label={`Delete ${p.name}`}
                            onClick={() => setToDelete(p)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>Showing <b>{rows.length}</b> of <b>{items.length}</b> product{items.length === 1 ? '' : 's'}</span>
              {filtered && <span className="muted">Filtered from total records</span>}
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Delete product?"
        message={toDelete ? `${toDelete.brand} ${toDelete.name} and its attached invoice will be permanently removed. This cannot be undone.` : ''}
        onConfirm={() => { deleteProduct(toDelete.id); setToDelete(null); }}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
