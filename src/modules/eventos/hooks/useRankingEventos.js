import { useCallback, useEffect, useState } from 'react';
import { eventosApi } from '../api/eventosApi.js';

export function useRankingEventos() {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({
    ranking: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelado = false;
    eventosApi.ranking()
      .then((ranking) => {
        if (!cancelado) setState({ ranking, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelado) setState({ ranking: [], loading: false, error });
      });
    return () => { cancelado = true; };
  }, [version]);

  const recargar = useCallback(() => setVersion((actual) => actual + 1), []);

  return { ...state, recargar };
}
