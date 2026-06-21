import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  itemsDesdeCantidades,
  limiteEfectivo,
  puedeTransferirEntrada,
  subtotalItems,
  subtotalSeleccion,
  sumarItems,
  totalConComision,
} from '../src/modules/ventas/utils/ventas.js';

test('calcula selección, límites y totales del checkout', () => {
  assert.equal(limiteEfectivo({ limite_transaccion: 5, limite_evento: 4 }), 4);
  assert.deepEqual(itemsDesdeCantidades({ 3: 0, 5: 2, 7: 1 }), [
    { id_sector: 5, cantidad: 2 },
    { id_sector: 7, cantidad: 1 },
  ]);

  const sectores = [{ id: 5, precio: 20 }, { id: 7, precio: '15.50' }];
  const subtotal = subtotalSeleccion(sectores, { 5: 2, 7: 1 });
  assert.equal(subtotal, 55.5);
  assert.equal(totalConComision(subtotal, 5), 58.28);
});

test('reconstruye el resumen histórico de una venta', () => {
  const items = [
    { cantidad: '2', precio_unitario: '20.00' },
    { cantidad: 1, precio_unitario: '15.50' },
  ];
  assert.equal(sumarItems(items), 3);
  assert.equal(subtotalItems(items), 55.5);
});

test('solo permite transferir entradas emitidas de ventas pagas', () => {
  assert.equal(puedeTransferirEntrada({ estado: 'emitida', estado_venta: 'paga', nro_transferencias: 2 }), true);
  assert.equal(puedeTransferirEntrada({ estado: 'emitida', estado_venta: 'confirmada', nro_transferencias: 0 }), false);
  assert.equal(puedeTransferirEntrada({ estado: 'consumida', estado_venta: 'paga', nro_transferencias: 0 }), false);
  assert.equal(puedeTransferirEntrada({ estado: 'emitida', estado_venta: 'paga', nro_transferencias: 3 }), false);
});
