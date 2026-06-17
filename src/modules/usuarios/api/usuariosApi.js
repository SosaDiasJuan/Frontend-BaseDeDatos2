import { apiClient } from '../../../config/apiClient.js';

export const usuariosApi = {
  obtenerPerfil: (email) => apiClient.get(`/usuarios/${encodeURIComponent(email)}`),
  // TODO: registrar(datos), login({email, password}).
};
