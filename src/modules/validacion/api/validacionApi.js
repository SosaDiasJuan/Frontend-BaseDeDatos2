import { apiClient } from '../../../config/apiClient.js';

export const validacionApi = {
  dispositivosDe: (emailFuncionario) =>
    apiClient.get(`/validacion/dispositivos/${encodeURIComponent(emailFuncionario)}`),
  // TODO: validar({ idEntrada, codigoToken, idDispositivo }).
};
