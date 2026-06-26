import React from 'react';
import { codigoBanderaPais } from '../utils/eventos.js';

export default function BanderaPais({ pais }) {
  const codigo = codigoBanderaPais(pais);

  return (
    <span
      className={`team-flag fi fi-${codigo}`}
      title={pais}
      aria-label={`Bandera de ${pais || 'pais desconocido'}`}
    />
  );
}
