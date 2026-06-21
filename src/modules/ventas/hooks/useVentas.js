import { useCallback, useEffect, useState } from 'react';
import { ventasApi } from '../api/ventasApi.js';

export function useConfiguracionVentas() {
  const [configuracion, setConfiguracion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    ventasApi.configuracion()
      .then((datos) => {
        if (!cancelado) setConfiguracion(datos);
      })
      .catch((err) => {
        if (!cancelado) setError(err);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => { cancelado = true; };
  }, []);

  return { configuracion, loading, error };
}

export function useCheckout() {
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ejecutar = useCallback(async (operacion, reemplazar = false) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await operacion();
      setVenta((actual) => reemplazar ? resultado : { ...actual, ...resultado });
      return resultado;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cargar = useCallback(
    (id) => ejecutar(() => ventasApi.obtener(id), true),
    [ejecutar]
  );
  const crear = useCallback(
    (idEvento, items) => ejecutar(() => ventasApi.crear({ id_evento: idEvento, items }), true),
    [ejecutar]
  );
  const confirmar = useCallback(
    (id) => ejecutar(() => ventasApi.confirmar(id)),
    [ejecutar]
  );
  const pagar = useCallback(
    (id) => ejecutar(() => ventasApi.pagar(id)),
    [ejecutar]
  );
  const completar = useCallback(
    (id) => ejecutar(() => ventasApi.completar(id)),
    [ejecutar]
  );
  const cancelar = useCallback(
    (id) => ejecutar(() => ventasApi.cancelar(id)),
    [ejecutar]
  );
  const reiniciar = useCallback(() => {
    setVenta(null);
    setError(null);
  }, []);

  return { venta, loading, error, cargar, crear, confirmar, pagar, completar, cancelar, reiniciar };
}

export function useVentasMias() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelado = false;
    ventasApi.listarMias()
      .then((datos) => {
        if (!cancelado) {
          setVentas(datos);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelado) setError(err);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => { cancelado = true; };
  }, [version]);

  const recargar = useCallback(() => {
    setLoading(true);
    setVersion((actual) => actual + 1);
  }, []);
  return { ventas, loading, error, recargar };
}

export function useRankingCompradores() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    ventasApi.rankingCompradores()
      .then((datos) => {
        if (!cancelado) setRanking(datos);
      })
      .catch((err) => {
        if (!cancelado) setError(err);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => { cancelado = true; };
  }, []);

  return { ranking, loading, error };
}
