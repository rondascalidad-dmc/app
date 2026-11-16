/* Acceso: pide usuario de Mi Productividad (legajo o correo de administrador) antes de mostrar la app. */
import React, { useEffect, useState } from 'react';
import { sb } from './compartido.jsx';

const CSS = `#gate{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:#0b0b0b;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#f2f2f2}
#gate[hidden]{display:none}
#gate .g-card{width:min(360px,92vw);background:#161616;border:1px solid #2b2b2b;border-top:4px solid #FFC000;border-radius:14px;padding:26px 22px;box-shadow:0 20px 50px rgba(0,0,0,.5)}
#gate small{display:block;color:#FFC000;font-weight:700;letter-spacing:.12em;font-size:11px}
#gate h2{margin:6px 0 4px;font-size:22px}
#gate p{margin:0 0 16px;color:#9a9a9a;font-size:13px}
#gate .g-tabs{display:flex;gap:6px;margin-bottom:12px}
#gate .g-tabs button{flex:1;padding:8px;border-radius:8px;border:1px solid #333;background:#0f0f0f;color:#bbb;font:inherit;font-size:13px;cursor:pointer}
#gate .g-tabs button.on{background:#FFC000;color:#111;border-color:#FFC000;font-weight:700}
#gate input{width:100%;box-sizing:border-box;margin-bottom:10px;padding:11px 12px;border-radius:8px;border:1px solid #333;background:#0b0b0b;color:#f2f2f2;font:inherit;font-size:15px}
#gate .g-go{width:100%;padding:11px;border:0;border-radius:8px;background:#FFC000;color:#111;font:inherit;font-weight:800;font-size:15px;cursor:pointer}
#gate .g-go:disabled{opacity:.6}
#gate .g-err{color:#ff6b6b;font-size:13px;min-height:18px;margin:2px 0 8px}
#gate-out{position:fixed;right:10px;bottom:10px;z-index:2147482000;padding:5px 10px;border-radius:999px;border:1px solid #444;background:rgba(20,20,20,.85);color:#bbb;font:12px system-ui,sans-serif;cursor:pointer}
`;

const esAdm = s => !!s && !/^(?!administrador@)[^@]+@personal\.local$/i.test((s.user && s.user.email) || '');

export function Acceso({ children }) {
  const [estado, setEstado] = useState('cargando');
  const [user, setUser] = useState(''), [pass, setPass] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { sb.auth.getSession().then(({ data }) => { const s = data && data.session; if (esAdm(s)) setEstado('ok'); else { if (s) sb.auth.signOut(); setEstado('login'); } }); }, []);
  async function entrar(e) {
    e.preventDefault(); const u = user.trim(); if (!u || !pass) return;
    setBusy(true); setErr('');
    const { data, error } = await sb.auth.signInWithPassword({ email: u.includes('@') ? u : `${u}@personal.local`, password: pass });
    if (error) { setBusy(false); setErr('Usuario o contraseña incorrectos.'); return; }
    if (!esAdm(data && data.session)) { await sb.auth.signOut(); setBusy(false); setErr('Solo el administrador puede entrar.'); return; }
    location.reload();
  }
  if (estado === 'cargando') return <style>{CSS}</style>;
  if (estado === 'ok') return <>{children}<style>{CSS}</style><button id="gate-out" type="button" onClick={() => sb.auth.signOut().then(() => location.reload())}>Salir</button></>;
  return <div id="gate"><style>{CSS}</style>
    <form className="g-card" onSubmit={entrar}>
      <small>CD MERCADO CENTRAL</small><h2>Ingresar</h2><p>Acceso solo para administrador.</p>
      <input value={user} onChange={e => setUser(e.target.value)} placeholder="Usuario" autoComplete="username" autoCapitalize="none" required />
      <input value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="Contraseña" autoComplete="current-password" required />
      <div className="g-err">{err}</div>
      <button className="g-go" disabled={busy}>{busy ? 'Ingresando…' : 'Entrar'}</button>
    </form></div>;
}
