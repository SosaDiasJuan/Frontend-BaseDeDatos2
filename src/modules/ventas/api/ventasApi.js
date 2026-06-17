import { apiClient } from '../../../config/apiClient.js';

export const ventasApi = {
  listarPorUsuario: (email) => apiClient.get(`/ventas/usuario/${encodeURIComponent(email)}`),
  // TODO: crear({ items }).
};
