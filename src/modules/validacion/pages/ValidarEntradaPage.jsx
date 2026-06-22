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
          {resultado && (
            <section className="validation-receipt form-success" role="status" aria-labelledby="validation-receipt-title">
              <h2 id="validation-receipt-title">Validación exitosa</h2>
              <dl>
                <div><dt>Entrada</dt><dd>#{resultado.id_entrada}</dd></div>
                <div><dt>Estado</dt><dd>{resultado.estado}</dd></div>
                <div><dt>Fecha y hora</dt><dd>{formatearFechaHora(resultado.fecha_hora)}</dd></div>
                <div>
                  <dt>Funcionario</dt>
                  <dd>{resultado.funcionario_nombre} {resultado.funcionario_apellido} · {resultado.email_funcionario}</dd>
                </div>
                <div>
                  <dt>Dispositivo</dt>
                  <dd>{resultado.device}{resultado.dispositivo_descripcion ? ` · ${resultado.dispositivo_descripcion}` : ''}</dd>
                </div>
                <div><dt>Código aceptado</dt><dd><code>{resultado.codigo_token}</code></dd></div>
              </dl>
            </section>
          )}
          <button className="primary-button" type="submit" disabled={loading || !idDispositivo}>{loading ? 'Validando...' : 'Validar entrada'}</button>
        </form>
      </div>
    </main>
  );
}

function formatearFechaHora(valor) {
  if (!valor) return '—';
  return new Intl.DateTimeFormat('es-UY', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(valor));
}
