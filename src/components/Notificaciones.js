import React, { useState, useEffect } from 'react';

// Iconos SVG para notificaciones
const IconoExito = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
  </svg>
);

const IconoError = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z"/>
  </svg>
);

const IconoAdvertencia = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
  </svg>
);

const IconoInfo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
  </svg>
);

const IconoCerrar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
  </svg>
);

const Notificacion = ({ tipo, titulo, mensaje, onCerrar, duracion = 5000 }) => {
  const [visible, setVisible] = useState(true);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      cerrarNotificacion();
    }, duracion);

    return () => clearTimeout(timer);
  }, [duracion]);

  const cerrarNotificacion = () => {
    setSaliendo(true);
    setTimeout(() => {
      setVisible(false);
      onCerrar();
    }, 300);
  };

  const obtenerEstilos = () => {
    const base = {
      transform: saliendo ? 'translateX(100%)' : 'translateX(0)',
      opacity: saliendo ? 0 : 1,
      transition: 'all 0.3s ease-in-out'
    };

    switch (tipo) {
      case 'exito':
        return {
          ...base,
          backgroundColor: '#f0fdf4',
          borderColor: '#16a34a',
          color: '#15803d'
        };
      case 'error':
        return {
          ...base,
          backgroundColor: '#fef2f2',
          borderColor: '#dc2626',
          color: '#dc2626'
        };
      case 'advertencia':
        return {
          ...base,
          backgroundColor: '#fffbeb',
          borderColor: '#d97706',
          color: '#d97706'
        };
      case 'info':
        return {
          ...base,
          backgroundColor: '#eff6ff',
          borderColor: '#2563eb',
          color: '#2563eb'
        };
      default:
        return base;
    }
  };

  const obtenerIcono = () => {
    switch (tipo) {
      case 'exito': return <IconoExito />;
      case 'error': return <IconoError />;
      case 'advertencia': return <IconoAdvertencia />;
      case 'info': return <IconoInfo />;
      default: return <IconoInfo />;
    }
  };

  if (!visible) return null;

  return (
    <div style={{
      ...obtenerEstilos(),
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid',
      marginBottom: '0.5rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      maxWidth: '400px',
      position: 'relative'
    }}>
      <div style={{ flexShrink: 0, marginTop: '0.125rem' }}>
        {obtenerIcono()}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ 
          margin: '0 0 0.25rem 0', 
          fontWeight: '600',
          fontSize: '0.875rem'
        }}>
          {titulo}
        </h4>
        <p style={{ 
          margin: 0, 
          fontSize: '0.8rem',
          opacity: 0.9,
          lineHeight: '1.4'
        }}>
          {mensaje}
        </p>
      </div>

      <button
        onClick={cerrarNotificacion}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '4px',
          opacity: 0.6,
          transition: 'opacity 0.2s'
        }}
        onMouseOver={(e) => e.target.style.opacity = '1'}
        onMouseOut={(e) => e.target.style.opacity = '0.6'}
      >
        <IconoCerrar />
      </button>
    </div>
  );
};

const ContenedorNotificaciones = ({ notificaciones, onRemover }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      maxWidth: '400px'
    }}>
      {notificaciones.map(notificacion => (
        <Notificacion
          key={notificacion.id}
          tipo={notificacion.tipo}
          titulo={notificacion.titulo}
          mensaje={notificacion.mensaje}
          onCerrar={() => onRemover(notificacion.id)}
          duracion={notificacion.duracion}
        />
      ))}
    </div>
  );
};

export { ContenedorNotificaciones };