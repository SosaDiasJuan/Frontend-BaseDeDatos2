import { apiClient } from '../../../config/apiClient.js';

export const transferenciasApi = {
  listarPorUsuario: (email) =>
    apiClient.get(`/transferencias/usuario/${encodeURIComponent(email)}`),
  solicitar: ({ id_entrada, email_receptor }) =>
    apiClient.post('/transferencias', { id_entrada, email_receptor }),
  aceptar: (id) =>
    apiClient.put(`/transferencias/${id}/aceptar`),
  rechazar: (id) =>
    apiClient.put(`/transferencias/${id}/rechazar`),
};
