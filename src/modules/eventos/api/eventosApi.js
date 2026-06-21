import { apiClient } from '../../../config/apiClient.js';

export const eventosApi = {
  listar: () => apiClient.get('/eventos'),
  crear: (datos) => apiClient.post('/eventos', datos),
  actualizar: (idEvento, datos) => apiClient.put(`/eventos/${idEvento}`, datos),
  habilitarSectores: (idEvento, idsSectores) => (
    apiClient.post(`/eventos/${idEvento}/sectores`, { ids_sectores: idsSectores })
  ),
  ranking: () => apiClient.get('/eventos/ranking/ventas'),
  asignaciones: (idEvento) => apiClient.get(`/eventos/${idEvento}/asignaciones`),
  guardarAsignaciones: (idEvento, asignaciones) => (
    apiClient.put(`/eventos/${idEvento}/asignaciones`, { asignaciones })
  ),
  coberturaValidacion: (idEvento) => apiClient.get(`/eventos/${idEvento}/cobertura-validacion`),
  cerrar: (idEvento) => apiClient.post(`/eventos/${idEvento}/cerrar`, {}),
};
