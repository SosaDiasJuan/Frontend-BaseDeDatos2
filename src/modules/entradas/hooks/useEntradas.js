// Estado + side effects del modulo entradas.
// Los componentes consumen este hook, no llaman al api directamente.
import { useEffect, useState } from 'react';
import { entradasApi } from '../api/entradasApi.js';

export function useEntradasDeUsuario(email) {
  const [state, setState] = useState({
    email: null,
    entradas: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!email) return;
    let cancel = false;

    entradasApi.listarPorUsuario(email)
      .then(data => {
        if (!cancel) {
          setState({ email, entradas: data, loading: false, error: null });
        }
      })
      .catch(err => {
        if (!cancel) {
          setState({ email, entradas: [], loading: false, error: err });
        }
      });
    return () => { cancel = true; };
  }, [email]);

  return {
    entradas: state.email === email ? state.entradas : [],
    loading: Boolean(email) && state.email !== email,
    error: state.email === email ? state.error : null,
  };
}
