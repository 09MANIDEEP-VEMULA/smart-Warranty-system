import { useEffect, useRef, useState, useMemo } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Bell, ChevronDown, ChevronRight, LayoutDashboard, LogOut, Menu,
  PackagePlus, Package, RotateCcw, Search, Settings, ShieldCheck, Timer
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfirmModal, Toasts } from '../components/ui';
import ParticleBackground from '../components/ParticleBackground';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'My Products', icon: Package, end: true },
  { to: '/products/new', label: 'Add Product', icon: PackagePlus },
  { to: '/tracking', label: 'Warranty Tracking', icon: Timer },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: true },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const { user, logout, unreadCount, resetDemo } = useApp();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const loc = useLocation();
  const menuRef = useRef(null);

  useEffect(() => { setOpen(false); setMenu(false); window.scrollTo(0, 0); }, [loc.pathname]);
  useEffect(() => {
    const h = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenu(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const search = (e) => {
    e.preventDefault();
    nav(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : '/products');
  };

  const breadcrumbs = useMemo(() => {
    const p = loc.pathname;
    if (p === '/dashboard') return [{ label: 'Dashboard' }];
    if (p === '/products') return [{ label: 'My Products' }];
    if (p === '/products/new') return [{ label: 'My Products', to: '/products' }, { label: 'Add Product' }];
    if (p.startsWith('/products/') && p.endsWith('/edit')) {
      return [{ label: 'My Products', to: '/products' }, { label: 'Edit Product' }];
    }
    if (p.startsWith('/products/')) {
      return [{ label: 'My Products', to: '/products' }, { label: 'Product Details' }];
    }
    if (p === '/tracking') return [{ label: 'Warranty Tracking' }];
    if (p === '/notifications') return [{ label: 'Notifications' }];
    if (p === '/settings') return [{ label: 'Settings' }];
    return [{ label: 'Dashboard' }];
  }, [loc.pathname]);

  return (
    <div className="shell">
      {/* Subtle particle network in main app background */}
      <div style={{ position: 'fixed', top: 0, left: 260, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.35 }}>
        <ParticleBackground particleCount={35} interactive={false} opacity={0.04} background="transparent" />
      </div>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="logo"><ShieldCheck size={20} /></span>
          <div><b>Smart Warranty</b><small>Warranty tracking</small></div>
        </div>

        <nav>
          {NAV.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink key={to} to={to} end={end ?? true} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
              {badge && unreadCount > 0 && <em className="count">{unreadCount}</em>}
            </NavLink>
          ))}
        </nav>

        {/* User profile card at bottom of sidebar */}
        <div className="sidebar-profile">
          <span className="avatar">{user?.name ? user.name[0] : 'U'}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <b>{user?.name || 'User'}</b>
            <small>{user?.email || 'user@example.com'}</small>
          </div>
        </div>

        <div className="side-foot">
          <p>Demo mode</p>
          <small>Data is stored in this browser only.</small>
        </div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>

          {/* Breadcrumb navigation */}
          <nav className="breadcrumbs" aria-label="Breadcrumbs">
            {breadcrumbs.map((b, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <ChevronRight size={14} style={{ color: 'var(--muted)' }} />}
                {b.to ? (
                  <Link to={b.to}>{b.label}</Link>
                ) : (
                  <span className="current">{b.label}</span>
                )}
              </span>
            ))}
          </nav>

          <form className="search" onSubmit={search} role="search" style={{ marginLeft: 20 }}>
            <Search size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, brands, models…" aria-label="Search products" />
          </form>

          <div className="top-right">
            <button className="icon-btn bell" onClick={() => nav('/notifications')} aria-label="Notifications" title="Notifications">
              <Bell size={18} />
              {unreadCount > 0 && <span className="dot">{unreadCount}</span>}
            </button>

            <div className="profile" ref={menuRef}>
              <button className="profile-btn" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu}>
                <span className="avatar">{user?.name ? user.name[0] : 'U'}</span>
                <span className="pname">{user?.name || 'User'}</span>
                <ChevronDown size={14} />
              </button>
              {menu && (
                <div className="menu" role="menu">
                  <div className="menu-head"><b>{user?.name}</b><small>{user?.email}</small></div>
                  <button role="menuitem" onClick={() => { setMenu(false); setConfirm(true); }}><RotateCcw size={15} />Reset demo data</button>
                  <button role="menuitem" onClick={() => { logout(); nav('/login'); }}><LogOut size={15} />Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content"><Outlet /></main>
      </div>

      <ConfirmModal
        open={confirm}
        title="Reset demo data?"
        message="This replaces all products with the original 8 demo records. Any products you added will be removed."
        confirmLabel="Reset data"
        danger={false}
        onConfirm={() => { resetDemo(); setConfirm(false); }}
        onCancel={() => setConfirm(false)}
      />
      <Toasts />
    </div>
  );
}
