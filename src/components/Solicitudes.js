import React, { useState, useEffect } from 'react';
import FormularioSolicitud from './FormularioSolicitud';
import { 
  crearCliente, 
  crearProducto, 
  crearSolicitud, 
  obtenerSolicitudes,
  buscarClientePorRuc,
  buscarProductoPorNombre,
  emitirFactura,
  cancelarSolicitud
} from '../services/database';

const Solicitudes = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
  const [modalCancelacion, setModalCancelacion] = useState(null);
  const [comentarioCancelacion, setComentarioCancelacion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setCargandoSolicitudes(true);
      const solicitudesDB = await obtenerSolicitudes();
      setSolicitudes(solicitudesDB);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      alert('Error al cargar las solicitudes');
    } finally {
      setCargandoSolicitudes(false);
    }
  };

  const guardarSolicitud = async (datos) => {
    try {
      setCargando(true);
      
      let cliente = await buscarClientePorRuc(datos.ruc);
      let clienteId;
      
      if (cliente) {
        clienteId = cliente.id;
      } else {
        clienteId = await crearCliente(datos);
      }

      let producto = await buscarProductoPorNombre(datos.producto);
      let productoId;
      
      if (producto) {
        productoId = producto.id;
      } else {
        productoId = await crearProducto(datos.producto);
      }

      await crearSolicitud({
        clienteId,
        productoId,
        ...datos
      });
      
      await cargarSolicitudes();
      setMostrarFormulario(false);
      alert('¡Solicitud guardada exitosamente! 🎉');
      
    } catch (error) {
      console.error('Error guardando solicitud:', error);
      alert('Error al guardar la solicitud: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  const manejarEmitirFactura = async (solicitudId) => {
    if (!window.confirm('¿Está seguro de que desea emitir esta factura?\n\nEsta acción confirma que el producto fue entregado al cliente.')) {
      return;
    }

    try {
      setCargando(true);
      await emitirFactura(solicitudId);
      await cargarSolicitudes();
      alert('✅ ¡Factura emitida exitosamente!');
    } catch (error) {
      console.error('Error emitiendo factura:', error);
      alert('❌ Error al emitir la factura: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  const abrirModalCancelacion = (solicitud) => {
    setModalCancelacion(solicitud);
    setComentarioCancelacion('');
  };

  const cerrarModalCancelacion = () => {
    setModalCancelacion(null);
    setComentarioCancelacion('');
  };

  const manejarCancelarSolicitud = async () => {
    try {
      setCargando(true);
      await cancelarSolicitud(modalCancelacion.id, comentarioCancelacion);
      await cargarSolicitudes();
      cerrarModalCancelacion();
      alert('❌ Solicitud cancelada exitosamente');
    } catch (error) {
      console.error('Error cancelando solicitud:', error);
      alert('Error al cancelar la solicitud: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  const formatearMonto = (monto) => {
    return parseFloat(monto).toLocaleString('es-PY');
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    if (fecha.toLocaleDateString) {
      return fecha.toLocaleDateString('es-PY');
    }
    return new Date(fecha).toLocaleDateString('es-PY');
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'emitida':
        return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'cancelada':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const obtenerTextoEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente de Emisión';
      case 'emitida':
        return 'Factura Emitida';
      case 'cancelada':
        return 'Cancelada';
      default:
        return 'Estado Desconocido';
    }
  };

  // Filtrar solicitudes
  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    const cumpleFiltro = filtroEstado === 'todos' || solicitud.estado === filtroEstado;
    const cumpleBusqueda = busqueda === '' || 
      solicitud.cliente?.razonSocial?.toLowerCase().includes(busqueda.toLowerCase()) ||
      solicitud.cliente?.ruc?.includes(busqueda) ||
      solicitud.producto?.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltro && cumpleBusqueda;
  });

  return (
    <div style={{ padding: '2rem', marginLeft: '280px', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ color: '#1f2937', margin: 0, fontSize: '2rem' }}>
            📋 Gestión de Solicitudes
          </h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
            Control completo del flujo de facturación
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          disabled={cargando}
          style={{
            backgroundColor: cargando ? '#9ca3af' : '#2563eb',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: cargando ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {cargando ? '⏳ Procesando...' : '➕ Nueva Solicitud'}
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#dc2626' }}>
            {solicitudes.filter(s => s.estado === 'pendiente').length}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Pendientes</div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#059669' }}>
            {solicitudes.filter(s => s.estado === 'emitida').length}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Emitidas</div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#6b7280' }}>
            {solicitudes.filter(s => s.estado === 'cancelada').length}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Canceladas</div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2563eb' }}>
            {solicitudes.length}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Total</div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <input
              type="text"
              placeholder="🔍 Buscar por cliente, RUC o producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>
          <div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                backgroundColor: 'white'
              }}
            >
              <option value="todos">📊 Todos los estados</option>
              <option value="pendiente">⏳ Pendientes</option>
              <option value="emitida">✅ Emitidas</option>
              <option value="cancelada">❌ Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de solicitudes */}
      {cargandoSolicitudes ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
          <p style={{ color: '#6b7280' }}>Cargando solicitudes...</p>
        </div>
      ) : solicitudesFiltradas.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: '#1f2937', margin: '0 0 0.5rem 0' }}>
            {busqueda || filtroEstado !== 'todos' 
              ? 'No se encontraron solicitudes' 
              : 'No hay solicitudes registradas'}
          </h3>
          <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
            {busqueda || filtroEstado !== 'todos'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Crea tu primera solicitud para comenzar'
            }
          </p>
          {!busqueda && filtroEstado === 'todos' && (
            <button
              onClick={() => setMostrarFormulario(true)}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ➕ Primera Solicitud
            </button>
          )}
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, color: '#1f2937' }}>
              📋 Solicitudes ({solicitudesFiltradas.length})
            </h3>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              {filtroEstado !== 'todos' && `Filtrado por: ${filtroEstado}`}
            </div>
          </div>

          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {solicitudesFiltradas.map(solicitud => (
              <div key={solicitud.id} style={{
                padding: '1.5rem',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: '0 1rem 0 0', color: '#1f2937', fontSize: '1.1rem' }}>
                        {solicitud.cliente?.razonSocial || 'Cliente desconocido'}
                      </h4>
                      <span style={{
                        ...obtenerColorEstado(solicitud.estado),
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {obtenerTextoEstado(solicitud.estado)}
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      color: '#6b7280'
                    }}>
                      <div>📋 RUC: {solicitud.cliente?.ruc || 'N/A'}</div>
                      <div>📧 Email: {solicitud.cliente?.email || 'N/A'}</div>
                      <div>📦 Producto: {solicitud.producto?.nombre || 'N/A'}</div>
                      <div style={{ fontWeight: 'bold', color: '#059669' }}>
                        💰 Gs. {formatearMonto(solicitud.monto)}
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      📅 Creada: {formatearFecha(solicitud.fechaSolicitud)}
                      {solicitud.fechaEmision && (
                        <span style={{ color: '#059669', marginLeft: '1rem' }}>
                          ✅ Emitida: {formatearFecha(solicitud.fechaEmision)}
                        </span>
                      )}
                      {solicitud.fechaCancelacion && (
                        <span style={{ color: '#dc2626', marginLeft: '1rem' }}>
                          ❌ Cancelada: {formatearFecha(solicitud.fechaCancelacion)}
                        </span>
                      )}
                    </div>

                    {solicitud.comentarioCancelacion && (
                      <div style={{
                        backgroundColor: '#fee2e2',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        marginTop: '0.5rem',
                        fontSize: '0.85rem',
                        color: '#991b1b'
                      }}>
                        💬 {solicitud.comentarioCancelacion}
                      </div>
                    )}
                  </div>
                  
                  {solicitud.estado === 'pendiente' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                      <button
                        onClick={() => manejarEmitirFactura(solicitud.id)}
                        disabled={cargando}
                        style={{
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          cursor: cargando ? 'not-allowed' : 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}
                      >
                        ✅ Emitir
                      </button>
                      <button
                        onClick={() => abrirModalCancelacion(solicitud)}
                        disabled={cargando}
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          cursor: cargando ? 'not-allowed' : 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal del formulario */}
      {mostrarFormulario && (
        <FormularioSolicitud
          onCerrar={() => setMostrarFormulario(false)}
          onGuardar={guardarSolicitud}
          cargando={cargando}
        />
      )}

      {/* Modal de cancelación */}
      {modalCancelacion && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#dc2626' }}>
              ❌ Cancelar Solicitud
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              ¿Está seguro de que desea cancelar la solicitud de <strong>{modalCancelacion.cliente?.razonSocial}</strong>?
            </p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Comentario (opcional):
              </label>
              <textarea
                value={comentarioCancelacion}
                onChange={(e) => setComentarioCancelacion(e.target.value)}
                placeholder="Razón de la cancelación..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={cerrarModalCancelacion}
                disabled={cargando}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: cargando ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={manejarCancelarSolicitud}
                disabled={cargando}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: cargando ? '#9ca3af' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: cargando ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {cargando ? 'Cancelando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Solicitudes;