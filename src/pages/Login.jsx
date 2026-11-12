import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, FileText, Lock, Mail, ShieldCheck, Timer } from 'lucide-react';
import { DEMO_LOGIN, useApp } from '../context/AppContext';
import { Toasts } from '../components/ui';
import ParticleBackground from '../components/ParticleBackground';

export default function Login() {
  const { login } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError('Enter your email and password.');
    const r = login(email, password, remember);
    if (r.ok) nav('/dashboard', { replace: true });
    else setError(r.error);
  };

  const demo = () => {
    login(DEMO_LOGIN.email, DEMO_LOGIN.password, remember);
    nav('/dashboard', { replace: true });
  };

  return (
    <div className="login">
      {/* Left Section: Interactive Particle Canvas + SaaS Branding */}
      <section className="login-art">
        <ParticleBackground interactive={true} opacity={1} background="#0B1220" />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div className="brand light">
            <span className="logo"><ShieldCheck size={20} /></span>
            <div><b>Smart Warranty</b><small style={{ color: '#94A3B8' }}>Product warranty tracking</small></div>
          </div>

          <div className="login-copy">
            <h2>Never Miss a Warranty Again.</h2>
            <p>Keep every purchase, invoice and warranty date in one place. Get smart reminders before coverage expires.</p>
            <ul>
              <li><ShieldCheck size={18} /> Centralised Warranty Management</li>
              <li><Timer size={18} /> Smart Expiry Tracking</li>
              <li><FileText size={18} /> Organised Purchase Records</li>
            </ul>
          </div>

          <div style={{ height: 1 }} />
        </div>
      </section>

      {/* Right Section: Crisp SaaS Sign-In Card */}
      <section className="login-form-wrap">
        <form className="login-form animate-in" onSubmit={submit} noValidate>
          <div style={{ textAlign: 'center', marginBottom: 4 }}>
            <span className="logo" style={{ width: 44, height: 44, margin: '0 auto 14px', display: 'grid' }}>
              <ShieldCheck size={22} />
            </span>
            <h1>Welcome back</h1>
            <p className="muted" style={{ marginTop: 4 }}>Sign in to manage your warranties</p>
          </div>

          {error && <div className="alert" role="alert">{error}</div>}

          <label className="field">
            <span>Email</span>
            <div className="input-wrap">
              <Mail size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                autoComplete="username"
              />
            </div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input-wrap">
              <Lock size={16} />
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <label className="check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me on this device
          </label>

          <button className="btn primary block" type="submit" style={{ padding: '11px 18px', fontSize: '14.5px' }}>
            Sign in
          </button>

          <div className="divider"><span>or</span></div>

          <button className="btn ghost block" type="button" onClick={demo} style={{ padding: '11px 18px' }}>
            Continue with demo account
          </button>

          <div className="demo-box">
            <b>Demo account credentials</b>
            <span>{DEMO_LOGIN.email}</span>
            <span>Password: {DEMO_LOGIN.password}</span>
          </div>
        </form>
      </section>

      <Toasts />
    </div>
  );
}
