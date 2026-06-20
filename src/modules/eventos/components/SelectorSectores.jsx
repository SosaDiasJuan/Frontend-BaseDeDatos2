import React from 'react';

export default function SelectorSectores({
  sectores,
  seleccionados,
  onAlternar,
  loading = false,
  mensajeVacio = 'No hay sectores disponibles.',
}) {
  if (loading) return <p className="table-empty">Cargando sectores...</p>;
  if (sectores.length === 0) return <p className="form-hint">{mensajeVacio}</p>;

  return (
    <div className="sector-options">
      {sectores.map((sector) => {
        const id = Number(sector.id);
        return (
          <label className="sector-option" key={id}>
            <input
              type="checkbox"
              checked={seleccionados.includes(id)}
              onChange={() => onAlternar(id)}
            />
            <span>
              <strong>{sector.codigo}</strong>
              <small>
                {Number(sector.capacidad_maxima).toLocaleString('es-UY')} lugares
                {sector.costo_entrada != null ? ` · USD ${Number(sector.costo_entrada).toFixed(2)}` : ''}
              </small>
            </span>
          </label>
        );
      })}
    </div>
  );
}
