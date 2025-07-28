// src/components/Sidebar.tsx - Versión temporal
import React from 'react';

type TipoVista = 'dashboard' | 'solicitudes' | 'clientes' | 'productos';

interface SidebarProps {
  seccionActiva: TipoVista;
  onCambiarSeccion: (seccion: TipoVista) => void;
  abierto?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  seccionActiva, 
  onCambiarSeccion, 
  abierto = true,
  onToggle 
}) => {
  const secciones: Array<{id: TipoVista, nombre: string, icono: string}> = [
    { id: 'dashboard', nombre: 'Dashboard', icono: '📊' },
    { id: 'solicitudes', nombre: 'Solicitudes', icono: '📋' },
    { id: 'clientes', nombre: 'Clientes', icono: '👥' },
    { id: 'productos', nombre: 'Productos', icono: '📦' }
  ];

  return (
    <div style={{
      position: 'fixed',
      left: abierto ? '0' : '-280px',
      top: '0',
      width: '280px',
      height: '100vh',
      backgroundColor: '#1f2937',
      color: 'white',
      transition: 'left 0.3s ease',
      zIndex: 999,
      padding: '1rem'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Sistema Facturas</h2>
        {onToggle && (
          <button 
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        )}
      </div>

      <nav>
        {secciones.map((seccion) => (
          <button
            key={seccion.id}
            onClick={() => onCambiarSeccion(seccion.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '0.75rem 1rem',
              margin: '0.25rem 0',
              backgroundColor: seccionActiva === seccion.id ? '#3b82f6' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.2s'
            }}
          >
            <span style={{ marginRight: '0.75rem', fontSize: '1.25rem' }}>
              {seccion.icono}
            </span>
            {seccion.nombre}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;