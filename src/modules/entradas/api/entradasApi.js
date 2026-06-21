// Llamadas al backend del modulo entradas. UNICA capa con fetch.
import { apiClient } from '../../../config/apiClient.js';

export const entradasApi = {
  listarMias:       ()      => apiClient.get('/entradas/mias'),
  obtener:          (id)    => apiClient.get(`/entradas/${id}`),
};
