// Helpers de formato compartidos por toda la app.
// Estos helpers son agnosticos al dominio (no saben nada de eventos, ventas, etc.).

export function formatMonto(valor) {
  if (valor == null) return '';
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(valor);
}

export function formatFecha(fechaISO) {
  if (!fechaISO) return '';
  return new Date(fechaISO).toLocaleDateString('es-UY');
}

export function formatFechaHora(fechaISO) {
  if (!fechaISO) return '';
  return new Date(fechaISO).toLocaleString('es-UY');
}
