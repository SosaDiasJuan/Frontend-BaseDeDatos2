import { apiClient } from '../../../config/apiClient.js';

export const transferenciasApi = {
  listarPorUsuario: (email) => apiClient.get(`/transferencias/usuario/${encodeURIComponent(email)}`),
  // TODO: solicitar({ idEntrada, receptor }), aceptar(idTransferencia).
};
