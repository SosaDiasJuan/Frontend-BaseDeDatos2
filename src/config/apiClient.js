// Cliente HTTP unico para hablar con el backend.
// Todos los api/ de cada modulo importan desde aca. Si manana cambia la baseURL,
// se modifica un solo archivo.
//
// La URL base se lee de la variable de entorno VITE_API_URL (definida en .env).
// Si no existe, cae al default de desarrollo (backend local en puerto 3000).
const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';

// Token de auth (lo setea el AuthContext al loguearse).
let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);

  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch { /* la respuesta no era JSON */ }
    const err = new Error(errorMsg);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const apiClient = {
  get:    (path)          => request(path),
  post:   (path, body)    => request(path, { method: 'POST',   body }),
  put:    (path, body)    => request(path, { method: 'PUT',    body }),
  patch:  (path, body)    => request(path, { method: 'PATCH',  body }),
  delete: (path)          => request(path, { method: 'DELETE' }),
};
