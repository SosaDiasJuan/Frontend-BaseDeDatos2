import { useEffect, useState } from 'react';
import { validacionApi } from '../api/validacionApi.js';

export function useDispositivosDeFuncionario(email) {
  const [state, setState] = useState({
    email: null,
    dispositivos: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!email) return;
    let cancel = false;

    validacionApi.dispositivosDe(email)
      .then(data => {
        if (!cancel) {
          setState({ email, dispositivos: data, loading: false, error: null });
        }
      })
      .catch(err => {
        if (!cancel) {
          setState({ email, dispositivos: [], loading: false, error: err });
        }
      });
    return () => { cancel = true; };
  }, [email]);

  return {
    dispositivos: state.email === email ? state.dispositivos : [],
    loading: Boolean(email) && state.email !== email,
    error: state.email === email ? state.error : null,
  };
}

// TODO: useValidarEntrada() -> ejecuta el escaneo y maneja loading/error.
