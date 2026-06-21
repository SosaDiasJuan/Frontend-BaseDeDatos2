import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validacionApi } from '../src/modules/validacion/api/validacionApi.js';

test('validacionApi usa la identidad autenticada y el contrato de validacion', async () => {
  const fetchOriginal = globalThis.fetch;
  const llamadas = [];
  globalThis.fetch = async (url, options) => {
    llamadas.push({ url, options });
    return { ok: true, status: 200, json: async () => ({ ok: true }) };
  };
  try {
    await validacionApi.dispositivosMios();
    assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/validacion/dispositivos');
    const datos = { codigo_token: 'uuid-test', id_dispositivo: 1 };
    await validacionApi.validar(datos);
    assert.equal(llamadas.at(-1).url, 'http://localhost:3000/api/validacion');
    assert.equal(llamadas.at(-1).options.method, 'POST');
    assert.deepEqual(JSON.parse(llamadas.at(-1).options.body), datos);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});
