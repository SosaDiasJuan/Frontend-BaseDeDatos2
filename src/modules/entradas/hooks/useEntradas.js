// Estado + side effects del modulo entradas.
// Los componentes consumen este hook, no llaman al api directamente.
import { useCallback, useEffect, useState } from 'react';
import { entradasApi } from '../api/entradasApi.js';

const POLL_MS = 15000;

export function useEntradasMias(habilitado = true) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({
    email: null,
    entradas: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!habilitado) return;
    let cancel = false;

    entradasApi.listarMias()
      .then(data => {
        if (!cancel) {
          setState({ email: 'mias', entradas: data, loading: false, error: null });
        }
      })
      .catch(err => {
        if (!cancel) {
          setState({ email: 'mias', entradas: [], loading: false, error: err });
        }
      });
    return () => { cancel = true; };
  }, [habilitado, version]);

  useEffect(() => {
    if (!habilitado) return;
    const id = setInterval(() => setVersion(v => v + 1), POLL_MS);
    return () => clearInterval(id);
  }, [habilitado]);

  const recargar = useCallback(() => setVersion(v => v + 1), []);

  return {
    entradas: state.email === 'mias' ? state.entradas : [],
    loading: habilitado && state.email !== 'mias',
    error: state.email === 'mias' ? state.error : null,
    recargar,
  };
}
