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
            <div
              key={seccion.id}
              style={{
                margin: '0 1rem 0.5rem 1rem',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => onCambiarSeccion(seccion.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  backgroundColor: esActivo ? '#3b82f6' : 'transparent',
                  color: esActivo ? 'white' : '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  borderRadius: '12px',
                  position: 'relative',
                  userSelect: 'none', // Evita selección de texto
                  outline: 'none', // Quita el outline por defecto
                  WebkitTapHighlightColor: 'transparent', // Quita highlight en móvil
                  boxShadow: esActivo ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!esActivo) {
                    e.currentTarget.style.backgroundColor = '#334155';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!esActivo) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#cbd5e1';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                onFocus={(e) => {
                  if (!esActivo) {
                    e.currentTarget.style.backgroundColor = '#334155';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onBlur={(e) => {
                  if (!esActivo) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#cbd5e1';
                  }
                }}
              >
                {/* Indicador activo */}
                {esActivo && (
                  <div style={{
                    position: 'absolute',
                    left: '-1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '70%',
                    background: 'linear-gradient(to bottom, #60a5fa, #3b82f6)',
                    borderRadius: '0 4px 4px 0'
                  }}></div>
                )}
                
                <div style={{ 
                  marginRight: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  opacity: esActivo ? 1 : 0.8
                }}>
                  <IconoComponente />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: esActivo ? '600' : '500', 
                    fontSize: '0.95rem',
                    marginBottom: '0.125rem',
                    lineHeight: '1.2'
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

                {/* Flecha indicadora para elemento activo */}
                {esActivo && (
                  <div style={{
                    marginLeft: '0.5rem',
                    opacity: 0.8
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
                    </svg>
                  </div>
                )}
              </button>
            </div>
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