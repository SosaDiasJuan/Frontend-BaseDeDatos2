import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

import React from 'react'

export default function ProtectedRoute({ children, rol }) {
  const { isAuthenticated, rol: rolUsuario } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (rol && rolUsuario !== rol) return <Navigate to="/" replace />

  return children
}
