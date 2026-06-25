import { apiClient } from '../../../config/apiClient.js';

export const usuariosApi = {
  listar: () => apiClient.get('/usuarios'),
  registrar: (datos) => apiClient.post('/usuarios/registro', datos),
  registrarAdmin: (datos) => apiClient.post('/usuarios/admin/registro', datos),
  listarFuncionarios: () => apiClient.get('/usuarios/funcionarios'),
  crearFuncionario: (datos) => apiClient.post('/usuarios/funcionarios', datos),
  actualizarFuncionario: (email, datos) => apiClient.put(`/usuarios/funcionarios/${encodeURIComponent(email)}`, datos),
  eliminarFuncionario: (email) => apiClient.delete(`/usuarios/funcionarios/${encodeURIComponent(email)}`),
  login: (credenciales) => apiClient.post('/usuarios/login', credenciales),
  obtenerPerfil: (email) => apiClient.get(`/usuarios/${encodeURIComponent(email)}`),
  actualizarPerfil: (email, datos) => apiClient.put(`/usuarios/${encodeURIComponent(email)}`, datos),
};
