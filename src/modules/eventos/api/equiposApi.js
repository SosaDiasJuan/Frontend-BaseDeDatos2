import { apiClient } from '../../../config/apiClient.js';

export const equiposApi = {
  listar: () => apiClient.get('/equipos'),
};
