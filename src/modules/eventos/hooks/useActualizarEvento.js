import { useCallback, useState } from 'react';
import { eventosApi } from '../api/eventosApi.js';

export function useActualizarEvento() {
  const [state, setState] = useState({
    actualizando: false,
    error: null,
    eventoActualizado: null,
  });

  const actualizar = useCallback(async (idEvento, datos) => {
    setState({ actualizando: true, error: null, eventoActualizado: null });
    try {
      const eventoActualizado = await eventosApi.actualizar(idEvento, datos);
      setState({ actualizando: false, error: null, eventoActualizado });
      return eventoActualizado;
    } catch (error) {
      setState({ actualizando: false, error, eventoActualizado: null });
      throw error;
    }
  }, []);

  const limpiarResultado = useCallback(() => {
    setState({ actualizando: false, error: null, eventoActualizado: null });
  }, []);

  return { ...state, actualizar, limpiarResultado };
}
