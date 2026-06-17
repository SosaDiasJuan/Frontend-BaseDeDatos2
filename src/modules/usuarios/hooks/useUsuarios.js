// TODO: useLogin, useRegistro.
import { useEffect, useState } from 'react';
import { usuariosApi } from '../api/usuariosApi.js';

export function usePerfil(email) {
  const [state, setState] = useState({
    email: null,
    perfil: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!email) return;
    let cancel = false;

    usuariosApi.obtenerPerfil(email)
      .then(data => {
        if (!cancel) {
          setState({ email, perfil: data, loading: false, error: null });
        }
      })
      .catch(err => {
        if (!cancel) {
          setState({ email, perfil: null, loading: false, error: err });
        }
      });
    return () => { cancel = true; };
  }, [email]);

  return {
    perfil: state.email === email ? state.perfil : null,
    loading: Boolean(email) && state.email !== email,
    error: state.email === email ? state.error : null,
  };
}
