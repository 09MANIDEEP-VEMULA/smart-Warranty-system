import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { buildDemoActivity, buildDemoProducts } from '../data/demo';
import { buildNotifications, getWarranty } from '../utils/warranty';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const K = {
  products: 'smartwarranty.products.v1',
  activity: 'smartwarranty.activity.v1',
  read: 'smartwarranty.read.v1',
  user: 'smartwarranty.user.v1',
};
export const DEMO_LOGIN = { email: 'demo@smartwarranty.com', password: 'demo123', name: 'Demo User' };

const load = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const save = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
    return true;
  } catch {
    return false;
  }
};
const readUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem(K.user) || localStorage.getItem(K.user) || 'null');
  } catch {
    return null;
  }
};
const uid = () => `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function AppProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [products, setProducts] = useState(() => {
    const s = load(K.products, null);
    return Array.isArray(s) ? s : buildDemoProducts();
  });
  const [activity, setActivity] = useState(() => {
    const s = load(K.activity, null);
    return Array.isArray(s) ? s : buildDemoActivity();
  });
  const [readKeys, setReadKeys] = useState(() => load(K.read, []));
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const toast = useCallback((message, type = 'success') => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  useEffect(() => {
    if (!save(K.products, products)) toast('Storage is full. Try a smaller invoice file.', 'error');
  }, [products, toast]);
  useEffect(() => { save(K.activity, activity); }, [activity]);
  useEffect(() => { save(K.read, readKeys); }, [readKeys]);

  const log = useCallback((type, text) => {
    setActivity((a) => [{ id: uid(), type, text, at: new Date().toISOString() }, ...a].slice(0, 30));
  }, []);

  const login = (email, password, remember) => {
    if (email.trim().toLowerCase() === DEMO_LOGIN.email && password === DEMO_LOGIN.password) {
      const u = { name: DEMO_LOGIN.name, email: DEMO_LOGIN.email };
      try {
        sessionStorage.setItem(K.user, JSON.stringify(u));
        if (remember) localStorage.setItem(K.user, JSON.stringify(u));
      } catch { /* ignore */ }
      setUser(u);
      return { ok: true };
    }
    return { ok: false, error: 'Incorrect email or password. Use the demo account below.' };
  };
  const logout = () => {
    try { sessionStorage.removeItem(K.user); localStorage.removeItem(K.user); } catch { /* ignore */ }
    setUser(null);
  };

  const addProduct = (data) => {
    const p = { ...data, id: uid(), createdAt: new Date().toISOString() };
    setProducts((ps) => [p, ...ps]);
    log('add', `Added ${p.brand} ${p.name}`);
    toast(`${p.brand} ${p.name} added successfully`);
    return p.id;
  };
  const updateProduct = (id, data) => {
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...data } : p)));
    log('edit', `Updated ${data.brand} ${data.name}`);
    toast('Product updated successfully');
  };
  const deleteProduct = (id) => {
    const p = products.find((x) => x.id === id);
    setProducts((ps) => ps.filter((x) => x.id !== id));
    if (p) { log('delete', `Deleted ${p.brand} ${p.name}`); toast(`${p.brand} ${p.name} deleted`, 'info'); }
  };
  const resetDemo = () => {
    setProducts(buildDemoProducts());
    setActivity(buildDemoActivity());
    setReadKeys([]);
    toast('Demo data restored');
  };
  const clearAll = () => {
    setProducts([]);
    setActivity([]);
    toast('All products removed', 'info');
  };

  const items = useMemo(() => products.map((p) => ({ ...p, w: getWarranty(p) })), [products]);
  const notifications = useMemo(
    () => buildNotifications(items).map((n) => ({ ...n, read: readKeys.includes(n.key) })),
    [items, readKeys]
  );
  const markRead = (keys, read = true) =>
    setReadKeys((r) => (read ? [...new Set([...r, ...keys])] : r.filter((k) => !keys.includes(k))));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = {
    user, login, logout, items, activity, notifications, unreadCount, markRead,
    addProduct, updateProduct, deleteProduct, resetDemo, clearAll, toast, toasts,
    dismissToast: (id) => setToasts((t) => t.filter((x) => x.id !== id)),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
