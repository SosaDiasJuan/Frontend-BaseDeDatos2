export function agruparEventos(filas = []) {
  const eventos = new Map();

  for (const fila of filas) {
    const id = Number(fila.id);
    if (!eventos.has(id)) {
      eventos.set(id, {
        id,
        fecha: fila.fecha,
        hora: fila.hora,
        id_estadio: Number(fila.id_estadio),
        estadio: fila.estadio,
        pais: fila.pais,
        id_equipo_local: Number(fila.id_equipo_local),
        equipo_local: fila.equipo_local,
        id_equipo_visitante: Number(fila.id_equipo_visitante),
        equipo_visitante: fila.equipo_visitante,
        cerrado: Boolean(fila.cerrado),
        fecha_cierre: fila.fecha_cierre,
        sectores: [],
      });
    }

    eventos.get(id).sectores.push({
      id: Number(fila.id_sector),
      codigo: fila.sector,
      precio: Number(fila.precio),
      disponibilidad: Number(fila.disponibilidad),
    });
  }

  return [...eventos.values()];
}

export function formatearFecha(fecha) {
  const valor = String(fecha || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  return new Intl.DateTimeFormat('es-UY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${valor}T00:00:00Z`));
}

export function formatearHora(hora) {
  return String(hora || '').slice(0, 5);
}

export function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(precio));
}

export function filtrarPorJurisdiccion(elementos, jurisdiccion) {
  return elementos.filter((elemento) => (
    String(elemento.pais || '').localeCompare(
      String(jurisdiccion || ''),
      undefined,
      { sensitivity: 'base' }
    ) === 0
  ));
}

export function puedeVerRanking(rol) {
  return ['Administrador', 'UsuarioGen'].includes(rol);
}

export function sectoresNoHabilitados(sectoresEstadio, sectoresEvento) {
  const habilitados = new Set(sectoresEvento.map((sector) => Number(sector.id)));
  return sectoresEstadio.filter((sector) => !habilitados.has(Number(sector.id)));
}
