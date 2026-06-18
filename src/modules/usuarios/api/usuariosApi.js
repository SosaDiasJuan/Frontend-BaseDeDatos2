import { apiClient } from '../../../config/apiClient.js';

export const usuariosApi = {
  listar: () => apiClient.get('/usuarios'),
  registrar: (datos) => apiClient.post('/usuarios/registro', datos),
  registrarAdmin: (datos) => apiClient.post('/usuarios/admin/registro', datos),
  login: (credenciales) => apiClient.post('/usuarios/login', credenciales),
  obtenerPerfil: (email) => apiClient.get(`/usuarios/${encodeURIComponent(email)}`),
};
