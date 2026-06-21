export function limiteEfectivo(configuracion) {
  if (!configuracion) return 0;
  return Math.min(
    Number(configuracion.limite_transaccion),
    Number(configuracion.limite_evento)
  );
}

export function itemsDesdeCantidades(cantidades = {}) {
  return Object.entries(cantidades)
    .filter(([, cantidad]) => Number(cantidad) > 0)
    .map(([idSector, cantidad]) => ({
      id_sector: Number(idSector),
      cantidad: Number(cantidad),
    }));
}

export function subtotalSeleccion(sectores = [], cantidades = {}) {
  return sectores.reduce(
    (total, sector) => total + Number(sector.precio) * Number(cantidades[sector.id] || 0),
    0
  );
}

export function totalConComision(subtotal, comision) {
  return Number((Number(subtotal) * (1 + Number(comision || 0) / 100)).toFixed(2));
}

export function sumarItems(items = []) {
  return items.reduce((total, item) => total + Number(item.cantidad), 0);
}

export function subtotalItems(items = []) {
  return items.reduce(
    (total, item) => total + Number(item.precio_unitario) * Number(item.cantidad),
    0
  );
}

export function puedeTransferirEntrada(entrada) {
  return entrada?.estado === 'emitida'
    && entrada?.estado_venta === 'paga'
    && Number(entrada?.nro_transferencias) < 3;
}
