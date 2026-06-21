import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSolicitarTransferencia } from '../hooks/useTransferencias.js';

export default function TransferirEntradaPage() {
  const { idEntrada } = useParams();
  const { solicitar, loading, error } = useSolicitarTransferencia();
  const [emailReceptor, setEmailReceptor] = useState('');
  const [exito, setExito] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await solicitar({ id_entrada: Number(idEntrada), email_receptor: emailReceptor });
      setExito(true);
    } catch {
      // error shown via hook
    }
  }

  if (exito) {
    return (
      <main className="auth-layout">
        <div className="auth-panel">
          <p className="eyebrow">Transferencia</p>
          <h1 style={{ fontSize: '1.6rem' }}>Solicitud enviada</h1>
          <p style={{ marginTop: 8 }}>
            La transferencia de la entrada #{idEntrada} fue enviada a <strong>{emailReceptor}</strong>.
            Queda pendiente hasta que el receptor la acepte o rechace.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Link to="/mis-entradas" className="back-link">Ver mis entradas</Link>
            <Link to="/mis-transferencias" className="back-link">Ver transferencias</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-layout">
      <div className="auth-panel">
        <Link to="/mis-entradas" className="back-link" style={{ display: 'inline-block', marginBottom: 20 }}>
          Volver
        </Link>
        <p className="eyebrow">Transferencia</p>
        <h1 style={{ fontSize: '1.6rem' }}>Transferir entrada #{idEntrada}</h1>

        <form className="auth-form" onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <label>
            Email del receptor
            <input
              type="email"
              value={emailReceptor}
              onChange={e => setEmailReceptor(e.target.value)}
              placeholder="receptor@ejemplo.com"
              required
              disabled={loading}
            />
          </label>

          {error && <p className="form-error">{error.message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar transferencia'}
          </button>
        </form>
      </div>
    </main>
  );
}
