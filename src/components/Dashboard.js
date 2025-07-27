import React, { useState, useEffect } from 'react';
import FormularioSolicitud from './FormularioSolicitud';
import { 
  crearCliente, 
  crearProducto, 
  crearSolicitud, 
  obtenerSolicitudes,
  buscarClientePorRuc,
  buscarProductoPorNombre 
} from '../services/database';

const Dashboard = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);

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
      alert('¡Solicitud guardada exitosamente en Firebase! 🎉');
      
    } catch (error) {
      console.error('Error guardando solicitud:', error);
      alert('Error al guardar la solicitud: ' + error.message);
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

  return (
    <div style={{ padding: '0 2rem' }}>
      <h2 style={{ color: '#1f2937', marginBottom: '1.5rem' }}>
        📊 Dashboard Principal
      </h2>
      
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
            Este mes
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
            En Firebase
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
          {cargando ? '⏳ Guardando...' : '➕ Nueva Solicitud de Factura'}
        </button>
      </div>

      {/* Lista de solicitudes */}
      {cargandoSolicitudes ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p>🔄 Cargando solicitudes desde Firebase...</p>
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
            📋 Solicitudes en Firebase ({solicitudes.length})
          </h3>
          {solicitudes.map(solicitud => (
            <div key={solicitud.id} style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              marginBottom: '0.5rem',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>
                    {solicitud.cliente?.razonSocial || 'Cliente desconocido'}
                  </p>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: '#6b7280' }}>
                    RUC: {solicitud.cliente?.ruc || 'N/A'} | {solicitud.cliente?.email || 'N/A'}
                  </p>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                    Producto: {solicitud.producto?.nombre || 'Producto desconocido'}
                  </p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#059669' }}>
                    Monto: Gs. {formatearMonto(solicitud.monto)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    ...obtenerColorEstado(solicitud.estado),
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {solicitud.estado === 'pendiente' ? 'Pendiente' : 
                     solicitud.estado === 'emitida' ? 'Emitida' : 'Cancelada'}
                  </span>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
                    {formatearFecha(solicitud.fechaSolicitud)}
                  </p>
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
            🚀 ¡Firebase Conectado!
          </h3>
          <p style={{ margin: 0, color: '#1e40af', lineHeight: '1.5' }}>
            Tu base de datos está funcionando. Crea tu primera solicitud para verla guardada permanentemente.
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
    </div>
  );
};

export default Dashboard;