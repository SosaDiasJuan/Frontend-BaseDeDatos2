import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setAuthToken } from '../src/config/apiClient.js';
import { entradasApi } from '../src/modules/entradas/api/entradasApi.js';
import { ventasApi } from '../src/modules/ventas/api/ventasApi.js';

test('ventasApi y entradasApi respetan los contratos del backend', async (t) => {
  const fetchOriginal = globalThis.fetch;
  const llamadas = [];
  setAuthToken('token-test');
  globalThis.fetch = async (url, options) => {
    llamadas.push({ url, options });
    return { ok: true, status: 200, json: async () => ({ ok: true }) };
  };

  try {
    await t.test('crea una venta con evento e items', async () => {
      const datos = { id_evento: 8, items: [{ id_sector: 3, cantidad: 2 }] };
      await ventasApi.crear(datos);
      const llamada = llamadas.at(-1);
      assert.equal(llamada.url, 'http://localhost:3000/api/ventas');
      assert.equal(llamada.options.method, 'POST');
      assert.deepEqual(JSON.parse(llamada.options.body), datos);
      assert.equal(llamada.options.headers.Authorization, 'Bearer token-test');
    });

    await t.test('usa las transiciones y lecturas privadas', async () => {
      await ventasApi.configuracion();
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/ventas/configuracion');
      await ventasApi.listarMias();
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/ventas/mias');
      await ventasApi.obtener(12);
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/ventas/12');
      await ventasApi.confirmar(12);
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/ventas/12/confirmar');
      await ventasApi.pagar(12);
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/ventas/12/pagar');
      await ventasApi.cancelar(12);
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/ventas/12/cancelar');
      await ventasApi.rankingCompradores();
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/ventas/ranking/compradores');
      await entradasApi.listarMias();
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/entradas/mias');
      await entradasApi.generarQr(15);
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/entradas/15/qr');
    });

    await t.test('conserva code y status de los errores', async () => {
      globalThis.fetch = async () => ({
        ok: false,
        status: 409,
        json: async () => ({ code: 'SECTOR_AGOTADO', error: 'Sin cupo' }),
      });
      await assert.rejects(
        () => ventasApi.confirmar(99),
        (err) => err.code === 'SECTOR_AGOTADO' && err.status === 409 && err.message === 'Sin cupo'
      );
    });
  } finally {
    globalThis.fetch = fetchOriginal;
    setAuthToken(null);
  }
});
