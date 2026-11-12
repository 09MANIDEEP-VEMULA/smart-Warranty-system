import { useState } from 'react';
import { LogOut, RotateCcw, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ConfirmModal, PageHeader } from '../components/ui';

export default function Settings() {
  const { user, items, resetDemo, clearAll, logout } = useApp();
  const nav = useNavigate();
  const [dlg, setDlg] = useState(null);
  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your demo account and stored data." />
      <div className="grid-2 animate-in">
        <section className="card">
          <h3>Account</h3>
          <div className="info-grid one">
            <div className="info"><small>Name</small><b>{user.name}</b></div>
            <div className="info"><small>Email</small><b>{user.email}</b></div>
          </div>
          <button className="btn ghost mt" onClick={() => { logout(); nav('/login'); }}><LogOut size={16} />Sign out</button>
        </section>
        <section className="card">
          <h3>Demo data</h3>
          <p className="muted">{items.length} product{items.length === 1 ? '' : 's'} stored in this browser. Reset restores the original 8 demo records with dates matched to today.</p>
          <div className="btn-row">
            <button className="btn primary" onClick={() => setDlg('reset')}><RotateCcw size={16} />Reset demo data</button>
            <button className="btn danger-ghost" onClick={() => setDlg('clear')}><Trash2 size={16} />Remove all products</button>
          </div>
        </section>
      </div>
      <ConfirmModal open={dlg === 'reset'} title="Reset demo data?" message="This replaces all products with the original 8 demo records. Products you added will be removed." confirmLabel="Reset data" danger={false} onConfirm={() => { resetDemo(); setDlg(null); }} onCancel={() => setDlg(null)} />
      <ConfirmModal open={dlg === 'clear'} title="Remove all products?" message="Every product and invoice stored in this browser will be deleted. You can restore the demo records with Reset demo data." confirmLabel="Remove all" onConfirm={() => { clearAll(); setDlg(null); }} onCancel={() => setDlg(null)} />
    </>
  );
}
