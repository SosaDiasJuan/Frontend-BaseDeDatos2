import { useCallback, useEffect, useState } from 'react';
import { usuariosApi } from '../api/usuariosApi.js';

export function useListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancel = false;
    usuariosApi.listar()
      .then((data) => { if (!cancel) { setUsuarios(data); setLoading(false); } })
      .catch((err) => { if (!cancel) { setError(err); setLoading(false); } });
    return () => { cancel = true; };
  }, [tick]);

  const recargar = useCallback(() => {
    setLoading(true);
    setError(null);
    setTick((t) => t + 1);
  }, []);
  return { usuarios, loading, error, recargar };
}

export function useRegistroAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function ejecutar(datos) {
    setLoading(true);
    setError(null);
    try {
      return await usuariosApi.registrarAdmin(datos);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { registrarAdmin: ejecutar, loading, error, limpiarError: () => setError(null) };
}

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function ejecutar(credenciales) {
    setLoading(true);
    setError(null);
    try {
      return await usuariosApi.login(credenciales);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { login: ejecutar, loading, error };
}

export function useRegistro() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function ejecutar(datos) {
    setLoading(true);
    setError(null);
    try {
      return await usuariosApi.registrar(datos);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { registrar: ejecutar, loading, error };
}

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
