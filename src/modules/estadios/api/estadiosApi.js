import { apiClient } from '../../../config/apiClient.js';

export const estadiosApi = {
  listar:   ()          => apiClient.get('/estadios'),
  sectores: (idEstadio) => apiClient.get(`/estadios/${idEstadio}/sectores`),
};
