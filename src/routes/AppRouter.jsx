import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'
import MisEntradasPage from '../modules/entradas/pages/MisEntradasPage.jsx'
import HomePage from '../modules/usuarios/pages/HomePage.jsx'
import LoginPage from '../modules/usuarios/pages/LoginPage.jsx'
import RegisterPage from '../modules/usuarios/pages/RegisterPage.jsx'

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
        path="/eventos"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Listado de eventos" />
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
            <PlaceholderPage title="Comprar entradas" />
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
            <PlaceholderPage title="Mis compras" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mis-transferencias"
        element={
          <ProtectedRoute rol="UsuarioGen">
            <PlaceholderPage title="Mis transferencias" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transferir/:idEntrada"
        element={
          <ProtectedRoute rol="UsuarioGen">
            <PlaceholderPage title="Transferir entrada" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/estadios"
        element={
          <ProtectedRoute rol="Administrador">
            <PlaceholderPage title="Admin estadios" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/eventos"
        element={
          <ProtectedRoute rol="Administrador">
            <PlaceholderPage title="Admin eventos" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/validar"
        element={
          <ProtectedRoute rol="Funcionario">
            <PlaceholderPage title="Validar entrada" />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function PlaceholderPage({ title }) {
  return (
    <main className="app">
      <section className="panel">
        <p className="eyebrow">Base de Datos 2</p>
        <h1>{title}</h1>
        <p>Ruta activa. Falta conectar la pantalla definitiva del modulo.</p>
      </section>
    </main>
  )
}
