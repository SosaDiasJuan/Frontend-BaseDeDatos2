import { useEffect, useState } from 'react';
import { estadiosApi } from '../api/estadiosApi.js';

export function useEstadios() {
  const [state, setState] = useState({
    estadios: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancel = false;
    estadiosApi.listar()
      .then(data => {
        if (!cancel) setState({ estadios: data, loading: false, error: null });
      })
      .catch(err => {
        if (!cancel) setState({ estadios: [], loading: false, error: err });
      });
    return () => { cancel = true; };
  }, []);

  return state;
}

export function useSectoresDeEstadio(idEstadio) {
  const [state, setState] = useState({
    key: null,
    sectores: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (idEstadio == null) return;
    let cancel = false;
    estadiosApi.sectores(idEstadio)
      .then(data => {
        if (!cancel) setState({ key: idEstadio, sectores: data, loading: false, error: null });
      })
      .catch(err => {
        if (!cancel) setState({ key: idEstadio, sectores: [], loading: false, error: err });
      });
    return () => { cancel = true; };
  }, [idEstadio]);

  return {
    sectores: state.key === idEstadio ? state.sectores : [],
    loading: idEstadio != null && state.key !== idEstadio,
    error: state.key === idEstadio ? state.error : null,
  };
}
