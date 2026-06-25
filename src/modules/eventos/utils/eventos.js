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
        entradas_vendidas: 0,
        sectores: [],
      });
    }

    const evento = eventos.get(id);
    const entradasVendidas = Number(fila.entradas_vendidas || 0);
    evento.entradas_vendidas += entradasVendidas;
    evento.sectores.push({
      id: Number(fila.id_sector),
      codigo: fila.sector,
      precio: Number(fila.precio),
      disponibilidad: Number(fila.disponibilidad),
      entradas_vendidas: entradasVendidas,
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

const COUNTRY_CODES = {
  Algeria: 'DZ',
  Argentina: 'AR',
  Australia: 'AU',
  Austria: 'AT',
  Belgium: 'BE',
  'Bosnia and Herzegovina': 'BA',
  Brasil: 'BR',
  'Cabo Verde': 'CV',
  Canada: 'CA',
  Colombia: 'CO',
  "Cote d'Ivoire": 'CI',
  Croatia: 'HR',
  Curacao: 'CW',
  Czechia: 'CZ',
  'Democratic Republic of the Congo': 'CD',
  Ecuador: 'EC',
  Egypt: 'EG',
  England: 'GB-ENG',
  France: 'FR',
  Germany: 'DE',
  Ghana: 'GH',
  Haiti: 'HT',
  Iran: 'IR',
  Iraq: 'IQ',
  Japan: 'JP',
  Jordan: 'JO',
  Mexico: 'MX',
  Morocco: 'MA',
  Netherlands: 'NL',
  'New Zealand': 'NZ',
  Norway: 'NO',
  Panama: 'PA',
  Paraguay: 'PY',
  Portugal: 'PT',
  Qatar: 'QA',
  'Saudi Arabia': 'SA',
  Scotland: 'GB-SCT',
  Senegal: 'SN',
  'South Africa': 'ZA',
  'South Korea': 'KR',
  Spain: 'ES',
  Sweden: 'SE',
  Switzerland: 'CH',
  Tunisia: 'TN',
  Turkey: 'TR',
  Uruguay: 'UY',
  USA: 'US',
  Uzbekistan: 'UZ',
};

export function banderaPais(pais) {
  const code = COUNTRY_CODES[pais];
  if (!code) return '🏳';
  if (code === 'GB-ENG') return '🏴';
  if (code === 'GB-SCT') return '🏴';
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function ordenarEventosPorInteres(eventos = [], paisUsuario) {
  const pais = String(paisUsuario || '').toLowerCase();
  return [...eventos].sort((a, b) => {
    const aFavorito = pais && [a.equipo_local, a.equipo_visitante].some((equipo) => String(equipo).toLowerCase() === pais);
    const bFavorito = pais && [b.equipo_local, b.equipo_visitante].some((equipo) => String(equipo).toLowerCase() === pais);
    if (aFavorito !== bFavorito) return aFavorito ? -1 : 1;
    return new Date(`${String(a.fecha).slice(0, 10)}T${formatearHora(a.hora)}:00Z`)
      - new Date(`${String(b.fecha).slice(0, 10)}T${formatearHora(b.hora)}:00Z`);
  });
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

export function puedeVerRankingCompradores(rol) {
  return rol === 'Administrador';
}

export function sectoresNoHabilitados(sectoresEstadio, sectoresEvento) {
  const habilitados = new Set(sectoresEvento.map((sector) => Number(sector.id)));
  return sectoresEstadio.filter((sector) => !habilitados.has(Number(sector.id)));
}
