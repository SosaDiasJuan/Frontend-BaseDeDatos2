import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { entradasApi } from '../api/entradasApi.js';
import React from 'react';

export default function EntradaQrModal({ entrada, onClose }) {
  const [qr, setQr] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [segundos, setSegundos] = useState(30);
  const timer = useRef(null);

  const cargar = useCallback(async () => {
    if (document.visibilityState !== 'visible') return;
    setLoading(true);
    try {
      const nuevo = await entradasApi.generarQr(entrada.id);
      setQr(nuevo);
      setSegundos(segundosRestantes(nuevo.expira_en));
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [entrada.id]);

  useEffect(() => {
    const inicio = setTimeout(cargar, 0);
    timer.current = setInterval(cargar, 30000);
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') cargar();
    };
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    return () => {
      clearTimeout(inicio);
      clearInterval(timer.current);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    };
  }, [cargar]);

  useEffect(() => {
    if (!qr?.expira_en) return undefined;
    const contador = setInterval(() => {
      setSegundos(segundosRestantes(qr.expira_en));
    }, 1000);
    return () => clearInterval(contador);
  }, [qr]);

  return (
    <div className="modal-overlay" role="presentation">
      <section className="modal-panel qr-modal" role="dialog" aria-modal="true" aria-labelledby="qr-title">
        <header className="modal-header">
          <h2 id="qr-title">QR de {entrada.equipo_local} vs. {entrada.equipo_visitante}</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        </header>
        {loading && !qr && <p>Cargando QR...</p>}
        {error && <p className="form-error" role="alert">{error.message}</p>}
        {qr && (
          <div className="qr-content">
            <QRCodeSVG value={qr.codigo_token} size={240} level="M" />
            <p>Este código se renueva en <strong>{segundos} {segundos === 1 ? 'segundo' : 'segundos'}</strong>.</p>
            <code>{qr.codigo_token}</code>
            <button className="secondary-button" type="button" onClick={() => navigator.clipboard?.writeText(qr.codigo_token)}>
              Copiar código
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function segundosRestantes(expiraEn) {
  const diferencia = new Date(expiraEn).getTime() - Date.now();
  return Math.max(0, Math.ceil(diferencia / 1000));
}
