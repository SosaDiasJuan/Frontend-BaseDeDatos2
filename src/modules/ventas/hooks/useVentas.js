import { useEffect, useState } from 'react';
import { ventasApi } from '../api/ventasApi.js';

export function useVentasDeUsuario(email) {
  const [state, setState] = useState({
    email: null,
    ventas: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!email) return;
    let cancel = false;

    ventasApi.listarPorUsuario(email)
      .then(data => {
        if (!cancel) {
          setState({ email, ventas: data, loading: false, error: null });
        }
      })
      .catch(err => {
        if (!cancel) {
          setState({ email, ventas: [], loading: false, error: err });
        }
      });
    return () => { cancel = true; };
  }, [email]);

  return {
    ventas: state.email === email ? state.ventas : [],
    loading: Boolean(email) && state.email !== email,
    error: state.email === email ? state.error : null,
  };
}

// TODO: useCrearVenta() -> valida max 5 entradas en cliente, calcula total con comision,
// llama a ventasApi.crear y devuelve { crear, loading, error, ventaCreada }.
