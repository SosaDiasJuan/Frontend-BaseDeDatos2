import { useEffect, useState } from 'react';
import { validacionApi } from '../api/validacionApi.js';

export function useDispositivos() {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelado = false;
    validacionApi.dispositivosMios()
      .then((data) => { if (!cancelado) setDispositivos(data); })
      .catch((err) => { if (!cancelado) setError(err); })
      .finally(() => { if (!cancelado) setLoading(false); });
    return () => { cancelado = true; };
  }, []);
  return { dispositivos, loading, error };
}

export function useValidarEntrada() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  async function validar(datos) {
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const data = await validacionApi.validar(datos);
      setResultado(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally { setLoading(false); }
  }
  return { validar, loading, error, resultado };
}
