import { apiClient } from '../../../config/apiClient.js';

export const estadiosApi = {
  listar:   ()          => apiClient.get('/estadios'),
  crear:    (datos)     => apiClient.post('/estadios', datos),
  actualizar: (id, datos) => apiClient.put(`/estadios/${id}`, datos),
  sectores: (idEstadio) => apiClient.get(`/estadios/${idEstadio}/sectores`),
};
