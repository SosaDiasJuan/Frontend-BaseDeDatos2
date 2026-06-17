import { apiClient } from '../../../config/apiClient.js';

export const eventosApi = {
  listar:  ()      => apiClient.get('/eventos'),
  // TODO: obtener(id), crear(data), habilitarSector(idEvento, idSector).
};
