import { useEffect, useState, useCallback } from 'react';
import { transferenciasApi } from '../api/transferenciasApi.js';

export function useTransferenciasDeUsuario(email) {
  const [transferencias, setTransferencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    if (!email) return;
    setLoading(true);
    transferenciasApi.listarPorUsuario(email)
      .then(data => { setTransferencias(data); setError(null); })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [email]);

  useEffect(() => { cargar(); }, [cargar]);

  return { transferencias, loading, error, recargar: cargar };
}

export function useSolicitarTransferencia() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const solicitar = useCallback(async ({ id_entrada, email_receptor }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await transferenciasApi.solicitar({ id_entrada, email_receptor });
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { solicitar, loading, error };
}

export function useResponderTransferencia() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const responder = useCallback(async (id, accion) => {
    setLoading(true);
    setError(null);
    try {
      const fn = accion === 'aceptar' ? transferenciasApi.aceptar : transferenciasApi.rechazar;
      const result = await fn(id);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { responder, loading, error };
}
