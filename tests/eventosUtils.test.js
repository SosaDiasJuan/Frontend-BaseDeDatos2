import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  agruparEventos,
  filtrarPorJurisdiccion,
  formatearHora,
  puedeVerRanking,
  puedeVerRankingCompradores,
  sectoresNoHabilitados,
} from '../src/modules/eventos/utils/eventos.js';

test('agrupa las filas de sectores por evento', () => {
  const filas = [
    {
      id: 9,
      fecha: '2042-08-15',
      hora: '17:00:00',
      id_estadio: 3,
      id_equipo_local: 4,
      id_equipo_visitante: 3,
      estadio: 'Estadio Central',
      pais: 'Mexico',
      equipo_local: 'Mexico',
      equipo_visitante: 'Brasil',
      id_sector: 10,
      sector: 'A',
      precio: '25.50',
      disponibilidad: '80',
    },
    {
      id: 9,
      fecha: '2042-08-15',
      hora: '17:00:00',
      id_estadio: 3,
      id_equipo_local: 4,
      id_equipo_visitante: 3,
      estadio: 'Estadio Central',
      pais: 'Mexico',
      equipo_local: 'Mexico',
      equipo_visitante: 'Brasil',
      id_sector: 11,
      sector: 'B',
      precio: '15.00',
      disponibilidad: '120',
    },
  ];

  const eventos = agruparEventos(filas);
  assert.equal(eventos.length, 1);
  assert.equal(eventos[0].pais, 'Mexico');
  assert.equal(eventos[0].id_equipo_local, 4);
  assert.equal(eventos[0].id_equipo_visitante, 3);
  assert.deepEqual(eventos[0].sectores, [
    { id: 10, codigo: 'A', precio: 25.5, disponibilidad: 80 },
    { id: 11, codigo: 'B', precio: 15, disponibilidad: 120 },
  ]);
  assert.equal(formatearHora(eventos[0].hora), '17:00');
});

test('aplica jurisdiccion y permisos para usuarios existentes o nuevos', () => {
  const registros = [
    { id: 1, pais: 'USA' },
    { id: 2, pais: 'Mexico' },
    { id: 3, pais: 'Canada' },
  ];

  assert.deepEqual(filtrarPorJurisdiccion(registros, 'Mexico').map((item) => item.id), [2]);
  assert.deepEqual(filtrarPorJurisdiccion(registros, 'usa').map((item) => item.id), [1]);
  assert.equal(puedeVerRanking('Administrador'), true);
  assert.equal(puedeVerRanking('UsuarioGen'), true);
  assert.equal(puedeVerRanking('Funcionario'), false);
  assert.equal(puedeVerRankingCompradores('Administrador'), true);
  assert.equal(puedeVerRankingCompradores('UsuarioGen'), false);
  assert.equal(puedeVerRankingCompradores('Funcionario'), false);
});

test('detecta los sectores que todavía pueden habilitarse', () => {
  const sectores = [{ id: 1 }, { id: 2 }, { id: 3 }];
  assert.deepEqual(
    sectoresNoHabilitados(sectores, [{ id: 1 }, { id: 3 }]).map((sector) => sector.id),
    [2]
  );
});
