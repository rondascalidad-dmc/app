/* Datos compartidos en Supabase (mismo proyecto que Mi Productividad).
   Todos leen; solo el administrador carga el Excel para el equipo. */
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SB_URL = 'https://chwxnahvdpufcuyjpocj.supabase.co';
const SB_KEY = 'sb_publishable_4uRwwSKwjzv5T84NF2PZ-Q_-9O__I_B';
export const sb = createClient(SB_URL, SB_KEY);

export async function leerCompartido() {
  const { data, error } = await sb.from('compartido').select('id,datos').eq('app', 'rondas').eq('coleccion', 'datos');
  if (error) return null;
  return Object.fromEntries(data.map(r => [r.id, r.datos]));
}
export async function esAdmin() { const { data } = await sb.auth.getSession(); return !!(data && data.session); }
/* devuelve un texto para mostrar en el aviso */
export async function subirCompartido(id, datos) {
  if (!(await esAdmin())) return 'Quedó solo en este navegador. Para que lo vea todo el equipo, entrá como Admin (abajo a la izquierda) y volvé a cargarlo.';
  const { error } = await sb.from('compartido').upsert({ app: 'rondas', coleccion: 'datos', id, datos, actualizado: new Date().toISOString() });
  return error ? '⚠ No se pudo guardar para el equipo; quedó en este navegador.' : '✓ Guardado: ya lo ve todo el equipo';
}

const box = { position: 'fixed', left: 12, bottom: 12, zIndex: 9999, fontFamily: 'system-ui, sans-serif', fontSize: 13 };
const pill = { background: '#1b2230', color: '#9aa6b8', border: '1px solid #2a3446', borderRadius: 999, padding: '7px 12px', cursor: 'pointer', font: 'inherit' };
const field = { padding: 10, borderRadius: 8, border: '1px solid #2a3446', background: '#0b0f17', color: '#e8eef7', font: 'inherit' };

export function AdminBoton() {
  const [admin, setAdmin] = useState(false), [abierto, setAbierto] = useState(false);
  const [mail, setMail] = useState(''), [pass, setPass] = useState(''), [err, setErr] = useState('');
  useEffect(() => { esAdmin().then(setAdmin); }, []);
  async function entrar(e) {
    e.preventDefault(); setErr('');
    const { error } = await sb.auth.signInWithPassword({ email: mail.trim(), password: pass });
    if (error) { setErr('Correo o contraseña incorrectos'); return; }
    setPass(''); setAdmin(true); setAbierto(false);
  }
  async function salir() { await sb.auth.signOut(); setAdmin(false); }
  return (
    <div style={box}>
      {admin
        ? <button type="button" style={{ ...pill, color: '#2bc4d8' }} onClick={salir}>Admin conectado · Salir</button>
        : <button type="button" style={pill} onClick={() => setAbierto(true)}>Admin</button>}
      {abierto && (
        <div style={{ position: 'fixed', inset: 0, background: '#02060ccc', display: 'grid', placeItems: 'center', padding: 16 }} onClick={() => setAbierto(false)}>
          <form onSubmit={entrar} onClick={e => e.stopPropagation()}
            style={{ background: '#121824', color: '#e8eef7', border: '1px solid #2a3446', borderRadius: 12, padding: 20, width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <strong style={{ fontSize: 16 }}>Ingreso de administrador</strong>
            <span style={{ color: '#9aa6b8' }}>El mismo usuario administrador de Mi Productividad. Lo que cargues lo ve todo el equipo.</span>
            <input type="email" placeholder="Correo" autoComplete="username" required value={mail} onChange={e => setMail(e.target.value)} style={field} />
            <input type="password" placeholder="Contraseña" autoComplete="current-password" required value={pass} onChange={e => setPass(e.target.value)} style={field} />
            {err && <span style={{ color: '#e5534b' }}>{err}</span>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" style={{ ...pill, borderRadius: 8 }} onClick={() => setAbierto(false)}>Cancelar</button>
              <button type="submit" style={{ ...pill, borderRadius: 8, background: '#2bc4d8', color: '#061016', border: 0, fontWeight: 600 }}>Entrar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
