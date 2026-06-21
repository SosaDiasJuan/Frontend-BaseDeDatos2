import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispositivos, useValidarEntrada } from '../hooks/useValidacion.js';
import React from 'react';

export default function ValidarEntradaPage() {
  const { dispositivos, loading: cargandoDispositivos, error: errorDispositivos } = useDispositivos();
  const { validar, loading, error, resultado } = useValidarEntrada();
  const [idDispositivo, setIdDispositivo] = useState('');
  const [codigo, setCodigo] = useState('');

  async function enviar(event) {
    event.preventDefault();
    try {
      await validar({ codigo_token: codigo.trim(), id_dispositivo: Number(idDispositivo) });
      setCodigo('');
    } catch { /* el hook expone el error */ }
  }

  return (
    <main className="events-layout">
      <div className="validation-shell">
        <header className="page-header">
          <div><p className="eyebrow">Control de acceso</p><h1>Validar entrada</h1><p>Ingresá el código mostrado por el asistente.</p></div>
          <Link className="back-link" to="/home">Volver al inicio</Link>
        </header>
        <form className="validation-panel" onSubmit={enviar}>
          <label>Dispositivo
            <select value={idDispositivo} onChange={(e) => setIdDispositivo(e.target.value)} required disabled={cargandoDispositivos}>
              <option value="">Seleccionar dispositivo</option>
              {dispositivos.map((item) => <option key={item.id} value={item.id}>{item.device} · {item.descripcion}</option>)}
            </select>
          </label>
          <label>Código del QR
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Pegá el UUID del QR" required />
          </label>
          {errorDispositivos && <p className="form-error">{errorDispositivos.message}</p>}
          {error && <p className="form-error" role="alert">{error.message}</p>}
          {resultado && <p className="form-success" role="status">Entrada #{resultado.id_entrada} validada y consumida.</p>}
          <button className="primary-button" type="submit" disabled={loading || !idDispositivo}>{loading ? 'Validando...' : 'Validar entrada'}</button>
        </form>
      </div>
    </main>
  );
}
