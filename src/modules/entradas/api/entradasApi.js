// Llamadas al backend del modulo entradas. UNICA capa con fetch.
import { apiClient } from '../../../config/apiClient.js';

export const entradasApi = {
  listarPorUsuario: (email) => apiClient.get(`/entradas/usuario/${encodeURIComponent(email)}`),
  obtener:          (id)    => apiClient.get(`/entradas/${id}`),
  // TODO: transferir, validar, etc.
};
