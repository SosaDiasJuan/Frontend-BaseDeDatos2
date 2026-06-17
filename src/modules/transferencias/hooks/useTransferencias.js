import { useEffect, useState } from 'react';
import { transferenciasApi } from '../api/transferenciasApi.js';

export function useTransferenciasDeUsuario(email) {
  const [state, setState] = useState({
    email: null,
    transferencias: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!email) return;
    let cancel = false;

    transferenciasApi.listarPorUsuario(email)
      .then(data => {
        if (!cancel) {
          setState({ email, transferencias: data, loading: false, error: null });
        }
      })
      .catch(err => {
        if (!cancel) {
          setState({ email, transferencias: [], loading: false, error: err });
        }
      });
    return () => { cancel = true; };
  }, [email]);

  return {
    transferencias: state.email === email ? state.transferencias : [],
    loading: Boolean(email) && state.email !== email,
    error: state.email === email ? state.error : null,
  };
}
