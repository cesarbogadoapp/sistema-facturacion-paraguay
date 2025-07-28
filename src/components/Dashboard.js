import React, { useState, useEffect } from 'react';
import Header from './Header';
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

const Dashboard = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
  const [modalCancelacion, setModalCancelacion] = useState(null);
  const [comentarioCancelacion, setComentarioCancelacion] = useState('');

  // Cargar solicitudes al inicio
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

  const abrirFormulario = () => {
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
  };

  const guardarSolicitud = async (datos) => {
    try {
      setCargando(true);
      
      // 1. Buscar o crear cliente
      let cliente = await buscarClientePorRuc(datos.ruc);
      let clienteId;
      
      if (cliente) {
        clienteId = cliente.id;
        console.log('Cliente existente encontrado:', cliente.razonSocial);
      } else {
        clienteId = await crearCliente(datos);
        console.log('Nuevo cliente creado');
      }

      // 2. Buscar o crear producto
      let producto = await buscarProductoPorNombre(datos.producto);
      let productoId;
      
      if (producto) {
        productoId = producto.id;
        console.log('Producto existente encontrado:', producto.nombre);
      } else {
        productoId = await crearProducto(datos.producto);
        console.log('Nuevo producto creado');
      }

      // 3. Crear solicitud
      const solicitudId = await crearSolicitud({
        clienteId,
        productoId,
        ...datos
      });

      console.log('Solicitud creada exitosamente');
      
      // 4. Recargar solicitudes
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

  return (
      <div style={{ padding: '2rem', marginLeft: '280px', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
    <Header 
      titulo="Dashboard Principal" 
      subtitulo="Vista general y estadísticas del sistema"
    />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ color: '#1f2937', margin: 0 }}>
          📊 Dashboard Principal
        </h2>
        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
          📅 {new Date().toLocaleDateString('es-PY')}
        </div>
      </div>
      
      {/* Tarjetas de estadísticas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#059669' }}>
            💰 Facturas Emitidas
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
            {solicitudes.filter(s => s.estado === 'emitida').length}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            Total: Gs. {formatearMonto(
              solicitudes
                .filter(s => s.estado === 'emitida')
                .reduce((sum, s) => sum + s.monto, 0)
            )}
          </p>
        </div>

        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#dc2626' }}>
            ⏳ Pendientes
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
            {solicitudes.filter(s => s.estado === 'pendiente').length}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            Por emitir
          </p>
        </div>

        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2563eb' }}>
            📝 Total Solicitudes
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
            {solicitudes.length}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            En el sistema
          </p>
        </div>
      </div>

      {/* Botón para crear nueva factura */}
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button 
          onClick={abrirFormulario}
          disabled={cargando}
          style={{
            backgroundColor: cargando ? '#9ca3af' : '#2563eb',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            border: 'none',
            borderRadius: '8px',
            cursor: cargando ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s'
          }}
        >
          {cargando ? '⏳ Procesando...' : '➕ Nueva Solicitud de Factura'}
        </button>
      </div>

      {/* Lista de solicitudes */}
      {cargandoSolicitudes ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p>🔄 Cargando solicitudes...</p>
        </div>
      ) : solicitudes.length > 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          marginTop: '2rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>
            📋 Gestión de Solicitudes ({solicitudes.length})
          </h3>
          {solicitudes.map(solicitud => (
            <div key={solicitud.id} style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              marginBottom: '1rem',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {solicitud.cliente?.razonSocial || 'Cliente desconocido'}
                  </p>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: '#6b7280' }}>
                    📋 RUC: {solicitud.cliente?.ruc || 'N/A'} | 📧 {solicitud.cliente?.email || 'N/A'}
                  </p>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                    📦 Producto: {solicitud.producto?.nombre || 'Producto desconocido'}
                  </p>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#059669', fontSize: '1.1rem' }}>
                    💰 Monto: Gs. {formatearMonto(solicitud.monto)}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
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
                  </p>
                </div>
                
                <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                  <span style={{
                    ...obtenerColorEstado(solicitud.estado),
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '1rem'
                  }}>
                    {obtenerTextoEstado(solicitud.estado)}
                  </span>
                  
                  {solicitud.estado === 'pendiente' && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
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
                        ✅ Emitir Factura
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
                  
                  {solicitud.comentarioCancelacion && (
                    <div style={{
                      backgroundColor: '#fee2e2',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      marginTop: '0.5rem',
                      fontSize: '0.8rem',
                      color: '#991b1b'
                    }}>
                      💬 {solicitud.comentarioCancelacion}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          backgroundColor: '#eff6ff',
          padding: '1.5rem',
          borderRadius: '8px',
          marginTop: '2rem',
          border: '1px solid #bfdbfe',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1d4ed8' }}>
            🚀 ¡Sistema Listo!
          </h3>
          <p style={{ margin: 0, color: '#1e40af', lineHeight: '1.5' }}>
            Tu sistema está funcionando perfectamente. Crea tu primera solicitud para comenzar.
          </p>
        </div>
      )}

      {/* Modal del formulario */}
      {mostrarFormulario && (
        <FormularioSolicitud
          onCerrar={cerrarFormulario}
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
                {cargando ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;