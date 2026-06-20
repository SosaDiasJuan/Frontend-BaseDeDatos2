import assert from 'node:assert/strict';
import { test } from 'node:test';
import { eventosApi } from '../src/modules/eventos/api/eventosApi.js';
import { equiposApi } from '../src/modules/eventos/api/equiposApi.js';

test('eventosApi usa los contratos HTTP del backend', async (t) => {
  const fetchOriginal = globalThis.fetch;
  const llamadas = [];
  globalThis.fetch = async (url, options) => {
    llamadas.push({ url, options });
    return {
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    };
  };

  try {
    await t.test('lista eventos', async () => {
      await eventosApi.listar();
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/eventos');
      assert.equal(llamadas.at(-1).options.method, 'GET');
    });

    await t.test('crea un evento', async () => {
      const datos = { id_estadio: 1, ids_sectores: [1, 2] };
      await eventosApi.crear(datos);
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/eventos');
      assert.equal(llamadas.at(-1).options.method, 'POST');
      assert.deepEqual(JSON.parse(llamadas.at(-1).options.body), datos);
    });

    await t.test('actualiza un evento', async () => {
      const datos = { id_estadio: 2, ids_sectores: [5, 6] };
      await eventosApi.actualizar(9, datos);
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/eventos/9');
      assert.equal(llamadas.at(-1).options.method, 'PUT');
      assert.deepEqual(JSON.parse(llamadas.at(-1).options.body), datos);
    });

    await t.test('habilita varios sectores', async () => {
      await eventosApi.habilitarSectores(8, [3, 4]);
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/eventos/8/sectores');
      assert.equal(llamadas.at(-1).options.method, 'POST');
      assert.deepEqual(JSON.parse(llamadas.at(-1).options.body), { ids_sectores: [3, 4] });
    });

    await t.test('consulta el ranking', async () => {
      await eventosApi.ranking();
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/eventos/ranking/ventas');
      assert.equal(llamadas.at(-1).options.method, 'GET');
    });

    await t.test('lista equipos para el formulario', async () => {
      await equiposApi.listar();
      assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/equipos');
      assert.equal(llamadas.at(-1).options.method, 'GET');
    });
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});
