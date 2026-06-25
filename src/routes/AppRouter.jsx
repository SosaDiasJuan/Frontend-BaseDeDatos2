import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'
import MisEntradasPage from '../modules/entradas/pages/MisEntradasPage.jsx'
import HomePage from '../modules/usuarios/pages/HomePage.jsx'
import LoginPage from '../modules/usuarios/pages/LoginPage.jsx'
import RegisterPage from '../modules/usuarios/pages/RegisterPage.jsx'
import PerfilPage from '../modules/usuarios/pages/PerfilPage.jsx'
import AdminFuncionariosPage from '../modules/usuarios/pages/AdminFuncionariosPage.jsx'
import AdminEstadiosPage from '../modules/estadios/pages/AdminEstadiosPage.jsx'
import EventosPage from '../modules/eventos/pages/EventosPage.jsx'
import AdminEventosPage from '../modules/eventos/pages/AdminEventosPage.jsx'
import MisTransferenciasPage from '../modules/transferencias/pages/MisTransferenciasPage.jsx'
import TransferirEntradaPage from '../modules/transferencias/pages/TransferirEntradaPage.jsx'
import ComprarEntradasPage from '../modules/ventas/pages/ComprarEntradasPage.jsx'
import MisComprasPage from '../modules/ventas/pages/MisComprasPage.jsx'
import ValidarEntradaPage from '../modules/validacion/pages/ValidarEntradaPage.jsx'

import React from 'react'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/perfil"
        element={
          <ProtectedRoute rol="UsuarioGen">
            <PerfilPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/eventos"
        element={
          <ProtectedRoute>
            <EventosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/eventos/:id"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Detalle de evento" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/comprar/:idEvento"
        element={
          <ProtectedRoute rol="UsuarioGen">
            <ComprarEntradasPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mis-entradas"
        element={
          <ProtectedRoute rol="UsuarioGen">
            <MisEntradasPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mis-compras"
        element={
          <ProtectedRoute rol="UsuarioGen">
            <MisComprasPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mis-transferencias"
        element={
          <ProtectedRoute rol="UsuarioGen">
            <MisTransferenciasPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transferir/:idEntrada"
        element={
          <ProtectedRoute rol="UsuarioGen">
            <TransferirEntradaPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/estadios"
        element={
          <ProtectedRoute rol="Administrador">
            <AdminEstadiosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/eventos"
        element={
          <ProtectedRoute rol="Administrador">
            <AdminEventosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/funcionarios"
        element={
          <ProtectedRoute rol="Administrador">
            <AdminFuncionariosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/validar"
        element={
          <ProtectedRoute rol="Funcionario">
            <ValidarEntradaPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function PlaceholderPage({ title }) {
  const navigate = useNavigate();
  return (
    <main className="app">
      <section className="panel">
        <p className="eyebrow">Base de Datos 2</p>
        <h1>{title}</h1>
        <p>Ruta activa. Falta conectar la pantalla definitiva del modulo.</p>
        <button className="back-link" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>← Volver</button>
      </section>
    </main>
  )
}
