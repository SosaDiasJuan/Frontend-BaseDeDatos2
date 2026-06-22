import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useEventos } from '../../eventos/hooks/useEventos.js';
import { agruparEventos, formatearFecha, formatearHora, formatearPrecio } from '../../eventos/utils/eventos.js';
import { useCheckout, useConfiguracionVentas } from '../hooks/useVentas.js';
import {
  itemsDesdeCantidades,
  limiteEfectivo,
  subtotalItems,
  subtotalSeleccion,
  sumarItems,
  totalConComision,
} from '../utils/ventas.js';

import React from 'react';

export default function ComprarEntradasPage() {
  const { idEvento } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { usuario } = useAuth();
  const { eventos: filas, loading: cargandoEventos, error: errorEventos, recargar } = useEventos();
  const { configuracion, loading: cargandoConfig, error: errorConfig } = useConfiguracionVentas();
  const checkout = useCheckout();
  const cargarVenta = checkout.cargar;
  const [cantidades, setCantidades] = useState({});
  const ventaId = searchParams.get('venta');
  const evento = useMemo(
    () => agruparEventos(filas).find((item) => item.id === Number(idEvento)),
    [filas, idEvento]
  );

  useEffect(() => {
    if (ventaId) cargarVenta(Number(ventaId)).catch(() => {});
  }, [ventaId, cargarVenta]);

  const totalSeleccionado = Object.values(cantidades).reduce((total, valor) => total + valor, 0);
  const limiteSeleccion = limiteEfectivo(configuracion);
  const subtotal = subtotalSeleccion(evento?.sectores, cantidades);
  const totalEstimado = totalConComision(subtotal, configuracion?.comision_vigente);
  const requiereVerificacion = configuracion?.exigir_verificacion
    && usuario?.estado_verificacion !== true;
  function cambiarCantidad(sector, cambio) {
    setCantidades((actual) => {
      const cantidadActual = actual[sector.id] || 0;
      const totalActual = Object.values(actual).reduce((total, valor) => total + valor, 0);
      const siguiente = Math.max(
        0,
        Math.min(cantidadActual + cambio, Number(sector.disponibilidad), limiteSeleccion)
      );
      if (cambio > 0 && totalActual >= limiteSeleccion) return actual;
      return { ...actual, [sector.id]: siguiente };
    });
  }

  async function crearVenta() {
    const items = itemsDesdeCantidades(cantidades);
    try {
      const venta = await checkout.crear(Number(idEvento), items);
      setSearchParams({ venta: String(venta.id) });
    } catch { /* el hook muestra el error */ }
  }

  async function confirmarVenta() {
    try {
      await checkout.confirmar(checkout.venta.id);
      recargar();
    } catch { /* el hook muestra el error */ }
  }

  async function pagarVenta() {
    try {
      await checkout.pagar(checkout.venta.id);
    } catch {
      await checkout.cargar(checkout.venta.id).catch(() => {});
      recargar();
    }
  }

  async function cancelarVenta() {
    try {
      await checkout.cancelar(checkout.venta.id);
      recargar();
    } catch { /* el hook muestra el error */ }
  }

  async function volverASeleccion() {
    const cantidadesAnteriores = Object.fromEntries(
      (checkout.venta?.items || []).map((item) => [Number(item.id_sector), Number(item.cantidad)])
    );
    if (checkout.venta && ['pendiente', 'confirmada'].includes(checkout.venta.estado)) {
      try { await checkout.cancelar(checkout.venta.id); } catch { return; }
    }
    checkout.reiniciar();
    setSearchParams({});
    setCantidades(cantidadesAnteriores);
    recargar();
  }

  const cargando = cargandoEventos || cargandoConfig;
  const errorInicial = errorEventos || errorConfig;

  return (
    <main className="events-layout">
      <div className="checkout-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">Compra de entradas</p>
            <h1>Checkout</h1>
            <p>Elegí sectores, revisá tu compra y completá el pago.</p>
          </div>
          <Link className="back-link" to="/eventos">Volver a eventos</Link>
        </header>

        <Stepper estado={checkout.venta?.estado} />

        {cargando ? (
          <section className="checkout-panel"><p>Cargando evento...</p></section>
        ) : errorInicial ? (
          <p className="form-error">{errorInicial.message}</p>
        ) : !evento ? (
          <section className="checkout-panel"><p className="table-empty">Evento no encontrado.</p></section>
        ) : (
          <div className="checkout-grid">
            <section className="checkout-panel">
              <p className="eyebrow">{formatearFecha(evento.fecha)} · {formatearHora(evento.hora)}</p>
              <h2>{evento.equipo_local} vs. {evento.equipo_visitante}</h2>
              <p>{evento.estadio} · {evento.pais}</p>

              {!checkout.venta && (
                <div className="quantity-list">
                  {evento.sectores.map((sector) => {
                    const agotado = Number(sector.disponibilidad) <= 0;
                    const cantidad = cantidades[sector.id] || 0;
                    return (
                      <div className={`quantity-row ${agotado ? 'quantity-row-disabled' : ''}`} key={sector.id}>
                        <div>
                          <strong>{sector.codigo}</strong>
                          <span>{formatearPrecio(sector.precio)}</span>
                          <small>{agotado ? 'Agotado' : `${sector.disponibilidad} disponibles`}</small>
                        </div>
                        <div className="quantity-control" aria-label={`Cantidad para ${sector.codigo}`}>
                          <button type="button" onClick={() => cambiarCantidad(sector, -1)} disabled={cantidad === 0}>−</button>
                          <output>{cantidad}</output>
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(sector, 1)}
                            disabled={agotado || totalSeleccionado >= limiteSeleccion || cantidad >= sector.disponibilidad}
                          >+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {checkout.venta && <DetalleVenta venta={checkout.venta} evento={evento} />}

              {requiereVerificacion && !checkout.venta && (
                <p className="checkout-warning">Debés verificar tu identidad antes de comprar.</p>
              )}
              {checkout.error && (
                <p className="form-error" role="alert">{checkout.error.message}</p>
              )}

              <div className="checkout-actions">
                {!checkout.venta && (
                  <button
                    className="primary-button"
                    type="button"
                    onClick={crearVenta}
                    disabled={checkout.loading || totalSeleccionado === 0 || requiereVerificacion}
                  >{checkout.loading ? 'Creando...' : 'Crear compra'}</button>
                )}
                {checkout.venta?.estado === 'pendiente' && (
                  <>
                    <button className="primary-button" type="button" onClick={confirmarVenta} disabled={checkout.loading}>
                      {checkout.loading ? 'Confirmando...' : 'Confirmar y continuar al pago'}
                    </button>
                    <button className="secondary-button" type="button" onClick={volverASeleccion} disabled={checkout.loading}>
                      ← Volver a seleccionar
                    </button>
                    <button className="secondary-button" type="button" onClick={cancelarVenta} disabled={checkout.loading}>Cancelar</button>
                  </>
                )}
                {checkout.venta?.estado === 'confirmada' && (
                  <>
                    <button className="primary-button" type="button" onClick={pagarVenta} disabled={checkout.loading}>
                      {checkout.loading ? 'Procesando...' : 'Pagar compra'}
                    </button>
                    <button className="secondary-button" type="button" onClick={volverASeleccion} disabled={checkout.loading}>
                      ← Volver a seleccionar
                    </button>
                    <button className="secondary-button" type="button" onClick={cancelarVenta} disabled={checkout.loading}>Cancelar</button>
                  </>
                )}
                {checkout.error?.code === 'SECTOR_AGOTADO' && (
                  <button className="secondary-button" type="button" onClick={volverASeleccion}>Volver a seleccionar</button>
                )}
              </div>

              {checkout.venta?.estado === 'paga' && (
                <div className="checkout-success">
                  <strong>Compra completada</strong>
                  <p>Tus entradas ya están habilitadas para transferir y validar.</p>
                  <div className="checkout-actions">
                    <Link className="primary-button button-link" to="/mis-entradas">Ver mis entradas</Link>
                    <Link className="back-link" to="/mis-compras">Ver mis compras</Link>
                  </div>
                </div>
              )}
              {checkout.venta?.estado === 'cancelada' && (
                <div className="checkout-warning">
                  Esta compra fue cancelada.
                  <button className="text-button" type="button" onClick={volverASeleccion}>Iniciar otra compra</button>
                </div>
              )}
            </section>

            <aside className="checkout-summary">
              <p className="eyebrow">Resumen</p>
              <dl>
                <div><dt>Entradas</dt><dd>{checkout.venta ? sumarItems(checkout.venta.items) : totalSeleccionado}</dd></div>
                <div><dt>Subtotal</dt><dd>{formatearPrecio(checkout.venta ? subtotalItems(checkout.venta.items) : subtotal)}</dd></div>
                <div><dt>Comisión</dt><dd>{Number(checkout.venta?.comision_aplicada ?? configuracion?.comision_vigente)}%</dd></div>
                <div className="summary-total"><dt>Total</dt><dd>{formatearPrecio(checkout.venta ? checkout.venta.monto_total : totalEstimado)}</dd></div>
              </dl>
              <small>Máximo efectivo: {limiteSeleccion} entradas por evento.</small>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function Stepper({ estado }) {
  const paso = estado === 'paga' ? 3 : estado === 'confirmada' ? 3 : estado === 'pendiente' ? 2 : 1;
  return (
    <ol className="checkout-stepper" aria-label="Progreso de la compra">
      {['Selección', 'Confirmación', 'Pago'].map((label, index) => (
        <li className={index + 1 <= paso ? 'step-active' : ''} key={label}>
          <span>{index + 1}</span>{label}
        </li>
      ))}
    </ol>
  );
}

function DetalleVenta({ venta, evento }) {
  return (
    <div className="sale-detail-list">
      {(venta.items || []).map((item) => {
        const sector = evento.sectores.find((actual) => actual.id === Number(item.id_sector));
        return (
          <div key={item.id_sector}>
            <span>{sector?.codigo || item.sector || `Sector ${item.id_sector}`} × {item.cantidad}</span>
            <strong>{formatearPrecio(Number(item.precio_unitario) * Number(item.cantidad))}</strong>
          </div>
        );
      })}
    </div>
  );
}
