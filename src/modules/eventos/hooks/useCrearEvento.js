import { useCallback, useState } from 'react';
import { eventosApi } from '../api/eventosApi.js';

export function useCrearEvento() {
  const [state, setState] = useState({
    creando: false,
    error: null,
    eventoCreado: null,
  });

  const crear = useCallback(async (datos) => {
    setState({ creando: true, error: null, eventoCreado: null });
    try {
      const eventoCreado = await eventosApi.crear(datos);
      setState({ creando: false, error: null, eventoCreado });
      return eventoCreado;
    } catch (error) {
      setState({ creando: false, error, eventoCreado: null });
      throw error;
    }
  }, []);

  const limpiarResultado = useCallback(() => {
    setState({ creando: false, error: null, eventoCreado: null });
  }, []);

  return { ...state, crear, limpiarResultado };
}
