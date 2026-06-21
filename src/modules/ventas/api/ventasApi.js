import { apiClient } from '../../../config/apiClient.js';

export const ventasApi = {
  configuracion: () => apiClient.get('/ventas/configuracion'),
  crear: ({ id_evento, items }) => apiClient.post('/ventas', { id_evento, items }),
  confirmar: (id) => apiClient.post(`/ventas/${id}/confirmar`),
  pagar: (id) => apiClient.post(`/ventas/${id}/pagar`),
  cancelar: (id) => apiClient.post(`/ventas/${id}/cancelar`),
  obtener: (id) => apiClient.get(`/ventas/${id}`),
  listarMias: () => apiClient.get('/ventas/mias'),
  rankingCompradores: () => apiClient.get('/ventas/ranking/compradores'),
};
