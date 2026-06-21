// Estado + side effects del modulo entradas.
// Los componentes consumen este hook, no llaman al api directamente.
import { useEffect, useState } from 'react';
import { entradasApi } from '../api/entradasApi.js';

export function useEntradasMias(habilitado = true) {
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
  }, [habilitado]);

  return {
    entradas: state.email === 'mias' ? state.entradas : [],
    loading: habilitado && state.email !== 'mias',
    error: state.email === 'mias' ? state.error : null,
  };
}
