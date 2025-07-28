import React from 'react';

// Iconos SVG profesionales
const IconoDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
  </svg>
);

const IconoSolicitudes = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </svg>
);

const IconoClientes = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 17v2H2v-2s0-4 7-4 7 4 7 4zm-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5zm3.44 6.44A5.5 5.5 0 0 1 18 16.5c0-.34-.04-.67-.09-1H18c2.8 0 5 2.2 5 5v2h-2v-2c0-1.65-1.35-3-3-3h-.06z"/>
  </svg>
);

const IconoProductos = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
  </svg>
);

const IconoFactura = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </svg>
);

const Sidebar = ({ seccionActiva, onCambiarSeccion }) => {
  const secciones = [
    {
      id: 'dashboard',
      nombre: 'Dashboard',
      icono: IconoDashboard,
      descripcion: 'Vista general y estadísticas'
    },
    {
      id: 'solicitudes',
      nombre: 'Solicitudes',
      icono: IconoSolicitudes,
      descripcion: 'Gestionar facturas'
    },
    {
      id: 'clientes',
      nombre: 'Clientes',
      icono: IconoClientes,
      descripcion: 'Base de datos de clientes'
    },
    {
      id: 'productos',
      nombre: 'Productos',
      icono: IconoProductos,
      descripcion: 'Catálogo de productos'
    }
  ];

  return (
    <div style={{
      width: '280px',
      backgroundColor: '#1e293b',
      minHeight: '100vh',
      padding: '0',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
    }}>
      {/* Header del sidebar */}
      <div style={{
        padding: '2rem 1.5rem',
        borderBottom: '1px solid #334155',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <IconoFactura />
          <h2 style={{
            color: 'white',
            margin: '0 0 0 0.75rem',
            fontSize: '1.25rem',
            fontWeight: 'bold'
          }}>
            Sistema Facturación
          </h2>
        </div>
        <p style={{
          color: '#94a3b8',
          margin: 0,
          fontSize: '0.875rem'
        }}>
          Gestión empresarial profesional
        </p>
      </div>

      {/* Navegación */}
      <nav style={{ padding: '1.5rem 0' }}>
        {secciones.map(seccion => {
          const IconoComponente = seccion.icono;
          const esActivo = seccionActiva === seccion.id;
          
          return (
            <button
              key={seccion.id}
              onClick={() => onCambiarSeccion(seccion.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                backgroundColor: esActivo ? '#3b82f6' : 'transparent',
                color: esActivo ? 'white' : '#cbd5e1',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                borderLeft: esActivo ? '4px solid #60a5fa' : '4px solid transparent',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                if (!esActivo) {
                  e.target.style.backgroundColor = '#334155';
                  e.target.style.color = 'white';
                }
              }}
              onMouseOut={(e) => {
                if (!esActivo) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#cbd5e1';
                }
              }}
            >
              {esActivo && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  background: 'linear-gradient(to bottom, #60a5fa, #3b82f6)',
                }}></div>
              )}
              
              <div style={{ 
                marginRight: '1rem',
                display: 'flex',
                alignItems: 'center',
                opacity: esActivo ? 1 : 0.8
              }}>
                <IconoComponente />
              </div>
              
              <div>
                <div style={{ 
                  fontWeight: esActivo ? '600' : '500', 
                  fontSize: '0.95rem',
                  marginBottom: '0.125rem'
                }}>
                  {seccion.nombre}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  opacity: 0.75,
                  lineHeight: '1.2'
                }}>
                  {seccion.descripcion}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer del sidebar */}
      <div style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '1.5rem',
        right: '1.5rem',
        padding: '1rem',
        backgroundColor: '#334155',
        borderRadius: '12px',
        border: '1px solid #475569'
      }}>
        <div style={{ 
          color: '#94a3b8', 
          fontSize: '0.8rem', 
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          <div style={{ fontWeight: '600', color: 'white', marginBottom: '0.25rem' }}>
            César Bogado
          </div>
          <div style={{ marginBottom: '0.5rem' }}>Desarrollador</div>
          <div style={{ 
            fontSize: '0.7rem', 
            opacity: 0.6,
            borderTop: '1px solid #475569',
            paddingTop: '0.5rem'
          }}>
            v1.0.0 • Sistema Profesional
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;