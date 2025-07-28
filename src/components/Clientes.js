import React, { useState, useEffect } from 'react';
import { obtenerSolicitudes } from '../services/database';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setCargando(true);
      const solicitudes = await obtenerSolicitudes();
      
      // Extraer clientes únicos de las solicitudes
      const clientesUnicos = [];
      const rucsProcesados = new Set();
      
      solicitudes.forEach(solicitud => {
        if (solicitud.cliente && !rucsProcesados.has(solicitud.cliente.ruc)) {
          rucsProcesados.add(solicitud.cliente.ruc);
          
          // Calcular estadísticas del cliente
          const solicitudesCliente = solicitudes.filter(s => 
            s.cliente?.ruc === solicitud.cliente.ruc
          );
          
          const totalFacturas = solicitudesCliente.filter(s => s.estado === 'emitida').length;
          const totalMonto = solicitudesCliente
            .filter(s => s.estado === 'emitida')
            .reduce((sum, s) => sum + s.monto, 0);
          const pendientes = solicitudesCliente.filter(s => s.estado === 'pendiente').length;
          
          clientesUnicos.push({
            ...solicitud.cliente,
            totalFacturas,
            totalMonto,
            pendientes,
            ultimaSolicitud: solicitudesCliente[0].fechaSolicitud
          });
        }
      });
      
      // Ordenar por fecha de última solicitud
      clientesUnicos.sort((a, b) => new Date(b.ultimaSolicitud) - new Date(a.ultimaSolicitud));
      
      setClientes(clientesUnicos);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      alert('Error al cargar los clientes');
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

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente => {
    if (!busqueda) return true;
    const busquedaLower = busqueda.toLowerCase();
    return (
      cliente.razonSocial?.toLowerCase().includes(busquedaLower) ||
      cliente.ruc?.includes(busqueda) ||
      cliente.email?.toLowerCase().includes(busquedaLower)
    );
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
            👥 Gestión de Clientes
          </h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
            Base de datos de clientes registrados
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
            {clientes.length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            Clientes registrados
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '1.2rem', marginRight: '0.75rem' }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, RUC o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      {/* Lista de clientes */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
          <p style={{ color: '#6b7280' }}>Cargando clientes...</p>
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ color: '#1f2937', margin: '0 0 0.5rem 0' }}>
            {busqueda ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </h3>
          <p style={{ color: '#6b7280', margin: 0 }}>
            {busqueda 
              ? 'Intenta con otros términos de búsqueda'
              : 'Los clientes se registran automáticamente al crear solicitudes'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '1.5rem'
        }}>
          {clientesFiltrados.map((cliente, index) => (
            <div key={cliente.ruc || index} style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#2563eb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem'
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {cliente.razonSocial?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: '#1f2937', fontSize: '1.1rem' }}>
                    {cliente.razonSocial || 'Sin nombre'}
                  </h3>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                    📋 RUC: {cliente.ruc || 'N/A'}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '0.9rem' }}>
                  📧 {cliente.email || 'Sin email'}
                </p>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>
                  📅 Última actividad: {formatearFecha(cliente.ultimaSolicitud)}
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '6px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                    {cliente.totalFacturas}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Facturas
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                    {cliente.pendientes}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Pendientes
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#2563eb' }}>
                    Gs. {formatearMonto(cliente.totalMonto)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Total facturado
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Clientes;