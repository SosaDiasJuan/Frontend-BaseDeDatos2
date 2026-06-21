import { apiClient } from '../../../config/apiClient.js';

export const validacionApi = {
  dispositivosMios: () => apiClient.get('/validacion/dispositivos'),
  validar: (datos) => apiClient.post('/validacion', datos),
};
