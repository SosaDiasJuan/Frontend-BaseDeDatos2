import { useEffect, useState } from 'react';
import { eventosApi } from '../api/eventosApi.js';

export function useEventos() {
  const [state, setState] = useState({
    eventos: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancel = false;
    eventosApi.listar()
      .then(data => {
        if (!cancel) setState({ eventos: data, loading: false, error: null });
      })
      .catch(err => {
        if (!cancel) setState({ eventos: [], loading: false, error: err });
      });
    return () => { cancel = true; };
  }, []);

  return state;
}
