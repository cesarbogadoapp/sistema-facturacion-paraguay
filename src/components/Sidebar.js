import React from 'react';

const Sidebar = ({ seccionActiva, onCambiarSeccion }) => {
  const secciones = [
    {
      id: 'dashboard',
      nombre: 'Dashboard',
      icono: '📊',
      descripcion: 'Vista general y estadísticas'
    },
    {
      id: 'solicitudes',
      nombre: 'Solicitudes',
      icono: '📋',
      descripcion: 'Gestionar facturas'
    },
    {
      id: 'clientes',
      nombre: 'Clientes',
      icono: '👥',
      descripcion: 'Base de datos de clientes'
    },
    {
      id: 'productos',
      nombre: 'Productos',
      icono: '📦',
      descripcion: 'Catálogo de productos'
    }
  ];

  return (
    <div style={{
      width: '280px',
      backgroundColor: '#1f2937',
      minHeight: '100vh',
      padding: '1rem 0',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100
    }}>
      {/* Header del sidebar */}
      <div style={{
        padding: '0 1.5rem 2rem 1.5rem',
        borderBottom: '1px solid #374151'
      }}>
        <h2 style={{
          color: 'white',
          margin: 0,
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          🧾 Sistema Facturación
        </h2>
        <p style={{
          color: '#9ca3af',
          margin: '0.5rem 0 0 0',
          fontSize: '0.85rem'
        }}>
          Gestión empresarial
        </p>
      </div>

      {/* Navegación */}
      <nav style={{ padding: '1rem 0' }}>
        {secciones.map(seccion => (
          <button
            key={seccion.id}
            onClick={() => onCambiarSeccion(seccion.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              backgroundColor: seccionActiva === seccion.id ? '#2563eb' : 'transparent',
              color: seccionActiva === seccion.id ? 'white' : '#d1d5db',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              borderLeft: seccionActiva === seccion.id ? '4px solid #60a5fa' : '4px solid transparent'
            }}
            onMouseOver={(e) => {
              if (seccionActiva !== seccion.id) {
                e.target.style.backgroundColor = '#374151';
                e.target.style.color = 'white';
              }
            }}
            onMouseOut={(e) => {
              if (seccionActiva !== seccion.id) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#d1d5db';
              }
            }}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '0.75rem' }}>
              {seccion.icono}
            </span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                {seccion.nombre}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                opacity: 0.8,
                marginTop: '0.25rem'
              }}>
                {seccion.descripcion}
              </div>
            </div>
          </button>
        ))}
      </nav>

      {/* Footer del sidebar */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '1.5rem',
        right: '1.5rem',
        padding: '1rem',
        backgroundColor: '#374151',
        borderRadius: '8px'
      }}>
        <div style={{ color: '#9ca3af', fontSize: '0.8rem', textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: 'white' }}>César Bogado</div>
          <div>Desarrollador</div>
          <div style={{ marginTop: '0.5rem' }}>v1.0.0</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;