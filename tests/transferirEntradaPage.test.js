import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createServer } from 'vite';

test('la pantalla de transferencia se puede montar sin romper React', async () => {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    const modulo = await vite.ssrLoadModule(
      '/src/modules/transferencias/pages/TransferirEntradaPage.jsx'
    );
    const html = renderToString(
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/transferir/1'] },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: '/transferir/:idEntrada',
            element: React.createElement(modulo.default),
          })
        )
      )
    );

    assert.match(html, /Transferir entrada #/);
    assert.match(html, /Email del receptor/);
  } finally {
    await vite.close();
  }
});
